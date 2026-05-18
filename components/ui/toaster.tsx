/**
 * DEPRECATED — Use `Toaster` from `@/components/ui/sonner` instead.
 *
 * This file is kept only to prevent build breaks in case of residual
 * imports. It now renders null to prevent loading the memory-leaking
 * shadcn toast engine.
 */

'use client'

export function Toaster() {
  return null
}
