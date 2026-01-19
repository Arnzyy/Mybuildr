'use client'

import { useState } from 'react'
import { Company } from '@/lib/supabase/types'
import { Phone, Mail, MapPin } from 'lucide-react'
import WhatsAppButton from './WhatsAppButton'

interface SiteContactProps {
  company: Company
}

export default function SiteContact({ company }: SiteContactProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: company.id,
          ...formData,
        }),
      })
      setSubmitted(true)
    } catch (error) {
      alert('Something went wrong. Please try calling or WhatsApp instead.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="contact" className="py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Get In Touch
          </h2>
          <p className="text-gray-600">
            Ready to discuss your project? Contact us today
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              Contact Details
            </h3>
            <div className="space-y-4">
              {company.phone && (
                <a
                  href={`tel:${company.phone}`}
                  className="flex items-center gap-4 text-gray-700 hover:text-gray-900"
                >
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${company.primary_color}15` }}
                  >
                    <Phone className="w-5 h-5" style={{ color: company.primary_color }} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">{company.phone}</p>
                  </div>
                </a>
              )}

              {company.email && (
                <a
                  href={`mailto:${company.email}`}
                  className="flex items-center gap-4 text-gray-700 hover:text-gray-900"
                >
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${company.primary_color}15` }}
                  >
                    <Mail className="w-5 h-5" style={{ color: company.primary_color }} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{company.email}</p>
                  </div>
                </a>
              )}

              {company.city && (
                <div className="flex items-center gap-4 text-gray-700">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${company.primary_color}15` }}
                  >
                    <MapPin className="w-5 h-5" style={{ color: company.primary_color }} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="font-medium">
                      {company.city}{company.postcode ? `, ${company.postcode}` : ''}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8">
              <p className="text-sm text-gray-500 mb-3">Prefer WhatsApp?</p>
              <WhatsAppButton company={company} variant="inline" />
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-gray-50 rounded-xl p-8">
            {submitted ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">✓</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Message Sent!
                </h3>
                <p className="text-gray-600">
                  We&apos;ll get back to you as soon as possible.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message
                  </label>
                  <textarea
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    placeholder="Tell us about your project..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-lg font-semibold text-white transition-colors disabled:opacity-50"
                  style={{ backgroundColor: company.primary_color }}
                >
                  {loading ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
