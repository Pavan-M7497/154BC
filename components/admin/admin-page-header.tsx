'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

interface AdminPageHeaderProps {
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  count?: number
}

export function AdminPageHeader({ title, description, actionLabel, onAction, count }: AdminPageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
    >
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-foreground text-2xl font-serif">{title}</h1>
          {count !== undefined && (
            <span className="px-2 py-0.5 bg-card border border-border text-muted-foreground text-xs rounded-full">
              {count}
            </span>
          )}
        </div>
        {description && <p className="text-muted-foreground text-sm mt-1">{description}</p>}
      </div>

      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          className="bg-accent hover:bg-caramel-hover text-accent-foreground font-medium shrink-0"
        >
          <Plus size={16} className="mr-1.5" />
          {actionLabel}
        </Button>
      )}
    </motion.div>
  )
}
