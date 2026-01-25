'use client'

import { useState } from 'react'
import { Company } from '@/lib/supabase/types'
import { TEMPLATE_CONFIGS } from '@/lib/templates/types'
import SettingsSection from './SettingsSection'
import {
  Building2,
  Phone,
  Palette,
  Share2,
  Calendar,
  Sparkles
} from 'lucide-react'

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
    posting_enabled: company.posting_enabled ?? true,
    posts_per_week: company.posts_per_week || 5,
    posting_times: company.posting_times || [8, 12, 18],
    // AI Caption Settings
    caption_guidelines: company.caption_guidelines || '',
    caption_signoff_enabled: company.caption_signoff_enabled ?? true,
    caption_signoff_instagram: company.caption_signoff_instagram || '',
    caption_signoff_facebook: company.caption_signoff_facebook || '',
    caption_signoff_google: company.caption_signoff_google || '',
    hashtag_preferences: company.hashtag_preferences?.join(', ') || '',
    // Review Posting Settings
    review_posting_enabled: company.review_posting_enabled ?? true,
    review_min_rating: company.review_min_rating ?? 4,
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
            posts_per_week: Number(formData.posts_per_week),
            hashtag_preferences: formData.hashtag_preferences.split(',').map(s => s.trim().replace(/^#/, '')).filter(Boolean),
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
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Business Info */}
      <SettingsSection
        title="Business Information"
        icon={<Building2 className="w-5 h-5" />}
        defaultOpen={false}
      >
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
      </SettingsSection>

      {/* Contact Info */}
      <SettingsSection
        title="Contact Information"
        icon={<Phone className="w-5 h-5" />}
        defaultOpen={false}
      >
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
      </SettingsSection>

      {/* Social Links */}
      <SettingsSection
        title="Social Links"
        icon={<Share2 className="w-5 h-5" />}
        defaultOpen={false}
      >
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
      </SettingsSection>

      {/* Posting Settings */}
      <SettingsSection
        title="Posting Settings"
        icon={<Calendar className="w-5 h-5" />}
        defaultOpen={true}
      >
        <div className="space-y-6">
          {/* Pause/Resume Posting Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
            <div>
              <p className="font-medium text-gray-900">
                {formData.posting_enabled ? 'Auto-Posting Active' : 'Auto-Posting Paused'}
              </p>
              <p className="text-sm text-gray-500">
                {formData.posting_enabled
                  ? 'Your photos are being posted automatically'
                  : 'Posting is paused - no new posts will be created'
                }
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setFormData(prev => ({ ...prev, posting_enabled: !prev.posting_enabled }))
                setSaved(false)
              }}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                formData.posting_enabled ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  formData.posting_enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Posts per week
            </label>
            <select
              name="posts_per_week"
              value={formData.posts_per_week}
              onChange={handleChange}
              className="w-full sm:w-48 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <optgroup label="Weekly">
                <option value={1}>1x per week</option>
                <option value={2}>2x per week</option>
                <option value={3}>3x per week</option>
                <option value={5}>5x per week (Recommended)</option>
                <option value={7}>7x per week</option>
              </optgroup>
              <optgroup label="Daily">
                <option value={7}>1x per day (7/week)</option>
                <option value={14}>2x per day (14/week)</option>
                <option value={21}>3x per day (21/week) - MAX</option>
              </optgroup>
            </select>
            <p className="text-xs text-gray-500 mt-2">
              How often we auto-post to social media. Posts are distributed across your selected time slots.
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Posting Times (UK time)
              </label>
              <span className="text-sm font-medium text-gray-600">
                {formData.posting_times.length}/3 slots selected
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {[
                { hour: 6, label: '6am' },
                { hour: 7, label: '7am' },
                { hour: 8, label: '8am' },
                { hour: 9, label: '9am' },
                { hour: 10, label: '10am' },
                { hour: 11, label: '11am' },
                { hour: 12, label: '12pm' },
                { hour: 13, label: '1pm' },
                { hour: 14, label: '2pm' },
                { hour: 15, label: '3pm' },
                { hour: 16, label: '4pm' },
                { hour: 17, label: '5pm' },
                { hour: 18, label: '6pm' },
                { hour: 19, label: '7pm' },
                { hour: 20, label: '8pm' },
                { hour: 21, label: '9pm' },
              ].map(({ hour, label }) => {
                const isSelected = formData.posting_times.includes(hour)
                const isDisabled = !isSelected && formData.posting_times.length >= 3

                return (
                  <button
                    key={hour}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => {
                      const currentTimes = formData.posting_times

                      // Check if trying to add more than 3 slots
                      if (!isSelected && currentTimes.length >= 3) {
                        alert('You can select a maximum of 3 posting times')
                        return
                      }

                      const newTimes = isSelected
                        ? currentTimes.filter(h => h !== hour)
                        : [...currentTimes, hour].sort((a, b) => a - b)

                      // Ensure at least one time slot
                      if (newTimes.length === 0) {
                        alert('You must select at least one posting time')
                        return
                      }

                      setFormData(prev => ({ ...prev, posting_times: newTimes }))
                      setSaved(false)
                    }}
                    className={`px-3 py-2 rounded-lg border-2 text-sm font-medium transition-colors ${
                      isSelected
                        ? 'bg-orange-500 border-orange-500 text-white'
                        : isDisabled
                        ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-white border-gray-300 text-gray-700 hover:border-orange-300'
                    }`}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Select up to 3 times when your posts will go live. Posts will be distributed across these time slots throughout the week.
            </p>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Auto-post Reviews</p>
              <p className="text-sm text-gray-500">
                Automatically create and post review graphics
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setFormData(prev => ({ ...prev, review_posting_enabled: !prev.review_posting_enabled }))
                setSaved(false)
              }}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                formData.review_posting_enabled ? 'bg-orange-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  formData.review_posting_enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {formData.review_posting_enabled && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Rating for Reviews
              </label>
              <select
                name="review_min_rating"
                value={formData.review_min_rating}
                onChange={handleChange}
                className="w-full sm:w-48 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value={5}>5 stars only</option>
                <option value={4}>4+ stars</option>
                <option value={3}>3+ stars</option>
              </select>
              <p className="text-xs text-gray-500 mt-2">
                Only reviews with this rating or higher will be posted
              </p>
            </div>
          )}
        </div>
      </SettingsSection>

      {/* AI Caption Settings */}
      <SettingsSection
        title="AI Caption Settings"
        icon={<Sparkles className="w-5 h-5" />}
        defaultOpen={false}
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Caption Guidelines
            </label>
            <textarea
              name="caption_guidelines"
              value={formData.caption_guidelines}
              onChange={handleChange}
              rows={4}
              placeholder="e.g. Keep it professional, mention quality workmanship, avoid slang, always mention we're a family-run business..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Tell the AI how to write your captions - tone, style, what to include/avoid
            </p>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Caption Sign-off</p>
              <p className="text-sm text-gray-500">
                Add your contact info at the end of each caption
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setFormData(prev => ({ ...prev, caption_signoff_enabled: !prev.caption_signoff_enabled }))
                setSaved(false)
              }}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                formData.caption_signoff_enabled ? 'bg-orange-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  formData.caption_signoff_enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {formData.caption_signoff_enabled && (
            <>
              <p className="text-sm text-gray-600">
                Leave fields empty to auto-generate from your business info (name, phone, city)
              </p>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sign-off - Instagram
                  </label>
                  <input
                    type="text"
                    name="caption_signoff_instagram"
                    value={formData.caption_signoff_instagram}
                    onChange={handleChange}
                    placeholder="Leave empty for auto-generated, or enter custom text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sign-off - Facebook
                  </label>
                  <input
                    type="text"
                    name="caption_signoff_facebook"
                    value={formData.caption_signoff_facebook}
                    onChange={handleChange}
                    placeholder="Leave empty for auto-generated, or enter custom text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sign-off - Google Business
                  </label>
                  <input
                    type="text"
                    name="caption_signoff_google"
                    value={formData.caption_signoff_google}
                    onChange={handleChange}
                    placeholder="Leave empty for auto-generated, or enter custom text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Custom Hashtags (comma separated)
            </label>
            <input
              type="text"
              name="hashtag_preferences"
              value={formData.hashtag_preferences}
              onChange={handleChange}
              placeholder="e.g. yourbrand, yourarea, yourspecialty"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              These hashtags will always be included in your posts (without #)
            </p>
          </div>
        </div>
      </SettingsSection>

      {/* Website & Branding */}
      <SettingsSection
        title="Website & Branding"
        icon={<Palette className="w-5 h-5" />}
        defaultOpen={true}
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Primary Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  name="primary_color"
                  value={formData.primary_color}
                  onChange={handleChange}
                  className="w-12 h-12 rounded border border-gray-300 cursor-pointer flex-shrink-0"
                />
                <input
                  type="text"
                  value={formData.primary_color}
                  onChange={handleChange}
                  name="primary_color"
                  className="w-full min-w-0 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Secondary Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  name="secondary_color"
                  value={formData.secondary_color}
                  onChange={handleChange}
                  className="w-12 h-12 rounded border border-gray-300 cursor-pointer flex-shrink-0"
                />
                <input
                  type="text"
                  value={formData.secondary_color}
                  onChange={handleChange}
                  name="secondary_color"
                  className="w-full min-w-0 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </SettingsSection>

      {/* Submit */}
      <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-4">
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
          className="w-full sm:w-auto px-8 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  )
}
