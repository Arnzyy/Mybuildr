'use client'

import { useState, useEffect } from 'react'
import { Globe, Settings, Camera, Upload, Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Check, Clock, ChevronLeft, ChevronRight } from 'lucide-react'

const tabs = [
  { id: 'website', label: 'Website', icon: Globe },
  { id: 'admin', label: 'Upload', icon: Settings },
  { id: 'instagram', label: 'Instagram', icon: Camera },
]

const demoImages = [
  { src: '/images/kitchen-demo.jpg', label: 'Kitchen' },
  { src: '/images/demo-1.webp', label: 'Extension' },
  { src: '/images/demo-2.jpg', label: 'Renovation' },
  { src: '/images/demo-3.jpg', label: 'Bathroom' },
]

const instagramPosts = [
  {
    image: '/images/kitchen-demo.jpg',
    caption: 'Bespoke handmade in-frame shaker kitchen. Solid oak internals, soft-close everything. Another happy client in Clifton.',
    likes: 47,
    time: '2 hours ago',
  },
  {
    image: '/images/demo-1.webp',
    caption: 'Extension complete in Redland. Extra 40sqm of living space, bi-fold doors out to the garden. The clients are over the moon.',
    likes: 62,
    time: '2 days ago',
  },
  {
    image: '/images/demo-2.jpg',
    caption: 'Full house renovation wrapped up this week. New kitchen, bathrooms, rewire, replumb. Transformed this 1930s semi.',
    likes: 89,
    time: '4 days ago',
  },
  {
    image: '/images/demo-3.jpg',
    caption: 'Bathroom refit in Bishopston. Walk-in shower, heated floors, new everything. Done and dusted in 2 weeks.',
    likes: 34,
    time: '1 week ago',
  },
]

export default function DemoSection() {
  const [activeTab, setActiveTab] = useState('website')
  const [currentPost, setCurrentPost] = useState(0)

  // Auto-scroll Instagram posts
  useEffect(() => {
    if (activeTab !== 'instagram') return

    const interval = setInterval(() => {
      setCurrentPost((prev) => (prev + 1) % instagramPosts.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [activeTab])

  const nextPost = () => setCurrentPost((prev) => (prev + 1) % instagramPosts.length)
  const prevPost = () => setCurrentPost((prev) => (prev - 1 + instagramPosts.length) % instagramPosts.length)

  return (
    <section id="demo" className="py-16 md:py-24 bg-gray-50">
      <div className="section-container">
        {/* Headline */}
        <div className="max-w-3xl mx-auto text-center mb-8 md:mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            See it in action
          </h2>
          <p className="text-lg text-gray-600">
            Real client. Real results. Zero effort from them.
          </p>
        </div>

        {/* Demo Container */}
        <div className="max-w-4xl mx-auto">
          {/* Tabs - Always show labels */}
          <div className="flex gap-2 mb-4 justify-center">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-gray-900 text-white shadow-lg'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Content Card */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xl">
            {/* Website Tab */}
            {activeTab === 'website' && (
              <div className="relative">
                {/* Browser Chrome */}
                <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <div className="flex-1 bg-white rounded-md px-3 py-1.5 text-xs text-gray-500 font-mono">
                    daxamanagement.com
                  </div>
                </div>
                <div className="aspect-[4/3] md:aspect-video">
                  <iframe
                    src="https://www.daxamanagement.com"
                    className="w-full h-full border-none"
                    title="DAXA Management - Live Client Website"
                  />
                </div>
              </div>
            )}

            {/* Admin Panel Tab */}
            {activeTab === 'admin' && (
              <div className="p-4 md:p-8">
                {/* Mobile-first admin UI */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
                      <span className="text-white font-bold text-sm">bt</span>
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">bytrade</p>
                      <p className="text-xs text-gray-500">Admin Panel</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1.5 rounded-full text-xs font-medium">
                    <Clock className="w-3 h-3" />
                    3 scheduled
                  </div>
                </div>

                {/* Upload Zone */}
                <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 md:p-12 text-center bg-gray-50 mb-6 hover:border-orange-400 hover:bg-orange-50/50 transition-all cursor-pointer group">
                  <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4 group-hover:shadow-md transition-shadow">
                    <Upload className="w-8 h-8 text-gray-400 group-hover:text-orange-500 transition-colors" />
                  </div>
                  <p className="text-base font-semibold text-gray-900 mb-1">Drop photos here</p>
                  <p className="text-sm text-gray-500">We write the captions & post for you</p>
                </div>

                {/* Recent Uploads */}
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-gray-900">Recent Uploads</p>
                  <p className="text-xs text-gray-500">All auto-posted</p>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {demoImages.map((img, i) => (
                    <div key={i} className="relative group">
                      <div className="aspect-square rounded-xl overflow-hidden">
                        <img
                          src={img.src}
                          alt={img.label}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      </div>
                      <p className="absolute bottom-1 left-1 right-1 text-[10px] text-white font-medium truncate bg-black/50 rounded px-1">{img.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Instagram Tab - Auto-scrolling posts */}
            {activeTab === 'instagram' && (
              <div className="flex flex-col">
                {/* Instagram Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-bold ring-2 ring-pink-200">DM</div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">daxa_management</p>
                      <p className="text-xs text-gray-500">Bristol, UK</p>
                    </div>
                  </div>
                  <MoreHorizontal className="w-5 h-5 text-gray-400" />
                </div>

                {/* Post Image with navigation */}
                <div className="aspect-[4/5] md:aspect-[16/9] relative group">
                  <img
                    src={instagramPosts[currentPost].image}
                    alt="Instagram post"
                    className="w-full h-full object-cover transition-opacity duration-500"
                  />

                  {/* Navigation arrows */}
                  <button
                    onClick={prevPost}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-700" />
                  </button>
                  <button
                    onClick={nextPost}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-700" />
                  </button>

                  {/* Post indicator dots */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {instagramPosts.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPost(i)}
                        className={`w-1.5 h-1.5 rounded-full transition-all ${
                          i === currentPost ? 'bg-white w-4' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Auto-post badge */}
                  <div className="absolute top-3 right-3 bg-green-500 text-white text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                    Auto-posted
                  </div>
                </div>

                {/* Post Actions */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-4">
                      <Heart className="w-7 h-7 text-red-500 fill-red-500" />
                      <MessageCircle className="w-7 h-7 text-gray-700" />
                      <Send className="w-7 h-7 text-gray-700" />
                    </div>
                    <Bookmark className="w-7 h-7 text-gray-700" />
                  </div>
                  <p className="text-sm font-bold text-gray-900 mb-1">{instagramPosts[currentPost].likes} likes</p>
                  <p className="text-sm text-gray-700">
                    <span className="font-bold">daxa_management</span>{' '}
                    {instagramPosts[currentPost].caption}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <p className="text-xs text-gray-400">{instagramPosts[currentPost].time}</p>
                    <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">bytrade</span>
                  </div>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="px-4 md:px-6 py-4 bg-gradient-to-r from-orange-50 to-amber-50 border-t border-orange-100">
              <p className="text-sm text-orange-900 text-center md:text-left">
                <strong>Real client.</strong> Dave hasn&apos;t touched Instagram in months. His feed posts itself.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
