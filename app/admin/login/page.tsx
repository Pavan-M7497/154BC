'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/components/auth/auth-context'
import { getPostAuthRedirect } from '@/lib/auth/roles'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff, Coffee, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { signIn, user, role, canAccessDashboard, loading: authLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && user && role) {
      if (canAccessDashboard) {
        router.replace(getPostAuthRedirect(role))
      } else {
        router.replace('/profile')
      }
    }
  }, [user, role, canAccessDashboard, authLoading, router])

  useEffect(() => {
    if (!loading && user && role && !canAccessDashboard) {
      setError('This account does not have dashboard access. Contact an administrator.')
      toast.error('Dashboard access required')
    }
  }, [user, role, canAccessDashboard, loading])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await signIn(email, password)
      toast.success('Welcome back!')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid email or password'
      if (msg.includes('user-not-found') || msg.includes('wrong-password') || msg.includes('invalid-credential')) {
        setError('Invalid email or password.')
      } else {
        setError('Something went wrong. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#1A0F0A] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#D4A574] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#1A0F0A] flex items-center justify-center p-6">
      <div className="absolute inset-0 opacity-5" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23D4A574' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="relative w-full max-w-md">
        <div className="bg-[#2C1810] border border-[#3D2318] rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#D4A574]/10 border border-[#D4A574]/20 mb-4">
              <Coffee className="w-7 h-7 text-[#D4A574]" />
            </div>
            <h1 className="font-serif text-3xl text-[#FAF7F2] mb-1">154 Admin</h1>
            <p className="text-[#8B7355] text-sm">Breakfast Club Management System</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
              <Label htmlFor="email" className="text-[#FAF7F2]/80 text-sm">Email address</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@154breakfastclub.in" required className="bg-[#1A0F0A] border-[#3D2318] text-[#FAF7F2] placeholder:text-[#8B7355] focus:border-[#D4A574] focus:ring-[#D4A574]/20" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#FAF7F2]/80 text-sm">Password</Label>
              <div className="relative">
                <Input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required className="bg-[#1A0F0A] border-[#3D2318] text-[#FAF7F2] placeholder:text-[#8B7355] focus:border-[#D4A574] focus:ring-[#D4A574]/20 pr-10" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8B7355] hover:text-[#D4A574] transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {error && (
              <div className="flex items-center gap-2 text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2.5 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}
            <Button type="submit" disabled={loading} className="w-full bg-[#D4A574] hover:bg-[#C4955A] text-[#2C1810] font-semibold py-2.5 rounded-lg transition-colors">
              {loading ? 'Signing in...' : 'Sign in to Admin'}
            </Button>
          <div className="mt-6 pt-6 border-t border-[#3D2318]">
            <p className="text-center text-[#8B7355] text-xs">Restricted access — 154 Breakfast Club staff only</p>
          </div>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
