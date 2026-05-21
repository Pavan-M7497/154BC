'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/auth-context'
import { RoleGuard } from '@/components/auth/role-guard'
import { AdminPageHeader } from '@/components/admin/admin-page-header'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { AlertCircle, Loader2, Save, LogOut, Coffee, Share2, Award, Info } from 'lucide-react'
import { toast } from 'sonner'
import { updateSettings, getSettings } from '@/lib/firestore'

export default function SettingsPage() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<Record<string, unknown>>({
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
  })

  useEffect(() => {
    let cancelled = false

    if (!user) {
      router.push('/admin/login')
      return
    }

    const loadSettings = async () => {
      try {
        const data = await getSettings()
        if (cancelled) return
        if (data) {
          setSettings(prev => ({ ...prev, ...data }))
        }
      } catch (error) {
        console.error('Error loading settings:', error)
        toast.error('Failed to load settings')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadSettings()
    return () => { cancelled = true }
  }, [user, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    const parsedValue = type === 'number' ? Number(value) : value
    setSettings(prev => ({ ...prev, [name]: parsedValue }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateSettings(settings)
      toast.success('Settings saved successfully')
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut()
      router.push('/admin/login')
    } catch (error) {
      console.error('Error logging out:', error)
      toast.error('Failed to logout')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    )
  }

  return (
    <RoleGuard permission="settings">
      <div className="space-y-8 max-w-4xl pb-16">
        <AdminPageHeader
          title="Global Settings"
          description="Manage site branding, dynamic contact info, social handles, and business configurations"
        />

        <div className="grid gap-6">
          {/* General & Branding Settings */}
          <Card className="p-6 bg-card border border-border shadow-sm rounded-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-accent/10 border border-accent/20 rounded-xl flex items-center justify-center text-accent">
                <Coffee size={20} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">General & Branding</h3>
                <p className="text-muted-foreground text-xs">Configure how your brand displays across the website</p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2 text-foreground/80">Café / Business Name</label>
                <Input
                  name="cafeName"
                  value={typeof settings.cafeName === 'string' ? settings.cafeName : ''}
                  onChange={handleChange}
                  placeholder="e.g. 154 Breakfast Club"
                  className="bg-background border-border text-foreground focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-foreground/80">SEO Site Title</label>
                <Input
                  name="siteTitle"
                  value={typeof settings.siteTitle === 'string' ? settings.siteTitle : ''}
                  onChange={handleChange}
                  placeholder="Site title for search engines"
                  className="bg-background border-border text-foreground"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-foreground/80">SEO Site Description</label>
                <Input
                  name="siteDescription"
                  value={typeof settings.siteDescription === 'string' ? settings.siteDescription : ''}
                  onChange={handleChange}
                  placeholder="Short description for search engines"
                  className="bg-background border-border text-foreground"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2 text-foreground/80">Brand Description / Story (Footer & About)</label>
                <Textarea
                  name="brandDescription"
                  value={typeof settings.brandDescription === 'string' ? settings.brandDescription : ''}
                  onChange={handleChange}
                  placeholder="Tell clients about your business history, vibe, and vision..."
                  rows={3}
                  className="bg-background border-border text-foreground resize-none"
                />
              </div>
            </div>
          </Card>

          {/* Contact Details Settings */}
          <Card className="p-6 bg-card border border-border shadow-sm rounded-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center text-blue-400">
                <Info size={20} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Contact details</h3>
                <p className="text-muted-foreground text-xs">Customer support channels and dynamic map fallbacks</p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-5">
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground/80">Support Email</label>
                <Input
                  name="contactEmail"
                  type="email"
                  value={typeof settings.contactEmail === 'string' ? settings.contactEmail : ''}
                  onChange={handleChange}
                  placeholder="contact@yourcafe.com"
                  className="bg-background border-border text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground/80">WhatsApp Number</label>
                <Input
                  name="whatsappNumber"
                  value={typeof settings.whatsappNumber === 'string' ? settings.whatsappNumber : ''}
                  onChange={handleChange}
                  placeholder="e.g. +918045670154"
                  className="bg-background border-border text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground/80">Main Phone Number</label>
                <Input
                  name="mainPhoneNumber"
                  value={typeof settings.mainPhoneNumber === 'string' ? settings.mainPhoneNumber : ''}
                  onChange={handleChange}
                  placeholder="e.g. +918045670154"
                  className="bg-background border-border text-foreground"
                />
              </div>
            </div>
          </Card>

          {/* Social Channels & Social Proof */}
          <Card className="p-6 bg-card border border-border shadow-sm rounded-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400">
                <Share2 size={20} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Social & Metrics</h3>
                <p className="text-muted-foreground text-xs">Configure dynamic reviews counts and social channels</p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-5">
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground/80">Instagram Profile Link</label>
                <Input
                  name="instagramUrl"
                  value={typeof settings.instagramUrl === 'string' ? settings.instagramUrl : ''}
                  onChange={handleChange}
                  placeholder="https://instagram.com/..."
                  className="bg-background border-border text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground/80">Facebook Page Link</label>
                <Input
                  name="facebookUrl"
                  value={typeof settings.facebookUrl === 'string' ? settings.facebookUrl : ''}
                  onChange={handleChange}
                  placeholder="https://facebook.com/..."
                  className="bg-background border-border text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground/80">Manual Review Stats Count</label>
                <Input
                  name="reviewCount"
                  type="number"
                  value={typeof settings.reviewCount === 'number' ? settings.reviewCount : 154}
                  onChange={handleChange}
                  placeholder="150"
                  className="bg-background border-border text-foreground"
                />
              </div>
            </div>
          </Card>

          {/* Operational Loyalty System */}
          <Card className="p-6 bg-card border border-border shadow-sm rounded-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-center justify-center text-yellow-400">
                <Award size={20} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Loyalty configuration</h3>
                <p className="text-muted-foreground text-xs">Set points conversion values for client purchases</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-foreground/80">Points Earning Ratio (Points per $1 / ₹100 spent)</label>
              <Input
                name="pointsRatio"
                type="number"
                value={typeof settings.pointsRatio === 'number' ? settings.pointsRatio : 10}
                onChange={handleChange}
                placeholder="10"
                className="bg-background border-border text-foreground max-w-xs"
              />
              <p className="text-xs text-muted-foreground mt-2">
                This factor calculates points given to customers automatically on confirmed order payments.
              </p>
            </div>
          </Card>

          {/* Admin Account Controls */}
          <Card className="p-6 bg-card border border-border shadow-sm rounded-2xl">
            <h3 className="text-lg font-semibold mb-4 text-foreground">System Account</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-background border border-border rounded-xl">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Authorized staff session:</p>
                  <p className="text-base font-semibold text-foreground mt-1">{user?.email}</p>
                </div>
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="w-full border-border hover:bg-red-500/10 hover:text-red-400 text-muted-foreground transition-all duration-200"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out Session
              </Button>
            </div>
          </Card>

          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold py-4 rounded-xl transition-all shadow-md active:scale-[0.99] duration-150"
            size="lg"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Updating Global CMS...
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Save Business Configurations
              </>
            )}
          </Button>
        </div>
      </div>
    </RoleGuard>
  )
}
