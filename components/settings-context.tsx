'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export interface Settings {
  siteTitle: string
  siteDescription: string
  cafeName: string
  brandDescription: string
  contactEmail: string
  whatsappNumber: string
  mainPhoneNumber: string
  instagramUrl: string
  facebookUrl: string
  reviewCount: number
  pointsRatio?: number
}

const defaultSettings: Settings = {
  siteTitle: '154 Breakfast Club',
  siteDescription: 'Crafting unforgettable brunch experiences in Bangalore since 2019.',
  cafeName: '154 Breakfast Club',
  brandDescription: 'Crafting unforgettable brunch experiences in Bangalore since 2019. Premium coffee, artisan food, and warm hospitality.',
  contactEmail: 'hello@154breakfastclub.in',
  whatsappNumber: '+918045670154',
  mainPhoneNumber: '+918045670154',
  instagramUrl: 'https://instagram.com/154breakfastclub',
  facebookUrl: 'https://facebook.com/154breakfastclub',
  reviewCount: 154,
  pointsRatio: 10,
}

interface SettingsContextType {
  settings: Settings
  loading: boolean
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const docRef = doc(db, 'settings', 'general')
    const unsubscribe = onSnapshot(
      docRef,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data()
          setSettings({
            ...defaultSettings,
            ...data,
          } as Settings)
        }
        setLoading(false)
      },
      (error) => {
        console.error('[SettingsProvider] Error loading settings:', error)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [])

  return (
    <SettingsContext.Provider value={{ settings, loading }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}
