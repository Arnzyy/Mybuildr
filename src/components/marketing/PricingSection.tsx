'use client'

import { PRICING, COPY, SITE_CONFIG } from '@/lib/constants'

export default function PricingSection() {
  const tiers = [PRICING.starter, PRICING.pro, PRICING.full]

  return (
    <section className="py-16 md:py-24" id="pricing">
      <div className="section-container">
        <div className="max-w-2xl mx-auto text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {COPY.pricing.headline}
          </h2>
          <p className="text-lg text-gray-600">{COPY.pricing.subheading}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto items-start">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={`relative rounded-lg border transition-all ${
                tier.highlighted
                  ? 'border-orange-400 bg-gradient-to-br from-orange-50 to-white shadow-lg md:scale-105'
                  : 'border-gray-200 bg-white'
              }`}
            >
              {tier.highlighted && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </div>
              )}

              <div className="p-6 md:p-8">
                <div className="mb-6">
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">{tier.name}</h3>
                  <p className="text-sm text-gray-600">{tier.description}</p>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl md:text-5xl font-bold text-gray-900">£{tier.price}</span>
                    <span className="text-gray-600">/month</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">Billed monthly. Cancel anytime.</p>
                </div>

                <a
                  href={`mailto:${SITE_CONFIG.email}?subject=Interest in ${tier.name} Plan`}
                  className={`w-full block text-center py-3 rounded-lg font-semibold mb-6 transition-colors ${
                    tier.highlighted
                      ? 'bg-orange-500 text-white hover:bg-orange-600'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  {tier.cta}
                </a>

                <div className="space-y-3 mb-6">
                  {tier.features.map((feature, index) => (
                    <div key={index} className="flex gap-3">
                      <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <p className="text-sm text-gray-700">{feature}</p>
                    </div>
                  ))}
                </div>

                {tier.notIncluded.length > 0 && (
                  <div className="border-t pt-4">
                    <p className="text-xs font-semibold text-gray-600 uppercase mb-3">Not included</p>
                    <div className="space-y-2">
                      {tier.notIncluded.map((item, index) => (
                        <div key={index} className="flex gap-3">
                          <svg className="w-4 h-4 text-gray-300 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                          <p className="text-sm text-gray-500">{item}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600">
            Have questions?{' '}
            <a href="#faq" className="text-orange-500 font-semibold hover:underline">
              Check our FAQ
            </a>
          </p>
        </div>
      </div>
    </section>
  )
}
