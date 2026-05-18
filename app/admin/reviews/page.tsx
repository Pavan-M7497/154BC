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
          <Star size={16} className={star <= value ? 'fill-accent text-accent' : 'text-border'} />
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
    let cancelled = false
    const unsub = subscribeReviews(
      (firestoreReviews) => {
        if (!cancelled) {
          setReviews(firestoreReviews.length > 0 ? firestoreReviews : staticReviews)
          setSeeded(firestoreReviews.length > 0)
        }
      },
      (error) => {
        if (cancelled) return
        if (error.code === 'permission-denied') {
          toast.error('No permission to load reviews. Check your role in Firestore.')
        } else {
          toast.error('Failed to load reviews from Firestore.')
        }
      }
    )
    return () => {
      cancelled = true
      unsub()
    }
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
        <div className="bg-card border border-accent/20 rounded-xl p-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-foreground text-sm font-medium">Initialize Reviews</p>
            <p className="text-muted-foreground text-xs mt-0.5">Seed the {staticReviews.length} default reviews to Firestore</p>
          </div>
          <Button onClick={handleSeedReviews} disabled={saving} className="bg-accent hover:bg-caramel-hover text-accent-foreground shrink-0">
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
                ? 'bg-accent text-accent-foreground'
                : 'bg-background border border-border text-muted-foreground hover:text-foreground hover:border-espresso'
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
              'bg-card border rounded-2xl p-5 transition-colors',
              review.hidden ? 'border-border opacity-50' : 'border-border',
              review.featured && 'border-accent/20'
            )}
          >
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center shrink-0">
                <span className="text-accent text-sm font-semibold">{review.author[0]}</span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-foreground text-sm font-medium">{review.author}</span>
                  <StarRating value={review.rating} />
                  <Badge className="bg-background text-muted-foreground border-border text-xs">{getLocationName(review.locationId)}</Badge>
                  {review.featured && <Badge className="bg-accent/10 text-accent border border-accent/20 text-xs">Featured</Badge>}
                  {review.hidden && <Badge className="bg-background text-muted-foreground border-border text-xs">Hidden</Badge>}
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">{review.text}</p>
                <div className="flex items-center gap-3 mt-2 text-espresso text-xs">
                  <span>{review.date}</span>
                  {review.source && <span>via {review.source}</span>}
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button onClick={() => toggleFeatured(review)} className={cn('p-1.5 rounded-lg transition-colors', review.featured ? 'text-accent bg-accent/10' : 'text-espresso hover:text-accent hover:bg-background')} title="Toggle featured">
                  <Star size={14} className={review.featured ? 'fill-accent' : ''} />
                </button>
                <button onClick={() => toggleHidden(review)} className="text-espresso hover:text-muted-foreground p-1.5 rounded-lg hover:bg-background transition-colors" title="Toggle visibility">
                  {review.hidden ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
                <button onClick={() => setEditing(review)} className="text-muted-foreground hover:text-accent p-1.5 rounded-lg hover:bg-background transition-colors">
                  <Edit2 size={14} />
                </button>
                <button onClick={() => handleDelete(review.id)} disabled={deleting === review.id} className="text-muted-foreground hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors">
                  {deleting === review.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                </button>
              </div>
            </div>
          </motion.div>
        ))}

        {filtered.length === 0 && (
          <div className="bg-card border border-border rounded-2xl p-12 text-center">
            <Star size={28} className="text-espresso mx-auto mb-2" />
            <p className="text-muted-foreground text-sm">No reviews yet</p>
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
              className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-background border-l border-border z-50 overflow-y-auto"
            >
              <div className="sticky top-0 bg-background border-b border-border px-6 py-4 flex items-center justify-between z-10">
                <h2 className="text-foreground font-serif text-lg">{'id' in editing && editing.id ? 'Edit Review' : 'Add Review'}</h2>
                <button onClick={() => setEditing(null)} className="text-muted-foreground hover:text-foreground"><X size={20} /></button>
              </div>

              <div className="p-6 space-y-5">
                <div className="space-y-1.5">
                  <Label className="text-foreground/80 text-sm">Customer Name *</Label>
                  <Input value={editing.author} onChange={e => updateField('author', e.target.value)} placeholder="Priya Sharma" className="bg-card border-border text-foreground focus:border-accent" />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-foreground/80 text-sm">Rating</Label>
                  <StarRating value={editing.rating} onChange={v => updateField('rating', v)} />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-foreground/80 text-sm">Review Text *</Label>
                  <textarea
                    value={editing.text}
                    onChange={e => updateField('text', e.target.value)}
                    placeholder="Write the customer review here..."
                    rows={4}
                    className="w-full text-sm px-3 py-2.5 bg-card border border-border rounded-lg text-foreground placeholder:text-espresso focus:outline-none focus:border-accent resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-foreground/80 text-sm">Location</Label>
                    <div className="relative">
                      <select value={editing.locationId} onChange={e => updateField('locationId', e.target.value)} className="w-full appearance-none text-sm px-3 py-2 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:border-accent">
                        {locations.map(l => <option key={l.id} value={l.id}>{l.shortName}</option>)}
                      </select>
                      <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-foreground/80 text-sm">Source</Label>
                    <div className="relative">
                      <select value={editing.source || 'Google'} onChange={e => updateField('source', e.target.value)} className="w-full appearance-none text-sm px-3 py-2 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:border-accent">
                        <option value="Google">Google</option>
                        <option value="Zomato">Zomato</option>
                      </select>
                      <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-foreground/80 text-sm">Date Label</Label>
                  <Input value={editing.date} onChange={e => updateField('date', e.target.value)} placeholder="2 weeks ago" className="bg-card border-border text-foreground focus:border-accent" />
                </div>

                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={editing.featured || false} onChange={e => updateField('featured', e.checked)} className="w-4 h-4 rounded border-border bg-card accent-accent" />
                    <span className="text-foreground/80 text-sm">Featured</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={editing.hidden || false} onChange={e => updateField('hidden', e.checked)} className="w-4 h-4 rounded border-border bg-card accent-accent" />
                    <span className="text-foreground/80 text-sm">Hidden</span>
                  </label>
                </div>

                <div className="flex gap-3 pt-4 sticky bottom-0 bg-background py-4 -mx-6 px-6 border-t border-border">
                  <Button onClick={() => setEditing(null)} variant="outline" className="flex-1 border-border text-muted-foreground hover:text-foreground hover:bg-card">Cancel</Button>
                  <Button onClick={handleSave} disabled={saving} className="flex-1 bg-accent hover:bg-caramel-hover text-accent-foreground font-medium">
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
