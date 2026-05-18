export interface Location {
  id: string
  name: string
  shortName: string
  address: string
  city: string
  vibe: string
  image: string
  mapUrl: string
  phone: string
  email: string
  instagram: string
  whatsapp: string
  hours: {
    weekday: string
    weekend: string
  }
  coordinates: {
    lat: number
    lng: number
  }
  active?: boolean
  description?: string
  galleryImages?: string[]
}

export interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  category: string
  image: string
  featured?: boolean
  available?: boolean
  dietary?: ('vegetarian' | 'vegan' | 'gluten-free')[]
  locationIds?: string[] // empty = all locations
}

export interface Review {
  id: string
  author: string
  rating: number
  text: string
  date: string
  locationId: string
  source?: 'Google' | 'Zomato'
  avatar?: string
  featured?: boolean
  hidden?: boolean
}

export interface GalleryImage {
  id: string
  src: string
  alt: string
  locationId: string
  order?: number
}

export interface HomepageContent {
  heroTitle?: string
  heroSubtitle?: string
  heroCTA?: string
  announcement?: string
  announcementActive?: boolean
  featuredItemIds?: string[]
}

// Format price in INR
export function formatPrice(price: number): string {
  return `₹${price}`
}

export const locations: Location[] = [
  {
    id: 'indiranagar',
    name: '154 Indiranagar',
    shortName: 'Indiranagar',
    address: '154, 12th Main Road, HAL 2nd Stage',
    city: 'Indiranagar, Bengaluru 560038',
    vibe: 'Our flagship café — urban sophistication meets cozy warmth. Perfect for morning meetings and creative souls in the heart of Indiranagar.',
    image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80',
    mapUrl: 'https://maps.google.com/?q=154+12th+Main+Road+Indiranagar+Bangalore',
    phone: '+91 80 4567 0154',
    email: 'indiranagar@154breakfastclub.in',
    instagram: '@154indiranagar',
    whatsapp: '+918045670154',
    hours: {
      weekday: '8:00 AM - 10:00 PM',
      weekend: '8:00 AM - 11:00 PM'
    },
    coordinates: { lat: 12.9784, lng: 77.6408 },
    active: true,
  },
  {
    id: 'koramangala',
    name: '154 Koramangala',
    shortName: 'Koramangala',
    address: '154, 80 Feet Road, 4th Block',
    city: 'Koramangala, Bengaluru 560034',
    vibe: "The trendy hangout spot — where Bangalore's startup culture meets artisanal coffee and wholesome brunch.",
    image: 'https://images.unsplash.com/photo-1559305616-3f99cd43e353?w=800&q=80',
    mapUrl: 'https://maps.google.com/?q=154+80+Feet+Road+Koramangala+Bangalore',
    phone: '+91 80 4567 0287',
    email: 'koramangala@154breakfastclub.in',
    instagram: '@154koramangala',
    whatsapp: '+918045670287',
    hours: {
      weekday: '8:00 AM - 10:00 PM',
      weekend: '8:00 AM - 11:00 PM'
    },
    coordinates: { lat: 12.9352, lng: 77.6245 },
    active: true,
  },
  {
    id: 'hsr',
    name: '154 HSR Layout',
    shortName: 'HSR',
    address: '154, 27th Main Road, Sector 1',
    city: 'HSR Layout, Bengaluru 560102',
    vibe: 'A peaceful retreat — sunlit spaces with lush greenery, perfect for lazy weekend brunches and work-from-café days.',
    image: 'https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?w=800&q=80',
    mapUrl: 'https://maps.google.com/?q=154+27th+Main+HSR+Layout+Bangalore',
    phone: '+91 80 4567 0042',
    email: 'hsr@154breakfastclub.in',
    instagram: '@154hsr',
    whatsapp: '+918045670042',
    hours: {
      weekday: '8:00 AM - 10:00 PM',
      weekend: '8:00 AM - 11:00 PM'
    },
    coordinates: { lat: 12.9116, lng: 77.6389 },
    active: true,
  }
]

export const menuItems: MenuItem[] = [
  { id: 'classic-pancakes', name: 'Buttermilk Pancakes', description: 'Fluffy stack with maple syrup, whipped butter, and fresh berries', price: 349, category: 'breakfast', image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&q=80', featured: true, available: true, dietary: ['vegetarian'] },
  { id: 'avocado-toast', name: 'Avocado Toast', description: 'Smashed avocado on sourdough with poached eggs, chili flakes, and microgreens', price: 399, category: 'breakfast', image: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=600&q=80', featured: true, available: true, dietary: ['vegetarian'] },
  { id: 'belgian-waffles', name: 'Belgian Waffles', description: 'Crispy golden waffles with house-made berry compote and fresh cream', price: 329, category: 'breakfast', image: 'https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=600&q=80', available: true, dietary: ['vegetarian'] },
  { id: 'eggs-benedict', name: 'Eggs Benedict', description: 'Poached eggs on brioche with smoked salmon and hollandaise', price: 449, category: 'breakfast', image: 'https://images.unsplash.com/photo-1608039829572-9b1234ef409c?w=600&q=80', featured: true, available: true },
  { id: 'brunch-platter', name: 'The 154 Platter', description: 'Eggs your way, chicken sausage, roasted tomatoes, mushrooms, and sourdough', price: 549, category: 'breakfast', image: 'https://images.unsplash.com/photo-1533920379810-6bedac961555?w=600&q=80', available: true },
  { id: 'acai-bowl', name: 'Açaí Power Bowl', description: 'Blended açaí with granola, fresh fruits, coconut, and honey drizzle', price: 349, category: 'breakfast', image: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=600&q=80', available: true, dietary: ['vegan', 'gluten-free'] },
  { id: 'cappuccino', name: 'Cappuccino', description: 'Double shot with velvety milk foam and latte art', price: 179, category: 'coffee', image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=600&q=80', featured: true, available: true },
  { id: 'signature-latte', name: 'Signature Latte', description: 'House-made oat milk with single origin espresso and vanilla', price: 219, category: 'coffee', image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600&q=80', featured: true, available: true, dietary: ['vegan'] },
  { id: 'cold-brew', name: 'Cold Brew', description: '18-hour slow steeped with notes of chocolate and caramel', price: 199, category: 'coffee', image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=600&q=80', available: true, dietary: ['vegan'] },
  { id: 'filter-coffee', name: 'South Indian Filter Coffee', description: 'Traditional decoction brewed fresh, served in a dabara set', price: 99, category: 'coffee', image: 'https://images.unsplash.com/photo-1497515114889-1f074bdfdc42?w=600&q=80', featured: true, available: true, dietary: ['vegetarian'] },
  { id: 'chocolate-brownie', name: 'Fudge Brownie', description: 'Warm chocolate brownie with vanilla ice cream and caramel', price: 279, category: 'desserts', image: 'https://images.unsplash.com/photo-1564355808539-22fda35bed7e?w=600&q=80', featured: true, available: true, dietary: ['vegetarian'] },
  { id: 'cheesecake', name: 'New York Cheesecake', description: 'Classic creamy cheesecake with berry coulis', price: 329, category: 'desserts', image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=600&q=80', available: true, dietary: ['vegetarian'] },
  { id: 'tiramisu', name: 'Tiramisu', description: 'Espresso-soaked ladyfingers with mascarpone and cocoa', price: 349, category: 'desserts', image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&q=80', available: true, dietary: ['vegetarian'] },
]

export const reviews: Review[] = [
  { id: '1', author: 'Priya Sharma', rating: 5, text: 'The atmosphere here is absolutely unmatched. Perfect for a cozy date or focused work session. The avocado toast is divine!', date: '2 weeks ago', locationId: 'indiranagar', source: 'Google', featured: true },
  { id: '2', author: 'Arjun Krishnan', rating: 5, text: 'Best brunch spot in Bangalore. The 154 Platter is a must-try. Staff is incredibly warm and the filter coffee is exceptional.', date: '1 month ago', locationId: 'indiranagar', source: 'Zomato', featured: true },
  { id: '3', author: 'Sneha Reddy', rating: 5, text: 'Finally found my go-to café! The interiors are Instagram-worthy and the food backs up the aesthetic. 10/10.', date: '3 weeks ago', locationId: 'koramangala', source: 'Google', featured: true },
  { id: '4', author: 'Rahul Menon', rating: 5, text: 'The Koramangala location is perfect for startup meetings. Great WiFi, amazing cold brew, and the Belgian waffles are incredible.', date: '1 week ago', locationId: 'koramangala', source: 'Zomato', featured: true },
  { id: '5', author: 'Ananya Iyer', rating: 5, text: 'As a remote worker, I appreciate how peaceful and welcoming this space is. Great WiFi, better pastries, perfect acoustics.', date: '2 months ago', locationId: 'hsr', source: 'Google', featured: true },
  { id: '6', author: 'Vikram Das', rating: 5, text: 'The HSR location feels like an escape from the city. Lush plants, natural light, and the most comforting brunch menu in Bangalore.', date: '1 month ago', locationId: 'hsr', source: 'Zomato', featured: true },
]

export const galleryImages: GalleryImage[] = [
  { id: '1', src: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80', alt: 'Coffee preparation', locationId: 'indiranagar', order: 0 },
  { id: '2', src: 'https://images.unsplash.com/photo-1493857671505-72967e2e2760?w=800&q=80', alt: 'Café interior', locationId: 'indiranagar', order: 1 },
  { id: '3', src: 'https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=800&q=80', alt: 'Brunch spread', locationId: 'koramangala', order: 0 },
  { id: '4', src: 'https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=800&q=80', alt: 'Coffee art', locationId: 'koramangala', order: 1 },
  { id: '5', src: 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=800&q=80', alt: 'Cozy seating', locationId: 'hsr', order: 0 },
  { id: '6', src: 'https://images.unsplash.com/photo-1498804103079-a6351b050096?w=800&q=80', alt: 'Morning light', locationId: 'hsr', order: 1 },
]

export function getLocationById(id: string): Location | undefined {
  return locations.find(l => l.id === id)
}

export function getReviewsByLocation(locationId: string): Review[] {
  return reviews.filter(r => r.locationId === locationId)
}

export function getGalleryByLocation(locationId: string): GalleryImage[] {
  return galleryImages.filter(g => g.locationId === locationId)
}

export function isOpenNow(location: Location): boolean {
  const now = new Date()
  const istOffset = 5.5 * 60 * 60 * 1000
  const istTime = new Date(now.getTime() + (now.getTimezoneOffset() * 60 * 1000) + istOffset)
  
  const day = istTime.getDay()
  const hours = istTime.getHours()
  const minutes = istTime.getMinutes()
  const currentTime = hours * 60 + minutes
  
  const isWeekend = day === 0 || day === 6
  const hoursStr = isWeekend ? location.hours.weekend : location.hours.weekday
  
  const [openStr, closeStr] = hoursStr.split(' - ')
  
  const parseTime = (str: string) => {
    const [time, period] = str.split(' ')
    const [h, m] = time.split(':').map(Number)
    let hrs = h
    if (period === 'PM' && h !== 12) hrs += 12
    if (period === 'AM' && h === 12) hrs = 0
    return hrs * 60 + m
  }
  
  const openTime = parseTime(openStr)
  const closeTime = parseTime(closeStr)
  
  return currentTime >= openTime && currentTime < closeTime
}

export function generateTimeSlots(location: Location, date: Date): string[] {
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()
  const day = date.getDay()
  const isWeekend = day === 0 || day === 6
  const hoursStr = isWeekend ? location.hours.weekend : location.hours.weekday
  
  const [openStr, closeStr] = hoursStr.split(' - ')
  
  const parseTime = (str: string) => {
    const [time, period] = str.split(' ')
    const [h, m] = time.split(':').map(Number)
    let hrs = h
    if (period === 'PM' && h !== 12) hrs += 12
    if (period === 'AM' && h === 12) hrs = 0
    return hrs * 60 + m
  }
  
  const openTime = parseTime(openStr)
  const closeTime = parseTime(closeStr) - 60
  
  const slots: string[] = []
  
  for (let time = openTime; time <= closeTime; time += 30) {
    const h = Math.floor(time / 60)
    const m = time % 60
    const period = h >= 12 ? 'PM' : 'AM'
    const displayHours = h > 12 ? h - 12 : h === 0 ? 12 : h
    const slot = `${displayHours}:${m.toString().padStart(2, '0')} ${period}`
    
    if (isToday) {
      const currentMinutes = now.getHours() * 60 + now.getMinutes()
      if (time > currentMinutes + 30) slots.push(slot)
    } else {
      slots.push(slot)
    }
  }
  
  return slots
}
