import { TEMPLATE_CONFIGS } from '@/lib/templates/types'
import Link from 'next/link'

export const metadata = {
  title: 'Website Templates | ByTrade',
  description: 'Choose from 8 professional website templates designed for tradespeople',
}

export default function TemplatesPage() {
  const templates = Object.values(TEMPLATE_CONFIGS)

  return (
    <div className="py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Website Templates
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            8 professional templates designed specifically for tradespeople.
            Pick one, we&apos;ll customise it to your brand.
          </p>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {templates.map((template) => (
            <Link
              key={template.name}
              href={`/templates/${template.name}`}
              className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Preview image placeholder */}
              <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <span className="text-4xl font-bold text-gray-300 group-hover:text-gray-400 transition-colors">
                  {template.displayName.charAt(0)}
                </span>
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="font-bold text-gray-900 mb-1">{template.displayName}</h3>
                <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                <div className="flex flex-wrap gap-1">
                  {template.features.slice(0, 3).map((feature) => (
                    <span
                      key={feature}
                      className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <p className="text-gray-600 mb-4">
            Not sure which template is right for you?
          </p>
          <Link
            href="/get-started"
            className="inline-flex items-center gap-2 bg-orange-500 text-white px-8 py-4 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
          >
            Get Started - We&apos;ll Help You Choose
          </Link>
        </div>
      </div>
    </div>
  )
}
