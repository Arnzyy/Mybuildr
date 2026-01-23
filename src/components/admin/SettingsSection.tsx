'use client'

import { useState, ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'

interface SettingsSectionProps {
  title: string
  icon: ReactNode
  defaultOpen?: boolean
  children: ReactNode
}

export default function SettingsSection({
  title,
  icon,
  defaultOpen = false,
  children
}: SettingsSectionProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full px-4 sm:px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="text-gray-600">{icon}</div>
          <span className="font-semibold text-gray-900">{title}</span>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 transition-transform ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {open && (
        <div className="px-4 sm:px-6 pb-6 border-t border-gray-100">
          <div className="pt-6">{children}</div>
        </div>
      )}
    </div>
  )
}
