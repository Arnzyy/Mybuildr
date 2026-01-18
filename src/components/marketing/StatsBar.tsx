import { STATS } from '@/lib/constants'

const stats = [
  { value: STATS.postsAutomated, label: 'Posts automated' },
  { value: STATS.hoursSaved, label: 'Hours saved' },
  { value: STATS.buildersOnline, label: 'Builders online' },
]

export default function StatsBar() {
  return (
    <section className="py-12 bg-gray-900 text-white">
      <div className="section-container">
        <div className="grid grid-cols-3 gap-8 text-center">
          {stats.map((stat) => (
            <div key={stat.label}>
              <p className="text-3xl md:text-4xl font-bold text-orange-500">{stat.value}</p>
              <p className="text-sm text-gray-400 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
