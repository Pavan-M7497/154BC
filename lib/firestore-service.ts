/**
 * Centralized Firestore Service Layer
 * Provides reusable, typed helpers for common Firestore operations
 * with built-in error handling, logging, and defensive parsing
 */

import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  where,
  Query,
  DocumentReference,
  serverTimestamp,
  type FirestoreError,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'

/**
 * Generic subscription handler with error handling
 */
export function subscribeToQuery<T>(
  label: string,
  q: Query,
  parseDoc: (id: string, data: Record<string, unknown>) => T,
  callback: (data: T[]) => void,
  onError?: (error: FirestoreError) => void
): Unsubscribe {
  return onSnapshot(
    q,
    (snap) => {
      try {
        const parsed = snap.docs
          .map((d) => {
            try {
              return parseDoc(d.id, d.data() as Record<string, unknown>)
            } catch (e) {
              console.error(`[Firestore:${label}] Error parsing doc ${d.id}:`, e)
              return null
            }
          })
          .filter((item): item is T => item !== null)
        callback(parsed)
      } catch (e) {
        console.error(`[Firestore:${label}] Error processing snapshot:`, e)
      }
    },
    (error) => {
      console.error(`[Firestore:${label}]`, error.code, error.message)
      onError?.(error)
    }
  )
}

/**
 * Generic single document subscription
 */
export function subscribeToDoc<T>(
  label: string,
  docRef: DocumentReference,
  parseDoc: (data: Record<string, unknown>) => T,
  callback: (data: T | null) => void,
  onError?: (error: FirestoreError) => void
): Unsubscribe {
  return onSnapshot(
    docRef,
    (snap) => {
      try {
        const data = snap.data()
        callback(data ? parseDoc(data as Record<string, unknown>) : null)
      } catch (e) {
        console.error(`[Firestore:${label}] Error parsing doc:`, e)
        callback(null)
      }
    },
    (error) => {
      console.error(`[Firestore:${label}]`, error.code, error.message)
      onError?.(error)
    }
  )
}

/**
 * Generic document fetch with parsing
 */
export async function fetchDocument<T>(
  label: string,
  docRef: DocumentReference,
  parseDoc: (id: string, data: Record<string, unknown>) => T
): Promise<T | null> {
  try {
    const snap = await getDoc(docRef)
    if (!snap.exists()) return null
    return parseDoc(snap.id, snap.data() as Record<string, unknown>)
  } catch (e) {
    console.error(`[Firestore:${label}] Error fetching doc:`, e)
    throw e
  }
}

/**
 * Generic collection query with parsing
 */
export async function fetchCollection<T>(
  label: string,
  collectionQuery: Query,
  parseDoc: (id: string, data: Record<string, unknown>) => T
): Promise<T[]> {
  try {
    const snap = await getDocs(collectionQuery)
    return snap.docs
      .map((d) => {
        try {
          return parseDoc(d.id, d.data() as Record<string, unknown>)
        } catch (e) {
          console.error(`[Firestore:${label}] Error parsing doc ${d.id}:`, e)
          return null
        }
      })
      .filter((item): item is T => item !== null)
  } catch (e) {
    console.error(`[Firestore:${label}] Error fetching collection:`, e)
    throw e
  }
}

/**
 * Add document with automatic timestamps
 */
export async function addDocument<T extends Record<string, unknown>>(
  label: string,
  collectionName: string,
  data: T
): Promise<string> {
  try {
    const ref = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    return ref.id
  } catch (e) {
    console.error(`[Firestore:${label}] Error adding document:`, e)
    throw e
  }
}

/**
 * Set document (create or replace) with timestamps
 */
export async function setDocument<T extends Record<string, unknown>>(
  label: string,
  collectionName: string,
  docId: string,
  data: T,
  merge = false
): Promise<void> {
  try {
    const docRef = doc(db, collectionName, docId)
    await setDoc(
      docRef,
      merge ? { ...data, updatedAt: serverTimestamp() } : { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() },
      { merge }
    )
  } catch (e) {
    console.error(`[Firestore:${label}] Error setting document:`, e)
    throw e
  }
}

/**
 * Delete document
 */
export async function deleteDocument(label: string, collectionName: string, docId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, collectionName, docId))
  } catch (e) {
    console.error(`[Firestore:${label}] Error deleting document:`, e)
    throw e
  }
}

/**
 * Get document data safely
 */
export async function getDocumentData<T extends Record<string, unknown>>(
  collectionName: string,
  docId: string
): Promise<T | null> {
  try {
    const snap = await getDoc(doc(db, collectionName, docId))
    return snap.exists() ? (snap.data() as T) : null
  } catch (e) {
    console.error(`[Firestore] Error getting document:`, e)
    return null
  }
}
