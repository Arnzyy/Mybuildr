import type { Company, Project, Review } from '@/lib/supabase/types'

export type TemplateName =
  | 'developer'
  | 'tradesman'
  | 'showcase'
  | 'bold'
  | 'local'
  | 'corporate'
  | 'craftsman'
  | 'emergency'
  | 'daxa'

export interface TemplateProps {
  company: Company
  projects: Project[]
  reviews: Review[]
}

export interface TemplateConfig {
  name: TemplateName
  displayName: string
  description: string
  features: string[]
}

export const TEMPLATE_CONFIGS: Record<TemplateName, TemplateConfig> = {
  developer: {
    name: 'developer',
    displayName: 'Developer',
    description: 'Clean, corporate design with professional feel',
    features: ['Hero with CTA', 'Services grid', 'Project gallery', 'Reviews', 'Contact form'],
  },
  tradesman: {
    name: 'tradesman',
    displayName: 'Tradesman',
    description: 'Trust-focused with badges and reviews prominent',
    features: ['Trust badges', 'Reviews first', 'Checkatrade integration', 'Simple contact'],
  },
  showcase: {
    name: 'showcase',
    displayName: 'Showcase',
    description: 'Portfolio-heavy with minimal text',
    features: ['Full-width gallery', 'Lightbox', 'Minimal text', 'Visual impact'],
  },
  bold: {
    name: 'bold',
    displayName: 'Bold',
    description: 'Modern and energetic with strong colors',
    features: ['Bold typography', 'Animated elements', 'Strong CTAs'],
  },
  local: {
    name: 'local',
    displayName: 'Local',
    description: 'Service-area focused with map emphasis',
    features: ['Area coverage', 'Local SEO', 'Service list', 'Quick contact'],
  },
  corporate: {
    name: 'corporate',
    displayName: 'Corporate',
    description: 'Professional for larger companies',
    features: ['Team section', 'Multiple pages feel', 'Formal tone'],
  },
  craftsman: {
    name: 'craftsman',
    displayName: 'Craftsman',
    description: 'Artisan quality focus',
    features: ['Quality messaging', 'Before/after', 'Testimonials'],
  },
  emergency: {
    name: 'emergency',
    displayName: 'Emergency',
    description: '24/7 services with urgent CTAs',
    features: ['Phone prominent', 'Availability badge', 'Fast response'],
  },
  daxa: {
    name: 'daxa',
    displayName: 'DAXA Custom',
    description: 'Custom premium design for DAXA Building Solutions',
    features: ['Animated hero', 'Parallax effects', 'Premium gallery', 'Custom branding'],
  },
}
