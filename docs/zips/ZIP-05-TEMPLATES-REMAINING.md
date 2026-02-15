# ZIP-05: Builder Templates (+4 Remaining)

> **Time**: ~4 hours  
> **Outcome**: All 8 templates complete, template preview for onboarding  
> **Dependencies**: ZIP-04 complete

---

## WHAT YOU'LL HAVE AFTER THIS ZIP

- ✅ 4 more templates: Bold, Corporate, Craftsman, Emergency
- ✅ All 8 templates working
- ✅ Template preview/selector page
- ✅ Emergency template with 24/7 prominent CTAs
- ✅ Complete builder site system

---

## TEMPLATE OVERVIEW (REMAINING 4)

| Template | Style | Best For |
|----------|-------|----------|
| **Bold** | Modern, energetic, strong colors | Young businesses, want to stand out |
| **Corporate** | Professional, formal, multi-section | Larger companies, teams |
| **Craftsman** | Artisan quality, before/after focus | Quality-focused trades, bespoke work |
| **Emergency** | Urgent CTAs, 24/7 badge, phone prominent | Emergency services (locksmith, plumber) |

---

## STEP 1: TEMPLATE - BOLD

**File: `src/components/templates/BoldTemplate.tsx`**

```typescript
import { TemplateProps } from '@/lib/templates/types'
import SiteHeader from '../builder-site/SiteHeader'
import SiteServices from '../builder-site/SiteServices'
import SiteGallery from '../builder-site/SiteGallery'
import SiteReviews from '../builder-site/SiteReviews'
import SiteContact from '../builder-site/SiteContact'
import SiteFooter from '../builder-site/SiteFooter'
import WhatsAppButton from '../builder-site/WhatsAppButton'
import { Phone, ArrowRight, Zap } from 'lucide-react'

// Bold hero - big text, strong colors, animated feel
function BoldHero({ company }: { company: any }) {
  const heroImage = company.hero_image_url || '/images/default-hero.jpg'

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background with overlay */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div 
        className="absolute inset-0 z-10"
        style={{ 
          background: `linear-gradient(135deg, ${company.primary_color}ee 0%, ${company.primary_color}99 50%, transparent 100%)` 
        }}
      />

      {/* Content */}
      <div className="relative z-20 max-w-6xl mx-auto px-4 py-24">
        <div className="max-w-3xl">
          {/* Badge */}
          <div 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6"
            style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
          >
            <Zap className="w-4 h-4" />
            {company.trade_type || 'Construction'} Experts
          </div>

          {/* Main heading - BOLD */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-tight">
            {company.name}
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-xl">
            {company.description?.substring(0, 120) || `Professional ${company.trade_type} services that deliver results`}
          </p>

          {/* CTAs - Bold style */}
          <div className="flex flex-col sm:flex-row gap-4">
            <WhatsAppButton company={company} variant="inline" className="text-lg px-8 py-4" />
            {company.phone && (
              <a
                href={`tel:${company.phone}`}
                className="inline-flex items-center justify-center gap-2 bg-white text-gray-900 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors"
              >
                <Phone className="w-5 h-5" />
                Call Now
                <ArrowRight className="w-5 h-5" />
              </a>
            )}
          </div>

          {/* Stats row */}
          {company.areas_covered && company.areas_covered.length > 0 && (
            <div className="mt-12 flex gap-8">
              <div>
                <p className="text-4xl font-black text-white">10+</p>
                <p className="text-white/70 text-sm">Years Experience</p>
              </div>
              <div>
                <p className="text-4xl font-black text-white">500+</p>
                <p className="text-white/70 text-sm">Projects Done</p>
              </div>
              <div>
                <p className="text-4xl font-black text-white">100%</p>
                <p className="text-white/70 text-sm">Satisfaction</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
        <div className="w-8 h-12 rounded-full border-2 border-white/50 flex items-start justify-center p-2">
          <div className="w-1 h-3 bg-white rounded-full animate-bounce" />
        </div>
      </div>
    </section>
  )
}

// Bold services - cards with hover effect
function BoldServices({ company }: { company: any }) {
  if (!company.services || company.services.length === 0) return null

  return (
    <section id="services" className="py-20 bg-gray-900 text-white">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-4xl md:text-5xl font-black mb-12">
          What We <span style={{ color: company.secondary_color || '#f97316' }}>Do</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {company.services.map((service: string, index: number) => (
            <div 
              key={service}
              className="group relative bg-gray-800 rounded-xl p-8 hover:bg-gray-700 transition-colors cursor-pointer overflow-hidden"
            >
              <div 
                className="absolute top-0 left-0 w-1 h-full transition-all group-hover:w-2"
                style={{ backgroundColor: company.secondary_color || '#f97316' }}
              />
              <span className="text-6xl font-black text-gray-700 group-hover:text-gray-600 transition-colors">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3 className="text-xl font-bold mt-4">{service}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default function BoldTemplate({ company, projects, reviews }: TemplateProps) {
  return (
    <div className="min-h-screen">
      <SiteHeader company={company} variant="transparent" />
      <BoldHero company={company} />
      <BoldServices company={company} />
      <SiteGallery projects={projects} primaryColor={company.primary_color} />
      <SiteReviews reviews={reviews} primaryColor={company.primary_color} />
      <SiteContact company={company} />
      <SiteFooter company={company} />
      <WhatsAppButton company={company} variant="floating" />
    </div>
  )
}
```

---

## STEP 2: TEMPLATE - CORPORATE

**File: `src/components/templates/CorporateTemplate.tsx`**

```typescript
import { TemplateProps } from '@/lib/templates/types'
import SiteHeader from '../builder-site/SiteHeader'
import SiteServices from '../builder-site/SiteServices'
import SiteGallery from '../builder-site/SiteGallery'
import SiteReviews from '../builder-site/SiteReviews'
import SiteContact from '../builder-site/SiteContact'
import SiteFooter from '../builder-site/SiteFooter'
import WhatsAppButton from '../builder-site/WhatsAppButton'
import { Phone, Mail, Building2, Users, Award, Clock } from 'lucide-react'

// Corporate hero - professional, formal
function CorporateHero({ company }: { company: any }) {
  return (
    <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div>
            <div className="flex items-center gap-2 text-gray-400 mb-4">
              <Building2 className="w-5 h-5" />
              <span className="text-sm uppercase tracking-wider">
                Established {company.trade_type || 'Construction'} Company
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              {company.name}
            </h1>
            <p className="text-lg text-gray-300 mb-8">
              {company.description || `Professional ${company.trade_type} services for residential and commercial clients`}
            </p>
            
            <div className="flex flex-wrap gap-4">
              <a
                href="#contact"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors"
                style={{ backgroundColor: company.primary_color, color: 'white' }}
              >
                <Mail className="w-5 h-5" />
                Get a Quote
              </a>
              {company.phone && (
                <a
                  href={`tel:${company.phone}`}
                  className="inline-flex items-center gap-2 border border-white/30 px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
                >
                  <Phone className="w-5 h-5" />
                  {company.phone}
                </a>
              )}
            </div>
          </div>

          {/* Image */}
          {company.hero_image_url && (
            <div className="relative">
              <img
                src={company.hero_image_url}
                alt={company.name}
                className="rounded-lg shadow-2xl w-full"
              />
              {/* Overlay badge */}
              <div className="absolute -bottom-6 -left-6 bg-white text-gray-900 rounded-lg p-4 shadow-lg">
                <p className="text-2xl font-bold" style={{ color: company.primary_color }}>10+</p>
                <p className="text-sm text-gray-600">Years in Business</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

// Company stats bar
function CorporateStats({ company }: { company: any }) {
  const stats = [
    { icon: Users, value: '50+', label: 'Happy Clients' },
    { icon: Building2, value: '100+', label: 'Projects Completed' },
    { icon: Award, value: '10+', label: 'Years Experience' },
    { icon: Clock, value: '24/7', label: 'Support Available' },
  ]

  return (
    <section className="py-12 bg-gray-100">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <stat.icon 
                className="w-8 h-8 mx-auto mb-3" 
                style={{ color: company.primary_color }}
              />
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-600">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// About section for corporate
function CorporateAbout({ company }: { company: any }) {
  return (
    <section className="py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              About {company.name}
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              {company.description || `${company.name} is a professional ${company.trade_type} company serving ${company.city || 'the local area'} and surrounding regions. We pride ourselves on delivering exceptional quality and customer service.`}
            </p>
            {company.services && company.services.length > 0 && (
              <div className="space-y-3">
                <p className="font-semibold text-gray-900">Our Services Include:</p>
                <ul className="grid grid-cols-2 gap-2">
                  {company.services.slice(0, 6).map((service: string) => (
                    <li key={service} className="flex items-center gap-2 text-gray-600">
                      <div 
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: company.primary_color }}
                      />
                      {service}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          {/* Values/Why choose us */}
          <div className="bg-gray-50 rounded-xl p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Why Choose Us</h3>
            <div className="space-y-4">
              {[
                { title: 'Quality Workmanship', desc: 'Every project completed to the highest standards' },
                { title: 'Experienced Team', desc: 'Skilled professionals with years of expertise' },
                { title: 'Competitive Pricing', desc: 'Fair, transparent quotes with no hidden costs' },
                { title: 'Customer Focused', desc: 'Your satisfaction is our top priority' },
              ].map((item) => (
                <div key={item.title} className="flex gap-4">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${company.primary_color}15` }}
                  >
                    <Award className="w-5 h-5" style={{ color: company.primary_color }} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{item.title}</p>
                    <p className="text-sm text-gray-600">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function CorporateTemplate({ company, projects, reviews }: TemplateProps) {
  return (
    <div className="min-h-screen">
      <SiteHeader company={company} />
      <CorporateHero company={company} />
      <CorporateStats company={company} />
      <CorporateAbout company={company} />
      <SiteServices company={company} />
      <SiteGallery projects={projects} primaryColor={company.primary_color} />
      <SiteReviews reviews={reviews} primaryColor={company.primary_color} />
      <SiteContact company={company} />
      <SiteFooter company={company} />
      <WhatsAppButton company={company} variant="floating" />
    </div>
  )
}
```

---

## STEP 3: TEMPLATE - CRAFTSMAN

**File: `src/components/templates/CraftsmanTemplate.tsx`**

```typescript
import { TemplateProps } from '@/lib/templates/types'
import SiteHeader from '../builder-site/SiteHeader'
import SiteReviews from '../builder-site/SiteReviews'
import SiteContact from '../builder-site/SiteContact'
import SiteFooter from '../builder-site/SiteFooter'
import WhatsAppButton from '../builder-site/WhatsAppButton'
import { Phone, Sparkles, ArrowRight } from 'lucide-react'

// Craftsman hero - quality focused, elegant
function CraftsmanHero({ company }: { company: any }) {
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
function CraftsmanPhilosophy({ company }: { company: any }) {
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
function CraftsmanGallery({ projects, company }: { projects: any[]; company: any }) {
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
function CraftsmanServices({ company }: { company: any }) {
  if (!company.services || company.services.length === 0) return null

  return (
    <section id="services" className="py-20 bg-gray-900 text-white">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-light mb-12 text-center">
          Services
        </h2>
        <div className="space-y-0">
          {company.services.map((service: string, index: number) => (
            <div 
              key={service}
              className="flex items-center justify-between py-6 border-b border-gray-800"
            >
              <span className="text-xl font-light">{service}</span>
              <span className="text-amber-400">→</span>
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
      <CraftsmanPhilosophy company={company} />
      <CraftsmanGallery projects={projects} company={company} />
      <CraftsmanServices company={company} />
      <SiteReviews reviews={reviews} primaryColor="#f59e0b" />
      <SiteContact company={company} />
      <SiteFooter company={company} />
      <WhatsAppButton company={company} variant="floating" />
    </div>
  )
}
```

---

## STEP 4: TEMPLATE - EMERGENCY

**File: `src/components/templates/EmergencyTemplate.tsx`**

```typescript
import { TemplateProps } from '@/lib/templates/types'
import SiteHeader from '../builder-site/SiteHeader'
import SiteServices from '../builder-site/SiteServices'
import SiteGallery from '../builder-site/SiteGallery'
import SiteReviews from '../builder-site/SiteReviews'
import SiteContact from '../builder-site/SiteContact'
import SiteFooter from '../builder-site/SiteFooter'
import WhatsAppButton from '../builder-site/WhatsAppButton'
import { Phone, Clock, Shield, Zap, AlertCircle, CheckCircle } from 'lucide-react'

// Emergency header - phone VERY prominent
function EmergencyHeader({ company }: { company: any }) {
  return (
    <header className="sticky top-0 z-50">
      {/* Top bar - phone number */}
      <div className="bg-red-600 text-white py-2">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-center gap-4">
          <Clock className="w-5 h-5" />
          <span className="font-bold">24/7 Emergency Service</span>
          {company.phone && (
            <>
              <span>|</span>
              <a href={`tel:${company.phone}`} className="font-bold text-lg hover:underline">
                {company.phone}
              </a>
            </>
          )}
        </div>
      </div>
      
      {/* Main header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {company.logo_url && (
              <img src={company.logo_url} alt={company.name} className="h-10 w-auto" />
            )}
            <span className="text-xl font-bold text-gray-900">{company.name}</span>
          </div>
          
          <div className="flex items-center gap-4">
            <WhatsAppButton company={company} variant="header" />
            {company.phone && (
              <a
                href={`tel:${company.phone}`}
                className="hidden md:flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-red-700 transition-colors"
              >
                <Phone className="w-5 h-5" />
                Call Now
              </a>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

// Emergency hero - urgent feel
function EmergencyHero({ company }: { company: any }) {
  return (
    <section className="bg-gray-900 text-white py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div>
            {/* 24/7 Badge */}
            <div className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-full text-sm font-bold mb-6">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              24/7 EMERGENCY SERVICE
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              {company.trade_type || 'Emergency'} Services
              <br />
              <span className="text-red-500">When You Need It</span>
            </h1>

            <p className="text-xl text-gray-300 mb-8">
              {company.description || `Fast, reliable ${company.trade_type} services available around the clock. We're here when you need us most.`}
            </p>

            {/* CTAs - Very prominent */}
            <div className="space-y-4">
              {company.phone && (
                <a
                  href={`tel:${company.phone}`}
                  className="flex items-center justify-center gap-3 bg-red-600 text-white px-8 py-5 rounded-lg font-bold text-xl hover:bg-red-700 transition-colors w-full sm:w-auto"
                >
                  <Phone className="w-6 h-6" />
                  {company.phone}
                </a>
              )}
              <div className="flex gap-4">
                <WhatsAppButton company={company} variant="inline" className="flex-1 sm:flex-none" />
                <a
                  href="#contact"
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 border border-white/30 px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
                >
                  Request Callback
                </a>
              </div>
            </div>
          </div>

          {/* Trust signals */}
          <div className="space-y-4">
            {[
              { icon: Clock, title: 'Fast Response', desc: 'Usually within 30-60 minutes' },
              { icon: Shield, title: 'Fully Insured', desc: 'Complete peace of mind' },
              { icon: Zap, title: 'No Call Out Fee', desc: 'Free quotes on all jobs' },
              { icon: CheckCircle, title: 'Satisfaction Guaranteed', desc: 'Quality work every time' },
            ].map((item) => (
              <div 
                key={item.title}
                className="flex items-center gap-4 bg-white/10 rounded-lg p-4"
              >
                <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-bold">{item.title}</p>
                  <p className="text-sm text-gray-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// Areas covered - important for emergency services
function EmergencyAreas({ company }: { company: any }) {
  if (!company.areas_covered || company.areas_covered.length === 0) return null

  return (
    <section className="py-12 bg-red-600 text-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-wrap items-center justify-center gap-4">
          <span className="font-bold">We Cover:</span>
          {company.areas_covered.map((area: string) => (
            <span 
              key={area}
              className="bg-white/20 px-4 py-2 rounded-full text-sm font-medium"
            >
              {area}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

// Emergency CTA bar - repeated throughout
function EmergencyCTABar({ company }: { company: any }) {
  return (
    <section className="py-8 bg-gray-900 text-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-8 h-8 text-red-500" />
            <div>
              <p className="font-bold text-lg">Need Emergency Help?</p>
              <p className="text-gray-400 text-sm">We're available 24 hours a day, 7 days a week</p>
            </div>
          </div>
          {company.phone && (
            <a
              href={`tel:${company.phone}`}
              className="flex items-center gap-2 bg-red-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-red-700 transition-colors"
            >
              <Phone className="w-5 h-5" />
              {company.phone}
            </a>
          )}
        </div>
      </div>
    </section>
  )
}

export default function EmergencyTemplate({ company, projects, reviews }: TemplateProps) {
  return (
    <div className="min-h-screen">
      <EmergencyHeader company={company} />
      <EmergencyHero company={company} />
      <EmergencyAreas company={company} />
      <SiteServices company={company} />
      <EmergencyCTABar company={company} />
      <SiteGallery projects={projects} primaryColor={company.primary_color} />
      <SiteReviews reviews={reviews} primaryColor={company.primary_color} />
      <EmergencyCTABar company={company} />
      <SiteContact company={company} />
      <SiteFooter company={company} />
      {/* BOTH floating WhatsApp AND floating phone for emergency */}
      <WhatsAppButton company={company} variant="floating" className="bottom-24" />
      {company.phone && (
        <a
          href={`tel:${company.phone}`}
          className="fixed bottom-6 right-6 z-50 bg-red-600 text-white p-4 rounded-full shadow-lg hover:bg-red-700 transition-colors"
          aria-label="Call now"
        >
          <Phone className="w-6 h-6" />
        </a>
      )}
    </div>
  )
}
```

---

## STEP 5: UPDATE TEMPLATE RENDERER

**File: `src/lib/templates/render.tsx`** (update)

```typescript
import { TemplateProps, TemplateName } from './types'
import DeveloperTemplate from '@/components/templates/DeveloperTemplate'
import TradesmanTemplate from '@/components/templates/TradesmanTemplate'
import ShowcaseTemplate from '@/components/templates/ShowcaseTemplate'
import LocalTemplate from '@/components/templates/LocalTemplate'
import BoldTemplate from '@/components/templates/BoldTemplate'
import CorporateTemplate from '@/components/templates/CorporateTemplate'
import CraftsmanTemplate from '@/components/templates/CraftsmanTemplate'
import EmergencyTemplate from '@/components/templates/EmergencyTemplate'

const TEMPLATES: Record<TemplateName, React.ComponentType<TemplateProps>> = {
  developer: DeveloperTemplate,
  tradesman: TradesmanTemplate,
  showcase: ShowcaseTemplate,
  local: LocalTemplate,
  bold: BoldTemplate,
  corporate: CorporateTemplate,
  craftsman: CraftsmanTemplate,
  emergency: EmergencyTemplate,
}

export function renderTemplate(props: TemplateProps) {
  const Template = TEMPLATES[props.company.template] || DeveloperTemplate
  return <Template {...props} />
}

export function getTemplateComponent(templateName: TemplateName) {
  return TEMPLATES[templateName] || DeveloperTemplate
}
```

---

## STEP 6: TEMPLATE PREVIEW PAGE

**File: `src/app/(marketing)/templates/page.tsx`**

```typescript
import { TEMPLATE_CONFIGS } from '@/lib/templates/types'
import Link from 'next/link'

export const metadata = {
  title: 'Website Templates | ByTrade',
  description: 'Choose from 8 professional website templates designed for tradespeople',
}

export default function TemplatesPage() {
  const templates = Object.values(TEMPLATE_CONFIGS)

  return (
    <div className="py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Website Templates
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            8 professional templates designed specifically for tradespeople. 
            Pick one, we'll customise it to your brand.
          </p>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {templates.map((template) => (
            <Link
              key={template.name}
              href={`/templates/${template.name}`}
              className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Preview image placeholder */}
              <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <span className="text-4xl font-bold text-gray-300 group-hover:text-gray-400 transition-colors">
                  {template.displayName.charAt(0)}
                </span>
              </div>
              
              {/* Info */}
              <div className="p-4">
                <h3 className="font-bold text-gray-900 mb-1">{template.displayName}</h3>
                <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                <div className="flex flex-wrap gap-1">
                  {template.features.slice(0, 3).map((feature) => (
                    <span 
                      key={feature}
                      className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <p className="text-gray-600 mb-4">
            Not sure which template is right for you?
          </p>
          <Link
            href="/#pricing"
            className="inline-flex items-center gap-2 bg-orange-500 text-white px-8 py-4 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
          >
            Get Started - We'll Help You Choose
          </Link>
        </div>
      </div>
    </div>
  )
}
```

---

## STEP 7: INDIVIDUAL TEMPLATE PREVIEW

**File: `src/app/(marketing)/templates/[template]/page.tsx`**

```typescript
import { TEMPLATE_CONFIGS, TemplateName } from '@/lib/templates/types'
import { renderTemplate } from '@/lib/templates/render'
import { notFound } from 'next/navigation'
import Link from 'next/link'

// Mock company data for preview
const PREVIEW_COMPANY = {
  id: 'preview',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  slug: 'preview',
  name: 'Example Construction',
  email: 'hello@example.com',
  phone: '07123 456789',
  whatsapp: '447123456789',
  address_line1: '123 High Street',
  address_line2: null,
  city: 'Bristol',
  postcode: 'BS1 1AA',
  trade_type: 'Construction',
  description: 'Professional construction services delivering exceptional quality for residential and commercial projects. With over 10 years of experience, we take pride in every project we complete.',
  services: ['Extensions', 'Renovations', 'New Builds', 'Loft Conversions', 'Kitchens', 'Bathrooms'],
  areas_covered: ['Bristol', 'Bath', 'South Gloucestershire', 'North Somerset'],
  logo_url: null,
  hero_image_url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200',
  primary_color: '#1e3a5f',
  secondary_color: '#f97316',
  template: 'developer' as TemplateName,
  instagram_url: null,
  facebook_url: null,
  google_business_url: null,
  checkatrade_url: 'https://checkatrade.com/trades/example',
  stripe_customer_id: null,
  stripe_subscription_id: null,
  tier: 'full' as const,
  tier_updated_at: null,
  posting_enabled: true,
  posts_per_week: 5,
  custom_domain: null,
  is_active: true,
  is_published: true,
}

const PREVIEW_PROJECTS = [
  {
    id: '1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    company_id: 'preview',
    title: 'Modern Kitchen Extension',
    description: 'Complete kitchen extension with bi-fold doors and skylight',
    location: 'Bristol',
    images: [
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800',
      'https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=800',
    ],
    featured_image_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800',
    project_type: 'Extension',
    completed_at: '2024-01-15',
    used_in_post: false,
    last_posted_at: null,
    display_order: 0,
    is_featured: true,
  },
  {
    id: '2',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    company_id: 'preview',
    title: 'Loft Conversion',
    description: 'Full loft conversion with en-suite bathroom',
    location: 'Bath',
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
    ],
    featured_image_url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
    project_type: 'Loft Conversion',
    completed_at: '2024-02-20',
    used_in_post: false,
    last_posted_at: null,
    display_order: 1,
    is_featured: false,
  },
]

const PREVIEW_REVIEWS = [
  {
    id: '1',
    created_at: new Date().toISOString(),
    company_id: 'preview',
    reviewer_name: 'John Smith',
    rating: 5,
    review_text: 'Excellent work on our extension. Professional team, clean site, finished on time and on budget. Would highly recommend to anyone.',
    review_date: '2024-01-20',
    source: 'checkatrade' as const,
    external_id: null,
    used_in_post: false,
    last_posted_at: null,
    graphic_url: null,
  },
  {
    id: '2',
    created_at: new Date().toISOString(),
    company_id: 'preview',
    reviewer_name: 'Sarah Jones',
    rating: 5,
    review_text: 'Very happy with our new kitchen. Great communication throughout the project.',
    review_date: '2024-02-15',
    source: 'google' as const,
    external_id: null,
    used_in_post: false,
    last_posted_at: null,
    graphic_url: null,
  },
]

interface Props {
  params: { template: string }
}

export function generateStaticParams() {
  return Object.keys(TEMPLATE_CONFIGS).map((template) => ({
    template,
  }))
}

export default function TemplatePreviewPage({ params }: Props) {
  const templateName = params.template as TemplateName
  const config = TEMPLATE_CONFIGS[templateName]

  if (!config) {
    notFound()
  }

  // Create preview company with this template
  const previewCompany = {
    ...PREVIEW_COMPANY,
    template: templateName,
  }

  return (
    <div>
      {/* Preview banner */}
      <div className="fixed top-0 left-0 right-0 z-[100] bg-orange-500 text-white py-3 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="font-bold">Template Preview:</span>
            <span>{config.displayName}</span>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              href="/templates" 
              className="text-sm hover:underline"
            >
              ← All Templates
            </Link>
            <Link
              href="/#pricing"
              className="bg-white text-orange-500 px-4 py-2 rounded font-semibold text-sm hover:bg-gray-100"
            >
              Get This Template
            </Link>
          </div>
        </div>
      </div>

      {/* Template content with padding for banner */}
      <div className="pt-12">
        {renderTemplate({
          company: previewCompany,
          projects: PREVIEW_PROJECTS,
          reviews: PREVIEW_REVIEWS,
        })}
      </div>
    </div>
  )
}
```

---

## STEP 8: UPDATE HEADER NAV

**File: `src/components/marketing/Header.tsx`** (add templates link)

```typescript
// In the nav links array, add:
<a href="/templates" className="text-gray-600 hover:text-gray-900">
  Templates
</a>
```

---

## STEP 9: TEST ALL TEMPLATES

```bash
npm run dev
```

Test each template:
1. `http://localhost:3000/templates` - see all templates
2. `http://localhost:3000/templates/developer`
3. `http://localhost:3000/templates/tradesman`
4. `http://localhost:3000/templates/showcase`
5. `http://localhost:3000/templates/local`
6. `http://localhost:3000/templates/bold`
7. `http://localhost:3000/templates/corporate`
8. `http://localhost:3000/templates/craftsman`
9. `http://localhost:3000/templates/emergency`

Also test with real data:
```sql
UPDATE companies SET template = 'emergency' WHERE slug = 'test-builder';
```

Then visit `http://localhost:3000/sites/test-builder`

---

## EXIT CRITERIA

- ✅ All 8 templates rendering correctly
- ✅ Bold template has animated/energetic feel
- ✅ Corporate template has professional multi-section layout
- ✅ Craftsman template has elegant artisan feel
- ✅ Emergency template has 24/7 badge, prominent phone, double floating buttons
- ✅ Template preview page working at /templates
- ✅ Individual template previews working at /templates/[name]
- ✅ All templates mobile responsive
- ✅ WhatsApp on all templates
- ✅ `npm run build` passes

---

## TEMPLATE SUMMARY

| Template | Hero Style | Key Feature | Best For |
|----------|------------|-------------|----------|
| Developer | Split image/text | Clean professional | General builders |
| Tradesman | Centered overlay | Trust badges, Checkatrade | Tradespeople |
| Showcase | Minimal centered | Full-width gallery | Portfolio focus |
| Local | Dark with area badge | Areas covered section | Local services |
| Bold | Full-screen gradient | Animated stats | Standing out |
| Corporate | Dark professional | About section, stats bar | Larger companies |
| Craftsman | Split dark/image | Quality philosophy | Artisan work |
| Emergency | Urgent red | 24/7 badge, double CTAs | Emergency services |

---

## NEXT: ZIP-06

ZIP-06 will add:
- Admin dashboard shell
- Company settings page
- Tier-gated features
- Basic stats

---

**All 8 templates done. Builder sites are production ready.**
