'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { onSnapshot, query, collection, orderBy, where } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { locations as staticLocations, type Location } from '@/lib/data'

interface LocationContextType {
  selectedLocation: Location | null
  setSelectedLocation: (location: Location) => void
  locations: Location[]
  isLocationModalOpen: boolean
  openLocationModal: () => void
  closeLocationModal: () => void
}

const LocationContext = createContext<LocationContextType | undefined>(undefined)

export function LocationProvider({ children }: { children: ReactNode }) {
  const [selectedLocation, setSelectedLocationState] = useState<Location | null>(null)
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [dynamicLocations, setDynamicLocations] = useState<Location[]>(staticLocations)

  // Subscribe to Firestore locations (active only)
  useEffect(() => {
    let unsubscribe: (() => void) | null = null
    
    try {
      const q = query(
        collection(db, 'locations'),
        where('active', '==', true),
        orderBy('name')
      )
      unsubscribe = onSnapshot(
        q,
        (snap) => {
          try {
            if (!snap.empty) {
              const firestoreLocations = snap.docs.map(d => {
                try {
                  return { id: d.id, ...d.data() } as Location
                } catch (e) {
                  console.error('Error parsing location:', e)
                  return null
                }
              }).filter((loc): loc is Location => loc !== null)
              
              if (firestoreLocations.length > 0) {
                setDynamicLocations(firestoreLocations)
              }
            }
          } catch (e) {
            console.error('Error processing Firestore snapshot:', e)
            setDynamicLocations(staticLocations)
          }
        },
        (error) => {
          console.error('Firestore locations subscription error:', error)
          setDynamicLocations(staticLocations)
        }
      )
    } catch (e) {
      console.error('Error setting up Firestore subscription:', e)
      setDynamicLocations(staticLocations)
    }
    
    return () => {
      if (unsubscribe && typeof unsubscribe === 'function') {
        unsubscribe()
      }
    }
  }, [])

  useEffect(() => {
    setMounted(true)
    const savedLocationId = localStorage.getItem('154-selected-location')
    if (savedLocationId) {
      const location = dynamicLocations.find(l => l.id === savedLocationId)
      if (location) {
        setSelectedLocationState(location)
        return
      }
    }
    setIsLocationModalOpen(true)
  }, [dynamicLocations])

  const setSelectedLocation = (location: Location) => {
    setSelectedLocationState(location)
    localStorage.setItem('154-selected-location', location.id)
    setIsLocationModalOpen(false)
  }

  const openLocationModal = () => setIsLocationModalOpen(true)
  const closeLocationModal = () => setIsLocationModalOpen(false)

  return (
    <LocationContext.Provider
      value={{
        selectedLocation: mounted ? selectedLocation : null,
        setSelectedLocation,
        locations: dynamicLocations,
        isLocationModalOpen: mounted ? isLocationModalOpen : false,
        openLocationModal,
        closeLocationModal,
      }}
    >
      {children}
    </LocationContext.Provider>
  )
}

export function useLocation() {
  const context = useContext(LocationContext)
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider')
  }
  return context
}
