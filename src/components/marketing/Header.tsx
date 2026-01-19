'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { SITE_CONFIG } from '@/lib/constants'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
      <div className="section-container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <img
              src="/images/logo.png"
              alt={SITE_CONFIG.name}
              className="h-10 w-auto"
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#how-it-works" className="text-sm text-gray-600 hover:text-gray-900">
              How It Works
            </a>
            <a href="#demo" className="text-sm text-gray-600 hover:text-gray-900">
              Demo
            </a>
            <a href="#pricing" className="text-sm text-gray-600 hover:text-gray-900">
              Pricing
            </a>
            <a href="#faq" className="text-sm text-gray-600 hover:text-gray-900">
              FAQ
            </a>
            <a href="#pricing" className="btn-primary text-sm">
              Get Your Site
            </a>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-gray-100">
            <div className="flex flex-col gap-4">
              <a href="#how-it-works" className="text-gray-600 hover:text-gray-900">
                How It Works
              </a>
              <a href="#demo" className="text-gray-600 hover:text-gray-900">
                Demo
              </a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900">
                Pricing
              </a>
              <a href="#faq" className="text-gray-600 hover:text-gray-900">
                FAQ
              </a>
              <a href="#pricing" className="btn-primary text-center">
                Get Your Site
              </a>
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
