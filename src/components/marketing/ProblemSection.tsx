'use client'

import { COPY } from '@/lib/constants'

export default function ProblemSection() {
  return (
    <section className="bg-gray-50 py-16 md:py-24" id="problem">
      <div className="section-container">
        <div className="max-w-2xl mx-auto text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {COPY.problem.headline}
          </h2>
          <p className="text-lg text-gray-600">{COPY.problem.description}</p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Without Us */}
            <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200">
              <div className="bg-red-50 px-6 py-4 border-b border-red-200">
                <h3 className="font-semibold text-gray-900">Without Us</h3>
                <p className="text-sm text-gray-600">No online presence</p>
              </div>
              <div className="p-8">
                <div className="space-y-4">
                  {['No website - customers can\'t find you', 'No Instagram - no proof of your work', 'Lost leads - competitor gets the job'].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                      <p className="text-gray-700">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* With Us */}
            <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-green-200">
              <div className="bg-green-50 px-6 py-4 border-b border-green-200">
                <h3 className="font-semibold text-gray-900">With Us</h3>
                <p className="text-sm text-gray-600">Professional & automated</p>
              </div>
              <div className="p-8">
                <div className="space-y-4">
                  {['Professional website - customers find you', 'Active Instagram - posts 5x per week automatically', 'Win more jobs - you\'re the professional choice'].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="text-gray-700">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { value: '5x', label: 'Weekly posts' },
              { value: '0 min', label: 'Your time' },
              { value: '£99', label: 'Starting price' },
              { value: '7 days', label: 'Live & posting' },
            ].map((stat, i) => (
              <div key={i} className="bg-white p-4 rounded-lg border border-gray-200 text-center">
                <p className="text-2xl font-bold text-orange-500">{stat.value}</p>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
