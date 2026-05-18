/**
 * DEPRECATED — Use `import { toast } from 'sonner'` directly.
 *
 * This file exists only for backward compatibility with shadcn/ui's
 * Toaster component. The custom reducer-based toast system has been
 * removed to prevent the TOAST_REMOVE_DELAY memory leak and to
 * standardize on Sonner across the entire app.
 */

'use client'

import { toast as sonnerToast } from 'sonner'

/** @deprecated Use `import { toast } from 'sonner'` instead */
export function useToast() {
  return {
    toasts: [] as never[],
    toast: sonnerToast,
    dismiss: () => {},
  }
}

/** @deprecated Use `import { toast } from 'sonner'` instead */
export const toast = sonnerToast
