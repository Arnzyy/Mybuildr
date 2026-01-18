'use client'

import { TESTIMONIAL, COPY } from '@/lib/constants'

export default function TestimonialSection() {
  return (
    <section className="bg-orange-50 py-16 md:py-24">
      <div className="section-container">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {COPY.testimonial.headline}
          </h2>
          <p className="text-lg text-gray-600">{COPY.testimonial.description}</p>
        </div>

        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-8 md:p-12">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="md:flex-shrink-0 md:w-32">
              <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center mx-auto shadow-md overflow-hidden">
                <svg className="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>

            <div className="flex-1">
              <div className="flex gap-1 mb-4 justify-center md:justify-start">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              <p className="text-lg md:text-xl text-gray-900 font-medium mb-6 leading-relaxed text-center md:text-left">
                &quot;{TESTIMONIAL.quote}&quot;
              </p>

              <div className="text-center md:text-left">
                <p className="font-semibold text-gray-900">{TESTIMONIAL.author}</p>
                <p className="text-gray-600 text-sm">{TESTIMONIAL.business} • {TESTIMONIAL.role}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
