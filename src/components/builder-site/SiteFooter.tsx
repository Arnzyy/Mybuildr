import { Company } from '@/lib/supabase/types'
import { Phone, Mail, MapPin } from 'lucide-react'

interface SiteFooterProps {
  company: Company
}

export default function SiteFooter({ company }: SiteFooterProps) {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-bold mb-4">{company.name}</h3>
            {company.description && (
              <p className="text-gray-400 text-sm mb-4">
                {company.description.substring(0, 150)}
                {company.description.length > 150 ? '...' : ''}
              </p>
            )}
            {company.checkatrade_url && (
              <a
                href={company.checkatrade_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-green-400 hover:underline"
              >
                View on Checkatrade
              </a>
            )}
            {/* Social Links */}
            {(company.instagram_url || company.facebook_url) && (
              <div className="flex gap-3 mt-4">
                {company.instagram_url && (
                  <a
                    href={company.instagram_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors"
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
                    className="text-gray-400 hover:text-white transition-colors"
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

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <div className="space-y-3 text-sm text-gray-400">
              {company.phone && (
                <a href={`tel:${company.phone}`} className="flex items-center gap-2 hover:text-white">
                  <Phone className="w-4 h-4" />
                  {company.phone}
                </a>
              )}
              {company.email && (
                <a href={`mailto:${company.email}`} className="flex items-center gap-2 hover:text-white">
                  <Mail className="w-4 h-4" />
                  {company.email}
                </a>
              )}
              {company.city && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {company.city}{company.postcode ? `, ${company.postcode}` : ''}
                </div>
              )}
            </div>
          </div>

          {/* Areas */}
          <div>
            <h4 className="font-semibold mb-4">Areas Covered</h4>
            {company.areas_covered && company.areas_covered.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {company.areas_covered.map((area) => (
                  <span
                    key={area}
                    className="text-xs bg-gray-800 px-2 py-1 rounded"
                  >
                    {area}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">Contact us for coverage areas</p>
            )}
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} {company.name}. All rights reserved.
          </p>
          <p className="text-xs text-gray-600">
            Website by <a href="https://bytrade.co.uk" className="hover:text-white">ByTrade</a>
          </p>
        </div>
      </div>
    </footer>
  )
}
