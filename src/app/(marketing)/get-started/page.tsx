'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { SITE_CONFIG, PRICING } from '@/lib/constants'
import { ArrowLeft, Check, Loader2 } from 'lucide-react'

const packageLabels: Record<string, string> = {
  starter: `Starter - £${PRICING.starter.price}/month`,
  pro: `Pro - £${PRICING.pro.price}/month`,
  full: `Full Package - £${PRICING.full.price}/month`,
}

function GetStartedForm() {
  const searchParams = useSearchParams()
  const packageParam = searchParams.get('package')

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    package: '',
    message: '',
  })

  // Pre-select package from URL parameter
  useEffect(() => {
    if (packageParam && packageLabels[packageParam]) {
      setFormData(prev => ({ ...prev, package: packageLabels[packageParam] }))
    }
  }, [packageParam])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Create mailto link with form data
    const subject = `New Lead: ${formData.name} - ${formData.package || 'Not specified'}`
    const body = `
Name: ${formData.name}
Email: ${formData.email}
Phone: ${formData.phone}
Package Interest: ${formData.package || 'Not specified'}
Message: ${formData.message || 'None'}
    `.trim()

    // Open email client
    window.location.href = `mailto:${SITE_CONFIG.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`

    // Show success after a short delay
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSubmitted(true)
    }, 500)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  if (isSubmitted) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center py-16">
        <div className="max-w-md mx-auto text-center px-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Thanks {formData.name}!</h1>
          <p className="text-gray-600 mb-8">
            Your email client should have opened with your details. Just hit send and we&apos;ll be in touch within 24 hours.
          </p>
          <p className="text-sm text-gray-500 mb-8">
            Didn&apos;t work? Email us directly at{' '}
            <a href={`mailto:${SITE_CONFIG.email}`} className="text-orange-500 font-medium">
              {SITE_CONFIG.email}
            </a>
          </p>
          <Link href="/" className="btn-primary inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="py-16 md:py-24">
      <div className="section-container">
        <div className="max-w-2xl mx-auto">
          {/* Back link */}
          <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8">
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>

          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Get Your Site
            </h1>
            <p className="text-lg text-gray-600">
              Fill in your details and we&apos;ll get back to you within 24 hours.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-lg">
            <div className="space-y-6">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-900 mb-2">
                  Your Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Smith"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
                />
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-900 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="07XXX XXXXXX"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
                />
              </div>

              {/* Package Selection */}
              <div>
                <label htmlFor="package" className="block text-sm font-medium text-gray-900 mb-2">
                  Which package are you interested in?
                </label>
                <select
                  id="package"
                  name="package"
                  value={formData.package}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all bg-white"
                >
                  <option value="">Not sure yet</option>
                  <option value={packageLabels.starter}>{packageLabels.starter}</option>
                  <option value={packageLabels.pro}>{packageLabels.pro}</option>
                  <option value={packageLabels.full}>{packageLabels.full} (Most Popular)</option>
                </select>
              </div>

              {/* Message */}
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-900 mb-2">
                  Anything else we should know? <span className="text-gray-400">(Optional)</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={3}
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us about your business..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all resize-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full btn-primary py-4 text-lg flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Get Started →'
                )}
              </button>

              {/* Trust note */}
              <p className="text-center text-sm text-gray-500">
                No spam. No pressure. Just a quick chat to see if we&apos;re a good fit.
              </p>
            </div>
          </form>

          {/* Alternative contact */}
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Prefer to chat? WhatsApp us at{' '}
              <a
                href={`https://wa.me/${SITE_CONFIG.whatsapp}?text=Hi, I'm interested in a website for my trade business`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-600 font-medium hover:underline"
              >
                WhatsApp
              </a>
              {' '}or email{' '}
              <a href={`mailto:${SITE_CONFIG.email}`} className="text-orange-500 font-medium hover:underline">
                {SITE_CONFIG.email}
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function FormLoading() {
  return (
    <div className="py-16 md:py-24">
      <div className="section-container">
        <div className="max-w-2xl mx-auto">
          <div className="animate-pulse">
            <div className="h-6 w-32 bg-gray-200 rounded mb-8" />
            <div className="text-center mb-12">
              <div className="h-10 w-64 bg-gray-200 rounded mx-auto mb-4" />
              <div className="h-6 w-96 bg-gray-200 rounded mx-auto" />
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8">
              <div className="space-y-6">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i}>
                    <div className="h-4 w-24 bg-gray-200 rounded mb-2" />
                    <div className="h-12 bg-gray-200 rounded-xl" />
                  </div>
                ))}
                <div className="h-14 bg-gray-300 rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function GetStartedPage() {
  return (
    <Suspense fallback={<FormLoading />}>
      <GetStartedForm />
    </Suspense>
  )
}
