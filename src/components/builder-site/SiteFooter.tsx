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
