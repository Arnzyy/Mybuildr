'use client'

import { useState } from 'react'
import { Globe, Settings, Instagram, Upload, Image, Calendar, Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from 'lucide-react'

const tabs = [
  {
    id: 'website',
    label: 'Your Website',
    icon: Globe,
    description: 'Professional, mobile-first',
  },
  {
    id: 'admin',
    label: 'Admin Panel',
    icon: Settings,
    description: 'Upload in 2 minutes',
  },
  {
    id: 'instagram',
    label: 'Your Instagram',
    icon: Instagram,
    description: 'Posted automatically',
  },
]

export default function DemoSection() {
  const [activeTab, setActiveTab] = useState('website')

  return (
    <section id="demo" className="py-16 md:py-24">
      <div className="section-container">
        {/* Headline */}
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            See it in action
          </h2>
          <p className="text-lg text-gray-600">
            Don&apos;t take our word for it. See a real site.
          </p>
        </div>

        {/* Demo Container */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-lg">
            {/* Tabs */}
            <div className="flex border-b border-gray-200 bg-gray-50">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 px-4 py-4 text-center transition-colors ${
                    activeTab === tab.id
                      ? 'bg-white border-b-2 border-orange-500 text-gray-900'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <tab.icon className="w-5 h-5" />
                    <span className="font-medium hidden sm:inline">{tab.label}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 hidden md:block">{tab.description}</p>
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="aspect-video bg-gray-100 relative overflow-hidden">
              {/* Website Tab - Live iframe */}
              {activeTab === 'website' && (
                <iframe
                  src="https://www.daxamanagement.com"
                  className="absolute inset-0 w-full h-full border-none"
                  title="DAXA Management - Live Client Website"
                />
              )}

              {/* Admin Panel Tab - Proper mockup */}
              {activeTab === 'admin' && (
                <div className="absolute inset-0 bg-gray-100 flex">
                  {/* Sidebar */}
                  <div className="w-48 bg-gray-900 text-white p-4 hidden sm:block">
                    <div className="flex items-center gap-2 mb-8">
                      <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center font-bold text-sm">TS</div>
                      <span className="font-semibold text-sm">Trade Sites</span>
                    </div>
                    <nav className="space-y-1">
                      <div className="flex items-center gap-2 px-3 py-2 bg-gray-800 rounded-lg text-sm">
                        <Image className="w-4 h-4" />
                        <span>Photos</span>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-2 text-gray-400 hover:bg-gray-800 rounded-lg text-sm">
                        <Calendar className="w-4 h-4" />
                        <span>Scheduled</span>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-2 text-gray-400 hover:bg-gray-800 rounded-lg text-sm">
                        <Settings className="w-4 h-4" />
                        <span>Settings</span>
                      </div>
                    </nav>
                  </div>

                  {/* Main Content */}
                  <div className="flex-1 p-4 sm:p-6 overflow-hidden">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-gray-900">Upload Photos</h3>
                      <span className="text-xs text-gray-500 bg-green-100 text-green-700 px-2 py-1 rounded-full">3 scheduled this week</span>
                    </div>

                    {/* Upload Zone */}
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 sm:p-8 text-center bg-white mb-4 hover:border-orange-400 transition-colors cursor-pointer">
                      <Upload className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                      <p className="text-sm font-medium text-gray-700">Drop photos here or click to upload</p>
                      <p className="text-xs text-gray-500 mt-1">We&apos;ll write the captions and post for you</p>
                    </div>

                    {/* Recent Uploads */}
                    <p className="text-xs font-medium text-gray-500 mb-2">RECENT UPLOADS</p>
                    <div className="grid grid-cols-4 gap-2">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="aspect-square bg-gray-300 rounded-lg relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-br from-gray-400 to-gray-500" />
                          <div className="absolute bottom-1 right-1 bg-green-500 text-white text-[10px] px-1 rounded">Posted</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Instagram Tab - Proper feed mockup */}
              {activeTab === 'instagram' && (
                <div className="absolute inset-0 bg-white flex flex-col">
                  {/* Instagram Header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white text-xs font-bold">DM</div>
                      <div>
                        <p className="text-sm font-semibold">daxa_management</p>
                        <p className="text-xs text-gray-500">Bristol, UK</p>
                      </div>
                    </div>
                    <MoreHorizontal className="w-5 h-5 text-gray-600" />
                  </div>

                  {/* Post Image */}
                  <div className="flex-1 relative">
                    <img
                      src="/images/kitchen-demo.jpg"
                      alt="Bespoke kitchen renovation"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute top-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded">
                      1/4
                    </div>
                  </div>

                  {/* Post Actions */}
                  <div className="px-4 py-3 border-t bg-white">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-4">
                        <Heart className="w-6 h-6 text-red-500 fill-red-500" />
                        <MessageCircle className="w-6 h-6 text-gray-700" />
                        <Send className="w-6 h-6 text-gray-700" />
                      </div>
                      <Bookmark className="w-6 h-6 text-gray-700" />
                    </div>
                    <p className="text-sm font-semibold">47 likes</p>
                    <p className="text-sm"><span className="font-semibold">daxa_management</span> Bespoke handmade in-frame shaker kitchen. Solid oak internals, soft-close everything...</p>
                    <p className="text-xs text-gray-500 mt-1">Posted 2 hours ago <span className="text-green-600">• Auto-posted by Trade Sites</span></p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-orange-50 border-t border-orange-100">
              <p className="text-sm text-orange-900">
                <strong>This is a real client.</strong> Dave from DAXA Management hasn&apos;t logged into Instagram in months. His feed is still active.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
