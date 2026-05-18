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
    if (!user) {
      router.push('/admin/login')
      return
    }

    const loadSettings = async () => {
      try {
        const data = await getSettings()
        if (data) {
          setSettings(data)
        }
      } catch (error) {
        console.error('Error loading settings:', error)
        toast.error('Failed to load settings')
      } finally {
        setLoading(false)
      }
    }

    loadSettings()
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
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <RoleGuard permission="settings">
    <div className="space-y-8">
      <AdminPageHeader
        title="Settings"
        description="Manage site-wide settings and configurations"
      />

      <div className="grid gap-6 max-w-2xl">
        {/* General Settings */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">General Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Site Title</label>
              <Input
                name="siteTitle"
                value={typeof settings.siteTitle === 'string' ? settings.siteTitle : ''}
                onChange={handleChange}
                placeholder="Site title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Site Description</label>
              <Input
                name="siteDescription"
                value={typeof settings.siteDescription === 'string' ? settings.siteDescription : ''}
                onChange={handleChange}
                placeholder="Site description"
              />
            </div>
          </div>
        </Card>

        {/* Contact Settings */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Contact Email</label>
              <Input
                name="contactEmail"
                type="email"
                value={typeof settings.contactEmail === 'string' ? settings.contactEmail : ''}
                onChange={handleChange}
                placeholder="contact@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">WhatsApp Number</label>
              <Input
                name="whatsappNumber"
                value={typeof settings.whatsappNumber === 'string' ? settings.whatsappNumber : ''}
                onChange={handleChange}
                placeholder="+1234567890"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Main Phone Number</label>
              <Input
                name="mainPhoneNumber"
                value={typeof settings.mainPhoneNumber === 'string' ? settings.mainPhoneNumber : ''}
                onChange={handleChange}
                placeholder="+1234567890"
              />
            </div>
          </div>
        </Card>

        {/* Admin Account */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Admin Account</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-700">Currently logged in as:</p>
                <p className="text-lg font-semibold text-gray-900">{user?.email}</p>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </Card>

        {/* Info Alert */}
        <div className="flex gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700">
            <p className="font-medium mb-1">Settings Updates</p>
            <p>These settings are stored in Firestore and are used throughout your site.</p>
          </div>
        </div>

        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full"
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
