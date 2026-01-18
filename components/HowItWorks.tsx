"use client";

import { COPY } from "@/lib/constants";

export default function HowItWorks() {
  return (
    <section className="py-16 md:py-24 px-4" id="how-it-works">
      <div className="max-w-6xl mx-auto px-4">
        {/* Section header */}
        <div className="max-w-2xl mx-auto text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {COPY.howItWorks.headline}
          </h2>
        </div>

        {/* Steps grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {COPY.howItWorks.steps.map((step, index) => (
            <div key={step.number} className="relative">
              {/* Step card */}
              <div className="bg-white rounded-lg border border-gray-200 p-8 hover:shadow-md transition-shadow h-full">
                {/* Step number circle */}
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 text-white font-bold text-lg mb-6">
                  {step.number}
                </div>

                {/* Step content */}
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600">{step.description}</p>
              </div>

              {/* Connector arrow (hidden on mobile) */}
              {index < COPY.howItWorks.steps.length - 1 && (
                <div className="hidden md:flex absolute top-1/2 -right-4 transform -translate-y-1/2 translate-x-full items-center justify-center w-8">
                  <svg
                    className="w-6 h-6 text-gray-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
