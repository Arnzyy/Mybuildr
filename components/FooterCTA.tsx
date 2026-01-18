"use client";

import { COPY, SITE_CONFIG } from "@/lib/constants";

export default function FooterCTA() {
  return (
    <section className="bg-blue-600 py-16 md:py-24 px-4">
      <div className="max-w-6xl mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {COPY.footerCta.headline}
          </h2>
          <p className="text-lg text-blue-100 mb-8">
            {COPY.footerCta.description}
          </p>
          <a
            href={`mailto:${SITE_CONFIG.email}`}
            className="inline-block px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors text-lg"
          >
            {COPY.footerCta.cta}
          </a>
        </div>
      </div>
    </section>
  );
}
