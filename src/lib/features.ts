import type { Tier } from './supabase/types'

// Which tier unlocks which features
export const FEATURE_TIERS: Record<string, number> = {
  // £99 - Starter (basic website only)
  public_website: 99,
  contact_form: 99,
  basic_seo: 99,

  // £149 - Pro (add admin panel)
  admin_panel: 149,
  edit_settings: 149,
  upload_projects: 149,
  custom_domain: 149,
  manage_reviews: 149,

  // £199 - Full (add automation)
  auto_posting: 199,
  social_connections: 199,
  review_graphics: 199,
  ai_captions: 199,
  view_scheduled_posts: 199,
  analytics: 199,
}

// Tier prices
export const TIER_PRICES: Record<Tier, number> = {
  starter: 99,
  pro: 149,
  full: 199,
}

// Check if a tier has access to a feature
export function hasFeature(tier: Tier, feature: string): boolean {
  const requiredPrice = FEATURE_TIERS[feature]
  if (!requiredPrice) return true // Unknown feature = allow

  const tierPrice = TIER_PRICES[tier]
  return tierPrice >= requiredPrice
}

// Get all features for a tier
export function getTierFeatures(tier: Tier): string[] {
  const tierPrice = TIER_PRICES[tier]
  return Object.entries(FEATURE_TIERS)
    .filter(([, price]) => tierPrice >= price)
    .map(([feature]) => feature)
}

// Get features user is missing
export function getMissingFeatures(tier: Tier): string[] {
  const tierPrice = TIER_PRICES[tier]
  return Object.entries(FEATURE_TIERS)
    .filter(([, price]) => tierPrice < price)
    .map(([feature]) => feature)
}

// Get minimum tier needed for a feature
export function getRequiredTier(feature: string): Tier {
  const requiredPrice = FEATURE_TIERS[feature]
  if (!requiredPrice || requiredPrice <= 99) return 'starter'
  if (requiredPrice <= 149) return 'pro'
  return 'full'
}
