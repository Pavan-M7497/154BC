/**
 * Input Validators — shared validation for forms and Firestore writes
 */

/** Validate email format */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254
}

/** Validate Indian phone number */
export function isValidPhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s\-()]/g, '')
  return /^(\+91|91)?[6-9]\d{9}$/.test(cleaned)
}

/** Validate name (1-120 chars, no script tags) */
export function isValidName(name: string): boolean {
  return name.length >= 1 && name.length <= 120 && !/<script/i.test(name)
}

/** Sanitize text input — strip HTML tags */
export function sanitizeText(input: string): string {
  return input.replace(/<[^>]*>/g, '').trim()
}

/** Validate a URL is safe to embed (Google Maps, etc) */
export function isValidMapUrl(url: string): boolean {
  if (!url) return true // empty is OK
  try {
    const parsed = new URL(url)
    const allowed = ['maps.google.com', 'www.google.com', 'goo.gl', 'maps.app.goo.gl']
    return allowed.some(domain => parsed.hostname.endsWith(domain))
  } catch {
    return false
  }
}

/** Validate an image URL is from a trusted source */
export function isValidImageUrl(url: string): boolean {
  if (!url) return true
  try {
    const parsed = new URL(url)
    const allowed = [
      'images.unsplash.com',
      'firebasestorage.googleapis.com',
      'storage.googleapis.com',
      'lh3.googleusercontent.com',
    ]
    // Also allow Firebase Storage custom domain
    if (parsed.hostname.endsWith('.firebasestorage.app')) return true
    return allowed.some(domain => parsed.hostname === domain)
  } catch {
    return false
  }
}

/** Validate reservation form */
export function validateReservation(data: {
  name: string
  email: string
  phone: string
  guests: number
  date: string
  timeSlot: string
}): string | null {
  if (!isValidName(data.name)) return 'Please enter a valid name'
  if (!isValidEmail(data.email)) return 'Please enter a valid email'
  if (data.phone && !isValidPhone(data.phone)) return 'Please enter a valid phone number'
  if (data.guests < 1 || data.guests > 20) return 'Guests must be between 1 and 20'
  if (!data.date) return 'Please select a date'
  if (!data.timeSlot) return 'Please select a time'
  return null
}

/** Validate contact form */
export function validateContactMessage(data: {
  name: string
  email: string
  message: string
}): string | null {
  if (!isValidName(data.name)) return 'Please enter a valid name'
  if (!isValidEmail(data.email)) return 'Please enter a valid email'
  if (!data.message || data.message.length < 1) return 'Please enter a message'
  if (data.message.length > 5000) return 'Message is too long (max 5000 characters)'
  return null
}
