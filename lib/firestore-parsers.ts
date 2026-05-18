/**
 * Defensive Firestore Data Parsers
 * Safely converts Firestore documents to typed objects with fallback values
 */

import type { DocumentData, Timestamp } from 'firebase/firestore'
import type { Location, MenuItem, Review, GalleryImage, HomepageContent } from '@/lib/data'

/**
 * Safely convert Firestore Timestamp to Date
 */
export function parseTimestamp(value: unknown): Date {
  if (value instanceof Date) return value
  if (value && typeof value === 'object' && 'toDate' in value && typeof (value as { toDate: unknown }).toDate === 'function') {
    return ((value as { toDate: () => Date }).toDate())
  }
  return new Date()
}

/**
 * Safely parse Location document from Firestore
 */
export function parseLocation(id: string, data: DocumentData): Location {
  return {
    id,
    name: typeof data.name === 'string' ? data.name : 'Unknown Location',
    shortName: typeof data.shortName === 'string' ? data.shortName : data.name?.substring(0, 10) || 'Loc',
    address: typeof data.address === 'string' ? data.address : '',
    city: typeof data.city === 'string' ? data.city : '',
    vibe: typeof data.vibe === 'string' ? data.vibe : '',
    image: typeof data.image === 'string' ? data.image : '',
    mapUrl: typeof data.mapUrl === 'string' ? data.mapUrl : '',
    phone: typeof data.phone === 'string' ? data.phone : '',
    email: typeof data.email === 'string' ? data.email : '',
    instagram: typeof data.instagram === 'string' ? data.instagram : '',
    whatsapp: typeof data.whatsapp === 'string' ? data.whatsapp : '',
    hours: data.hours && typeof data.hours === 'object'
      ? {
        weekday: typeof data.hours.weekday === 'string' ? data.hours.weekday : '8:00 AM - 10:00 PM',
        weekend: typeof data.hours.weekend === 'string' ? data.hours.weekend : '8:00 AM - 11:00 PM',
      }
      : { weekday: '8:00 AM - 10:00 PM', weekend: '8:00 AM - 11:00 PM' },
    coordinates: data.coordinates && typeof data.coordinates === 'object'
      ? {
        lat: typeof data.coordinates.lat === 'number' ? data.coordinates.lat : 0,
        lng: typeof data.coordinates.lng === 'number' ? data.coordinates.lng : 0,
      }
      : { lat: 0, lng: 0 },
    active: data.active !== false,
    description: typeof data.description === 'string' ? data.description : undefined,
    galleryImages: Array.isArray(data.galleryImages) ? data.galleryImages : undefined,
    createdAt: data.createdAt ? parseTimestamp(data.createdAt) : undefined,
    updatedAt: data.updatedAt ? parseTimestamp(data.updatedAt) : undefined,
  }
}

/**
 * Safely parse MenuItem document from Firestore
 */
export function parseMenuItem(id: string, data: DocumentData): MenuItem {
  // Validate and filter dietary tags
  const dietary = Array.isArray(data.dietary)
    ? (data.dietary.filter((d: unknown): d is 'vegetarian' | 'vegan' | 'gluten-free' =>
        ['vegetarian', 'vegan', 'gluten-free'].includes(d as string)
      ))
    : undefined

  return {
    id,
    name: typeof data.name === 'string' ? data.name : 'Unknown Item',
    description: typeof data.description === 'string' ? data.description : '',
    price: typeof data.price === 'number' && data.price >= 0 ? data.price : 0,
    category: typeof data.category === 'string' ? data.category : 'breakfast',
    image: typeof data.image === 'string' ? data.image : '',
    featured: data.featured === true,
    available: data.available !== false,
    dietary: dietary && dietary.length > 0 ? dietary : undefined,
    locationIds: Array.isArray(data.locationIds) ? data.locationIds : undefined,
    createdAt: data.createdAt ? parseTimestamp(data.createdAt) : undefined,
    updatedAt: data.updatedAt ? parseTimestamp(data.updatedAt) : undefined,
  }
}

/**
 * Safely parse Review document from Firestore
 */
export function parseReview(id: string, data: DocumentData): Review {
  // Ensure createdAt exists for orderBy queries
  const createdAt = data.createdAt ? parseTimestamp(data.createdAt) : new Date()

  return {
    id,
    author: typeof data.author === 'string' ? data.author : 'Anonymous',
    rating: typeof data.rating === 'number' && data.rating >= 1 && data.rating <= 5 ? data.rating : 5,
    text: typeof data.text === 'string' ? data.text : '',
    date: typeof data.date === 'string' ? data.date : 'Recently',
    locationId: typeof data.locationId === 'string' ? data.locationId : 'indiranagar',
    source: data.source === 'Google' || data.source === 'Zomato' ? data.source : undefined,
    avatar: typeof data.avatar === 'string' ? data.avatar : undefined,
    featured: data.featured === true,
    hidden: data.hidden === true,
    createdAt,
    updatedAt: data.updatedAt ? parseTimestamp(data.updatedAt) : undefined,
  }
}

/**
 * Safely parse GalleryImage document from Firestore
 */
export function parseGalleryImage(id: string, data: DocumentData): GalleryImage {
  return {
    id,
    src: typeof data.src === 'string' ? data.src : '',
    alt: typeof data.alt === 'string' ? data.alt : 'Gallery image',
    locationId: typeof data.locationId === 'string' ? data.locationId : 'indiranagar',
    order: typeof data.order === 'number' ? data.order : 0,
    createdAt: data.createdAt ? parseTimestamp(data.createdAt) : undefined,
    updatedAt: data.updatedAt ? parseTimestamp(data.updatedAt) : undefined,
  }
}

/**
 * Safely parse HomepageContent document from Firestore
 */
export function parseHomepageContent(data: DocumentData): HomepageContent {
  return {
    heroTitle: typeof data.heroTitle === 'string' ? data.heroTitle : undefined,
    heroSubtitle: typeof data.heroSubtitle === 'string' ? data.heroSubtitle : undefined,
    heroCTA: typeof data.heroCTA === 'string' ? data.heroCTA : undefined,
    announcement: typeof data.announcement === 'string' ? data.announcement : undefined,
    announcementActive: data.announcementActive === true,
    featuredItemIds: Array.isArray(data.featuredItemIds) ? data.featuredItemIds : undefined,
    createdAt: data.createdAt ? parseTimestamp(data.createdAt) : undefined,
    updatedAt: data.updatedAt ? parseTimestamp(data.updatedAt) : undefined,
  }
}

/**
 * Ensure Firestore document has required fields for ordering
 */
export function ensureDocumentTimestamps(doc: Record<string, unknown>): Record<string, unknown> {
  return {
    ...doc,
    createdAt: doc.createdAt || new Date(),
    updatedAt: doc.updatedAt || new Date(),
  }
}
