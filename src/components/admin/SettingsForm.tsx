'use client'

import { useState } from 'react'
import { Company } from '@/lib/supabase/types'
import { TEMPLATE_CONFIGS } from '@/lib/templates/types'

interface SettingsFormProps {
  company: Company
}

export default function SettingsForm({ company }: SettingsFormProps) {
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [formData, setFormData] = useState({
    name: company.name,
    email: company.email,
    phone: company.phone || '',
    whatsapp: company.whatsapp || '',
    address_line1: company.address_line1 || '',
    address_line2: company.address_line2 || '',
    city: company.city || '',
    postcode: company.postcode || '',
    trade_type: company.trade_type || '',
    description: company.description || '',
    services: company.services?.join(', ') || '',
    areas_covered: company.areas_covered?.join(', ') || '',
    instagram_url: company.instagram_url || '',
    facebook_url: company.facebook_url || '',
    checkatrade_url: company.checkatrade_url || '',
    template: company.template,
    primary_color: company.primary_color,
    secondary_color: company.secondary_color,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
    setSaved(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: company.id,
          updates: {
            ...formData,
            services: formData.services.split(',').map(s => s.trim()).filter(Boolean),
            areas_covered: formData.areas_covered.split(',').map(s => s.trim()).filter(Boolean),
          }
        }),
      })

      if (res.ok) {
        setSaved(true)
      } else {
        alert('Failed to save. Please try again.')
      }
    } catch {
      alert('Failed to save. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Business Info */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-6">Business Information</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Business Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trade Type
            </label>
            <input
              type="text"
              name="trade_type"
              value={formData.trade_type}
              onChange={handleChange}
              placeholder="e.g. Builder, Electrician, Plumber"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="Tell customers about your business..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Services (comma separated)
            </label>
            <input
              type="text"
              name="services"
              value={formData.services}
              onChange={handleChange}
              placeholder="e.g. Extensions, Renovations, New Builds"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Areas Covered (comma separated)
            </label>
            <input
              type="text"
              name="areas_covered"
              value={formData.areas_covered}
              onChange={handleChange}
              placeholder="e.g. Bristol, Bath, South Gloucestershire"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-6">Contact Information</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="07123 456789"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              WhatsApp Number
            </label>
            <input
              type="text"
              name="whatsapp"
              value={formData.whatsapp}
              onChange={handleChange}
              placeholder="447123456789 (country code, no +)"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
            <p className="text-xs text-gray-500 mt-1">UK format: 447123456789</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City
            </label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Postcode
            </label>
            <input
              type="text"
              name="postcode"
              value={formData.postcode}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
        </div>
      </div>

      {/* Social Links */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-6">Social & Reviews</h2>

        <div className="grid grid-cols-1 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Instagram URL
            </label>
            <input
              type="url"
              name="instagram_url"
              value={formData.instagram_url}
              onChange={handleChange}
              placeholder="https://instagram.com/yourbusiness"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Facebook URL
            </label>
            <input
              type="url"
              name="facebook_url"
              value={formData.facebook_url}
              onChange={handleChange}
              placeholder="https://facebook.com/yourbusiness"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Checkatrade URL
            </label>
            <input
              type="url"
              name="checkatrade_url"
              value={formData.checkatrade_url}
              onChange={handleChange}
              placeholder="https://checkatrade.com/trades/yourbusiness"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
        </div>
      </div>

      {/* Branding */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-6">Branding</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Template
            </label>
            <select
              name="template"
              value={formData.template}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              {Object.values(TEMPLATE_CONFIGS).map((template) => (
                <option key={template.name} value={template.name}>
                  {template.displayName} - {template.description}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Primary Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  name="primary_color"
                  value={formData.primary_color}
                  onChange={handleChange}
                  className="w-12 h-12 rounded border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.primary_color}
                  onChange={handleChange}
                  name="primary_color"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Secondary Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  name="secondary_color"
                  value={formData.secondary_color}
                  onChange={handleChange}
                  className="w-12 h-12 rounded border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.secondary_color}
                  onChange={handleChange}
                  name="secondary_color"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="flex items-center justify-between">
        <div>
          {saved && (
            <p className="text-green-600 text-sm flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full" />
              Settings saved successfully
            </p>
          )}
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-8 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  )
}
