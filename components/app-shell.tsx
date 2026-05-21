'use client'

import { usePathname } from 'next/navigation'
import { LocationProvider } from '@/components/location-context'
import { AuthProvider } from '@/components/auth/auth-context'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { WhatsAppButton } from '@/components/whatsapp-button'

import { SettingsProvider } from '@/components/settings-context'

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <LocationProvider>
        <SettingsProvider>
          <AppShellInner>{children}</AppShellInner>
        </SettingsProvider>
      </LocationProvider>
    </AuthProvider>
  )
}

function AppShellInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdminRoute = pathname?.startsWith('/admin')

  if (isAdminRoute) {
    return <>{children}</>
  }

  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
      <WhatsAppButton />
    </>
  )
}
