'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  collection,
  query,
  onSnapshot,
  orderBy,
  limit,
  Timestamp,
  doc,
  updateDoc,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/components/auth/auth-context'
import { format } from 'date-fns'
import {
  MapPin,
  UtensilsCrossed,
  Images,
  Star,
  Calendar,
  Users,
  Mail,
  AlertCircle,
  Check,
  X,
  TrendingUp,
  Clock,
  ArrowRight,
} from 'lucide-react'
import { locations } from '@/lib/data'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface Reservation {
  id: string
  name: string
  email: string
  phone: string
  date: string
  time: string
  guests: number
  locationId: string
  specialRequests?: string
  status: 'pending' | 'confirmed' | 'cancelled'
  createdAt: Timestamp
}

interface ContactMessage {
  id: string
  name: string
  email: string
  subject: string
  message: string
  locationId: string
  createdAt: Timestamp
  status: 'unread' | 'read' | 'replied'
}

const quickLinks = [
  { href: '/admin/locations', label: 'Manage Locations', icon: MapPin, desc: 'Add, edit or disable locations' },
  { href: '/admin/menu', label: 'Edit Menu', icon: UtensilsCrossed, desc: 'Update items, prices, availability' },
  { href: '/admin/gallery', label: 'Gallery', icon: Images, desc: 'Upload and manage photos' },
  { href: '/admin/reviews', label: 'Reviews', icon: Star, desc: 'Feature and moderate reviews' },
]

function StatCard({ label, value, icon: Icon, color, sublabel }: {
  label: string
  value: number | string
  icon: React.ElementType
  color: string
  sublabel?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-background border border-border rounded-2xl p-5"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-muted-foreground text-sm mb-1">{label}</p>
          <p className="text-foreground text-3xl font-bold">{value}</p>
          {sublabel && <p className="text-espresso text-xs mt-1">{sublabel}</p>}
        </div>
        <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center', color)}>
          <Icon size={20} />
        </div>
      </div>
    </motion.div>
  )
}

export default function AdminDashboard() {
  const { userProfile, canAccessDashboard, loading: authLoading } = useAuth()
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [messages, setMessages] = useState<ContactMessage[]>([])

  useEffect(() => {
    if (authLoading || !canAccessDashboard) return

    // PERFORMANCE FIX: limit() to prevent unbounded reads
    const q1 = query(
      collection(db, 'reservations'),
      orderBy('createdAt', 'desc'),
      limit(100)
    )
    const unsub1 = onSnapshot(
      q1,
      (snap) => {
        setReservations(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Reservation))
      },
      (error) => {
        console.error('[admin] reservations listener:', error.code, error.message)
        if (error.code === 'permission-denied') {
          toast.error('Permission denied reading reservations')
        }
      }
    )

    const q2 = query(
      collection(db, 'contactMessages'),
      orderBy('createdAt', 'desc'),
      limit(100)
    )
    const unsub2 = onSnapshot(
      q2,
      (snap) => {
        setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as ContactMessage))
      },
      (error) => {
        console.error('[admin] contactMessages listener:', error.code, error.message)
        if (error.code === 'permission-denied') {
          toast.error('Permission denied reading messages')
        }
      }
    )

    return () => {
      unsub1()
      unsub2()
    }
  }, [authLoading, canAccessDashboard])

  const today = new Date()
  const todayStr = today.toDateString()
  const todayReservations = reservations.filter(r => new Date(r.date).toDateString() === todayStr)
  const pendingReservations = reservations.filter(r => r.status === 'pending')
  const unreadMessages = messages.filter(m => m.status === 'unread')
  const totalGuests = todayReservations.reduce((sum, r) => sum + r.guests, 0)

  const recentReservations = pendingReservations.slice(0, 5)

  const updateStatus = async (id: string, status: 'confirmed' | 'cancelled') => {
    try {
      await updateDoc(doc(db, 'reservations', id), { status })
      toast.success(`Reservation ${status}`)
    } catch (err) {
      console.error('[admin] updateStatus error:', err)
      toast.error('Failed to update reservation')
    }
  }

  const getLocationName = (id: string) => locations.find(l => l.id === id)?.shortName || id

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-accent text-sm font-medium mb-1">{greeting}</p>
        <h1 className="text-foreground text-3xl font-serif">
          {userProfile?.name ? `Welcome back, ${userProfile.name.split(' ')[0]}` : 'Dashboard'}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {format(today, 'EEEE, MMMM d, yyyy')} — Here&apos;s what&apos;s happening today
        </p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Today's Reservations" value={todayReservations.length} icon={Calendar} color="bg-accent/10 text-accent" sublabel={`${totalGuests} guests`} />
        <StatCard label="Pending Approvals" value={pendingReservations.length} icon={AlertCircle} color="bg-yellow-500/10 text-yellow-400" />
        <StatCard label="Unread Messages" value={unreadMessages.length} icon={Mail} color="bg-blue-500/10 text-blue-400" />
        <StatCard label="Total Reservations" value={reservations.length} icon={TrendingUp} color="bg-green-500/10 text-green-400" sublabel="All time" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Pending Reservations */}
        <div className="lg:col-span-2 bg-background border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-foreground font-semibold">Pending Reservations</h2>
            <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20 text-xs">
              {pendingReservations.length} pending
            </Badge>
          </div>

          {recentReservations.length === 0 ? (
            <div className="text-center py-10">
              <Calendar className="w-8 h-8 text-espresso mx-auto mb-2" />
              <p className="text-muted-foreground text-sm">No pending reservations</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentReservations.map(r => (
                <div key={r.id} className="bg-card rounded-xl p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-foreground text-sm font-medium">{r.name}</p>
                        <Badge className="bg-secondary text-muted-foreground border-secondary text-xs shrink-0">
                          {getLocationName(r.locationId)}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar size={11} />
                          {r.date ? format(new Date(r.date), 'MMM d') : '—'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={11} />
                          {r.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users size={11} />
                          {r.guests} guests
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <button
                        onClick={() => updateStatus(r.id, 'confirmed')}
                        className="w-8 h-8 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-400 flex items-center justify-center transition-colors"
                        title="Confirm"
                      >
                        <Check size={14} />
                      </button>
                      <button
                        onClick={() => updateStatus(r.id, 'cancelled')}
                        className="w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 flex items-center justify-center transition-colors"
                        title="Cancel"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="space-y-3">
          <h2 className="text-foreground font-semibold">Quick Actions</h2>
          {quickLinks.map(({ href, label, icon: Icon, desc }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 p-4 bg-background border border-border rounded-xl hover:border-accent/30 hover:bg-card transition-all group"
            >
              <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center shrink-0 group-hover:bg-accent/20 transition-colors">
                <Icon size={16} className="text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-foreground text-sm font-medium">{label}</p>
                <p className="text-muted-foreground text-xs truncate">{desc}</p>
              </div>
              <ArrowRight size={14} className="text-espresso group-hover:text-accent group-hover:translate-x-0.5 transition-all" />
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Messages */}
      {unreadMessages.length > 0 && (
        <div className="bg-background border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-foreground font-semibold">Unread Messages</h2>
            <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-xs">
              {unreadMessages.length} new
            </Badge>
          </div>
          <div className="space-y-3">
            {unreadMessages.slice(0, 3).map(m => (
              <div key={m.id} className="flex items-start gap-3 p-3 bg-card rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                  <Mail size={14} className="text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-foreground text-sm font-medium">{m.name}</p>
                    <span className="text-muted-foreground text-xs">{m.email}</span>
                  </div>
                  <p className="text-muted-foreground text-xs truncate">{m.subject || m.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
