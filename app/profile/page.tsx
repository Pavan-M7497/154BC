'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useAuth } from '@/components/auth/auth-context'
import { LocationSelector } from '@/components/location-selector'
import { ScrollReveal } from '@/components/ui/scroll-reveal'
import { collection, query, where, orderBy, limit, getDocs, doc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { menuItems, formatPrice } from '@/lib/data'
import { subscribeLoyaltyHistory, type LoyaltyTransaction } from '@/lib/loyalty'
import { subscribeOrders, type Order } from '@/lib/orders'
import { nextTierThreshold, type LoyaltyTier } from '@/lib/auth/user-profile'
import { format } from 'date-fns'
import { toast } from 'sonner'
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
  AlertCircle,
  Trophy,
  TrendingUp,
  Gift,
  ArrowUpRight,
  ArrowDownRight,
  ShoppingBag,
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

type Tab = 'profile' | 'orders' | 'reservations' | 'loyalty' | 'favorites'

const tierColors: Record<LoyaltyTier, string> = {
  bronze: 'text-amber-700 bg-amber-100 dark:text-amber-300 dark:bg-amber-950/40',
  silver: 'text-slate-700 bg-slate-100 dark:text-slate-300 dark:bg-slate-900/40',
  gold: 'text-yellow-700 bg-yellow-100 dark:text-yellow-300 dark:bg-yellow-950/40',
}

const tierEmoji: Record<LoyaltyTier, string> = {
  bronze: '🥉',
  silver: '🥈',
  gold: '🥇',
}

function ProfileContent() {
  const router = useRouter()
  const { user, userProfile, loading } = useAuth()
  const [activeTab, setActiveTab] = useState<Tab>('profile')
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loyaltyHistory, setLoyaltyHistory] = useState<LoyaltyTransaction[]>([])
  const [ordersHistory, setOrdersHistory] = useState<Order[]>([])
  const [loadingReservations, setLoadingReservations] = useState(true)
  const [loadingLoyalty, setLoadingLoyalty] = useState(true)
  const [loadingOrders, setLoadingOrders] = useState(true)
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  // Subscribe to orders
  useEffect(() => {
    if (!user) return
    setLoadingOrders(true)
    const unsub = subscribeOrders(
      { uid: user.uid, limitCount: 20 },
      (orders) => {
        setOrdersHistory(orders)
        setLoadingOrders(false)
      },
      (error) => {
        console.error('Error fetching orders:', error)
        setLoadingOrders(false)
      }
    )
    return () => unsub()
  }, [user])

  // Fetch reservations with proper cleanup
  useEffect(() => {
    let cancelled = false

    async function fetchReservations() {
      if (!user) return
      
      try {
        const q = query(
          collection(db, 'reservations'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc'),
          limit(50)
        )
        const snapshot = await getDocs(q)
        if (cancelled) return
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date()
        })) as Reservation[]
        setReservations(data)
      } catch (error) {
        console.error('Error fetching reservations:', error)
      } finally {
        if (!cancelled) setLoadingReservations(false)
      }
    }

    if (user) {
      fetchReservations()
    }

    return () => { cancelled = true }
  }, [user])

  // Subscribe to loyalty history
  useEffect(() => {
    if (!user) return
    setLoadingLoyalty(true)
    const unsub = subscribeLoyaltyHistory(
      user.uid,
      (history) => {
        setLoyaltyHistory(history)
        setLoadingLoyalty(false)
      },
      (error) => {
        console.error('Error fetching loyalty history:', error)
        setLoadingLoyalty(false)
      },
      50
    )
    return () => unsub()
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
      toast.success('Reservation cancelled')
    } catch (error) {
      console.error('Error cancelling reservation:', error)
      toast.error('Failed to cancel reservation')
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-caramel" />
      </div>
    )
  }

  if (!user || !userProfile) {
    return null
  }

  // Loyalty progress calculation based on dynamic points tier
  const currentTier = userProfile.loyaltyTier
  const nextThreshold = nextTierThreshold(currentTier)
  
  // Calculate relative progress inside current tier block
  let progress = 0
  let currentPointsInTier = userProfile.loyaltyPoints
  let tierBase = 0
  let tierGoal = 1000

  if (currentTier === 'silver') {
    tierBase = 1000
    tierGoal = 5000
    currentPointsInTier = userProfile.loyaltyPoints - 1000
  } else if (currentTier === 'gold') {
    tierBase = 5000
    tierGoal = 5000
    currentPointsInTier = 0
  }

  if (nextThreshold === Infinity) {
    progress = 100
  } else {
    const range = tierGoal - tierBase
    progress = Math.min(100, Math.max(0, (currentPointsInTier / range) * 100))
  }

  return (
    <>
      <LocationSelector />
      
      {/* Hero */}
      <section className="pt-32 pb-8 md:pt-40 md:pb-12 bg-oat-milk dark:bg-zinc-950">
        <div className="max-w-7xl mx-auto px-6">
          <ScrollReveal className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-caramel text-cream flex items-center justify-center text-3xl font-serif">
              {userProfile.name.charAt(0).toUpperCase()}
            </div>
            <div className="text-center md:text-left">
              <h1 className="font-serif text-3xl md:text-4xl text-coffee dark:text-cream mb-2">
                Welcome back, {userProfile.name.split(' ')[0]}!
              </h1>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 md:gap-4 text-mocha dark:text-cream/70 text-sm">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-caramel" />
                  <span>{userProfile.loyaltyPoints} points</span>
                </div>
                <span className="text-foam">|</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase ${tierColors[currentTier]}`}>
                  {tierEmoji[currentTier]} {currentTier}
                </span>
                <span className="text-foam">|</span>
                <span>Member since {format(userProfile.createdAt, 'MMMM yyyy')}</span>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Tabs */}
      <section className="bg-oat-milk dark:bg-zinc-950 border-b border-foam dark:border-zinc-800 sticky top-[60px] z-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1 overflow-x-auto no-scrollbar">
            {[
              { id: 'profile' as Tab, label: 'Profile', icon: User },
              { id: 'orders' as Tab, label: 'Orders', icon: ShoppingBag },
              { id: 'reservations' as Tab, label: 'Reservations', icon: Calendar },
              { id: 'loyalty' as Tab, label: 'Loyalty & Tiers', icon: Trophy },
              { id: 'favorites' as Tab, label: 'Favorites', icon: Heart },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-4 font-semibold text-sm border-b-2 transition-colors shrink-0 ${
                  activeTab === tab.id
                    ? 'border-caramel text-coffee dark:text-cream'
                    : 'border-transparent text-mocha hover:text-coffee dark:hover:text-cream'
                }`}
              >
                <tab.icon className="w-4 h-4 shrink-0" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 md:py-16 bg-cream dark:bg-zinc-900 min-h-[60vh]">
        <div className="max-w-7xl mx-auto px-6">
          
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="max-w-2xl space-y-6">
              <ScrollReveal>
                <div className="bg-card dark:bg-zinc-950 border border-foam dark:border-zinc-800 rounded-xl p-6 shadow-sm">
                  <h2 className="font-serif text-xl text-coffee dark:text-cream mb-6">Personal Information</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs text-mocha dark:text-cream/50 mb-1">Full Name</label>
                      <p className="text-coffee dark:text-cream font-medium">{userProfile.name}</p>
                    </div>
                    <div>
                      <label className="block text-xs text-mocha dark:text-cream/50 mb-1">Email Address</label>
                      <p className="text-coffee dark:text-cream font-medium">{userProfile.email}</p>
                    </div>
                    {userProfile.phone && (
                      <div>
                        <label className="block text-xs text-mocha dark:text-cream/50 mb-1">Phone Number</label>
                        <p className="text-coffee dark:text-cream font-medium">{userProfile.phone}</p>
                      </div>
                    )}
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={0.1}>
                <div className="bg-card dark:bg-zinc-950 border border-foam dark:border-zinc-800 rounded-xl p-6 shadow-sm">
                  <h2 className="font-serif text-xl text-coffee dark:text-cream mb-6">Loyalty & Spent Status</h2>
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-4 bg-oat-milk dark:bg-zinc-900/60 rounded-lg">
                      <p className="text-2xl font-serif text-coffee dark:text-cream">{userProfile.loyaltyPoints}</p>
                      <p className="text-mocha dark:text-cream/50 text-xs">Points</p>
                    </div>
                    <div className="text-center p-4 bg-oat-milk dark:bg-zinc-900/60 rounded-lg">
                      <p className="text-2xl font-serif text-coffee dark:text-cream">₹{userProfile.totalSpent.toLocaleString()}</p>
                      <p className="text-mocha dark:text-cream/50 text-xs">Total Spent</p>
                    </div>
                    <div className="text-center p-4 bg-oat-milk dark:bg-zinc-900/60 rounded-lg">
                      <p className={`text-sm font-semibold capitalize ${tierColors[currentTier]} px-2.5 py-1 rounded-full inline-block`}>
                        {tierEmoji[currentTier]} {currentTier}
                      </p>
                      <p className="text-mocha dark:text-cream/50 text-xs mt-1">Tier</p>
                    </div>
                  </div>
                  <div className="p-4 bg-caramel/10 border border-caramel/20 rounded-lg">
                    <p className="text-coffee dark:text-cream text-xs leading-relaxed">
                      💡 <strong>Spend Tracking Rule:</strong> You earn points on every purchase automatically upon order completion. The current conversion is set to ₹100 spent = 10 points. Accumulating points triggers automatic tier upgrades!
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="max-w-4xl">
              <ScrollReveal>
                <div className="bg-card dark:bg-zinc-950 border border-foam dark:border-zinc-800 rounded-xl p-6 shadow-sm">
                  <h2 className="font-serif text-xl text-coffee dark:text-cream mb-6">Recent Purchases</h2>
                  {loadingOrders ? (
                    <div className="text-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-caramel mx-auto" />
                    </div>
                  ) : ordersHistory.length === 0 ? (
                    <div className="text-center py-12">
                      <ShoppingBag className="w-12 h-12 text-foam mx-auto mb-4" />
                      <p className="text-mocha dark:text-cream/50">No purchases found</p>
                      <p className="text-mocha/60 dark:text-cream/40 text-sm mt-1">Orders placed by staff at the counter will display here.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {ordersHistory.map((order) => (
                        <div key={order.id} className="border border-foam dark:border-zinc-800 rounded-lg p-5">
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-foam dark:border-zinc-800 pb-3 mb-3">
                            <div>
                              <p className="text-xs text-mocha dark:text-cream/40">Order ID: #{order.id.slice(-6).toUpperCase()}</p>
                              <p className="text-xs text-mocha dark:text-cream/50">{format(order.createdAt, 'MMM d, yyyy - h:mm a')}</p>
                            </div>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
                              order.status === 'completed' 
                                ? 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300' 
                                : order.status === 'cancelled'
                                ? 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300'
                                : 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                            }`}>
                              {order.status}
                            </span>
                          </div>

                          <div className="space-y-2">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="flex justify-between items-center text-sm">
                                <p className="text-coffee dark:text-cream font-medium">
                                  {item.name} <span className="text-mocha dark:text-cream/50">x{item.quantity}</span>
                                </p>
                                <p className="text-coffee dark:text-cream">₹{(item.price * item.quantity).toLocaleString()}</p>
                              </div>
                            ))}
                          </div>

                          <div className="flex justify-between items-center border-t border-foam dark:border-zinc-800 pt-3 mt-3">
                            <div>
                              <p className="text-xs text-mocha dark:text-cream/50 capitalize">Payment: {order.paymentMethod}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-mocha dark:text-cream/50">Total Paid</p>
                              <p className="text-base font-bold text-coffee dark:text-cream">₹{order.amount.toLocaleString()}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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
                  <h3 className="font-serif text-xl text-coffee dark:text-cream mb-2">No Reservations Yet</h3>
                  <p className="text-mocha dark:text-cream/50 mb-6">Book your first table and start your 154 experience!</p>
                  <a
                    href="/contact"
                    className="inline-flex items-center gap-2 bg-coffee dark:bg-cream text-cream dark:text-coffee px-6 py-3 rounded-lg font-semibold hover:bg-espresso transition-colors"
                  >
                    Make a Reservation
                  </a>
                </ScrollReveal>
              ) : (
                <div className="space-y-6">
                  {upcomingReservations.length > 0 && (
                    <div>
                      <h2 className="font-serif text-2xl text-coffee dark:text-cream mb-6">Upcoming Reservations</h2>
                      <div className="grid md:grid-cols-2 gap-4">
                        {upcomingReservations.map((res) => (
                          <div key={res.id} className="bg-card dark:bg-zinc-950 border border-foam dark:border-zinc-800 rounded-xl p-6 shadow-sm">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-caramel font-semibold">
                                <Calendar className="w-4 h-4" />
                                {format(new Date(res.date), 'MMM d, yyyy')} at {res.timeSlot}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${
                                  res.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                  {res.status}
                                </span>
                                {res.status === 'pending' && (
                                  <button
                                    onClick={() => handleCancelReservation(res.id)}
                                    disabled={cancellingId === res.id}
                                    className="text-xs text-red-500 hover:text-red-700 transition-colors ml-2"
                                  >
                                    {cancellingId === res.id ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Cancel'}
                                  </button>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-4 mt-3 text-sm text-mocha dark:text-cream/60">
                              <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {res.locationName}</span>
                              <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> {res.guests} guests</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {pastReservations.length > 0 && (
                    <div>
                      <h2 className="font-serif text-2xl text-coffee dark:text-cream mb-6">Past Reservations</h2>
                      <div className="space-y-3 max-w-2xl">
                        {pastReservations.map((res) => (
                          <div key={res.id} className="bg-card/60 dark:bg-zinc-950/40 border border-foam dark:border-zinc-800 rounded-xl p-4 shadow-sm opacity-75">
                            <div className="flex items-center gap-2 text-mocha dark:text-cream/50 text-sm">
                              <Calendar className="w-4 h-4" /> {format(new Date(res.date), 'MMM d, yyyy')} at {res.timeSlot}
                              <span className="text-foam">|</span>
                              <span>{res.locationName}</span>
                              <span className={`ml-auto px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${
                                res.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-zinc-100 text-zinc-600'
                              }`}>
                                {res.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Loyalty Tab */}
          {activeTab === 'loyalty' && (
            <div className="max-w-3xl space-y-6">
              {/* Tier Progress */}
              <ScrollReveal>
                <div className="bg-card dark:bg-zinc-950 border border-foam dark:border-zinc-800 rounded-xl p-6 shadow-sm">
                  <h2 className="font-serif text-xl text-coffee dark:text-cream mb-4">Milestone Progress</h2>
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl ${tierColors[currentTier]}`}>
                      {tierEmoji[currentTier]}
                    </div>
                    <div className="flex-1">
                      <p className="text-coffee dark:text-cream font-bold capitalize">{currentTier} Tier member</p>
                      {nextThreshold !== Infinity ? (
                        <>
                          <div className="w-full h-2.5 bg-foam dark:bg-zinc-800 rounded-full mt-2 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${progress}%` }}
                              transition={{ duration: 1, ease: 'easeOut' }}
                              className="h-full bg-caramel rounded-full"
                            />
                          </div>
                          <p className="text-mocha dark:text-cream/50 text-xs mt-2">
                            {userProfile.loyaltyPoints} / {nextThreshold} points to next milestone
                          </p>
                        </>
                      ) : (
                        <p className="text-mocha dark:text-cream/60 text-sm mt-1">🎉 Gold Status reached! You are receiving maximum perks.</p>
                      )}
                    </div>
                  </div>
                </div>
              </ScrollReveal>

              {/* Stats Grid */}
              <ScrollReveal delay={0.1}>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-card dark:bg-zinc-950 border border-foam dark:border-zinc-800 rounded-xl p-5 shadow-sm text-center">
                    <Star className="w-6 h-6 text-caramel mx-auto mb-2" />
                    <p className="text-2xl font-serif text-coffee dark:text-cream">{userProfile.loyaltyPoints}</p>
                    <p className="text-mocha dark:text-cream/50 text-xs font-semibold">Available Points</p>
                  </div>
                  <div className="bg-card dark:bg-zinc-950 border border-foam dark:border-zinc-800 rounded-xl p-5 shadow-sm text-center">
                    <TrendingUp className="w-6 h-6 text-caramel mx-auto mb-2" />
                    <p className="text-2xl font-serif text-coffee dark:text-cream">₹{userProfile.totalSpent.toLocaleString()}</p>
                    <p className="text-mocha dark:text-cream/50 text-xs font-semibold">Lifetime Spend</p>
                  </div>
                  <div className="bg-card dark:bg-zinc-950 border border-foam dark:border-zinc-800 rounded-xl p-5 shadow-sm text-center">
                    <ShoppingBag className="w-6 h-6 text-caramel mx-auto mb-2" />
                    <p className="text-2xl font-serif text-coffee dark:text-cream">{userProfile.totalOrders}</p>
                    <p className="text-mocha dark:text-cream/50 text-xs font-semibold">Total Orders</p>
                  </div>
                </div>
              </ScrollReveal>

              {/* Transaction History */}
              <ScrollReveal delay={0.2}>
                <div className="bg-card dark:bg-zinc-950 border border-foam dark:border-zinc-800 rounded-xl p-6 shadow-sm">
                  <h2 className="font-serif text-xl text-coffee dark:text-cream mb-5">Transaction History</h2>
                  {loadingLoyalty ? (
                    <div className="text-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-caramel mx-auto" />
                    </div>
                  ) : loyaltyHistory.length === 0 ? (
                    <div className="text-center py-8">
                      <Gift className="w-12 h-12 text-foam mx-auto mb-3" />
                      <p className="text-mocha dark:text-cream/50">No loyalty history found</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {loyaltyHistory.map(tx => (
                        <div key={tx.id} className="flex items-center gap-3 p-3 border border-foam dark:border-zinc-800 rounded-lg">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                            tx.type === 'earn' || tx.type === 'bonus' 
                              ? 'bg-green-100 text-green-600 dark:bg-green-950/40 dark:text-green-300' 
                              : tx.type === 'redeem' 
                              ? 'bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-300'
                              : 'bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300'
                          }`}>
                            {tx.type === 'earn' || tx.type === 'bonus' ? (
                              <ArrowUpRight className="w-4 h-4" />
                            ) : tx.type === 'redeem' ? (
                              <ArrowDownRight className="w-4 h-4" />
                            ) : (
                              <Star className="w-4 h-4" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-coffee dark:text-cream text-sm font-semibold capitalize">{tx.type}</p>
                            <p className="text-mocha dark:text-cream/50 text-xs">
                              {tx.note || (tx.amountSpent ? `₹${tx.amountSpent} purchase` : '')}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className={`text-sm font-semibold ${
                              tx.pointsEarned > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                            }`}>
                              {tx.pointsEarned > 0 ? `+${tx.pointsEarned}` : `-${tx.pointsRedeemed || 0}`}
                            </p>
                            <p className="text-mocha dark:text-cream/40 text-[10px]">{format(tx.createdAt, 'MMM d, yyyy')}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </ScrollReveal>
            </div>
          )}

          {/* Favorites Tab */}
          {activeTab === 'favorites' && (
            <div>
              {favoriteItems.length === 0 ? (
                <ScrollReveal className="text-center py-12">
                  <Heart className="w-16 h-16 text-foam mx-auto mb-4" />
                  <h3 className="font-serif text-xl text-coffee dark:text-cream mb-2">No Favorites Yet</h3>
                </ScrollReveal>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {favoriteItems.map((item) => (
                    <div key={item.id} className="bg-card dark:bg-zinc-950 border border-foam dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
                      <div className="relative h-48">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="p-5">
                        <h3 className="font-serif text-lg text-coffee dark:text-cream">{item.name}</h3>
                        <span className="text-caramel font-semibold">{formatPrice(item.price)}</span>
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
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="w-8 h-8 animate-spin text-caramel" /></div>}>
      <ProfileContent />
    </Suspense>
  )
}