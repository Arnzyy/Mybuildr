'use client'

import { useState } from 'react'
import { Company } from '@/lib/supabase/types'
import { Menu, X, Phone } from 'lucide-react'
import WhatsAppButton from './WhatsAppButton'

interface SiteHeaderProps {
  company: Company
  variant?: 'default' | 'transparent' | 'dark'
}

export default function SiteHeader({ company, variant = 'default' }: SiteHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  const bgClass = {
    default: 'bg-white border-b border-gray-200',
    transparent: 'bg-transparent absolute top-0 left-0 right-0 z-50',
    dark: 'bg-gray-900 text-white',
  }[variant]

  const textClass = variant === 'dark' || variant === 'transparent' ? 'text-white' : 'text-gray-900'

  return (
    <header className={`${bgClass} sticky top-0 z-50`}>
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo / Name */}
          <div className="flex items-center gap-3">
            {company.logo_url && (
              <img
                src={company.logo_url}
                alt={company.name}
                className="h-10 w-auto"
              />
            )}
            <span className={`text-xl font-bold ${textClass}`}>
              {company.name}
            </span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <a href="#services" className={`${textClass} hover:opacity-80`}>Services</a>
            <a href="#projects" className={`${textClass} hover:opacity-80`}>Projects</a>
            <a href="#reviews" className={`${textClass} hover:opacity-80`}>Reviews</a>
            <a href="#contact" className={`${textClass} hover:opacity-80`}>Contact</a>
          </nav>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            {company.phone && (
              <a
                href={`tel:${company.phone}`}
                className="flex items-center gap-2 text-sm font-medium"
                style={{ color: company.primary_color }}
              >
                <Phone className="w-4 h-4" />
                {company.phone}
              </a>
            )}
            <WhatsAppButton company={company} variant="header" />
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-200 pt-4">
            <nav className="flex flex-col gap-4">
              <a href="#services" className="text-gray-900">Services</a>
              <a href="#projects" className="text-gray-900">Projects</a>
              <a href="#reviews" className="text-gray-900">Reviews</a>
              <a href="#contact" className="text-gray-900">Contact</a>
              {company.phone && (
                <a
                  href={`tel:${company.phone}`}
                  className="flex items-center gap-2 font-medium"
                  style={{ color: company.primary_color }}
                >
                  <Phone className="w-4 h-4" />
                  {company.phone}
                </a>
              )}
              <WhatsAppButton company={company} variant="inline" />
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
