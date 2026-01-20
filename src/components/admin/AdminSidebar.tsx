'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Company } from '@/lib/supabase/types'
import { hasFeature } from '@/lib/features'
import {
  LayoutDashboard,
  Settings,
  FolderOpen,
  Calendar,
  Share2,
  Star,
  CreditCard,
  ExternalLink,
  Lock,
  LogOut
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface AdminSidebarProps {
  company: Company
}

export default function AdminSidebar({ company }: AdminSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  const navItems = [
    {
      href: '/admin',
      label: 'Dashboard',
      icon: LayoutDashboard,
      requiredFeature: null,
    },
    {
      href: '/admin/settings',
      label: 'Settings',
      icon: Settings,
      requiredFeature: null,
    },
    {
      href: '/admin/projects',
      label: 'Projects',
      icon: FolderOpen,
      requiredFeature: 'upload_projects',
    },
    {
      href: '/admin/posts',
      label: 'Scheduled Posts',
      icon: Calendar,
      requiredFeature: 'view_scheduled_posts',
    },
    {
      href: '/admin/social',
      label: 'Social Accounts',
      icon: Share2,
      requiredFeature: 'social_connections',
    },
    {
      href: '/admin/reviews',
      label: 'Reviews',
      icon: Star,
      requiredFeature: null,
    },
    {
      href: '/admin/billing',
      label: 'Billing',
      icon: CreditCard,
      requiredFeature: null,
    },
  ]

  return (
    <aside className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 bg-gray-900 text-white">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <Link href="/admin" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
            <span className="font-bold text-lg">B</span>
          </div>
          <div>
            <p className="font-bold">ByTrade</p>
            <p className="text-xs text-gray-400">Admin Panel</p>
          </div>
        </Link>
      </div>

      {/* Company info */}
      <div className="p-4 border-b border-gray-800">
        <p className="font-medium truncate">{company.name}</p>
        <p className="text-xs text-gray-400 capitalize">{company.tier} Plan</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const hasAccess = !item.requiredFeature || hasFeature(company.tier, item.requiredFeature)

          return (
            <Link
              key={item.href}
              href={hasAccess ? item.href : '#'}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-orange-500 text-white'
                  : hasAccess
                    ? 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    : 'text-gray-600 cursor-not-allowed'
              }`}
              onClick={(e) => !hasAccess && e.preventDefault()}
            >
              <item.icon className="w-5 h-5" />
              <span className="flex-1">{item.label}</span>
              {!hasAccess && <Lock className="w-4 h-4" />}
            </Link>
          )
        })}
      </nav>

      {/* View site link & Logout */}
      <div className="p-4 border-t border-gray-800 space-y-3">
        <a
          href={`/sites/${company.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          View Live Site
        </a>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-red-400 transition-colors w-full"
        >
          <LogOut className="w-4 h-4" />
          Log Out
        </button>
      </div>

      {/* Upgrade prompt for non-full tier */}
      {company.tier !== 'full' && (
        <div className="p-4 m-4 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg">
          <p className="font-medium text-sm mb-2">Unlock all features</p>
          <p className="text-xs text-orange-100 mb-3">
            Upgrade to Full Package for automated posting
          </p>
          <Link
            href="/admin/billing"
            className="block text-center bg-white text-orange-500 px-4 py-2 rounded font-medium text-sm hover:bg-gray-100"
          >
            Upgrade Now
          </Link>
        </div>
      )}
    </aside>
  )
}
