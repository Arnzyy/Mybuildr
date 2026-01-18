import { TRUST_SIGNALS } from '@/lib/constants'

export default function TrustBar() {
  return (
    <div className="bg-gray-50 border-b border-gray-100">
      <div className="section-container">
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 py-3 text-sm text-gray-600">
          {TRUST_SIGNALS.map((signal, index) => (
            <span key={index} className="flex items-center gap-2">
              {signal}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
