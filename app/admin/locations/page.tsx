'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { subscribeLocations, saveLocation, deleteLocation } from '@/lib/firestore'
import { locations as staticLocations, type Location } from '@/lib/data'
import { AdminPageHeader } from '@/components/admin/admin-page-header'
import { ImageUpload } from '@/components/admin/image-upload'
import {
  MapPin, Phone, Mail, Instagram, Globe, Clock, Trash2, Edit2, ToggleLeft, ToggleRight, X, Save, Loader2, ExternalLink
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { RoleGuard } from '@/components/auth/role-guard'

const emptyLocation: Omit<Location, 'id'> = {
  name: '',
  shortName: '',
  address: '',
  city: '',
  vibe: '',
  image: '',
  mapUrl: '',
  phone: '',
  email: '',
  instagram: '',
  whatsapp: '',
  hours: { weekday: '8:00 AM - 10:00 PM', weekend: '8:00 AM - 11:00 PM' },
  coordinates: { lat: 0, lng: 0 },
  active: true,
}

export default function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>(staticLocations)
  const [editing, setEditing] = useState<(Location | (Omit<Location, 'id'> & { id?: string })) | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [seeded, setSeeded] = useState(false)

  useEffect(() => {
    const unsub = subscribeLocations(
      (locs) => {
        if (locs.length > 0) {
          setLocations(locs)
          setSeeded(true)
        }
      },
      (error) => {
        if (error.code === 'permission-denied') {
          toast.error('No permission to load locations. Admin role required.')
        }
      }
    )
    return () => unsub()
  }, [])

  const handleSeedLocations = async () => {
    setSaving(true)
    try {
      for (const loc of staticLocations) {
        await saveLocation(loc)
      }
      toast.success('Locations seeded to Firestore successfully!')
      setSeeded(true)
    } catch (err) {
      console.error('[v0] Seed error:', err)
      toast.error('Failed to seed locations')
    } finally {
      setSaving(false)
    }
  }

  const handleSave = async () => {
    if (!editing) return
    if (!editing.name || !editing.address) {
      toast.error('Name and address are required')
      return
    }
    setSaving(true)
    try {
      await saveLocation(editing as Location)
      toast.success('Location saved!')
      setEditing(null)
    } catch (err) {
      console.error('[v0] Save location error:', err)
      toast.error('Failed to save location')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this location? This cannot be undone.')) return
    setDeleting(id)
    try {
      await deleteLocation(id)
      toast.success('Location deleted')
    } catch {
      toast.error('Failed to delete location')
    } finally {
      setDeleting(null)
    }
  }

  const handleToggleActive = async (loc: Location) => {
    try {
      await saveLocation({ ...loc, active: !loc.active })
      toast.success(`Location ${loc.active ? 'deactivated' : 'activated'}`)
    } catch {
      toast.error('Failed to update location')
    }
  }

  const updateField = (field: string, value: unknown) => {
    setEditing(prev => prev ? { ...prev, [field]: value } : null)
  }

  const updateNestedField = (parent: string, field: string, value: unknown) => {
    setEditing(prev => {
      if (!prev) return null
      const parentObj = prev[parent as keyof typeof prev]
      if (typeof parentObj !== 'object' || parentObj === null) return prev
      return {
        ...prev,
        [parent]: { ...parentObj, [field]: value }
      } as typeof prev
    })
  }

  return (
    <RoleGuard permission="locations">
    <div className="space-y-6 max-w-5xl">
      <AdminPageHeader
        title="Locations"
        description="Manage your café locations, hours, and contact details"
        actionLabel="Add Location"
        onAction={() => setEditing({ ...emptyLocation })}
        count={locations.length}
      />

      {/* Seed prompt */}
      {!seeded && (
        <div className="bg-[#1A0F0A] border border-[#D4A574]/20 rounded-xl p-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-[#FAF7F2] text-sm font-medium">Initialize Firestore Data</p>
            <p className="text-[#8B7355] text-xs mt-0.5">Seed the 3 default locations to your Firestore database to get started</p>
          </div>
          <Button onClick={handleSeedLocations} disabled={saving} className="bg-[#D4A574] hover:bg-[#C4955A] text-[#2C1810] shrink-0">
            {saving ? <Loader2 size={14} className="animate-spin mr-1.5" /> : null}
            Seed Locations
          </Button>
        </div>
      )}

      {/* Location Cards */}
      <div className="grid gap-4">
        {locations.map((loc) => (
          <motion.div
            key={loc.id}
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#1A0F0A] border border-[#2C1810] rounded-2xl p-5"
          >
            <div className="flex items-start gap-4">
              {/* Image preview */}
              {loc.image && (
                <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0">
                  <img src={loc.image} alt={loc.name} className="w-full h-full object-cover" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-[#FAF7F2] font-medium">{loc.name}</h3>
                  <Badge className={cn(
                    'text-xs border',
                    loc.active !== false
                      ? 'bg-green-500/10 text-green-400 border-green-500/20'
                      : 'bg-[#3D2318] text-[#8B7355] border-[#3D2318]'
                  )}>
                    {loc.active !== false ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-[#8B7355]">
                  <span className="flex items-center gap-1.5">
                    <MapPin size={11} />
                    {loc.address}, {loc.city}
                  </span>
                  {loc.phone && (
                    <span className="flex items-center gap-1.5">
                      <Phone size={11} />
                      {loc.phone}
                    </span>
                  )}
                  {loc.hours?.weekday && (
                    <span className="flex items-center gap-1.5">
                      <Clock size={11} />
                      {loc.hours.weekday}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleToggleActive(loc)}
                  className={cn('transition-colors', loc.active !== false ? 'text-green-400 hover:text-green-300' : 'text-[#5D4E3C] hover:text-[#8B7355]')}
                  title={loc.active !== false ? 'Deactivate' : 'Activate'}
                >
                  {loc.active !== false ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                </button>
                <button
                  onClick={() => setEditing(loc)}
                  className="text-[#8B7355] hover:text-[#D4A574] transition-colors p-1.5 rounded-lg hover:bg-[#2C1810]"
                  title="Edit"
                >
                  <Edit2 size={15} />
                </button>
                <button
                  onClick={() => handleDelete(loc.id)}
                  disabled={deleting === loc.id}
                  className="text-[#8B7355] hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-red-500/10"
                  title="Delete"
                >
                  {deleting === loc.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Edit / Add Drawer */}
      <AnimatePresence>
        {editing && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40"
              onClick={() => setEditing(null)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-xl bg-[#1A0F0A] border-l border-[#2C1810] z-50 overflow-y-auto"
            >
              <div className="sticky top-0 bg-[#1A0F0A] border-b border-[#2C1810] px-6 py-4 flex items-center justify-between z-10">
                <h2 className="text-[#FAF7F2] font-serif text-lg">
                  {'id' in editing && editing.id ? 'Edit Location' : 'Add Location'}
                </h2>
                <button onClick={() => setEditing(null)} className="text-[#8B7355] hover:text-[#FAF7F2]">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-5">
                {/* Hero Image */}
                <div className="space-y-1.5">
                  <Label className="text-[#FAF7F2]/80 text-sm">Location Image</Label>
                  <ImageUpload
                    value={editing.image}
                    onChange={(url) => updateField('image', url)}
                    folder="locations"
                    aspectRatio="wide"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[#FAF7F2]/80 text-sm">Location Name *</Label>
                    <Input value={editing.name} onChange={e => updateField('name', e.target.value)} placeholder="154 Indiranagar" className="bg-[#0F0908] border-[#3D2318] text-[#FAF7F2] focus:border-[#D4A574]" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[#FAF7F2]/80 text-sm">Short Name</Label>
                    <Input value={editing.shortName} onChange={e => updateField('shortName', e.target.value)} placeholder="Indiranagar" className="bg-[#0F0908] border-[#3D2318] text-[#FAF7F2] focus:border-[#D4A574]" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[#FAF7F2]/80 text-sm">Street Address *</Label>
                  <Input value={editing.address} onChange={e => updateField('address', e.target.value)} placeholder="154, 12th Main Road" className="bg-[#0F0908] border-[#3D2318] text-[#FAF7F2] focus:border-[#D4A574]" />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[#FAF7F2]/80 text-sm">City / Area</Label>
                  <Input value={editing.city} onChange={e => updateField('city', e.target.value)} placeholder="Indiranagar, Bengaluru 560038" className="bg-[#0F0908] border-[#3D2318] text-[#FAF7F2] focus:border-[#D4A574]" />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[#FAF7F2]/80 text-sm">Location Vibe / Description</Label>
                  <textarea
                    value={editing.vibe}
                    onChange={e => updateField('vibe', e.target.value)}
                    placeholder="Describe the unique atmosphere of this location..."
                    rows={3}
                    className="w-full text-sm px-3 py-2.5 bg-[#0F0908] border border-[#3D2318] rounded-lg text-[#FAF7F2] placeholder:text-[#5D4E3C] focus:outline-none focus:border-[#D4A574] resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[#FAF7F2]/80 text-sm">Weekday Hours</Label>
                    <Input value={editing.hours?.weekday} onChange={e => updateNestedField('hours', 'weekday', e.target.value)} placeholder="8:00 AM - 10:00 PM" className="bg-[#0F0908] border-[#3D2318] text-[#FAF7F2] focus:border-[#D4A574]" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[#FAF7F2]/80 text-sm">Weekend Hours</Label>
                    <Input value={editing.hours?.weekend} onChange={e => updateNestedField('hours', 'weekend', e.target.value)} placeholder="8:00 AM - 11:00 PM" className="bg-[#0F0908] border-[#3D2318] text-[#FAF7F2] focus:border-[#D4A574]" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[#FAF7F2]/80 text-sm">
                      <span className="flex items-center gap-1.5"><Phone size={12} />Phone</span>
                    </Label>
                    <Input value={editing.phone} onChange={e => updateField('phone', e.target.value)} placeholder="+91 80 4567 0154" className="bg-[#0F0908] border-[#3D2318] text-[#FAF7F2] focus:border-[#D4A574]" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[#FAF7F2]/80 text-sm">
                      <span className="flex items-center gap-1.5"><Globe size={12} />WhatsApp</span>
                    </Label>
                    <Input value={editing.whatsapp} onChange={e => updateField('whatsapp', e.target.value)} placeholder="+918045670154" className="bg-[#0F0908] border-[#3D2318] text-[#FAF7F2] focus:border-[#D4A574]" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[#FAF7F2]/80 text-sm">
                      <span className="flex items-center gap-1.5"><Mail size={12} />Email</span>
                    </Label>
                    <Input value={editing.email} onChange={e => updateField('email', e.target.value)} placeholder="indiranagar@154breakfastclub.in" className="bg-[#0F0908] border-[#3D2318] text-[#FAF7F2] focus:border-[#D4A574]" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[#FAF7F2]/80 text-sm">
                      <span className="flex items-center gap-1.5"><Instagram size={12} />Instagram</span>
                    </Label>
                    <Input value={editing.instagram} onChange={e => updateField('instagram', e.target.value)} placeholder="@154indiranagar" className="bg-[#0F0908] border-[#3D2318] text-[#FAF7F2] focus:border-[#D4A574]" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[#FAF7F2]/80 text-sm">
                    <span className="flex items-center gap-1.5"><ExternalLink size={12} />Google Maps URL</span>
                  </Label>
                  <Input value={editing.mapUrl} onChange={e => updateField('mapUrl', e.target.value)} placeholder="https://maps.google.com/?q=..." className="bg-[#0F0908] border-[#3D2318] text-[#FAF7F2] focus:border-[#D4A574]" />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editing.active !== false}
                      onChange={e => updateField('active', e.target.checked)}
                      className="w-4 h-4 rounded border-[#3D2318] bg-[#0F0908] accent-[#D4A574]"
                    />
                    <span className="text-[#FAF7F2]/80 text-sm">Active (visible on website)</span>
                  </label>
                </div>

                <div className="flex gap-3 pt-4 sticky bottom-0 bg-[#1A0F0A] py-4 -mx-6 px-6 border-t border-[#2C1810]">
                  <Button onClick={() => setEditing(null)} variant="outline" className="flex-1 border-[#3D2318] text-[#8B7355] hover:text-[#FAF7F2] hover:bg-[#2C1810]">
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={saving} className="flex-1 bg-[#D4A574] hover:bg-[#C4955A] text-[#2C1810] font-medium">
                    {saving ? <Loader2 size={14} className="animate-spin mr-1.5" /> : <Save size={14} className="mr-1.5" />}
                    Save Location
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
    </RoleGuard>
  )
}
