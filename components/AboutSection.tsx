"use client";

import { COPY } from "@/lib/constants";

export default function AboutSection() {
  return (
    <section className="bg-gray-50 py-16 md:py-24 px-4" id="about">
      <div className="max-w-6xl mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            {COPY.about.headline}
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            {COPY.about.description}
          </p>
        </div>
      </div>
    </section>
  );
}
