"use client";

import { SITE_CONFIG } from "@/lib/constants";

interface PricingCardProps {
  name: string;
  price: number;
  description: string;
  features: string[];
  notIncluded?: string[];
  highlighted?: boolean;
}

export default function PricingCard({
  name,
  price,
  description,
  features,
  notIncluded,
  highlighted,
}: PricingCardProps) {
  return (
    <div
      className={`relative rounded-lg border transition-all ${
        highlighted
          ? "border-blue-400 bg-gradient-to-br from-blue-50 to-white shadow-lg md:scale-105"
          : "border-gray-200 bg-white"
      }`}
    >
      {/* Highlighted badge */}
      {highlighted && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
          Most Popular
        </div>
      )}

      <div className="p-6 md:p-8">
        {/* Header */}
        <div className="mb-6">
          <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
            {name}
          </h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>

        {/* Price */}
        <div className="mb-6">
          <div className="flex items-baseline gap-1">
            <span className="text-4xl md:text-5xl font-bold text-gray-900">
              £{price}
            </span>
            <span className="text-gray-600">/month</span>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Billed monthly. Cancel anytime.
          </p>
        </div>

        {/* CTA Button */}
        <a
          href={`mailto:${SITE_CONFIG.email}?subject=Interest in ${name} Plan`}
          className={`w-full block text-center py-3 rounded-lg font-semibold mb-6 transition-colors ${
            highlighted
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-100 text-gray-900 hover:bg-gray-200"
          }`}
        >
          Email us to get started
        </a>

        {/* Features list */}
        <div className="space-y-3 mb-6">
          {features.map((feature, index) => (
            <div key={index} className="flex gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <svg
                  className="w-5 h-5 text-green-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <p className="text-sm text-gray-700">{feature}</p>
            </div>
          ))}
        </div>

        {/* Not included */}
        {notIncluded && notIncluded.length > 0 && (
          <div className="border-t pt-4">
            <p className="text-xs font-semibold text-gray-600 uppercase mb-3">
              Not included
            </p>
            <div className="space-y-2">
              {notIncluded.map((item, index) => (
                <div key={index} className="flex gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <svg
                      className="w-4 h-4 text-gray-300"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-500">{item}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
