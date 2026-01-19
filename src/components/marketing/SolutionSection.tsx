import { Globe, Upload, Zap } from 'lucide-react'

const steps = [
  {
    icon: Globe,
    number: '01',
    title: 'We build it',
    description: 'Professional website live in 7 days. Mobile-optimized, SEO-ready. You don\'t touch a thing.',
  },
  {
    icon: Upload,
    number: '02',
    title: 'You upload',
    description: 'Snap photos of your work. Upload to your admin panel. Takes 2 minutes.',
  },
  {
    icon: Zap,
    number: '03',
    title: 'We post automatically',
    description: 'We turn your photos into Instagram, Facebook, and Google posts. 5x per week. While you sleep.',
  },
]

export default function SolutionSection() {
  return (
    <section className="py-16 md:py-24">
      <div className="section-container">
        {/* Headline */}
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            We build your website.<br />
            Then we run your social media.<br />
            <span className="text-orange-500">Automatically.</span>
          </h2>
        </div>

        {/* Steps */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step) => (
            <div key={step.number} className="relative">
              <div className="bg-white rounded-xl border border-gray-200 p-8 h-full hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                    <step.icon className="w-6 h-6 text-orange-500" />
                  </div>
                  <span className="text-4xl font-bold text-gray-200">{step.number}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Time saved */}
        <div className="max-w-2xl mx-auto mt-12 bg-gray-900 rounded-xl p-8 text-center text-white">
          <p className="text-lg mb-2">
            <span className="text-3xl font-bold">5 posts/week × 52 weeks = 260 posts/year</span>
          </p>
          <p className="text-gray-400">
            Time to create manually: <span className="line-through">100+ hours</span>
            <br />
            Time with bytrade: <span className="text-green-400 font-bold">0 hours</span>
          </p>
        </div>
      </div>
    </section>
  )
}
