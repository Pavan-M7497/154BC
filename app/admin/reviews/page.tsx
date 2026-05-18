'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { subscribeReviews, saveReview, deleteReview } from '@/lib/firestore'
import { reviews as staticReviews, locations, type Review } from '@/lib/data'
import { AdminPageHeader } from '@/components/admin/admin-page-header'
import { Star, Trash2, Eye, EyeOff, Edit2, X, Save, Loader2, ChevronDown } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const emptyReview: Omit<Review, 'id'> = {
  author: '',
  rating: 5,
  text: '',
  date: 'Just now',
  locationId: 'indiranagar',
  source: 'Google',
  featured: false,
  hidden: false,
}

function StarRating({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange?.(star)}
          className={onChange ? 'cursor-pointer' : 'cursor-default'}
        >
          <Star size={16} className={star <= value ? 'fill-[#D4A574] text-[#D4A574]' : 'text-[#3D2318]'} />
        </button>
      ))}
    </div>
  )
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>(staticReviews)
  const [editing, setEditing] = useState<(Review | (Omit<Review, 'id'> & { id?: string })) | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [filterLocation, setFilterLocation] = useState('all')
  const [seeded, setSeeded] = useState(false)

  useEffect(() => {
    const unsub = subscribeReviews(
      (firestoreReviews) => {
        setReviews(firestoreReviews.length > 0 ? firestoreReviews : staticReviews)
        setSeeded(firestoreReviews.length > 0)
      },
      (error) => {
        if (error.code === 'permission-denied') {
          toast.error('No permission to load reviews. Check your role in Firestore.')
        } else {
          toast.error('Failed to load reviews from Firestore.')
        }
      }
    )
    return () => unsub()
  }, [])

  const handleSeedReviews = async () => {
    setSaving(true)
    try {
      for (const review of staticReviews) {
        await saveReview(review)
      }
      toast.success('Reviews seeded!')
      setSeeded(true)
    } catch {
      toast.error('Failed to seed reviews')
    } finally {
      setSaving(false)
    }
  }

  const handleSave = async () => {
    if (!editing) return
    if (!editing.author || !editing.text) {
      toast.error('Author and review text are required')
      return
    }
    setSaving(true)
    try {
      await saveReview(editing as Review)
      toast.success('Review saved!')
      setEditing(null)
    } catch {
      toast.error('Failed to save review')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this review?')) return
    setDeleting(id)
    try {
      await deleteReview(id)
      toast.success('Review deleted')
    } catch {
      toast.error('Failed to delete review')
    } finally {
      setDeleting(null)
    }
  }

  const toggleFeatured = async (review: Review) => {
    try {
      await saveReview({ ...review, featured: !review.featured })
    } catch { toast.error('Failed to update review') }
  }

  const toggleHidden = async (review: Review) => {
    try {
      await saveReview({ ...review, hidden: !review.hidden })
    } catch { toast.error('Failed to update review') }
  }

  const updateField = (field: string, value: unknown) => {
    setEditing(prev => prev ? { ...prev, [field]: value } : null)
  }

  const filtered = reviews.filter(r =>
    filterLocation === 'all' || r.locationId === filterLocation
  )

  const getLocationName = (id: string) => locations.find(l => l.id === id)?.shortName || id

  return (
    <div className="space-y-6 max-w-4xl">
      <AdminPageHeader
        title="Reviews"
        description="Manage customer testimonials and feature the best ones"
        actionLabel="Add Review"
        onAction={() => setEditing({ ...emptyReview })}
        count={reviews.length}
      />

      {!seeded && (
        <div className="bg-[#1A0F0A] border border-[#D4A574]/20 rounded-xl p-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-[#FAF7F2] text-sm font-medium">Initialize Reviews</p>
            <p className="text-[#8B7355] text-xs mt-0.5">Seed the {staticReviews.length} default reviews to Firestore</p>
          </div>
          <Button onClick={handleSeedReviews} disabled={saving} className="bg-[#D4A574] hover:bg-[#C4955A] text-[#2C1810] shrink-0">
            {saving ? <Loader2 size={14} className="animate-spin mr-1.5" /> : null}
            Seed Reviews
          </Button>
        </div>
      )}

      {/* Location filter */}
      <div className="flex flex-wrap gap-2">
        {['all', ...locations.map(l => l.id)].map(locId => (
          <button
            key={locId}
            onClick={() => setFilterLocation(locId)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
              filterLocation === locId
                ? 'bg-[#D4A574] text-[#2C1810]'
                : 'bg-[#1A0F0A] border border-[#2C1810] text-[#8B7355] hover:text-[#FAF7F2] hover:border-[#3D2318]'
            )}
          >
            {locId === 'all' ? 'All Locations' : getLocationName(locId)}
          </button>
        ))}
      </div>

      {/* Review Cards */}
      <div className="space-y-3">
        {filtered.map(review => (
          <motion.div
            key={review.id}
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              'bg-[#1A0F0A] border rounded-2xl p-5 transition-colors',
              review.hidden ? 'border-[#2C1810] opacity-50' : 'border-[#2C1810]',
              review.featured && 'border-[#D4A574]/20'
            )}
          >
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="w-10 h-10 rounded-xl bg-[#2C1810] flex items-center justify-center shrink-0">
                <span className="text-[#D4A574] text-sm font-semibold">{review.author[0]}</span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-[#FAF7F2] text-sm font-medium">{review.author}</span>
                  <StarRating value={review.rating} />
                  <Badge className="bg-[#2C1810] text-[#8B7355] border-[#3D2318] text-xs">{getLocationName(review.locationId)}</Badge>
                  {review.featured && <Badge className="bg-[#D4A574]/10 text-[#D4A574] border-[#D4A574]/20 text-xs">Featured</Badge>}
                  {review.hidden && <Badge className="bg-[#3D2318] text-[#8B7355] border-[#3D2318] text-xs">Hidden</Badge>}
                </div>
                <p className="text-[#8B7355] text-sm leading-relaxed">{review.text}</p>
                <div className="flex items-center gap-3 mt-2 text-[#5D4E3C] text-xs">
                  <span>{review.date}</span>
                  {review.source && <span>via {review.source}</span>}
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button onClick={() => toggleFeatured(review)} className={cn('p-1.5 rounded-lg transition-colors', review.featured ? 'text-[#D4A574] bg-[#D4A574]/10' : 'text-[#5D4E3C] hover:text-[#D4A574] hover:bg-[#2C1810]')} title="Toggle featured">
                  <Star size={14} className={review.featured ? 'fill-[#D4A574]' : ''} />
                </button>
                <button onClick={() => toggleHidden(review)} className="text-[#5D4E3C] hover:text-[#8B7355] p-1.5 rounded-lg hover:bg-[#2C1810] transition-colors" title="Toggle visibility">
                  {review.hidden ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
                <button onClick={() => setEditing(review)} className="text-[#8B7355] hover:text-[#D4A574] p-1.5 rounded-lg hover:bg-[#2C1810] transition-colors">
                  <Edit2 size={14} />
                </button>
                <button onClick={() => handleDelete(review.id)} disabled={deleting === review.id} className="text-[#8B7355] hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors">
                  {deleting === review.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                </button>
              </div>
            </div>
          </motion.div>
        ))}

        {filtered.length === 0 && (
          <div className="bg-[#1A0F0A] border border-[#2C1810] rounded-2xl p-12 text-center">
            <Star size={28} className="text-[#5D4E3C] mx-auto mb-2" />
            <p className="text-[#8B7355] text-sm">No reviews yet</p>
          </div>
        )}
      </div>

      {/* Edit Drawer */}
      <AnimatePresence>
        {editing && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-40" onClick={() => setEditing(null)} />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-[#1A0F0A] border-l border-[#2C1810] z-50 overflow-y-auto"
            >
              <div className="sticky top-0 bg-[#1A0F0A] border-b border-[#2C1810] px-6 py-4 flex items-center justify-between z-10">
                <h2 className="text-[#FAF7F2] font-serif text-lg">{'id' in editing && editing.id ? 'Edit Review' : 'Add Review'}</h2>
                <button onClick={() => setEditing(null)} className="text-[#8B7355] hover:text-[#FAF7F2]"><X size={20} /></button>
              </div>

              <div className="p-6 space-y-5">
                <div className="space-y-1.5">
                  <Label className="text-[#FAF7F2]/80 text-sm">Customer Name *</Label>
                  <Input value={editing.author} onChange={e => updateField('author', e.target.value)} placeholder="Priya Sharma" className="bg-[#0F0908] border-[#3D2318] text-[#FAF7F2] focus:border-[#D4A574]" />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[#FAF7F2]/80 text-sm">Rating</Label>
                  <StarRating value={editing.rating} onChange={v => updateField('rating', v)} />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[#FAF7F2]/80 text-sm">Review Text *</Label>
                  <textarea
                    value={editing.text}
                    onChange={e => updateField('text', e.target.value)}
                    placeholder="Write the customer review here..."
                    rows={4}
                    className="w-full text-sm px-3 py-2.5 bg-[#0F0908] border border-[#3D2318] rounded-lg text-[#FAF7F2] placeholder:text-[#5D4E3C] focus:outline-none focus:border-[#D4A574] resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[#FAF7F2]/80 text-sm">Location</Label>
                    <div className="relative">
                      <select value={editing.locationId} onChange={e => updateField('locationId', e.target.value)} className="w-full appearance-none text-sm px-3 py-2 bg-[#0F0908] border border-[#3D2318] rounded-lg text-[#FAF7F2] focus:outline-none focus:border-[#D4A574]">
                        {locations.map(l => <option key={l.id} value={l.id}>{l.shortName}</option>)}
                      </select>
                      <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8B7355] pointer-events-none" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[#FAF7F2]/80 text-sm">Source</Label>
                    <div className="relative">
                      <select value={editing.source || 'Google'} onChange={e => updateField('source', e.target.value)} className="w-full appearance-none text-sm px-3 py-2 bg-[#0F0908] border border-[#3D2318] rounded-lg text-[#FAF7F2] focus:outline-none focus:border-[#D4A574]">
                        <option value="Google">Google</option>
                        <option value="Zomato">Zomato</option>
                      </select>
                      <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8B7355] pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[#FAF7F2]/80 text-sm">Date Label</Label>
                  <Input value={editing.date} onChange={e => updateField('date', e.target.value)} placeholder="2 weeks ago" className="bg-[#0F0908] border-[#3D2318] text-[#FAF7F2] focus:border-[#D4A574]" />
                </div>

                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={editing.featured || false} onChange={e => updateField('featured', e.target.checked)} className="w-4 h-4 rounded border-[#3D2318] bg-[#0F0908] accent-[#D4A574]" />
                    <span className="text-[#FAF7F2]/80 text-sm">Featured</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={editing.hidden || false} onChange={e => updateField('hidden', e.target.checked)} className="w-4 h-4 rounded border-[#3D2318] bg-[#0F0908] accent-[#D4A574]" />
                    <span className="text-[#FAF7F2]/80 text-sm">Hidden</span>
                  </label>
                </div>

                <div className="flex gap-3 pt-4 sticky bottom-0 bg-[#1A0F0A] py-4 -mx-6 px-6 border-t border-[#2C1810]">
                  <Button onClick={() => setEditing(null)} variant="outline" className="flex-1 border-[#3D2318] text-[#8B7355] hover:text-[#FAF7F2] hover:bg-[#2C1810]">Cancel</Button>
                  <Button onClick={handleSave} disabled={saving} className="flex-1 bg-[#D4A574] hover:bg-[#C4955A] text-[#2C1810] font-medium">
                    {saving ? <Loader2 size={14} className="animate-spin mr-1.5" /> : <Save size={14} className="mr-1.5" />}
                    Save Review
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
