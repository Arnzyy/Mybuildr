import Link from 'next/link'

interface HealthCheckBannerProps {
  status: 'good' | 'warning' | 'critical'
  icon: string
  title: string
  message: string
  action?: {
    label: string
    href: string
  }
}

export default function HealthCheckBanner({
  status,
  icon,
  title,
  message,
  action
}: HealthCheckBannerProps) {
  const colors = {
    good: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    critical: 'bg-red-50 border-red-200 text-red-800',
  }

  const buttonColors = {
    good: 'bg-green-600 hover:bg-green-700 text-white',
    warning: 'bg-amber-600 hover:bg-amber-700 text-white',
    critical: 'bg-red-600 hover:bg-red-700 text-white',
  }

  return (
    <div className={`rounded-xl border p-4 md:p-6 mb-6 ${colors[status]}`}>
      <div className="flex items-start gap-3 md:gap-4">
        <span className="text-2xl md:text-3xl flex-shrink-0">{icon}</span>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg md:text-xl mb-1">{title}</h3>
          <p className="text-sm md:text-base opacity-90">{message}</p>
        </div>
        {action && (
          <Link
            href={action.href}
            className={`px-4 py-2 rounded-lg text-sm font-medium shadow-sm whitespace-nowrap ${buttonColors[status]}`}
          >
            {action.label}
          </Link>
        )}
      </div>
    </div>
  )
}
