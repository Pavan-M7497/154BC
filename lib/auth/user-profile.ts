import { doc, getDoc, setDoc, serverTimestamp, type DocumentData } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { DEFAULT_ROLE, isUserRole, type UserRole } from '@/lib/auth/roles'

export type LoyaltyTier = 'bronze' | 'silver' | 'gold'

export interface UserProfile {
  uid: string
  email: string
  name: string
  phone?: string
  role: UserRole
  favoriteItems: string[]
  loyaltyPoints: number
  totalSpent: number
  loyaltyTier: LoyaltyTier
  totalOrders: number
  lastPurchaseAt: Date | null
  createdAt: Date
}

export interface UserProfileWrite {
  name: string
  email: string
  role: UserRole
  favoriteItems?: string[]
  loyaltyPoints?: number
  totalSpent?: number
  loyaltyTier?: LoyaltyTier
  totalOrders?: number
  lastPurchaseAt?: ReturnType<typeof serverTimestamp> | null
  phone?: string
  createdAt: ReturnType<typeof serverTimestamp>
}

/** Derive loyalty tier from loyaltyPoints */
export function computeTier(points: number): LoyaltyTier {
  if (points >= 5000) return 'gold'
  if (points >= 1000) return 'silver'
  return 'bronze'
}

/** Points needed for next tier */
export function nextTierThreshold(tier: LoyaltyTier): number {
  switch (tier) {
    case 'bronze': return 1000
    case 'silver': return 5000
    case 'gold': return Infinity
  }
}

export function parseUserProfile(uid: string, data: DocumentData): UserProfile {
  const role = isUserRole(data.role) ? data.role : DEFAULT_ROLE
  const points = typeof data.loyaltyPoints === 'number' ? data.loyaltyPoints : 0
  const totalSpent = typeof data.totalSpent === 'number' ? data.totalSpent : 0
  const totalOrders = typeof data.totalOrders === 'number' ? data.totalOrders : 0

  return {
    uid,
    email: typeof data.email === 'string' ? data.email : '',
    name: typeof data.name === 'string' ? data.name : '',
    phone: typeof data.phone === 'string' ? data.phone : undefined,
    role,
    favoriteItems: Array.isArray(data.favoriteItems) ? data.favoriteItems : [],
    loyaltyPoints: points,
    totalSpent,
    loyaltyTier: isValidTier(data.loyaltyTier) ? data.loyaltyTier : computeTier(points),
    totalOrders,
    lastPurchaseAt: data.lastPurchaseAt?.toDate?.() ?? null,
    createdAt: data.createdAt?.toDate?.() ?? new Date(),
  }
}

function isValidTier(value: unknown): value is LoyaltyTier {
  return typeof value === 'string' && ['bronze', 'silver', 'gold'].includes(value)
}

export function buildDefaultProfile(
  uid: string,
  email: string,
  name: string
): UserProfileWrite {
  return {
    name,
    email,
    role: DEFAULT_ROLE,
    favoriteItems: [],
    loyaltyPoints: 0,
    totalSpent: 0,
    loyaltyTier: 'bronze',
    totalOrders: 0,
    lastPurchaseAt: null,
    createdAt: serverTimestamp(),
  }
}

export async function fetchUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, 'users', uid))
  if (!snap.exists()) return null
  return parseUserProfile(uid, snap.data())
}

export async function ensureUserProfile(
  uid: string,
  email: string,
  name: string
): Promise<UserProfile> {
  const ref = doc(db, 'users', uid)
  const snap = await getDoc(ref)

  if (snap.exists()) {
    return parseUserProfile(uid, snap.data())
  }

  const payload = buildDefaultProfile(uid, email, name)
  try {
    await setDoc(ref, payload)
  } catch (error) {
    const retry = await getDoc(ref)
    if (retry.exists()) {
      return parseUserProfile(uid, retry.data())
    }
    throw error
  }

  return {
    uid,
    email: payload.email,
    name: payload.name,
    role: payload.role,
    favoriteItems: payload.favoriteItems ?? [],
    loyaltyPoints: payload.loyaltyPoints ?? 0,
    totalSpent: payload.totalSpent ?? 0,
    loyaltyTier: payload.loyaltyTier ?? 'bronze',
    totalOrders: payload.totalOrders ?? 0,
    lastPurchaseAt: null,
    createdAt: new Date(),
  }
}
