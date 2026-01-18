"use client";

import { PRICING, COPY } from "@/lib/constants";
import PricingCard from "./PricingCard";

export default function PricingSection() {
  return (
    <section className="py-16 md:py-24 px-4" id="pricing">
      <div className="max-w-6xl mx-auto px-4">
        {/* Section header */}
        <div className="max-w-2xl mx-auto text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {COPY.pricing.headline}
          </h2>
          <p className="text-lg text-gray-600">{COPY.pricing.subheading}</p>
        </div>

        {/* Pricing cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto items-start">
          {PRICING.map((tier) => (
            <PricingCard key={tier.id} {...tier} />
          ))}
        </div>

        {/* FAQ note */}
        <div className="text-center mt-12">
          <p className="text-gray-600">
            Have questions?{" "}
            <a
              href="#faq"
              className="text-blue-600 font-semibold hover:underline"
            >
              Check our FAQ
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
