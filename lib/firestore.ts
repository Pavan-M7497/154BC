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
  limit,
  serverTimestamp,
  type FirestoreError,
  type Query,
  type QuerySnapshot,
  type Unsubscribe,
} from 'firebase/firestore'
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage'
import { db, storage } from '@/lib/firebase'
import type { Location, MenuItem, Review, GalleryImage, HomepageContent } from '@/lib/data'
import {
  parseLocation,
  parseMenuItem,
  parseReview,
  parseGalleryImage,
  parseHomepageContent,
} from '@/lib/firestore-parsers'

export type { FirestoreError }

function logSubscriptionError(label: string, error: FirestoreError): void {
  console.error(`[Firestore:${label}]`, error.code, error.message)
}

function subscribeQuery<T>(
  label: string,
  q: Query,
  map: (snap: QuerySnapshot) => T[],
  callback: (data: T[]) => void,
  onError?: (error: FirestoreError) => void
): Unsubscribe {
  return onSnapshot(
    q,
    (snap) => callback(map(snap)),
    (error) => {
      logSubscriptionError(label, error)
      onError?.(error)
    }
  )
}

// ─── Locations ──────────────────────────────────────────────────────────────

export function subscribeLocations(
  callback: (locations: Location[]) => void,
  onError?: (error: FirestoreError) => void
): Unsubscribe {
  const q = query(collection(db, 'locations'), orderBy('name'), limit(50))
  return subscribeQuery(
    'locations',
    q,
    (snap) => snap.docs.map((d) => parseLocation(d.id, d.data())),
    callback,
    onError
  )
}

export async function getLocations(): Promise<Location[]> {
  const snap = await getDocs(query(collection(db, 'locations'), orderBy('name')))
  return snap.docs.map((d) => parseLocation(d.id, d.data()))
}

export async function saveLocation(location: Omit<Location, 'id'> & { id?: string }): Promise<string> {
  if (location.id) {
    const { id, ...data } = location
    await setDoc(doc(db, 'locations', id), { ...data, updatedAt: serverTimestamp() }, { merge: true })
    return id
  }
  const ref = await addDoc(collection(db, 'locations'), {
    ...location,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function deleteLocation(id: string): Promise<void> {
  await deleteDoc(doc(db, 'locations', id))
}

// ─── Menu Items ──────────────────────────────────────────────────────────────

export function subscribeMenuItems(
  callback: (items: MenuItem[]) => void,
  onError?: (error: FirestoreError) => void
): Unsubscribe {
  const q = query(collection(db, 'menuItems'), orderBy('category'), limit(100))
  return subscribeQuery(
    'menuItems',
    q,
    (snap) => snap.docs.map((d) => parseMenuItem(d.id, d.data())),
    callback,
    onError
  )
}

export async function getMenuItems(): Promise<MenuItem[]> {
  const snap = await getDocs(query(collection(db, 'menuItems'), orderBy('category')))
  return snap.docs.map((d) => parseMenuItem(d.id, d.data()))
}

export async function saveMenuItem(item: Omit<MenuItem, 'id'> & { id?: string }): Promise<string> {
  if (item.id) {
    const { id, ...data } = item
    await setDoc(doc(db, 'menuItems', id), { ...data, updatedAt: serverTimestamp() }, { merge: true })
    return id
  }
  const ref = await addDoc(collection(db, 'menuItems'), {
    ...item,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function deleteMenuItem(id: string): Promise<void> {
  await deleteDoc(doc(db, 'menuItems', id))
}

// ─── Reviews ─────────────────────────────────────────────────────────────────

export function subscribeReviews(
  callback: (reviews: Review[]) => void,
  onError?: (error: FirestoreError) => void
): Unsubscribe {
  const q = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'), limit(50))
  return subscribeQuery(
    'reviews',
    q,
    (snap) => snap.docs.map((d) => parseReview(d.id, d.data())),
    callback,
    onError
  )
}

export async function getReviews(): Promise<Review[]> {
  const snap = await getDocs(query(collection(db, 'reviews'), orderBy('createdAt', 'desc')))
  return snap.docs.map((d) => parseReview(d.id, d.data()))
}

export async function saveReview(review: Omit<Review, 'id'> & { id?: string }): Promise<string> {
  if (review.id) {
    const { id, ...data } = review
    await setDoc(
      doc(db, 'reviews', id),
      { ...data, updatedAt: serverTimestamp() },
      { merge: true }
    )
    return id
  }
  const r = await addDoc(collection(db, 'reviews'), {
    ...review,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return r.id
}

export async function deleteReview(id: string): Promise<void> {
  await deleteDoc(doc(db, 'reviews', id))
}

// ─── Homepage CMS ───────────────────────────────────────────────────────────

export async function getHomepageCMS(): Promise<HomepageContent> {
  try {
    const snap = await getDoc(doc(db, 'settings', 'homepage'))
    return snap.data() ? parseHomepageContent(snap.data()!) : {}
  } catch (error) {
    console.error('Error getting homepage CMS:', error)
    return {}
  }
}

export async function updateHomepageCMS(data: Record<string, unknown>): Promise<void> {
  await setDoc(
    doc(db, 'settings', 'homepage'),
    { ...data, updatedAt: serverTimestamp() },
    { merge: true }
  )
}

export async function getSettings(): Promise<Record<string, unknown>> {
  try {
    const snap = await getDoc(doc(db, 'settings', 'general'))
    return snap.data() || {}
  } catch (error) {
    console.error('Error getting settings:', error)
    return {}
  }
}

export async function updateSettings(data: Record<string, unknown>): Promise<void> {
  await setDoc(
    doc(db, 'settings', 'general'),
    { ...data, updatedAt: serverTimestamp() },
    { merge: true }
  )
}

// ─── Gallery ─────────────────────────────────────────────────────────────────

export function subscribeGallery(
  callback: (images: GalleryImage[]) => void,
  onError?: (error: FirestoreError) => void
): Unsubscribe {
  const q = query(collection(db, 'gallery'), orderBy('order'), limit(100))
  return subscribeQuery(
    'gallery',
    q,
    (snap) => snap.docs.map((d) => parseGalleryImage(d.id, d.data())),
    callback,
    onError
  )
}

export async function getGallery(): Promise<GalleryImage[]> {
  const snap = await getDocs(query(collection(db, 'gallery'), orderBy('order')))
  return snap.docs.map((d) => parseGalleryImage(d.id, d.data()))
}

export async function saveGalleryImage(
  image: Omit<GalleryImage, 'id'> & { id?: string }
): Promise<string> {
  if (image.id) {
    const { id, ...data } = image
    await setDoc(doc(db, 'gallery', id), { ...data, updatedAt: serverTimestamp() }, { merge: true })
    return id
  }
  const r = await addDoc(collection(db, 'gallery'), {
    ...image,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return r.id
}

export async function deleteGalleryImage(id: string, storageUrl?: string): Promise<void> {
  await deleteDoc(doc(db, 'gallery', id))
  if (storageUrl) {
    try {
      const storageRef = ref(storage, storageUrl)
      await deleteObject(storageRef)
    } catch {
      // Ignore if the storage object doesn't exist
    }
  }
}

// ─── Homepage Content ────────────────────────────────────────────────────────

export function subscribeHomepageContent(
  callback: (content: HomepageContent) => void,
  onError?: (error: FirestoreError) => void
): Unsubscribe {
  return onSnapshot(
    doc(db, 'settings', 'homepage'),
    (snap) => {
      const data = snap.data()
      callback(data ? parseHomepageContent(data) : {})
    },
    (error) => {
      logSubscriptionError('settings/homepage', error)
      onError?.(error)
    }
  )
}

export async function saveHomepageContent(content: HomepageContent): Promise<void> {
  await setDoc(
    doc(db, 'settings', 'homepage'),
    { ...content, updatedAt: serverTimestamp() },
    { merge: true }
  )
}

// ─── File Upload ─────────────────────────────────────────────────────────────

export function uploadFile(
  file: File,
  path: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    const storageRef = ref(storage, path)
    const uploadTask = uploadBytesResumable(storageRef, file)

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        onProgress?.(progress)
      },
      (error) => reject(error),
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref)
        resolve(url)
      }
    )
  })
}
