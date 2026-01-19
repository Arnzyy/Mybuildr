'use client'

import { useEffect, useRef, useState } from 'react'
import { Review, Company } from '@/lib/supabase/types'

interface DaxaReviewsProps {
  reviews: Review[]
  company: Company
}

export default function DaxaReviews({ reviews, company }: DaxaReviewsProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true)
      },
      { threshold: 0.1 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (reviews.length <= 1) return
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % reviews.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [reviews.length])

  if (reviews.length === 0) {
    return null
  }

  return (
    <section id="reviews" ref={sectionRef} className="py-20 lg:py-32 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div
          className={`text-center max-w-3xl mx-auto mb-16 transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <span className="inline-block px-4 py-1.5 bg-[#E91E8C]/10 text-[#E91E8C] text-sm font-semibold rounded-full mb-4">
            Testimonials
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-900 mb-6">
            What Our <span className="text-[#38BDF8]">Clients</span> Say
          </h2>
          <p className="text-neutral-600 text-lg">
            Don&apos;t just take our word for it. Here&apos;s what our happy customers say about their experience.
          </p>
        </div>

        {/* Reviews Carousel */}
        <div
          className={`relative max-w-4xl mx-auto transition-all duration-1000 delay-200 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="relative bg-neutral-50 rounded-3xl p-8 sm:p-12">
            {/* Quote Icon */}
            <svg
              className="absolute top-6 right-6 w-20 h-20 text-[#E91E8C]/10"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
            </svg>

            {/* Stars */}
            <div className="flex gap-1 mb-6">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-6 h-6 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>

            {/* Review Text */}
            <div className="min-h-[120px] mb-8">
              {reviews.map((review, index) => (
                <p
                  key={review.id}
                  className={`text-xl sm:text-2xl text-neutral-700 leading-relaxed transition-all duration-500 ${
                    activeIndex === index ? 'opacity-100' : 'opacity-0 absolute'
                  }`}
                >
                  &ldquo;{review.review_text}&rdquo;
                </p>
              ))}
            </div>

            {/* Author */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#E91E8C] to-[#38BDF8] flex items-center justify-center text-white font-bold text-lg">
                  {reviews[activeIndex]?.reviewer_name?.charAt(0) || '?'}
                </div>
                <div>
                  <div className="font-semibold text-neutral-900">{reviews[activeIndex]?.reviewer_name}</div>
                  <div className="text-neutral-500 text-sm">Verified Customer</div>
                </div>
              </div>

              {/* Checkatrade Badge */}
              {company.checkatrade_url && (
                <a
                  href={company.checkatrade_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:flex items-center gap-2 bg-green-50 px-4 py-2 rounded-lg"
                >
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">✓</span>
                  </div>
                  <span className="text-sm text-green-700 font-medium">Checkatrade</span>
                </a>
              )}
            </div>

            {/* Navigation Dots */}
            {reviews.length > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                {reviews.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveIndex(index)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === activeIndex
                        ? 'w-8 bg-gradient-to-r from-[#E91E8C] to-[#38BDF8]'
                        : 'w-2 bg-neutral-300'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
