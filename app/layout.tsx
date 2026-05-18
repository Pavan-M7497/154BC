import type { Metadata, Viewport } from 'next'
import { DM_Sans, Playfair_Display } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AppShell } from '@/components/app-shell'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const dmSans = DM_Sans({ 
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
})

const playfair = Playfair_Display({ 
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

export const metadata: Metadata = {
  title: '154 Breakfast Club | Premium Brunch in Bangalore',
  description: 'Experience the art of slow coffee and premium brunch at 154 Breakfast Club. Three distinctive locations in Indiranagar, Koramangala, and HSR Layout.',
  keywords: ['brunch', 'breakfast', 'coffee', 'cafe', 'bangalore', 'indiranagar', 'koramangala', 'hsr layout', 'premium dining'],
  openGraph: {
    title: '154 Breakfast Club | Premium Brunch in Bangalore',
    description: 'Experience the art of slow coffee and premium brunch at 154 Breakfast Club.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: '#FAF7F2',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${playfair.variable} bg-background`}>
      <body className="font-sans antialiased bg-background text-foreground">
        <AppShell>{children}</AppShell>
        <Toaster richColors position="top-right" />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
