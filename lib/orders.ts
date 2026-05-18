/**
 * Orders and Spend Tracking Service
 *
 * Implements real, secure order creation, completion, and dynamic loyalty processing.
 * Using transactional atomic writes (runTransaction) to maintain consistent states.
 */

import {
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  runTransaction,
  onSnapshot,
  type Unsubscribe,
  type FirestoreError,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { computeTier, type LoyaltyTier } from '@/lib/auth/user-profile'
import { getSettings } from '@/lib/firestore'

// ─── Types ──────────────────────────────────────────────────

export type OrderStatus = 'pending' | 'completed' | 'cancelled'

export interface OrderItem {
  name: string
  quantity: number
  price: number
}

export interface Order {
  id: string
  uid: string
  customerName: string
  customerEmail: string
  amount: number
  items: OrderItem[]
  paymentMethod: 'cash' | 'card' | 'upi'
  status: OrderStatus
  locationId: string
  createdAt: Date
  completedAt: Date | null
  createdBy: string
}

// ─── Dynamic Conversion Ratio Helper ────────────────────────

/**
 * Fetch dynamic points ratio per ₹100 spent from settings.
 * Defaults to 10 points per ₹100 spent if not set.
 */
export async function getPointsRatio(): Promise<number> {
  try {
    const settings = await getSettings()
    if (settings && typeof settings.pointsRatio === 'number') {
      return settings.pointsRatio
    }
  } catch (error) {
    console.error('Error fetching points ratio setting:', error)
  }
  return 10 // Fallback conversion ratio
}

// ─── Write Operations ────────────────────────────────────────

/**
 * Manually create a new order (Admins/Managers or Customers).
 */
export async function createOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'completedAt'>): Promise<string> {
  const ref = await addDoc(collection(db, 'orders'), {
    ...orderData,
    createdAt: serverTimestamp(),
    completedAt: null,
  })
  return ref.id
}

/**
 * Mark order completed and process loyalty points atomically in a Firestore transaction.
 * Loyalty points are only processed if status transitions to 'completed'.
 */
export async function completeOrder(orderId: string, staffUid: string): Promise<void> {
  const orderRef = doc(db, 'orders', orderId)
  const ratio = await getPointsRatio()

  await runTransaction(db, async (transaction) => {
    // 1. Read Order Document
    const orderSnap = await transaction.get(orderRef)
    if (!orderSnap.exists()) {
      throw new Error('Order does not exist')
    }

    const orderData = orderSnap.data()
    if (orderData.status === 'completed') {
      throw new Error('Order is already completed')
    }

    const uid = orderData.uid
    const amountSpent = orderData.amount || 0
    const pointsEarned = Math.floor((amountSpent / 100) * ratio)

    // 2. Read User Document
    const userRef = doc(db, 'users', uid)
    const userSnap = await transaction.get(userRef)
    
    let currentPoints = 0
    let currentTotalSpent = 0
    let currentTotalOrders = 0

    if (userSnap.exists()) {
      const userData = userSnap.data()
      currentPoints = typeof userData.loyaltyPoints === 'number' ? userData.loyaltyPoints : 0
      currentTotalSpent = typeof userData.totalSpent === 'number' ? userData.totalSpent : 0
      currentTotalOrders = typeof userData.totalOrders === 'number' ? userData.totalOrders : 0
    }

    // 3. Compute Updated User Stats
    const newPoints = currentPoints + pointsEarned
    const newTotalSpent = currentTotalSpent + amountSpent
    const newTotalOrders = currentTotalOrders + 1
    const newTier = computeTier(newPoints)

    // 4. Update User Doc
    transaction.set(userRef, {
      loyaltyPoints: newPoints,
      totalSpent: newTotalSpent,
      totalOrders: newTotalOrders,
      loyaltyTier: newTier,
      lastPurchaseAt: serverTimestamp(),
    }, { merge: true })

    // 5. Update Order Status
    transaction.update(orderRef, {
      status: 'completed',
      completedAt: serverTimestamp(),
    })

    // 6. Write Immutable Loyalty Transaction Log
    const txRef = doc(collection(db, 'loyaltyTransactions'))
    transaction.set(txRef, {
      uid,
      orderId,
      amountSpent,
      pointsEarned,
      pointsRedeemed: 0,
      type: 'earn',
      createdAt: serverTimestamp(),
      createdBy: staffUid,
    })
  })
}

/**
 * Cancel a pending order.
 */
export async function cancelOrder(orderId: string, staffUid: string): Promise<void> {
  const orderRef = doc(db, 'orders', orderId)
  await setDoc(orderRef, {
    status: 'cancelled',
    updatedAt: serverTimestamp(),
    cancelledBy: staffUid,
  }, { merge: true })
}

// ─── Query Operations ───────────────────────────────────────

export function parseOrder(id: string, data: Record<string, unknown>): Order {
  return {
    id,
    uid: typeof data.uid === 'string' ? data.uid : '',
    customerName: typeof data.customerName === 'string' ? data.customerName : '',
    customerEmail: typeof data.customerEmail === 'string' ? data.customerEmail : '',
    amount: typeof data.amount === 'number' ? data.amount : 0,
    items: Array.isArray(data.items) ? data.items as OrderItem[] : [],
    paymentMethod: (data.paymentMethod === 'card' || data.paymentMethod === 'upi') ? data.paymentMethod : 'cash',
    status: (data.status === 'completed' || data.status === 'cancelled') ? data.status : 'pending',
    locationId: typeof data.locationId === 'string' ? data.locationId : '',
    createdAt: (data.createdAt as { toDate?: () => Date })?.toDate?.() ?? new Date(),
    completedAt: (data.completedAt as { toDate?: () => Date })?.toDate?.() ?? null,
    createdBy: typeof data.createdBy === 'string' ? data.createdBy : '',
  }
}

/**
 * Subscribe to orders in real-time (safe, paginated, limited)
 */
export function subscribeOrders(
  filters: { uid?: string; status?: OrderStatus; limitCount?: number },
  callback: (orders: Order[]) => void,
  onError?: (error: FirestoreError) => void
): Unsubscribe {
  const constraints: any[] = []
  if (filters.uid) {
    constraints.push(where('uid', '==', filters.uid))
  }
  if (filters.status) {
    constraints.push(where('status', '==', filters.status))
  }
  constraints.push(orderBy('createdAt', 'desc'))
  constraints.push(limit(filters.limitCount || 50))

  const q = query(collection(db, 'orders'), ...constraints)

  return onSnapshot(
    q,
    (snap) => {
      const orders = snap.docs.map(d => parseOrder(d.id, d.data() as Record<string, unknown>))
      callback(orders)
    },
    (error) => {
      console.error('[Firestore:orders subscribe error]:', error)
      onError?.(error)
    }
  )
}

/**
 * Fetch orders page-by-page (Paginated Query)
 */
export async function fetchOrdersPaginated(params: {
  uid?: string
  status?: OrderStatus
  limitCount?: number
  lastVisibleDoc?: any
}): Promise<{ orders: Order[]; lastDoc: any }> {
  const constraints: any[] = []
  if (params.uid) {
    constraints.push(where('uid', '==', params.uid))
  }
  if (params.status) {
    constraints.push(where('status', '==', params.status))
  }
  constraints.push(orderBy('createdAt', 'desc'))
  if (params.lastVisibleDoc) {
    constraints.push(startAfter(params.lastVisibleDoc))
  }
  constraints.push(limit(params.limitCount || 10))

  const q = query(collection(db, 'orders'), ...constraints)
  const snap = await getDocs(q)
  const orders = snap.docs.map(d => parseOrder(d.id, d.data() as Record<string, unknown>))
  const lastDoc = snap.docs[snap.docs.length - 1] || null

  return { orders, lastDoc }
}
