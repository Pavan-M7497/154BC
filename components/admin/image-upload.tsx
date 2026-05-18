'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { uploadFile } from '@/lib/firestore'
import { Upload, X, Loader2, ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
  folder?: string
  className?: string
  aspectRatio?: 'square' | 'wide' | 'tall'
}

export function ImageUpload({ value, onChange, folder = 'uploads', className, aspectRatio = 'wide' }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be under 10MB')
      return
    }

    setUploading(true)
    setProgress(0)

    try {
      const path = `${folder}/${Date.now()}-${file.name.replace(/\s/g, '_')}`
      const url = await uploadFile(file, path, setProgress)
      onChange(url)
      toast.success('Image uploaded successfully')
    } catch (err) {
      toast.error('Upload failed. Please try again.')
      console.error('[v0] Image upload error:', err)
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const aspectClass = {
    square: 'aspect-square',
    wide: 'aspect-video',
    tall: 'aspect-[3/4]',
  }[aspectRatio]

  return (
    <div className={cn('space-y-2', className)}>
      <div
        className={cn(
          'relative rounded-xl border-2 border-dashed transition-colors overflow-hidden',
          aspectClass,
          dragOver ? 'border-[#D4A574] bg-[#D4A574]/5' : 'border-[#3D2318] bg-[#1A0F0A]',
          !value && 'cursor-pointer hover:border-[#D4A574]/50 hover:bg-[#2C1810]/50'
        )}
        onClick={() => !value && !uploading && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        {value ? (
          <>
            <Image src={value} alt="Uploaded image" fill className="object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); inputRef.current?.click() }}
                className="px-3 py-1.5 bg-white/20 backdrop-blur-sm text-white text-xs rounded-lg hover:bg-white/30 transition-colors flex items-center gap-1.5"
              >
                <Upload size={12} />
                Replace
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onChange('') }}
                className="px-3 py-1.5 bg-red-500/20 backdrop-blur-sm text-red-300 text-xs rounded-lg hover:bg-red-500/30 transition-colors flex items-center gap-1.5"
              >
                <X size={12} />
                Remove
              </button>
            </div>
          </>
        ) : uploading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <Loader2 size={24} className="text-[#D4A574] animate-spin" />
            <p className="text-[#8B7355] text-sm">{Math.round(progress)}%</p>
            <div className="w-24 h-1 bg-[#3D2318] rounded-full overflow-hidden">
              <div className="h-full bg-[#D4A574] rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4">
            <div className="w-10 h-10 rounded-xl bg-[#2C1810] flex items-center justify-center">
              <ImageIcon size={18} className="text-[#8B7355]" />
            </div>
            <p className="text-[#8B7355] text-sm text-center">
              <span className="text-[#D4A574]">Click to upload</span> or drag & drop
            </p>
            <p className="text-[#5D4E3C] text-xs text-center">PNG, JPG, WebP up to 10MB</p>
          </div>
        )}
      </div>

      {/* URL fallback input */}
      <input
        type="text"
        placeholder="Or paste an image URL..."
        value={value && !value.startsWith('http') ? '' : (value || '')}
        onChange={(e) => onChange(e.target.value)}
        className="w-full text-xs px-3 py-2 bg-[#1A0F0A] border border-[#3D2318] rounded-lg text-[#8B7355] placeholder:text-[#5D4E3C] focus:outline-none focus:border-[#D4A574]/50"
      />

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
      />
    </div>
  )
}
