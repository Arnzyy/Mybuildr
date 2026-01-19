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
