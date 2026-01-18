"use client";

import { useState } from "react";
import { COPY } from "@/lib/constants";

export default function InteractiveDemo() {
  const [activeTab, setActiveTab] = useState("website");

  return (
    <section className="py-16 md:py-24 px-4 bg-gray-50" id="demo">
      <div className="max-w-6xl mx-auto px-4">
        {/* Section header */}
        <div className="max-w-2xl mx-auto text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {COPY.demo.headline}
          </h2>
          <p className="text-lg text-gray-600">{COPY.demo.description}</p>
        </div>

        {/* Demo container */}
        <div className="max-w-4xl mx-auto bg-white rounded-lg border border-gray-200 overflow-hidden shadow-lg">
          {/* Tab buttons */}
          <div className="flex gap-0 border-b border-gray-200 bg-gray-50 overflow-x-auto">
            {COPY.demo.tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-max md:min-w-0 px-4 md:px-6 py-4 font-medium text-center border-b-2 transition-all ${
                  activeTab === tab.id
                    ? "border-blue-600 text-blue-600 bg-white"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                <div className="text-sm md:text-base">{tab.label}</div>
                <div className="text-xs text-gray-500 mt-1 hidden md:block">
                  {tab.description}
                </div>
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="aspect-video md:aspect-auto md:h-96 bg-gray-100 relative overflow-hidden">
            {/* Tab 1: Website Preview */}
            {activeTab === "website" && (
              <div className="w-full h-full flex items-center justify-center p-4 md:p-8 bg-gradient-to-br from-blue-50 to-white">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                  </div>
                  <p className="text-gray-900 font-semibold text-lg mb-2">Professional Website</p>
                  <p className="text-gray-500 text-sm max-w-sm">
                    Mobile-first design that makes your construction business look professional and trustworthy.
                  </p>
                </div>
              </div>
            )}

            {/* Tab 2: Admin Panel */}
            {activeTab === "admin" && (
              <div className="w-full h-full flex items-center justify-center p-4 md:p-8 bg-gradient-to-br from-green-50 to-white">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-900 font-semibold text-lg mb-2">Simple Admin Panel</p>
                  <p className="text-gray-500 text-sm max-w-sm">
                    Drag and drop your project photos. Set your posting schedule. That&apos;s it.
                  </p>
                </div>
              </div>
            )}

            {/* Tab 3: Instagram Feed */}
            {activeTab === "instagram" && (
              <div className="w-full h-full flex items-center justify-center p-4 md:p-8 bg-gradient-to-br from-purple-50 to-white">
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <p className="text-gray-900 font-semibold text-lg mb-2">Automated Social Posts</p>
                  <p className="text-gray-500 text-sm max-w-sm">
                    Your projects posted to Instagram, Facebook, and Google Business automatically. 5x per week.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Demo footer info */}
          <div className="px-4 md:px-6 py-4 bg-blue-50 border-t border-blue-100">
            <p className="text-sm text-blue-900">
              <strong>Pro tip:</strong> Click the tabs above to see the full
              workflow. Website → Upload images → Automatic posts to social.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
