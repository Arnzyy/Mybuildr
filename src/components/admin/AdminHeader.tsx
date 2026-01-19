'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Company } from '@/lib/supabase/types'
import { User } from '@supabase/supabase-js'
import { Menu, X, LogOut } from 'lucide-react'
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
    router.push('/login')
  }

  return (
    <header className="md:hidden bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="px-4 py-3 flex items-center justify-between">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
            <span className="font-bold text-white">B</span>
          </div>
          <span className="font-bold text-gray-900">{company.name}</span>
        </Link>

        <button onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-gray-200 bg-white px-4 py-4 space-y-2">
          <Link
            href="/admin"
            className={`block px-4 py-2 rounded-lg ${pathname === '/admin' ? 'bg-orange-100 text-orange-600' : ''}`}
            onClick={() => setMobileOpen(false)}
          >
            Dashboard
          </Link>
          <Link
            href="/admin/settings"
            className={`block px-4 py-2 rounded-lg ${pathname === '/admin/settings' ? 'bg-orange-100 text-orange-600' : ''}`}
            onClick={() => setMobileOpen(false)}
          >
            Settings
          </Link>
          <Link
            href="/admin/projects"
            className={`block px-4 py-2 rounded-lg ${pathname === '/admin/projects' ? 'bg-orange-100 text-orange-600' : ''}`}
            onClick={() => setMobileOpen(false)}
          >
            Projects
          </Link>
          <Link
            href="/admin/reviews"
            className={`block px-4 py-2 rounded-lg ${pathname === '/admin/reviews' ? 'bg-orange-100 text-orange-600' : ''}`}
            onClick={() => setMobileOpen(false)}
          >
            Reviews
          </Link>
          <Link
            href="/admin/billing"
            className={`block px-4 py-2 rounded-lg ${pathname === '/admin/billing' ? 'bg-orange-100 text-orange-600' : ''}`}
            onClick={() => setMobileOpen(false)}
          >
            Billing
          </Link>

          <div className="border-t border-gray-200 pt-2 mt-2">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 text-red-600 w-full"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
