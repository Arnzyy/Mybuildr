"use client";

import { COPY } from "@/lib/constants";

export default function ProblemSection() {
  return (
    <section className="bg-gray-50 py-16 md:py-24 px-4">
      <div className="max-w-6xl mx-auto px-4">
        {/* Section headline */}
        <div className="max-w-2xl mx-auto text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {COPY.problem.headline}
          </h2>
          <p className="text-lg text-gray-600">{COPY.problem.description}</p>
        </div>

        {/* Before/After Comparison */}
        <div className="max-w-5xl mx-auto">
          {/* Mobile: Stacked layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Before */}
            <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200">
              <div className="bg-red-50 px-6 py-4 border-b border-red-200">
                <h3 className="font-semibold text-gray-900">Without Us</h3>
                <p className="text-sm text-gray-600">No online presence</p>
              </div>
              <div className="p-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                      <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">No website</p>
                      <p className="text-sm text-gray-500">Customers can&apos;t find you</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                      <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">No Instagram</p>
                      <p className="text-sm text-gray-500">No proof of your work</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                      <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Lost leads</p>
                      <p className="text-sm text-gray-500">Competitor gets the job</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* After */}
            <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-green-200">
              <div className="bg-green-50 px-6 py-4 border-b border-green-200">
                <h3 className="font-semibold text-gray-900">With Us</h3>
                <p className="text-sm text-gray-600">Professional & automated</p>
              </div>
              <div className="p-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Professional website</p>
                      <p className="text-sm text-gray-500">Customers find you online</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Active Instagram</p>
                      <p className="text-sm text-gray-500">Posts 5x per week automatically</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Win more jobs</p>
                      <p className="text-sm text-gray-500">You&apos;re the professional choice</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stat section below comparison */}
          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-4">
              Builders with active social media close 3x more jobs than those who don&apos;t.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <p className="text-2xl font-bold text-blue-600">5x</p>
                <p className="text-sm text-gray-600">Weekly posts</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <p className="text-2xl font-bold text-blue-600">0 min</p>
                <p className="text-sm text-gray-600">Your time (automated)</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <p className="text-2xl font-bold text-blue-600">£99</p>
                <p className="text-sm text-gray-600">Starting price</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <p className="text-2xl font-bold text-blue-600">1 week</p>
                <p className="text-sm text-gray-600">Live & posting</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
