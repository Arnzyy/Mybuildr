import { Rocket, TrendingUp, Zap } from 'lucide-react'

const segments = [
  {
    icon: Rocket,
    title: 'Just Starting',
    description: 'New to the trade, need credibility. Get a professional site that makes you look established.',
    tier: '→ Starter £99',
    bgColor: 'bg-blue-100',
    iconColor: 'text-blue-500',
  },
  {
    icon: TrendingUp,
    title: 'Going Online',
    description: 'Got plenty of work but no website. Losing jobs to competitors who show up on Google.',
    tier: '→ Pro £149',
    bgColor: 'bg-green-100',
    iconColor: 'text-green-500',
  },
  {
    icon: Zap,
    title: 'Growing Fast',
    description: 'Too busy to post on social media. Need automation so your online presence runs itself.',
    tier: '→ Full Package £199',
    bgColor: 'bg-orange-100',
    iconColor: 'text-orange-500',
  },
]

export default function WhoWeHelp() {
  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="section-container">
        {/* Headline */}
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Where are you right now?
          </h2>
          <p className="text-lg text-gray-600">
            We help builders at every stage
          </p>
        </div>

        {/* Segments */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {segments.map((segment) => (
            <div
              key={segment.title}
              className="bg-white rounded-xl border border-gray-200 p-8 hover:shadow-lg transition-shadow"
            >
              <div className={`w-12 h-12 rounded-full ${segment.bgColor} flex items-center justify-center mb-4`}>
                <segment.icon className={`w-6 h-6 ${segment.iconColor}`} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{segment.title}</h3>
              <p className="text-gray-600 mb-4">{segment.description}</p>
              <p className="text-sm font-semibold text-orange-500">{segment.tier}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
