'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/auth-context'
import { RoleGuard } from '@/components/auth/role-guard'
import { AdminPageHeader } from '@/components/admin/admin-page-header'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { AlertCircle, Loader2, Save, LogOut } from 'lucide-react'
import { toast } from 'sonner'
import { updateSettings, getSettings } from '@/lib/firestore'

export default function SettingsPage() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<Record<string, unknown>>({
    siteTitle: 'Premium Coffee Shop',
    siteDescription: 'Experience the finest coffee and pastries',
    contactEmail: 'contact@coffeeshop.com',
    whatsappNumber: '+1234567890',
    mainPhoneNumber: '+1234567890',
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
          setSettings(data)
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setSettings(prev => ({ ...prev, [name]: value }))
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
      <div className="space-y-8 max-w-2xl">
        <AdminPageHeader
          title="Settings"
          description="Manage site-wide settings and configurations"
        />

        <div className="grid gap-6">
          {/* General Settings */}
          <Card className="p-6 bg-card border-border">
            <h3 className="text-lg font-semibold mb-4 text-foreground">General Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground/80">Site Title</label>
                <Input
                  name="siteTitle"
                  value={typeof settings.siteTitle === 'string' ? settings.siteTitle : ''}
                  onChange={handleChange}
                  placeholder="Site title"
                  className="bg-background border-border text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground/80">Site Description</label>
                <Input
                  name="siteDescription"
                  value={typeof settings.siteDescription === 'string' ? settings.siteDescription : ''}
                  onChange={handleChange}
                  placeholder="Site description"
                  className="bg-background border-border text-foreground"
                />
              </div>
            </div>
          </Card>

          {/* Contact Settings */}
          <Card className="p-6 bg-card border-border">
            <h3 className="text-lg font-semibold mb-4 text-foreground">Contact Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground/80">Contact Email</label>
                <Input
                  name="contactEmail"
                  type="email"
                  value={typeof settings.contactEmail === 'string' ? settings.contactEmail : ''}
                  onChange={handleChange}
                  placeholder="contact@example.com"
                  className="bg-background border-border text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground/80">WhatsApp Number</label>
                <Input
                  name="whatsappNumber"
                  value={typeof settings.whatsappNumber === 'string' ? settings.whatsappNumber : ''}
                  onChange={handleChange}
                  placeholder="+1234567890"
                  className="bg-background border-border text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground/80">Main Phone Number</label>
                <Input
                  name="mainPhoneNumber"
                  value={typeof settings.mainPhoneNumber === 'string' ? settings.mainPhoneNumber : ''}
                  onChange={handleChange}
                  placeholder="+1234567890"
                  className="bg-background border-border text-foreground"
                />
              </div>
            </div>
          </Card>

          {/* Admin Account */}
          <Card className="p-6 bg-card border-border">
            <h3 className="text-lg font-semibold mb-4 text-foreground">Admin Account</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-background border border-border rounded-lg">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Currently logged in as:</p>
                  <p className="text-lg font-semibold text-foreground">{user?.email}</p>
                </div>
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="w-full border-border hover:bg-background hover:text-foreground text-muted-foreground"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </Card>

          {/* Info Alert */}
          <div className="flex gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-300">
              <p className="font-medium mb-1">Settings Updates</p>
              <p>These settings are stored in Firestore and are used throughout your site.</p>
            </div>
          </div>

          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-accent hover:bg-caramel-hover text-accent-foreground font-semibold py-3"
            size="lg"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </div>
    </RoleGuard>
  )
}
