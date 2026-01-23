'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Company } from '@/lib/supabase/types'
import { User } from '@supabase/supabase-js'
import { hasFeature } from '@/lib/features'
import {
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  Settings,
  Camera,
  Calendar,
  Share2,
  ExternalLink,
  Lock
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface AdminHeaderProps {
  company: Company
  user: User
}

export default function AdminHeader({ company }: AdminHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, requiredFeature: null },
    { href: '/admin/photos', label: 'My Photos', icon: Camera, requiredFeature: 'upload_projects' },
    { href: '/admin/posts', label: 'Posts', icon: Calendar, requiredFeature: 'view_scheduled_posts' },
    { href: '/admin/social', label: 'Socials', icon: Share2, requiredFeature: 'social_connections' },
    { href: '/admin/settings', label: 'Settings', icon: Settings, requiredFeature: null },
  ]

  return (
    <header className="md:hidden bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="px-4 py-3 flex items-center justify-between">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
            <span className="font-bold text-white">B</span>
          </div>
          <span className="font-bold text-gray-900 truncate max-w-[180px]">{company.name}</span>
        </Link>

        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 -mr-2">
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-gray-200 bg-white px-4 py-4 space-y-1 max-h-[70vh] overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const hasAccess = !item.requiredFeature || hasFeature(company.tier, item.requiredFeature)
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={hasAccess ? item.href : '/admin/billing'}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg ${
                  isActive
                    ? 'bg-orange-100 text-orange-600'
                    : hasAccess
                      ? 'text-gray-700 hover:bg-gray-100'
                      : 'text-gray-400'
                }`}
                onClick={() => setMobileOpen(false)}
              >
                <Icon className="w-5 h-5" />
                <span className="flex-1">{item.label}</span>
                {!hasAccess && <Lock className="w-4 h-4" />}
              </Link>
            )
          })}

          {/* View live site */}
          <a
            href={`/sites/${company.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100"
            onClick={() => setMobileOpen(false)}
          >
            <ExternalLink className="w-5 h-5" />
            <span>View Live Site</span>
          </a>

          <div className="border-t border-gray-200 pt-3 mt-3">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 px-4 py-3 text-red-600 w-full rounded-lg hover:bg-red-50"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
