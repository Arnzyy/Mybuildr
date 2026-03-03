'use client'

import { useState, useCallback } from 'react'
import { Company } from '@/lib/supabase/types'
import SettingsSection from './SettingsSection'
import Image from 'next/image'
import {
  Building2,
  Phone,
  Palette,
  Share2,
  Calendar,
  Sparkles,
  Upload,
  X,
  Loader2,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle
} from 'lucide-react'

interface SettingsFormProps {
  company: Company
}

export default function SettingsForm({ company }: SettingsFormProps) {
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [logoUrl, setLogoUrl] = useState(company.logo_url || '')
  const [heroImageUrl, setHeroImageUrl] = useState(company.hero_image_url || '')
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingHero, setUploadingHero] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const validatePassword = (password: string) => {
    const hasUppercase = /[A-Z]/.test(password)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)
    const hasMinLength = password.length >= 8
    return { hasUppercase, hasSpecialChar, hasMinLength, isValid: hasUppercase && hasSpecialChar && hasMinLength }
  }

  const passwordValidation = validatePassword(passwordData.newPassword)

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordMessage(null)

    if (!passwordValidation.isValid) {
      setPasswordMessage({ type: 'error', text: 'Password does not meet requirements' })
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'Passwords do not match' })
      return
    }

    setPasswordLoading(true)
    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      })

      const data = await res.json()

      if (res.ok) {
        setPasswordMessage({ type: 'success', text: 'Password changed successfully' })
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      } else {
        setPasswordMessage({ type: 'error', text: data.error || 'Failed to change password' })
      }
    } catch {
      setPasswordMessage({ type: 'error', text: 'Failed to change password' })
    } finally {
      setPasswordLoading(false)
    }
  }
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
    review_post_frequency: company.review_post_frequency ?? 3,
    // Site Publishing
    is_published: company.is_published ?? false,
  })

  const uploadImage = useCallback(async (file: File): Promise<string | null> => {
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      })
      if (res.ok) {
        const { url } = await res.json()
        return url
      }
      return null
    } catch {
      return null
    }
  }, [])

  const handleImageUpload = useCallback(async (
    file: File,
    setUrl: (url: string) => void,
    setUploading: (v: boolean) => void
  ) => {
    setUploading(true)
    const url = await uploadImage(file)
    if (url) {
      setUrl(url)
      setSaved(false)
    } else {
      alert('Upload failed. Please try again.')
    }
    setUploading(false)
  }, [uploadImage])

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
            logo_url: logoUrl || null,
            hero_image_url: heroImageUrl || null,
            services: formData.services.split(',').map(s => s.trim()).filter(Boolean),
            areas_covered: formData.areas_covered.split(',').map(s => s.trim()).filter(Boolean),
            posts_per_week: Number(formData.posts_per_week),
            review_post_frequency: Number(formData.review_post_frequency),
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
            <select
              name="trade_type"
              value={formData.trade_type}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="">Select a trade type...</option>
              <option value="Electrician">Electrician</option>
              <option value="Plumber">Plumber</option>
              <option value="Builder">Builder</option>
              <option value="Carpenter">Carpenter</option>
              <option value="Gas Engineer">Gas Engineer</option>
              <option value="Roofer">Roofer</option>
              <option value="Plasterer">Plasterer</option>
              <option value="Painter & Decorator">Painter & Decorator</option>
              <option value="Locksmith">Locksmith</option>
              <option value="Joinery">Joinery</option>
              <option value="Tiler">Tiler</option>
              <option value="HVAC/Air Conditioning">HVAC/Air Conditioning</option>
              <option value="Drainage">Drainage</option>
              <option value="Scaffolding">Scaffolding</option>
              <option value="Other">Other (custom)</option>
            </select>
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
        <p className="text-sm text-gray-500 mb-6">
          These links will appear as icons in your website footer, helping visitors find and follow you on social media.
        </p>
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
            <p className="mt-1 text-xs text-gray-500">Shows an Instagram icon in your site footer</p>
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
            <p className="mt-1 text-xs text-gray-500">Shows a Facebook icon in your site footer</p>
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
            <p className="mt-1 text-xs text-gray-500">Shows a Checkatrade badge in your footer and allows importing reviews</p>
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
              <option value={1}>1x per week</option>
              <option value={2}>2x per week</option>
              <option value={3}>3x per week</option>
              <option value={4}>4x per week</option>
              <option value={5}>5x per week (Recommended)</option>
              <option value={6}>6x per week</option>
              <option value={7}>7x per week (daily)</option>
            </select>
            <p className="text-xs text-gray-500 mt-2">
              How many times per week we post to your social media. Maximum 1 post per day.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Posting Time (UK time)
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 gap-2">
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

                return (
                  <button
                    key={hour}
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, posting_times: [hour] }))
                      setSaved(false)
                    }}
                    className={`px-3 py-2 rounded-lg border-2 text-sm font-medium transition-colors ${
                      isSelected
                        ? 'bg-orange-500 border-orange-500 text-white'
                        : 'bg-white border-gray-300 text-gray-700 hover:border-orange-300'
                    }`}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Choose what time your daily post goes live.
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
            <div className="space-y-4">
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Review Post Frequency
                </label>
                <select
                  name="review_post_frequency"
                  value={formData.review_post_frequency || 3}
                  onChange={handleChange}
                  className="w-full sm:w-48 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  {Array.from({ length: 20 }, (_, i) => i + 1).map(num => (
                    <option key={num} value={num}>
                      {num === 1 ? 'Every post' : num === 3 ? `Every ${num}rd post (Recommended)` : `Every ${num}th post`}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-2">
                  How often to post review graphics. Reviews won't repeat for at least 60 days.
                </p>
              </div>
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
          {/* Publish Site Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
            <div>
              <p className="font-medium text-gray-900">
                {formData.is_published ? 'Site Published' : 'Site Draft (Not Public)'}
              </p>
              <p className="text-sm text-gray-500">
                {formData.is_published
                  ? 'Your site is live and visible to the public'
                  : 'Your site is hidden from the public - only you can preview it'
                }
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setFormData(prev => ({ ...prev, is_published: !prev.is_published }))
                setSaved(false)
              }}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                formData.is_published ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  formData.is_published ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Hero Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hero Image
            </label>
            <p className="text-xs text-gray-500 mb-3">
              This is the main banner image on your website. Use a high-quality photo of your work.
            </p>
            {heroImageUrl ? (
              <div className="relative w-full aspect-[21/9] rounded-lg overflow-hidden bg-gray-100">
                <Image
                  src={heroImageUrl}
                  alt="Hero image"
                  fill
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={() => { setHeroImageUrl(''); setSaved(false) }}
                  className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-lg text-red-600 shadow-sm hover:bg-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="block border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-orange-400 hover:bg-orange-50/50 transition-colors">
                {uploadingHero ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin text-orange-500" />
                    <span className="text-gray-600">Uploading...</span>
                  </div>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-700">Upload hero image</p>
                    <p className="text-xs text-gray-500 mt-1">JPG, PNG or WebP</p>
                  </>
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleImageUpload(file, setHeroImageUrl, setUploadingHero)
                  }}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Logo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Logo
            </label>
            <div className="flex items-start gap-4">
              {logoUrl ? (
                <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 flex-shrink-0">
                  <Image
                    src={logoUrl}
                    alt="Logo"
                    fill
                    className="object-contain p-1"
                  />
                  <button
                    type="button"
                    onClick={() => { setLogoUrl(''); setSaved(false) }}
                    className="absolute -top-1 -right-1 p-1 bg-white rounded-full text-red-600 shadow-sm hover:bg-red-50"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <label className="flex-shrink-0 w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-orange-400 hover:bg-orange-50/50 transition-colors">
                  {uploadingLogo ? (
                    <Loader2 className="w-5 h-5 animate-spin text-orange-500" />
                  ) : (
                    <>
                      <Upload className="w-5 h-5 text-gray-400 mb-1" />
                      <span className="text-xs text-gray-500">Upload</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleImageUpload(file, setLogoUrl, setUploadingLogo)
                    }}
                    className="hidden"
                  />
                </label>
              )}
              <p className="text-xs text-gray-500 pt-1">
                Your business logo. Square or transparent PNG works best.
              </p>
            </div>
          </div>

          {/* Colors */}
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

      {/* Account Security */}
      <SettingsSection
        title="Account Security"
        icon={<Lock className="w-5 h-5" />}
        defaultOpen={false}
      >
        <form onSubmit={handlePasswordChange} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {/* Password Requirements */}
            {passwordData.newPassword && (
              <div className="mt-3 space-y-1">
                <div className={`flex items-center gap-2 text-sm ${passwordValidation.hasMinLength ? 'text-green-600' : 'text-gray-500'}`}>
                  {passwordValidation.hasMinLength ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  At least 8 characters
                </div>
                <div className={`flex items-center gap-2 text-sm ${passwordValidation.hasUppercase ? 'text-green-600' : 'text-gray-500'}`}>
                  {passwordValidation.hasUppercase ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  At least 1 uppercase letter
                </div>
                <div className={`flex items-center gap-2 text-sm ${passwordValidation.hasSpecialChar ? 'text-green-600' : 'text-gray-500'}`}>
                  {passwordValidation.hasSpecialChar ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  At least 1 special character (!@#$%^&* etc.)
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
              <p className="mt-1 text-sm text-red-500">Passwords do not match</p>
            )}
          </div>

          {passwordMessage && (
            <div className={`p-3 rounded-lg ${passwordMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {passwordMessage.text}
            </div>
          )}

          <button
            type="submit"
            disabled={passwordLoading || !passwordValidation.isValid || passwordData.newPassword !== passwordData.confirmPassword}
            className="px-6 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {passwordLoading ? 'Changing Password...' : 'Change Password'}
          </button>
        </form>
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
