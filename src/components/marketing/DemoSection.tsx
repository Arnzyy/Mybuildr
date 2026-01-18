'use client'

import { useState } from 'react'
import { Globe, Settings, Instagram } from 'lucide-react'

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
            <div className="aspect-video bg-gray-100 relative">
              {activeTab === 'website' && (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 text-white">
                  <div className="text-center">
                    <Globe className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-xl font-medium">Live Client Website</p>
                    <p className="text-gray-400">Professional mobile-first design</p>
                    <p className="text-sm text-gray-500 mt-4">Add your demo URL here</p>
                  </div>
                </div>
              )}

              {activeTab === 'admin' && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-white p-8">
                  <div className="text-center max-w-md">
                    <Settings className="w-16 h-16 mx-auto mb-4 text-orange-500" />
                    <h3 className="text-xl font-bold mb-2">Dead Simple Admin Panel</h3>
                    <p className="text-gray-400 mb-4">
                      Drag & drop your photos. Add a title. Done.
                      <br />We handle the rest.
                    </p>
                    <div className="bg-gray-800 rounded-lg p-4 text-left text-sm">
                      <p className="text-green-400">✓ Upload photos</p>
                      <p className="text-green-400">✓ Edit your info</p>
                      <p className="text-green-400">✓ See scheduled posts</p>
                      <p className="text-gray-500">No tech skills needed</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'instagram' && (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-600 to-pink-500 text-white p-8">
                  <div className="text-center max-w-md">
                    <Instagram className="w-16 h-16 mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">Posted Automatically</h3>
                    <p className="text-white/80 mb-4">
                      5 posts per week to Instagram, Facebook, and Google.
                      <br />You don&apos;t log in. Ever.
                    </p>
                    <div className="bg-white/10 rounded-lg p-4 text-left text-sm">
                      <p>📸 Posted 2 days ago</p>
                      <p>📸 Posted 4 days ago</p>
                      <p>📸 Posted 6 days ago</p>
                      <p className="text-white/60 mt-2">All while you were on site...</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-orange-50 border-t border-orange-100">
              <p className="text-sm text-orange-900">
                💡 <strong>This is a real client.</strong> Dave from DAXA Construction hasn&apos;t logged into Instagram in months. His feed is still active.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
