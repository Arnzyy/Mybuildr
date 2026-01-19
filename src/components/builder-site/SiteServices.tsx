import { Company } from '@/lib/supabase/types'
import { Wrench, Home, Paintbrush, Zap, Droplets, Hammer } from 'lucide-react'

interface SiteServicesProps {
  company: Company
}

// Map common service keywords to icons
const SERVICE_ICONS: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  'extension': Home,
  'renovation': Hammer,
  'electrical': Zap,
  'plumbing': Droplets,
  'painting': Paintbrush,
  'decorating': Paintbrush,
  'default': Wrench,
}

function getServiceIcon(service: string) {
  const lower = service.toLowerCase()
  for (const [key, Icon] of Object.entries(SERVICE_ICONS)) {
    if (lower.includes(key)) return Icon
  }
  return SERVICE_ICONS.default
}

export default function SiteServices({ company }: SiteServicesProps) {
  if (!company.services || company.services.length === 0) return null

  return (
    <section id="services" className="py-16 md:py-24 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Our Services
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Professional {company.trade_type || 'construction'} services tailored to your needs
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {company.services.map((service) => {
            const Icon = getServiceIcon(service)
            return (
              <div
                key={service}
                className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                  style={{ backgroundColor: `${company.primary_color}15` }}
                >
                  <Icon className="w-6 h-6" style={{ color: company.primary_color }} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{service}</h3>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
