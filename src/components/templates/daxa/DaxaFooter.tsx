'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Company } from '@/lib/supabase/types'

interface DaxaFooterProps {
  company: Company
}

export default function DaxaFooter({ company }: DaxaFooterProps) {
  const currentYear = new Date().getFullYear()

  const services = company.services || [
    'Extensions',
    'Loft Conversions',
    'Knock Throughs',
    'Renovations',
    'New Builds',
    'Garden Work',
  ]

  const formattedPhone = company.phone?.replace(/(\d{5})(\d{6})/, '$1 $2') || ''

  return (
    <footer className="bg-neutral-950 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 pb-12 border-b border-white/10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href={`/sites/${company.slug}`} className="inline-block mb-6">
              {company.logo_url ? (
                <Image
                  src={company.logo_url}
                  alt={company.name}
                  width={180}
                  height={60}
                  className="h-12 w-auto"
                />
              ) : (
                <span className="text-2xl font-bold text-white">{company.name}</span>
              )}
            </Link>
            <p className="text-white/50 mb-6 max-w-md">
              {company.description || 'Family-run building company with decades of combined experience. Quality craftsmanship delivered across Somerset.'}
            </p>
            {company.checkatrade_url && (
              <a
                href={company.checkatrade_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-green-500/10 px-4 py-2 rounded-lg"
              >
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">✓</span>
                </div>
                <span className="text-sm text-green-400 font-medium">Checkatrade Approved</span>
              </a>
            )}
            {/* Social Links */}
            {(company.instagram_url || company.facebook_url) && (
              <div className="flex gap-4 mt-6">
                {company.instagram_url && (
                  <a
                    href={company.instagram_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white/60 hover:bg-[#E91E8C] hover:text-white transition-all"
                    aria-label="Instagram"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </a>
                )}
                {company.facebook_url && (
                  <a
                    href={company.facebook_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white/60 hover:bg-[#1877F2] hover:text-white transition-all"
                    aria-label="Facebook"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-semibold mb-6">Services</h3>
            <ul className="space-y-3">
              {services.map((service) => (
                <li key={service}>
                  <a href="#services" className="text-white/50 hover:text-[#E91E8C] transition-colors text-sm">
                    {service}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-6">Contact</h3>
            <ul className="space-y-4">
              {company.phone && (
                <li>
                  <a href={`tel:${company.phone}`} className="flex items-center gap-3 text-white/50 hover:text-[#E91E8C] transition-colors text-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {formattedPhone}
                  </a>
                </li>
              )}
              {company.email && (
                <li>
                  <a href={`mailto:${company.email}`} className="flex items-center gap-3 text-white/50 hover:text-[#38BDF8] transition-colors text-sm break-all">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {company.email}
                  </a>
                </li>
              )}
              {(company.address_line1 || company.city) && (
                <li className="flex items-start gap-3 text-white/50 text-sm">
                  <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {[company.address_line1, company.city, company.postcode].filter(Boolean).join(', ')}
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-white/30 text-sm">
            &copy; {currentYear} {company.name}. All rights reserved.
          </p>
          <nav className="flex gap-6">
            {['Home', 'Services', 'Gallery', 'Reviews', 'Contact'].map((link) => (
              <a
                key={link}
                href={`#${link.toLowerCase()}`}
                className="text-white/30 hover:text-white/60 text-sm transition-colors"
              >
                {link}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  )
}
