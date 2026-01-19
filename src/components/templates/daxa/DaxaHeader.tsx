'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Company } from '@/lib/supabase/types'

interface DaxaHeaderProps {
  company: Company
}

export default function DaxaHeader({ company }: DaxaHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'Services', href: '#services' },
    { name: 'Gallery', href: '#gallery' },
    { name: 'Reviews', href: '#reviews' },
    { name: 'Contact', href: '#contact' },
  ]

  const formattedPhone = company.phone?.replace(/(\d{5})(\d{6})/, '$1 $2') || ''

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 lg:h-24">
          {/* Left Nav */}
          <nav className="hidden lg:flex items-center gap-8 flex-1">
            {navLinks.slice(0, 3).map((link) => (
              <a
                key={link.name}
                href={link.href}
                className={`text-sm font-medium tracking-wide transition-colors ${
                  isScrolled
                    ? 'text-neutral-700 hover:text-[#E91E8C]'
                    : 'text-white hover:text-[#E91E8C]'
                }`}
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Center Logo */}
          <Link href={`/sites/${company.slug}`} className="relative z-10">
            {company.logo_url ? (
              <Image
                src={company.logo_url}
                alt={company.name}
                width={200}
                height={70}
                className="h-12 lg:h-14 w-auto object-contain"
                priority
              />
            ) : (
              <span className={`text-2xl font-bold ${isScrolled ? 'text-neutral-900' : 'text-white'}`}>
                {company.name}
              </span>
            )}
          </Link>

          {/* Right Nav */}
          <nav className="hidden lg:flex items-center justify-end gap-8 flex-1">
            {navLinks.slice(3).map((link) => (
              <a
                key={link.name}
                href={link.href}
                className={`text-sm font-medium tracking-wide transition-colors ${
                  isScrolled
                    ? 'text-neutral-700 hover:text-[#E91E8C]'
                    : 'text-white hover:text-[#E91E8C]'
                }`}
              >
                {link.name}
              </a>
            ))}
            {company.phone && (
              <a
                href={`tel:${company.phone}`}
                className="px-6 py-2.5 bg-[#BE185D] hover:bg-[#9D174D] text-white text-sm font-medium rounded-lg shadow-sm shadow-black/10 hover:shadow-md transition-all duration-300"
              >
                {formattedPhone}
              </a>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`lg:hidden relative z-50 w-10 h-10 flex flex-col items-center justify-center gap-1.5 ${
              isMobileMenuOpen ? 'text-neutral-900' : isScrolled ? 'text-neutral-900' : 'text-white'
            }`}
          >
            <span
              className={`w-6 h-0.5 bg-current transition-all duration-300 ${
                isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''
              }`}
            />
            <span
              className={`w-6 h-0.5 bg-current transition-all duration-300 ${
                isMobileMenuOpen ? 'opacity-0' : ''
              }`}
            />
            <span
              className={`w-6 h-0.5 bg-current transition-all duration-300 ${
                isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''
              }`}
            />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden fixed inset-0 bg-white z-40 transition-all duration-500 ${
          isMobileMenuOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex flex-col items-center justify-center h-full gap-8">
          {navLinks.map((link, index) => (
            <a
              key={link.name}
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-2xl font-semibold text-neutral-900 hover:text-[#E91E8C] transition-colors"
              style={{
                transitionDelay: isMobileMenuOpen ? `${index * 50}ms` : '0ms',
              }}
            >
              {link.name}
            </a>
          ))}
          {company.phone && (
            <a
              href={`tel:${company.phone}`}
              className="mt-4 px-8 py-4 bg-[#BE185D] text-white font-semibold rounded-lg shadow-md shadow-black/10"
            >
              {formattedPhone}
            </a>
          )}
        </div>
      </div>
    </header>
  )
}
