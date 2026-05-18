/**
 * Loyalty Service — Real loyalty point system with Firestore
 *
 * Architecture:
 *   users/{uid}.loyaltyPoints  — current balance (increment/decrement atomically)
 *   users/{uid}.totalSpent     — lifetime spend
 *   users/{uid}.loyaltyTier    — bronze|silver|gold
 *   loyaltyTransactions/{id}   — immutable audit log
 */

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  increment,
  serverTimestamp,
  onSnapshot,
  runTransaction,
  type Unsubscribe,
  type FirestoreError,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { computeTier, type LoyaltyTier } from '@/lib/auth/user-profile'
import { getPointsRatio } from '@/lib/orders'

export type LoyaltyTransactionType = 'earn' | 'redeem' | 'adjust' | 'bonus'

export interface LoyaltyTransaction {
  id: string
  uid: string
  orderId?: string
  amountSpent?: number
  pointsEarned: number
  pointsRedeemed?: number
  type: LoyaltyTransactionType
  note?: string
  createdAt: Date
  createdBy: string
}

// ─── Write Operations (staff only) ──────────────────────────

/**
 * Award points manually or via adjustment.
 * Recomputes tier atomically.
 */
export async function adjustPoints(params: {
  uid: string
  pointsDelta: number
  note: string
  staffUid: string
}): Promise<string> {
  const { uid, pointsDelta, note, staffUid } = params
  const userRef = doc(db, 'users', uid)
  let txId = ''

  await runTransaction(db, async (transaction) => {
    const userSnap = await transaction.get(userRef)
    let currentPoints = 0
    if (userSnap.exists()) {
      currentPoints = typeof userSnap.data().loyaltyPoints === 'number' ? userSnap.data().loyaltyPoints : 0
    }

    const newPoints = Math.max(0, currentPoints + pointsDelta)
    const newTier = computeTier(newPoints)

    transaction.set(userRef, {
      loyaltyPoints: newPoints,
      loyaltyTier: newTier,
    }, { merge: true })

    const txRef = doc(collection(db, 'loyaltyTransactions'))
    transaction.set(txRef, {
      uid,
      pointsEarned: pointsDelta > 0 ? pointsDelta : 0,
      pointsRedeemed: pointsDelta < 0 ? Math.abs(pointsDelta) : 0,
      type: 'adjust',
      note,
      createdAt: serverTimestamp(),
      createdBy: staffUid,
    })
    txId = txRef.id
  })

  return txId
}

/**
 * Award bonus points (e.g. sign-up bonus, birthday).
 */
export async function awardBonus(params: {
  uid: string
  points: number
  note: string
  staffUid: string
}): Promise<string> {
  const { uid, points, note, staffUid } = params
  const userRef = doc(db, 'users', uid)
  let txId = ''

  await runTransaction(db, async (transaction) => {
    const userSnap = await transaction.get(userRef)
    let currentPoints = 0
    if (userSnap.exists()) {
      currentPoints = typeof userSnap.data().loyaltyPoints === 'number' ? userSnap.data().loyaltyPoints : 0
    }

    const newPoints = currentPoints + points
    const newTier = computeTier(newPoints)

    transaction.set(userRef, {
      loyaltyPoints: newPoints,
      loyaltyTier: newTier,
    }, { merge: true })

    const txRef = doc(collection(db, 'loyaltyTransactions'))
    transaction.set(txRef, {
      uid,
      pointsEarned: points,
      pointsRedeemed: 0,
      type: 'bonus',
      note,
      createdAt: serverTimestamp(),
      createdBy: staffUid,
    })
    txId = txRef.id
  })

  return txId
}

/**
 * Redeem points manually.
 */
export async function redeemPoints(params: {
  uid: string
  pointsToRedeem: number
  note?: string
  staffUid: string
}): Promise<string> {
  const { uid, pointsToRedeem, note, staffUid } = params
  const userRef = doc(db, 'users', uid)
  let txId = ''

  await runTransaction(db, async (transaction) => {
    const userSnap = await transaction.get(userRef)
    let currentPoints = 0
    if (userSnap.exists()) {
      currentPoints = typeof userSnap.data().loyaltyPoints === 'number' ? userSnap.data().loyaltyPoints : 0
    }

    if (currentPoints < pointsToRedeem) {
      throw new Error('Insufficient points balance')
    }

    const newPoints = currentPoints - pointsToRedeem
    const newTier = computeTier(newPoints)

    transaction.set(userRef, {
      loyaltyPoints: newPoints,
      loyaltyTier: newTier,
    }, { merge: true })

    const txRef = doc(collection(db, 'loyaltyTransactions'))
    transaction.set(txRef, {
      uid,
      pointsEarned: 0,
      pointsRedeemed: pointsToRedeem,
      type: 'redeem',
      note: note || 'Points redeemed',
      createdAt: serverTimestamp(),
      createdBy: staffUid,
    })
    txId = txRef.id
  })

  return txId
}

// ─── Read Operations ────────────────────────────────────────

function parseLoyaltyTransaction(id: string, data: Record<string, unknown>): LoyaltyTransaction {
  return {
    id,
    uid: typeof data.uid === 'string' ? data.uid : '',
    orderId: typeof data.orderId === 'string' ? data.orderId : undefined,
    amountSpent: typeof data.amountSpent === 'number' ? data.amountSpent : undefined,
    pointsEarned: typeof data.pointsEarned === 'number' ? data.pointsEarned : 0,
    pointsRedeemed: typeof data.pointsRedeemed === 'number' ? data.pointsRedeemed : undefined,
    type: isValidTxType(data.type) ? data.type : 'earn',
    note: typeof data.note === 'string' ? data.note : undefined,
    createdAt: (data.createdAt as { toDate?: () => Date })?.toDate?.() ?? new Date(),
    createdBy: typeof data.createdBy === 'string' ? data.createdBy : '',
  }
}

function isValidTxType(v: unknown): v is LoyaltyTransactionType {
  return typeof v === 'string' && ['earn', 'redeem', 'adjust', 'bonus'].includes(v)
}

/** Subscribe to loyalty history (safe, paginated, limited) */
export function subscribeLoyaltyHistory(
  uid: string,
  callback: (txs: LoyaltyTransaction[]) => void,
  onError?: (error: FirestoreError) => void,
  maxResults = 50
): Unsubscribe {
  const q = query(
    collection(db, 'loyaltyTransactions'),
    where('uid', '==', uid),
    orderBy('createdAt', 'desc'),
    limit(maxResults)
  )

  return onSnapshot(
    q,
    (snap) => {
      const txs = snap.docs.map(d => parseLoyaltyTransaction(d.id, d.data() as Record<string, unknown>))
      callback(txs)
    },
    (error) => {
      console.error('[Firestore:loyaltyTransactions subscribe error]:', error)
      onError?.(error)
    }
  )
}
