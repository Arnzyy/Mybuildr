export const SITE_CONFIG = {
  name: "BuilderSites",
  email: "info@buildersites.co.uk",
};

export const COPY = {
  hero: {
    headline: "Professional websites + automated social media. £99-199/month.",
    subheading: "Stop losing customers because you're not online.",
    cta: "Email us for a demo",
  },
  problem: {
    headline: "Your competitor posts 5x a week. You're not online at all.",
    description:
      "Builders without a strong online presence lose customers to those who have one. We solve that.",
  },
  howItWorks: {
    headline: "How it works in 3 simple steps",
    steps: [
      {
        number: 1,
        title: "We build it",
        description:
          "Your professional website built and live in under a week. Templates designed specifically for construction.",
      },
      {
        number: 2,
        title: "You upload",
        description:
          "Upload photos of your projects to the admin panel. Drag and drop, no technical skills needed.",
      },
      {
        number: 3,
        title: "We post automatically",
        description:
          "We handle Instagram, Facebook, and Google Business posts automatically. Set it and forget it.",
      },
    ],
  },
  demo: {
    headline: "See it in action",
    description: "Here's exactly what you get:",
    tabs: [
      {
        id: "website",
        label: "Your Website",
        description: "Professional, mobile-first design",
      },
      {
        id: "admin",
        label: "Admin Panel",
        description: "Simple image upload interface",
      },
      {
        id: "instagram",
        label: "Social Feed",
        description: "Automated posts to Instagram",
      },
    ],
  },
  pricing: {
    headline: "Simple pricing. No hidden fees.",
    subheading: "All plans include hosting and support. Cancel anytime.",
    perMonth: "per month",
    notIncluded: "Not included",
  },
  testimonial: {
    headline: "Loved by builders",
    description: "See what our clients are saying",
  },
  faq: {
    headline: "Frequently asked questions",
    description: "Everything you need to know",
    items: [
      {
        question: "How long does it actually take?",
        answer:
          "Your site is live and posting within a week. Sometimes faster.",
      },
      {
        question: "What if I want to change stuff?",
        answer:
          "Email us. We handle updates quickly on a ticket system.",
      },
      {
        question: "Do I have to upload images?",
        answer:
          "Yes, you upload project photos to the admin panel. It takes minutes per week.",
      },
      {
        question: "Can I cancel anytime?",
        answer: "Yes. Month-to-month, no contract.",
      },
      {
        question: "What if I already have a website?",
        answer:
          "We can rebuild it or migrate it. Email to discuss your situation.",
      },
    ],
  },
  about: {
    headline: "About us",
    description:
      "We build websites for construction companies because we understand the business. We run businesses ourselves, and we get it. No fluff, just results.",
  },
  footerCta: {
    headline: "Ready to get your business online?",
    description: "Email us today and we'll get you set up.",
    cta: "Email Us",
  },
};

export const PRICING = [
  {
    id: "basic",
    name: "Starter",
    price: 99,
    description: "Perfect for getting online",
    features: [
      "Professional website",
      "Mobile-optimized design",
      "Hosting included",
      "Domain setup help",
      "Basic contact form",
      "Live in under 1 week",
    ],
    notIncluded: ["Admin panel (images)", "Automated social posting"],
    cta: "Get Started",
    highlighted: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: 149,
    description: "Add admin panel for image uploads",
    features: [
      "Everything in Starter, plus:",
      "Admin panel (upload your projects)",
      "Drag-and-drop image management",
      "Unlimited projects",
      "Google Business integration",
      "Email support",
    ],
    notIncluded: ["Automated social posting"],
    cta: "Get Started",
    highlighted: false,
  },
  {
    id: "premium",
    name: "Full Package",
    price: 199,
    description: "Complete solution - website + automation",
    features: [
      "Everything in Pro, plus:",
      "Automated Instagram posts",
      "Automated Facebook posts",
      "Automated Google Business posts",
      "AI captions generated automatically",
      "Post scheduling (5x per week)",
      "Priority support",
    ],
    notIncluded: [],
    cta: "Get Started",
    highlighted: true,
  },
];

export const TESTIMONIAL = {
  quote:
    "These guys understood exactly what we needed. Website looks professional and the automatic social posting has been a game-changer for showing off our work.",
  author: "James Mitchell",
  business: "Mitchell Construction",
  role: "Founder",
  image: "/images/client-photo.jpg",
};
