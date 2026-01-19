import { TemplateProps } from '@/lib/templates/types'
import SiteHeader from '../builder-site/SiteHeader'
import SiteReviews from '../builder-site/SiteReviews'
import SiteContact from '../builder-site/SiteContact'
import SiteFooter from '../builder-site/SiteFooter'
import WhatsAppButton from '../builder-site/WhatsAppButton'
import { Phone, Sparkles, ArrowRight } from 'lucide-react'
import { Company, Project } from '@/lib/supabase/types'

// Craftsman hero - quality focused, elegant
function CraftsmanHero({ company }: { company: Company }) {
  const heroImage = company.hero_image_url || '/images/default-hero.jpg'

  return (
    <section className="relative min-h-[80vh] flex items-center">
      {/* Split design */}
      <div className="absolute inset-0 grid grid-cols-1 lg:grid-cols-2">
        <div className="bg-gray-900" />
        <div
          className="hidden lg:block"
          style={{
            backgroundImage: `url(${heroImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-20">
        <div className="max-w-xl text-white">
          {/* Quality badge */}
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span className="text-amber-400 text-sm uppercase tracking-widest font-medium">
              Quality Craftsmanship
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-light mb-6 leading-tight">
            {company.name}
          </h1>

          <div className="w-20 h-1 bg-amber-400 mb-6" />

          <p className="text-lg text-gray-300 mb-8 font-light leading-relaxed">
            {company.description || `Bespoke ${company.trade_type} services crafted with precision and care. Every detail matters.`}
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="#contact"
              className="inline-flex items-center justify-center gap-2 bg-amber-400 text-gray-900 px-8 py-4 font-medium hover:bg-amber-300 transition-colors"
            >
              Discuss Your Project
              <ArrowRight className="w-5 h-5" />
            </a>
            {company.phone && (
              <a
                href={`tel:${company.phone}`}
                className="inline-flex items-center justify-center gap-2 border border-white/30 px-8 py-4 font-medium hover:bg-white/10 transition-colors"
              >
                <Phone className="w-5 h-5" />
                {company.phone}
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

// Craftsman philosophy section
function CraftsmanPhilosophy() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <Sparkles className="w-10 h-10 mx-auto mb-6 text-amber-500" />
        <h2 className="text-3xl md:text-4xl font-light text-gray-900 mb-6">
          Our Approach
        </h2>
        <p className="text-xl text-gray-600 leading-relaxed mb-8">
          We believe that quality work speaks for itself. Every project we undertake
          is treated with the same level of care and attention to detail, regardless
          of size. Our commitment to craftsmanship means we never cut corners.
        </p>
        <div className="grid grid-cols-3 gap-8 mt-12">
          {[
            { number: '01', title: 'Consultation', desc: 'Understanding your vision' },
            { number: '02', title: 'Crafting', desc: 'Precision in every detail' },
            { number: '03', title: 'Completion', desc: 'Exceeding expectations' },
          ].map((step) => (
            <div key={step.number}>
              <p className="text-4xl font-light text-amber-500 mb-2">{step.number}</p>
              <p className="font-medium text-gray-900">{step.title}</p>
              <p className="text-sm text-gray-500">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Craftsman gallery - larger images, more elegant
function CraftsmanGallery({ projects }: { projects: Project[] }) {
  if (projects.length === 0) return null

  // Get featured images
  const images = projects.flatMap(p =>
    (p.images || []).slice(0, 2).map((img: string) => ({
      url: img,
      title: p.title,
      description: p.description
    }))
  ).slice(0, 6)

  return (
    <section id="projects" className="py-20">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-light text-gray-900 mb-4">
            Selected Works
          </h2>
          <div className="w-20 h-1 bg-amber-400 mx-auto" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {images.map((image, index) => (
            <div
              key={index}
              className="group relative overflow-hidden"
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={image.url}
                  alt={image.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
                <div className="p-6 text-white">
                  <p className="text-xl font-medium">{image.title}</p>
                  {image.description && (
                    <p className="text-sm text-gray-300 mt-1">{image.description.substring(0, 80)}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Craftsman services - minimal list style
function CraftsmanServices({ company }: { company: Company }) {
  if (!company.services || company.services.length === 0) return null

  return (
    <section id="services" className="py-20 bg-gray-900 text-white">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-light mb-12 text-center">
          Services
        </h2>
        <div className="space-y-0">
          {company.services.map((service: string) => (
            <div
              key={service}
              className="flex items-center justify-between py-6 border-b border-gray-800"
            >
              <span className="text-xl font-light">{service}</span>
              <span className="text-amber-400">&rarr;</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default function CraftsmanTemplate({ company, projects, reviews }: TemplateProps) {
  return (
    <div className="min-h-screen">
      <SiteHeader company={company} variant="dark" />
      <CraftsmanHero company={company} />
      <CraftsmanPhilosophy />
      <CraftsmanGallery projects={projects} />
      <CraftsmanServices company={company} />
      <SiteReviews reviews={reviews} primaryColor="#f59e0b" />
      <SiteContact company={company} />
      <SiteFooter company={company} />
      <WhatsAppButton company={company} variant="floating" />
    </div>
  )
}
