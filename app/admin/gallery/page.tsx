'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { subscribeGallery, saveGalleryImage, deleteGalleryImage, uploadFile } from '@/lib/firestore'
import { galleryImages as staticImages, locations, type GalleryImage } from '@/lib/data'
import { AdminPageHeader } from '@/components/admin/admin-page-header'
import { Trash2, Upload, Loader2, Images, ChevronDown, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export default function GalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>(staticImages)
  const [filterLocation, setFilterLocation] = useState<string>('all')
  const [deleting, setDeleting] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedLocation, setSelectedLocation] = useState<string>('indiranagar')
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const unsub = subscribeGallery(
      (firestoreImages) => {
        if (firestoreImages.length > 0) {
          setImages(firestoreImages)
        }
      },
      (error) => {
        if (error.code === 'permission-denied') {
          toast.error('No permission to load gallery.')
        }
      }
    )
    return () => unsub()
  }, [])

  const handleFiles = async (files: FileList) => {
    const fileArr = Array.from(files).filter(f => f.type.startsWith('image/'))
    if (!fileArr.length) return

    setUploading(true)
    let uploaded = 0

    try {
      for (const file of fileArr) {
        const path = `gallery/${Date.now()}-${file.name.replace(/\s/g, '_')}`
        const url = await uploadFile(file, path, (p) => {
          setUploadProgress(Math.round((uploaded / fileArr.length) * 100 + (p / fileArr.length)))
        })
        await saveGalleryImage({
          src: url,
          alt: file.name.replace(/\.[^.]+$/, '').replace(/-|_/g, ' '),
          locationId: selectedLocation,
          order: images.length + uploaded,
        })
        uploaded++
      }
      toast.success(`${fileArr.length} image(s) uploaded successfully`)
    } catch (err) {
      console.error('[v0] Gallery upload error:', err)
      toast.error('Upload failed')
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const handleDelete = async (image: GalleryImage) => {
    if (!confirm('Delete this image?')) return
    setDeleting(image.id)
    try {
      await deleteGalleryImage(image.id, image.src)
      toast.success('Image deleted')
    } catch {
      toast.error('Failed to delete image')
    } finally {
      setDeleting(null)
    }
  }

  const filteredImages = images.filter(img =>
    filterLocation === 'all' || img.locationId === filterLocation
  )

  const getLocationName = (id: string) => locations.find(l => l.id === id)?.shortName || id

  return (
    <div className="space-y-6 max-w-6xl">
      <AdminPageHeader
        title="Gallery"
        description="Upload and manage photos for each location"
        count={images.length}
      />

      {/* Upload Area */}
      <div
        className={cn(
          'border-2 border-dashed rounded-2xl transition-all',
          dragOver ? 'border-[#D4A574] bg-[#D4A574]/5' : 'border-[#2C1810] bg-[#1A0F0A]'
        )}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files) }}
      >
        <div className="p-8 text-center">
          {uploading ? (
            <div className="space-y-3">
              <Loader2 size={32} className="text-[#D4A574] animate-spin mx-auto" />
              <p className="text-[#FAF7F2] text-sm">Uploading...</p>
              <div className="w-48 h-1.5 bg-[#2C1810] rounded-full overflow-hidden mx-auto">
                <div className="h-full bg-[#D4A574] rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
              </div>
              <p className="text-[#8B7355] text-xs">{uploadProgress}%</p>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 rounded-xl bg-[#2C1810] flex items-center justify-center mx-auto mb-3">
                <Upload size={20} className="text-[#8B7355]" />
              </div>
              <p className="text-[#FAF7F2] text-sm mb-1">
                <span className="text-[#D4A574] cursor-pointer hover:underline" onClick={() => inputRef.current?.click()}>Click to upload</span>
                {' '}or drag & drop images here
              </p>
              <p className="text-[#8B7355] text-xs mb-4">PNG, JPG, WebP — multiple files supported</p>

              <div className="flex items-center justify-center gap-3">
                <div className="relative">
                  <select
                    value={selectedLocation}
                    onChange={e => setSelectedLocation(e.target.value)}
                    className="appearance-none text-sm px-4 py-2 pr-8 bg-[#2C1810] border border-[#3D2318] rounded-lg text-[#FAF7F2] focus:outline-none focus:border-[#D4A574]"
                  >
                    {locations.map(loc => (
                      <option key={loc.id} value={loc.id}>{loc.shortName}</option>
                    ))}
                  </select>
                  <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8B7355] pointer-events-none" />
                </div>
                <Button onClick={() => inputRef.current?.click()} className="bg-[#D4A574] hover:bg-[#C4955A] text-[#2C1810] font-medium">
                  <Upload size={14} className="mr-1.5" />
                  Choose Files
                </Button>
              </div>
            </>
          )}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => { if (e.target.files) handleFiles(e.target.files) }}
      />

      {/* Filters */}
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
            <span className="ml-1.5 opacity-60">
              ({locId === 'all' ? images.length : images.filter(i => i.locationId === locId).length})
            </span>
          </button>
        ))}
      </div>

      {/* Image Grid */}
      {filteredImages.length === 0 ? (
        <div className="bg-[#1A0F0A] border border-[#2C1810] rounded-2xl p-12 text-center">
          <Images size={32} className="text-[#5D4E3C] mx-auto mb-3" />
          <p className="text-[#8B7355] text-sm">No images yet. Upload some above!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {filteredImages.map((image) => (
            <motion.div
              key={image.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="group relative aspect-square rounded-xl overflow-hidden bg-[#1A0F0A] border border-[#2C1810]"
            >
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                <p className="text-white text-xs text-center truncate w-full">{image.alt}</p>
                <Badge className="bg-[#D4A574]/20 text-[#D4A574] border-[#D4A574]/20 text-xs">
                  {getLocationName(image.locationId)}
                </Badge>
                <button
                  onClick={() => handleDelete(image)}
                  disabled={deleting === image.id}
                  className="w-8 h-8 rounded-lg bg-red-500/20 hover:bg-red-500/40 text-red-300 flex items-center justify-center transition-colors"
                >
                  {deleting === image.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
