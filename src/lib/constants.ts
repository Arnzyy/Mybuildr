export const SITE_CONFIG = {
  name: 'trade.',
  domain: 'trade-sites.co.uk',
  tagline: 'Websites for builders. That actually work.',
  email: 'hello@trade-sites.co.uk',
  phone: '07XXX XXXXXX',
  whatsapp: '447XXXXXXXXX',
}

export const PRICING = {
  starter: {
    id: 'starter',
    name: 'Starter',
    price: 99,
    description: 'Professional website to get you online',
    features: [
      'Professional website',
      'Mobile-optimized',
      'Contact form',
      'SEO-ready',
      'SSL secure',
      'Live in 7 days',
    ],
    notIncluded: ['Admin panel', 'Auto-posting'],
    cta: 'Get Started',
    highlighted: false,
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 149,
    description: 'Add admin panel to manage your site',
    features: [
      'Everything in Starter',
      'Admin panel',
      'Upload project photos',
      'Edit your info anytime',
      'Unlimited photos',
      'Custom domain',
    ],
    notIncluded: ['Auto-posting'],
    cta: 'Get Started',
    highlighted: false,
  },
  full: {
    id: 'full',
    name: 'Full Package',
    price: 199,
    description: 'Website + automated social media',
    features: [
      'Everything in Pro',
      'Auto-post to Instagram',
      'Auto-post to Facebook',
      'Auto-post to Google',
      'AI-generated captions',
      '5 posts per week',
      'Review graphics',
      'Priority support',
    ],
    notIncluded: [],
    cta: 'Get Started',
    highlighted: true,
  },
}

export const STATS = {
  postsAutomated: '5,000+',
  hoursSaved: '500+',
  buildersOnline: '50+',
}

export const TRUST_SIGNALS = [
  '★★★★★ 5 on Trustpilot',
  'Live in 7 days',
  'No contracts',
]

export const COPY = {
  hero: {
    headline: "Your competitor posted on Instagram this morning.",
    headlineFaded: "You didn't.",
    subheadline: "Guess who's getting the call.",
    valueProp: "Professional website + automated social media.",
    price: "From £99/month.",
    cta: "Get Your Site →",
    trustSignals: "✓ Live in 7 days · ✓ We post for you · ✓ Cancel anytime",
  },
  problem: {
    headline: "Your competitor posts 5x a week. You're too busy actually working.",
    description: "We get it. You're grafting all day, last thing you want to do is figure out Instagram. But customers check you out online before they call. If you're not there, you're losing work to the bloke down the road who is.",
  },
  howItWorks: {
    headline: "How it works in 3 simple steps",
    steps: [
      {
        number: 1,
        title: "We build it",
        description: "Your professional website built and live in under a week. Templates designed specifically for trades.",
      },
      {
        number: 2,
        title: "You upload",
        description: "Upload photos of your projects to the admin panel. Drag and drop, no technical skills needed.",
      },
      {
        number: 3,
        title: "We post automatically",
        description: "We handle Instagram, Facebook, and Google Business posts automatically. Set it and forget it.",
      },
    ],
  },
  demo: {
    headline: "See it in action",
    description: "Here's exactly what you get:",
    tabs: [
      { id: "website", label: "Your Website", description: "Professional, mobile-first design" },
      { id: "admin", label: "Admin Panel", description: "Simple image upload interface" },
      { id: "instagram", label: "Social Feed", description: "Automated posts to Instagram" },
    ],
  },
  pricing: {
    headline: "Straight-up pricing. No nonsense.",
    subheading: "Everything included. No hidden fees. No contracts. Cancel anytime.",
  },
  testimonial: {
    headline: "Don't take our word for it",
    description: "Here's what other builders are saying",
  },
  faq: {
    headline: "Frequently asked questions",
    description: "Everything you need to know",
    items: [
      { question: "How long does it actually take?", answer: "Your site is live and posting within a week. Sometimes faster." },
      { question: "What if I want to change stuff?", answer: "Email us. We handle updates quickly on a ticket system." },
      { question: "Do I have to upload images?", answer: "Yes, you upload project photos to the admin panel. It takes minutes per week." },
      { question: "Can I cancel anytime?", answer: "Yes. Month-to-month, no contract." },
      { question: "What if I already have a website?", answer: "We can rebuild it or migrate it. Email to discuss your situation." },
    ],
  },
  about: {
    headline: "For builders, by builders",
    description: "We've been in your boots. We know what it's like trying to run a business, manage jobs, deal with customers - and somehow find time to post on social media and keep a website updated. It's a nightmare. That's exactly why we built this. No tech jargon, no complicated dashboards, just a professional online presence that works while you work.",
  },
  footerCta: {
    headline: "Stop losing jobs to competitors with better websites.",
    description: "Get online properly. Takes 5 minutes to get started, live within a week.",
    cta: "Get Your Site →",
  },
}

export const TESTIMONIAL = {
  quote: "These guys understood exactly what we needed. Website looks professional and the automatic social posting has been a game-changer for showing off our work.",
  author: "James Mitchell",
  business: "Mitchell Construction",
  role: "Founder",
  image: "/images/client-photo.jpg",
}
