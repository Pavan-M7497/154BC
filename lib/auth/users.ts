import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  type FirestoreError,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { parseUserProfile, type UserProfile } from '@/lib/auth/user-profile'
import { isUserRole, type UserRole } from '@/lib/auth/roles'

export function subscribeUsers(
  callback: (users: UserProfile[]) => void,
  onError?: (error: FirestoreError) => void
): Unsubscribe {
  const q = query(collection(db, 'users'), orderBy('name'))

  return onSnapshot(
    q,
    (snap) => {
      const users = snap.docs.map((d) => parseUserProfile(d.id, d.data()))
      callback(users)
    },
    (err) => {
      console.error('[Firestore:users]', err.code, err.message)
      onError?.(err)
    }
  )
}

export async function listUsers(): Promise<UserProfile[]> {
  const snap = await getDocs(query(collection(db, 'users'), orderBy('name')))
  return snap.docs.map((d) => parseUserProfile(d.id, d.data()))
}

export async function updateUserRole(uid: string, role: UserRole): Promise<void> {
  if (!isUserRole(role)) {
    throw new Error('Invalid role')
  }
  await updateDoc(doc(db, 'users', uid), { role })
}
