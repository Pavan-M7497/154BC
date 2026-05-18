'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useAuth } from '@/components/auth/auth-context'
import { LocationSelector } from '@/components/location-selector'
import { ScrollReveal } from '@/components/ui/scroll-reveal'
import { collection, query, where, orderBy, getDocs, doc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { menuItems, formatPrice, getLocationById } from '@/lib/data'
import { format } from 'date-fns'
import { 
  User, 
  Calendar, 
  Heart, 
  Star, 
  Clock, 
  MapPin, 
  Users,
  X,
  Check,
  Loader2,
  AlertCircle
} from 'lucide-react'

interface Reservation {
  id: string
  locationId: string
  locationName: string
  date: string
  timeSlot: string
  guests: number
  status: 'pending' | 'confirmed' | 'rejected' | 'completed' | 'cancelled'
  specialRequests?: string
  createdAt: Date
}

type Tab = 'profile' | 'reservations' | 'favorites'

function ProfileContent() {
  const router = useRouter()
  const { user, userProfile, loading } = useAuth()
  const [activeTab, setActiveTab] = useState<Tab>('profile')
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loadingReservations, setLoadingReservations] = useState(true)
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  // Fetch reservations
  useEffect(() => {
    async function fetchReservations() {
      if (!user) return
      
      try {
        const q = query(
          collection(db, 'reservations'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        )
        const snapshot = await getDocs(q)
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date()
        })) as Reservation[]
        setReservations(data)
      } catch (error) {
        console.error('Error fetching reservations:', error)
      } finally {
        setLoadingReservations(false)
      }
    }

    if (user) {
      fetchReservations()
    }
  }, [user])

  const handleCancelReservation = async (id: string) => {
    setCancellingId(id)
    try {
      await updateDoc(doc(db, 'reservations', id), {
        status: 'cancelled'
      })
      setReservations(prev => 
        prev.map(r => r.id === id ? { ...r, status: 'cancelled' as const } : r)
      )
    } catch (error) {
      console.error('Error cancelling reservation:', error)
    } finally {
      setCancellingId(null)
    }
  }

  const favoriteItems = menuItems.filter(item => 
    userProfile?.favoriteItems?.includes(item.id)
  )

  const upcomingReservations = reservations.filter(r => 
    r.status === 'pending' || r.status === 'confirmed'
  )
  
  const pastReservations = reservations.filter(r => 
    r.status === 'completed' || r.status === 'cancelled' || r.status === 'rejected'
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <Loader2 className="w-8 h-8 animate-spin text-caramel" />
      </div>
    )
  }

  if (!user || !userProfile) {
    return null
  }

  return (
    <>
      <LocationSelector />
      
      {/* Hero */}
      <section className="pt-32 pb-8 md:pt-40 md:pb-12 bg-oat-milk">
        <div className="max-w-7xl mx-auto px-6">
          <ScrollReveal className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-caramel text-cream flex items-center justify-center text-3xl font-serif">
              {userProfile.name.charAt(0).toUpperCase()}
            </div>
            <div className="text-center md:text-left">
              <h1 className="font-serif text-3xl md:text-4xl text-coffee mb-2">
                Welcome back, {userProfile.name.split(' ')[0]}!
              </h1>
              <div className="flex items-center justify-center md:justify-start gap-4 text-mocha">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-caramel" />
                  <span>{userProfile.loyaltyPoints} points</span>
                </div>
                <span className="text-foam">|</span>
                <span>Member since {format(userProfile.createdAt, 'MMMM yyyy')}</span>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Tabs */}
      <section className="bg-oat-milk border-b border-foam sticky top-[60px] z-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1">
            {[
              { id: 'profile' as Tab, label: 'Profile', icon: User },
              { id: 'reservations' as Tab, label: 'Reservations', icon: Calendar },
              { id: 'favorites' as Tab, label: 'Favorites', icon: Heart },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-caramel text-coffee'
                    : 'border-transparent text-mocha hover:text-coffee'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 md:py-16 bg-cream min-h-[60vh]">
        <div className="max-w-7xl mx-auto px-6">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="max-w-2xl">
              <ScrollReveal>
                <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
                  <h2 className="font-serif text-xl text-coffee mb-6">Personal Information</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-mocha mb-1">Full Name</label>
                      <p className="text-coffee font-medium">{userProfile.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm text-mocha mb-1">Email</label>
                      <p className="text-coffee font-medium">{userProfile.email}</p>
                    </div>
                    {userProfile.phone && (
                      <div>
                        <label className="block text-sm text-mocha mb-1">Phone</label>
                        <p className="text-coffee font-medium">{userProfile.phone}</p>
                      </div>
                    )}
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={0.1}>
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h2 className="font-serif text-xl text-coffee mb-6">Loyalty Program</h2>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-caramel/10 rounded-full flex items-center justify-center">
                      <Star className="w-8 h-8 text-caramel" />
                    </div>
                    <div>
                      <p className="text-3xl font-serif text-coffee">{userProfile.loyaltyPoints}</p>
                      <p className="text-mocha text-sm">Total Points</p>
                    </div>
                  </div>
                  <p className="text-mocha text-sm">
                    Earn 1 point for every ₹10 spent. Redeem points for exclusive rewards and discounts!
                  </p>
                </div>
              </ScrollReveal>
            </div>
          )}

          {/* Reservations Tab */}
          {activeTab === 'reservations' && (
            <div>
              {loadingReservations ? (
                <div className="text-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-caramel mx-auto" />
                </div>
              ) : reservations.length === 0 ? (
                <ScrollReveal className="text-center py-12">
                  <Calendar className="w-16 h-16 text-foam mx-auto mb-4" />
                  <h3 className="font-serif text-xl text-coffee mb-2">No Reservations Yet</h3>
                  <p className="text-mocha mb-6">Book your first table and start your 154 experience!</p>
                  <a
                    href="/contact"
                    className="inline-flex items-center gap-2 bg-coffee text-cream px-6 py-3 rounded-lg font-medium hover:bg-espresso transition-colors"
                  >
                    Make a Reservation
                  </a>
                </ScrollReveal>
              ) : (
                <div className="space-y-6">
                  {upcomingReservations.length > 0 && (
                    <div>
                      <h2 className="font-serif text-2xl text-coffee mb-6">Upcoming Reservations</h2>
                      <div className="space-y-4">
                        {upcomingReservations.map((res) => (
                          <div key={res.id} className="bg-white rounded-xl p-6 shadow-sm">
                            <div className="flex items-center gap-2 text-caramel"><Calendar className="w-4 h-4" /> {format(new Date(res.date), 'MMM d, yyyy')} at {res.timeSlot}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {pastReservations.length > 0 && (
                    <div>
                      <h2 className="font-serif text-2xl text-coffee mb-6">Past Reservations</h2>
                      <div className="space-y-4">
                        {pastReservations.map((res) => (
                          <div key={res.id} className="bg-white rounded-xl p-6 shadow-sm opacity-75">
                            <div className="flex items-center gap-2 text-mocha"><Calendar className="w-4 h-4" /> {format(new Date(res.date), 'MMM d, yyyy')}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Favorites Tab */}
          {activeTab === 'favorites' && (
            <div>
              {favoriteItems.length === 0 ? (
                <ScrollReveal className="text-center py-12">
                  <Heart className="w-16 h-16 text-foam mx-auto mb-4" />
                  <h3 className="font-serif text-xl text-coffee mb-2">No Favorites Yet</h3>
                </ScrollReveal>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {favoriteItems.map((item) => (
                    <div key={item.id} className="bg-white rounded-xl overflow-hidden shadow-sm">
                      <div className="relative h-48">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="p-5">
                        <h3 className="font-serif text-lg text-coffee">{item.name}</h3>
                        <span className="text-caramel font-medium">{formatPrice(item.price)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  )
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-cream"><Loader2 className="w-8 h-8 animate-spin text-caramel" /></div>}>
      <ProfileContent />
    </Suspense>
  )
}