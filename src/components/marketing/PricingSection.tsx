import { Check, X } from 'lucide-react'
import { PRICING } from '@/lib/constants'

export default function PricingSection() {
  const tiers = [PRICING.starter, PRICING.pro, PRICING.full]

  return (
    <section id="pricing" className="py-16 md:py-24 bg-gray-50">
      <div className="section-container">
        {/* Headline */}
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Simple pricing. Pick what you need.
          </h2>
          <p className="text-lg text-gray-600">
            All plans include hosting, SSL, and support. Cancel anytime.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={`relative bg-white rounded-xl overflow-hidden ${
                tier.highlighted
                  ? 'border-2 border-orange-500 shadow-xl'
                  : 'border border-gray-200'
              }`}
            >
              {/* Popular badge */}
              {tier.highlighted && (
                <div className="absolute top-0 right-0 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                  MOST POPULAR
                </div>
              )}

              <div className="p-8">
                {/* Header */}
                <h3 className="text-xl font-bold text-gray-900">{tier.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{tier.description}</p>

                {/* Price */}
                <div className="mt-6 mb-6">
                  <span className="text-4xl font-bold text-gray-900">£{tier.price}</span>
                  <span className="text-gray-600">/month</span>
                </div>

                {/* CTA */}
                <a
                  href={`/get-started?package=${tier.id}`}
                  className={`block w-full text-center py-3 rounded-lg font-semibold transition-colors ${
                    tier.highlighted
                      ? 'bg-orange-500 text-white hover:bg-orange-600'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  Get Started →
                </a>

                {/* Features */}
                <ul className="mt-6 space-y-3">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                  {tier.notIncluded.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <X className="w-5 h-5 text-gray-300 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-400">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom note */}
        <p className="text-center text-gray-500 mt-8">
          Questions? <a href="#faq" className="text-orange-500 font-medium hover:underline">Check our FAQ</a> or{' '}
          <a href="/get-started" className="text-orange-500 font-medium hover:underline">get in touch</a>
        </p>
      </div>
    </section>
  )
}
