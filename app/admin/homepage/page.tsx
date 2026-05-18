'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/auth-context'
import { AdminPageHeader } from '@/components/admin/admin-page-header'
import { ImageUpload } from '@/components/admin/image-upload'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { AlertCircle, Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'
import { updateHomepageCMS, getHomepageCMS } from '@/lib/firestore'
import type { HomepageContent } from '@/lib/data'
import { RoleGuard } from '@/components/auth/role-guard'

export default function HomepageCMSPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [cms, setCms] = useState<HomepageContent>({
    heroTitle: '',
    heroSubtitle: '',
    brandStoryTitle: '',
    brandStoryDescription: '',
    brandStoryImage: '',
    ctaText: '',
    ctaDescription: '',
  })

  useEffect(() => {
    let cancelled = false

    if (!user) {
      router.push('/admin/login')
      return
    }

    const loadCMS = async () => {
      try {
        const data = await getHomepageCMS()
        if (cancelled) return
        if (data) {
          setCms(data)
        }
      } catch (error) {
        console.error('Error loading CMS:', error)
        toast.error('Failed to load CMS data')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadCMS()
    return () => { cancelled = true }
  }, [user, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setCms(prev => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateHomepageCMS(cms)
      toast.success('Homepage CMS updated successfully')
    } catch (error) {
      console.error('Error saving CMS:', error)
      toast.error('Failed to save CMS data')
    } finally {
      setSaving(false)
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
    <RoleGuard permission="homepage">
      <div className="space-y-8 max-w-2xl">
        <AdminPageHeader
          title="Homepage CMS"
          description="Manage the content displayed on your homepage"
        />

        <div className="grid gap-6">
          {/* Hero Section */}
          <Card className="p-6 bg-card border-border">
            <h3 className="text-lg font-semibold mb-4 text-foreground">Hero Section</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground/80">Hero Title</label>
                <Input
                  name="heroTitle"
                  value={cms.heroTitle}
                  onChange={handleChange}
                  placeholder="Enter hero title"
                  className="bg-background border-border text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground/80">Hero Subtitle</label>
                <Textarea
                  name="heroSubtitle"
                  value={cms.heroSubtitle}
                  onChange={handleChange}
                  placeholder="Enter hero subtitle"
                  rows={3}
                  className="bg-background border-border text-foreground resize-none"
                />
              </div>
            </div>
          </Card>

          {/* Brand Story Section */}
          <Card className="p-6 bg-card border-border">
            <h3 className="text-lg font-semibold mb-4 text-foreground">Brand Story Section</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground/80">Title</label>
                <Input
                  name="brandStoryTitle"
                  value={cms.brandStoryTitle}
                  onChange={handleChange}
                  placeholder="Enter brand story title"
                  className="bg-background border-border text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground/80">Description</label>
                <Textarea
                  name="brandStoryDescription"
                  value={cms.brandStoryDescription}
                  onChange={handleChange}
                  placeholder="Enter brand story description"
                  rows={5}
                  className="bg-background border-border text-foreground resize-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium mb-2 text-foreground/80">Image URL</label>
                <ImageUpload
                  value={cms.brandStoryImage}
                  onChange={(url) => setCms(prev => ({ ...prev, brandStoryImage: url }))}
                  folder="cms"
                  aspectRatio="wide"
                />
              </div>
            </div>
          </Card>

          {/* CTA Section */}
          <Card className="p-6 bg-card border-border">
            <h3 className="text-lg font-semibold mb-4 text-foreground">Call to Action Section</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground/80">Button Text</label>
                <Input
                  name="ctaText"
                  value={cms.ctaText}
                  onChange={handleChange}
                  placeholder="Enter CTA button text"
                  className="bg-background border-border text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground/80">Description</label>
                <Textarea
                  name="ctaDescription"
                  value={cms.ctaDescription}
                  onChange={handleChange}
                  placeholder="Enter CTA description"
                  rows={3}
                  className="bg-background border-border text-foreground resize-none"
                />
              </div>
            </div>
          </Card>

          {/* Info Alert */}
          <div className="flex gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-300">
              <p className="font-medium mb-1">Content Updates</p>
              <p>Changes are saved to Firestore and will appear on the homepage in real-time.</p>
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
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </RoleGuard>
  )
}
