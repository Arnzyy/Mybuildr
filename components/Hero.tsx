"use client";

import { COPY, SITE_CONFIG } from "@/lib/constants";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-white pt-16 pb-24 md:pt-24 md:pb-32 px-4">
      {/* Background gradient accent */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-100 rounded-full blur-3xl opacity-20"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4">
        {/* Hero Content */}
        <div className="max-w-3xl mx-auto text-center">
          {/* Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            {COPY.hero.headline}
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">
            {COPY.hero.subheading}
          </p>

          {/* CTA Button */}
          <a
            href={`mailto:${SITE_CONFIG.email}`}
            className="inline-block px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-lg"
          >
            {COPY.hero.cta}
          </a>

          {/* Trust signal */}
          <p className="mt-8 text-sm text-gray-500">
            ✓ 30-day money-back guarantee • Setup in less than a week • Cancel anytime
          </p>
        </div>
      </div>
    </section>
  );
}
