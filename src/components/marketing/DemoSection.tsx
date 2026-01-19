'use client'

import { useState } from 'react'
import { Globe, Settings, Camera, Upload, Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Check, Clock } from 'lucide-react'

const tabs = [
  { id: 'website', label: 'Website', icon: Globe },
  { id: 'admin', label: 'Upload', icon: Settings },
  { id: 'instagram', label: 'Instagram', icon: Camera },
]

export default function DemoSection() {
  const [activeTab, setActiveTab] = useState('website')

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
                  {['Kitchen refit', 'Bathroom', 'Extension', 'Loft'].map((label, i) => (
                    <div key={i} className="relative group">
                      <div className="aspect-square bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl overflow-hidden">
                        <img
                          src="/images/kitchen-demo.jpg"
                          alt={label}
                          className="w-full h-full object-cover opacity-80"
                        />
                      </div>
                      <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Instagram Tab */}
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

                {/* Post Image */}
                <div className="aspect-square md:aspect-[4/3] relative">
                  <img
                    src="/images/kitchen-demo.jpg"
                    alt="Bespoke kitchen renovation"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full font-medium">
                    1/4
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
                  <p className="text-sm font-bold text-gray-900 mb-1">47 likes</p>
                  <p className="text-sm text-gray-700">
                    <span className="font-bold">daxa_management</span>{' '}
                    Bespoke handmade in-frame shaker kitchen. Solid oak internals, soft-close everything...
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <p className="text-xs text-gray-400">2 hours ago</p>
                    <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">Auto-posted by bytrade</span>
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
