'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { subscribeMenuItems, saveMenuItem, deleteMenuItem } from '@/lib/firestore'
import { menuItems as staticMenuItems, locations, formatPrice, type MenuItem } from '@/lib/data'
import { AdminPageHeader } from '@/components/admin/admin-page-header'
import { ImageUpload } from '@/components/admin/image-upload'
import {
  Trash2, Edit2, X, Save, Loader2, Star, Search, UtensilsCrossed, Eye, EyeOff, ChevronDown
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const CATEGORIES = ['breakfast', 'coffee', 'desserts', 'lunch', 'beverages', 'specials']
const DIETARY = ['vegetarian', 'vegan', 'gluten-free'] as const

const emptyItem: Omit<MenuItem, 'id'> = {
  name: '',
  description: '',
  price: 0,
  category: 'breakfast',
  image: '',
  featured: false,
  available: true,
  dietary: [],
  locationIds: [],
}

export default function MenuPage() {
  const [items, setItems] = useState<MenuItem[]>(staticMenuItems)
  const [editing, setEditing] = useState<(MenuItem | (Omit<MenuItem, 'id'> & { id?: string })) | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [seeded, setSeeded] = useState(false)

  useEffect(() => {
    const unsub = subscribeMenuItems(
      (firestoreItems) => {
        if (firestoreItems.length > 0) {
          setItems(firestoreItems)
          setSeeded(true)
        }
      },
      (error) => {
        if (error.code === 'permission-denied') {
          toast.error('No permission to load menu. Your account needs manager or admin role.')
        }
      }
    )
    return () => unsub()
  }, [])

  const handleSeedMenu = async () => {
    setSaving(true)
    try {
      for (const item of staticMenuItems) {
        await saveMenuItem(item)
      }
      toast.success('Menu seeded to Firestore!')
      setSeeded(true)
    } catch (err) {
      console.error('[v0] Seed error:', err)
      toast.error('Failed to seed menu')
    } finally {
      setSaving(false)
    }
  }

  const handleSave = async () => {
    if (!editing) return
    if (!editing.name || !editing.price) {
      toast.error('Name and price are required')
      return
    }
    setSaving(true)
    try {
      await saveMenuItem(editing as MenuItem)
      toast.success('Menu item saved!')
      setEditing(null)
    } catch (err) {
      console.error('[v0] Save menu item error:', err)
      toast.error('Failed to save item')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this menu item?')) return
    setDeleting(id)
    try {
      await deleteMenuItem(id)
      toast.success('Item deleted')
    } catch {
      toast.error('Failed to delete item')
    } finally {
      setDeleting(null)
    }
  }

  const toggleFeatured = async (item: MenuItem) => {
    try {
      await saveMenuItem({ ...item, featured: !item.featured })
    } catch { toast.error('Failed to update item') }
  }

  const toggleAvailable = async (item: MenuItem) => {
    try {
      await saveMenuItem({ ...item, available: !item.available })
    } catch { toast.error('Failed to update item') }
  }

  const updateField = (field: string, value: unknown) => {
    setEditing(prev => prev ? { ...prev, [field]: value } : null)
  }

  const toggleDietary = (tag: typeof DIETARY[number]) => {
    const current = (editing?.dietary || []) as string[]
    const updated = current.includes(tag) ? current.filter(d => d !== tag) : [...current, tag]
    updateField('dietary', updated)
  }

  const toggleLocationId = (id: string) => {
    const current = editing?.locationIds || []
    const updated = current.includes(id) ? current.filter(l => l !== id) : [...current, id]
    updateField('locationIds', updated)
  }

  const filteredItems = items.filter(item => {
    const matchSearch = !searchQuery || item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchCat = filterCategory === 'all' || item.category === filterCategory
    return matchSearch && matchCat
  })

  const categories = ['all', ...new Set(items.map(i => i.category))]

  return (
    <div className="space-y-6 max-w-6xl">
      <AdminPageHeader
        title="Menu"
        description="Manage menu items, categories, prices, and availability"
        actionLabel="Add Item"
        onAction={() => setEditing({ ...emptyItem })}
        count={items.length}
      />

      {!seeded && (
        <div className="bg-[#1A0F0A] border border-[#D4A574]/20 rounded-xl p-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-[#FAF7F2] text-sm font-medium">Initialize Menu Data</p>
            <p className="text-[#8B7355] text-xs mt-0.5">Seed the full menu ({staticMenuItems.length} items) to Firestore</p>
          </div>
          <Button onClick={handleSeedMenu} disabled={saving} className="bg-[#D4A574] hover:bg-[#C4955A] text-[#2C1810] shrink-0">
            {saving ? <Loader2 size={14} className="animate-spin mr-1.5" /> : null}
            Seed Menu
          </Button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48 max-w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B7355]" />
          <Input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search items..."
            className="pl-8 bg-[#1A0F0A] border-[#2C1810] text-[#FAF7F2] placeholder:text-[#5D4E3C] focus:border-[#D4A574]"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors',
                filterCategory === cat
                  ? 'bg-[#D4A574] text-[#2C1810]'
                  : 'bg-[#1A0F0A] border border-[#2C1810] text-[#8B7355] hover:text-[#FAF7F2] hover:border-[#3D2318]'
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#1A0F0A] border border-[#2C1810] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2C1810]">
                <th className="text-left text-xs font-medium text-[#8B7355] uppercase tracking-wider px-4 py-3 w-12" />
                <th className="text-left text-xs font-medium text-[#8B7355] uppercase tracking-wider px-4 py-3">Item</th>
                <th className="text-left text-xs font-medium text-[#8B7355] uppercase tracking-wider px-4 py-3">Category</th>
                <th className="text-left text-xs font-medium text-[#8B7355] uppercase tracking-wider px-4 py-3">Price</th>
                <th className="text-left text-xs font-medium text-[#8B7355] uppercase tracking-wider px-4 py-3">Status</th>
                <th className="text-left text-xs font-medium text-[#8B7355] uppercase tracking-wider px-4 py-3">Featured</th>
                <th className="text-right text-xs font-medium text-[#8B7355] uppercase tracking-wider px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2C1810]">
              {filteredItems.map(item => (
                <tr key={item.id} className="hover:bg-[#2C1810]/50 transition-colors">
                  <td className="px-4 py-3">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-[#2C1810] flex items-center justify-center">
                        <UtensilsCrossed size={14} className="text-[#5D4E3C]" />
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-[#FAF7F2] text-sm font-medium">{item.name}</p>
                    <p className="text-[#8B7355] text-xs truncate max-w-48">{item.description}</p>
                  </td>
                  <td className="px-4 py-3">
                    <Badge className="bg-[#2C1810] text-[#8B7355] border-[#3D2318] text-xs capitalize">{item.category}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[#D4A574] text-sm font-medium">{formatPrice(item.price)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleAvailable(item)} className="flex items-center gap-1.5 text-xs">
                      {item.available !== false ? (
                        <span className="flex items-center gap-1 text-green-400"><Eye size={12} /> Available</span>
                      ) : (
                        <span className="flex items-center gap-1 text-[#8B7355]"><EyeOff size={12} /> Hidden</span>
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleFeatured(item)}>
                      <Star size={15} className={item.featured ? 'fill-[#D4A574] text-[#D4A574]' : 'text-[#5D4E3C]'} />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <button onClick={() => setEditing(item)} className="text-[#8B7355] hover:text-[#D4A574] p-1.5 rounded-lg hover:bg-[#2C1810] transition-colors">
                        <Edit2 size={13} />
                      </button>
                      <button onClick={() => handleDelete(item.id)} disabled={deleting === item.id} className="text-[#8B7355] hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors">
                        {deleting === item.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-[#8B7355] text-sm">
                    No items found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Drawer */}
      <AnimatePresence>
        {editing && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-40" onClick={() => setEditing(null)} />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-xl bg-[#1A0F0A] border-l border-[#2C1810] z-50 overflow-y-auto"
            >
              <div className="sticky top-0 bg-[#1A0F0A] border-b border-[#2C1810] px-6 py-4 flex items-center justify-between z-10">
                <h2 className="text-[#FAF7F2] font-serif text-lg">{'id' in editing && editing.id ? 'Edit Item' : 'Add Item'}</h2>
                <button onClick={() => setEditing(null)} className="text-[#8B7355] hover:text-[#FAF7F2]"><X size={20} /></button>
              </div>

              <div className="p-6 space-y-5">
                <div className="space-y-1.5">
                  <Label className="text-[#FAF7F2]/80 text-sm">Item Image</Label>
                  <ImageUpload value={editing.image} onChange={url => updateField('image', url)} folder="menu" aspectRatio="wide" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-1.5">
                    <Label className="text-[#FAF7F2]/80 text-sm">Name *</Label>
                    <Input value={editing.name} onChange={e => updateField('name', e.target.value)} placeholder="Buttermilk Pancakes" className="bg-[#0F0908] border-[#3D2318] text-[#FAF7F2] focus:border-[#D4A574]" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[#FAF7F2]/80 text-sm">Price (₹) *</Label>
                    <Input type="number" value={editing.price} onChange={e => updateField('price', Number(e.target.value))} placeholder="349" className="bg-[#0F0908] border-[#3D2318] text-[#FAF7F2] focus:border-[#D4A574]" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[#FAF7F2]/80 text-sm">Category</Label>
                    <div className="relative">
                      <select
                        value={editing.category}
                        onChange={e => updateField('category', e.target.value)}
                        className="w-full appearance-none text-sm px-3 py-2 bg-[#0F0908] border border-[#3D2318] rounded-lg text-[#FAF7F2] focus:outline-none focus:border-[#D4A574] capitalize"
                      >
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8B7355] pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[#FAF7F2]/80 text-sm">Description</Label>
                  <textarea
                    value={editing.description}
                    onChange={e => updateField('description', e.target.value)}
                    placeholder="Describe the dish..."
                    rows={3}
                    className="w-full text-sm px-3 py-2.5 bg-[#0F0908] border border-[#3D2318] rounded-lg text-[#FAF7F2] placeholder:text-[#5D4E3C] focus:outline-none focus:border-[#D4A574] resize-none"
                  />
                </div>

                {/* Dietary Tags */}
                <div className="space-y-2">
                  <Label className="text-[#FAF7F2]/80 text-sm">Dietary Tags</Label>
                  <div className="flex flex-wrap gap-2">
                    {DIETARY.map(tag => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleDietary(tag)}
                        className={cn(
                          'px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors border',
                          (editing.dietary || []).includes(tag)
                            ? 'bg-green-500/10 border-green-500/30 text-green-400'
                            : 'bg-[#0F0908] border-[#3D2318] text-[#8B7355] hover:border-[#5D4E3C]'
                        )}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Location assignment */}
                <div className="space-y-2">
                  <Label className="text-[#FAF7F2]/80 text-sm">Available At</Label>
                  <p className="text-[#5D4E3C] text-xs">Leave empty to show at all locations</p>
                  <div className="flex flex-wrap gap-2">
                    {locations.map(loc => (
                      <button
                        key={loc.id}
                        type="button"
                        onClick={() => toggleLocationId(loc.id)}
                        className={cn(
                          'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border',
                          (editing.locationIds || []).includes(loc.id)
                            ? 'bg-[#D4A574]/10 border-[#D4A574]/30 text-[#D4A574]'
                            : 'bg-[#0F0908] border-[#3D2318] text-[#8B7355] hover:border-[#5D4E3C]'
                        )}
                      >
                        {loc.shortName}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Toggles */}
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={editing.featured || false} onChange={e => updateField('featured', e.target.checked)} className="w-4 h-4 rounded border-[#3D2318] bg-[#0F0908] accent-[#D4A574]" />
                    <span className="text-[#FAF7F2]/80 text-sm">Featured</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={editing.available !== false} onChange={e => updateField('available', e.target.checked)} className="w-4 h-4 rounded border-[#3D2318] bg-[#0F0908] accent-[#D4A574]" />
                    <span className="text-[#FAF7F2]/80 text-sm">Available</span>
                  </label>
                </div>

                <div className="flex gap-3 pt-4 sticky bottom-0 bg-[#1A0F0A] py-4 -mx-6 px-6 border-t border-[#2C1810]">
                  <Button onClick={() => setEditing(null)} variant="outline" className="flex-1 border-[#3D2318] text-[#8B7355] hover:text-[#FAF7F2] hover:bg-[#2C1810]">Cancel</Button>
                  <Button onClick={handleSave} disabled={saving} className="flex-1 bg-[#D4A574] hover:bg-[#C4955A] text-[#2C1810] font-medium">
                    {saving ? <Loader2 size={14} className="animate-spin mr-1.5" /> : <Save size={14} className="mr-1.5" />}
                    Save Item
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
