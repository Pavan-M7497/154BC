'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth'
import { auth } from '@/lib/firebase'
import {
  canAccessDashboard as roleCanAccessDashboard,
  isAdminRole,
  isManagerRole,
  type UserRole,
} from '@/lib/auth/roles'
import {
  ensureUserProfile,
  fetchUserProfile,
  type UserProfile,
} from '@/lib/auth/user-profile'

export type { UserRole, UserProfile }

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  role: UserRole | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  isAdmin: boolean
  isManager: boolean
  canAccessDashboard: boolean
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const loadProfile = async (firebaseUser: User) => {
    const profile = await fetchUserProfile(firebaseUser.uid)
    if (profile) {
      setUserProfile(profile)
      return
    }

    const created = await ensureUserProfile(
      firebaseUser.uid,
      firebaseUser.email || '',
      firebaseUser.displayName || ''
    )
    setUserProfile(created)
  }

  const refreshProfile = async () => {
    if (!user) return
    const profile = await fetchUserProfile(user.uid)
    setUserProfile(profile)
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)

      if (firebaseUser) {
        try {
          await loadProfile(firebaseUser)
        } catch (error) {
          const code =
            error && typeof error === 'object' && 'code' in error
              ? String((error as { code: string }).code)
              : 'unknown'
          console.error('Failed to load user profile:', code, error)
          setUserProfile(null)
        }
      } else {
        setUserProfile(null)
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password)
  }

  const signUp = async (email: string, password: string, name: string) => {
    const result = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(result.user, { displayName: name })
    await ensureUserProfile(result.user.uid, email, name)
  }

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider()
    const result = await signInWithPopup(auth, provider)
    await ensureUserProfile(
      result.user.uid,
      result.user.email || '',
      result.user.displayName || ''
    )
  }

  const signOut = async () => {
    await firebaseSignOut(auth)
    setUserProfile(null)
  }

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email)
  }

  const role = userProfile?.role ?? null
  const isAdmin = isAdminRole(role)
  const isManager = isManagerRole(role)
  const canAccessDashboard = roleCanAccessDashboard(role)

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        role,
        loading,
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
        resetPassword,
        isAdmin,
        isManager,
        canAccessDashboard,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
