import { doc, getDoc, setDoc, serverTimestamp, type DocumentData } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { DEFAULT_ROLE, isUserRole, type UserRole } from '@/lib/auth/roles'

export interface UserProfile {
  uid: string
  email: string
  name: string
  phone?: string
  role: UserRole
  favoriteItems: string[]
  loyaltyPoints: number
  createdAt: Date
}

export interface UserProfileWrite {
  name: string
  email: string
  role: UserRole
  favoriteItems?: string[]
  loyaltyPoints?: number
  phone?: string
  createdAt: ReturnType<typeof serverTimestamp>
}

export function parseUserProfile(uid: string, data: DocumentData): UserProfile {
  const role = isUserRole(data.role) ? data.role : DEFAULT_ROLE

  return {
    uid,
    email: typeof data.email === 'string' ? data.email : '',
    name: typeof data.name === 'string' ? data.name : '',
    phone: typeof data.phone === 'string' ? data.phone : undefined,
    role,
    favoriteItems: Array.isArray(data.favoriteItems) ? data.favoriteItems : [],
    loyaltyPoints: typeof data.loyaltyPoints === 'number' ? data.loyaltyPoints : 0,
    createdAt: data.createdAt?.toDate?.() ?? new Date(),
  }
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
    loyaltyPoints: 100,
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
    createdAt: new Date(),
  }
}
