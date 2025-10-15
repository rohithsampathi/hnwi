// lib/map-routing.ts
// Navigation and routing logic for map opportunities

import type { City } from "@/components/interactive-world-map"

/**
 * Map opportunity to executor filters (category and subcategory)
 */
export function mapOpportunityToExecutorFilters(opportunity: City): {
  category: string | null
  subcategory: string | null
} {
  const industry = (opportunity.industry || '').toLowerCase()
  const category = (opportunity.category || '').toLowerCase()
  const product = (opportunity.product || '').toLowerCase()
  const title = (opportunity.title || '').toLowerCase()
  const combined = `${industry} ${category} ${product} ${title}`

  // Real Estate → Alternative Assets > Real Estate
  if (combined.includes('real estate') || combined.includes('property') ||
      combined.includes('apartment') || combined.includes('villa') ||
      combined.includes('residential') || combined.includes('commercial')) {
    return { category: 'alternative_assets', subcategory: 'real_estate' }
  }

  // Art → Alternative Assets > Art & Collectibles
  if (combined.includes('art') || combined.includes('painting') ||
      combined.includes('sculpture') || combined.includes('collectible')) {
    return { category: 'alternative_assets', subcategory: 'art_collectibles' }
  }

  // Precious Metals → Alternative Assets > Precious Metals
  if (combined.includes('gold') || combined.includes('silver') ||
      combined.includes('precious metal') || combined.includes('bullion')) {
    return { category: 'alternative_assets', subcategory: 'precious_metals' }
  }

  // Crypto/Digital Assets → Alternative Assets > Cryptocurrency
  if (combined.includes('crypto') || combined.includes('cryptocurrency') ||
      combined.includes('bitcoin') || combined.includes('blockchain')) {
    return { category: 'alternative_assets', subcategory: 'crypto' }
  }

  // Private Equity → Alternative Assets > Private Equity
  if (combined.includes('private equity') || combined.includes('venture capital') ||
      combined.includes('startup') || combined.includes('pre-ipo')) {
    return { category: 'alternative_assets', subcategory: 'private_equity' }
  }

  // Watches, Jewelry, Luxury Goods → Alternative Assets
  if (combined.includes('watch') || combined.includes('jewelry') ||
      combined.includes('luxury goods') || combined.includes('collectibles')) {
    return { category: 'alternative_assets', subcategory: null }
  }

  // Tax → Tax Optimization
  if (combined.includes('tax') || combined.includes('taxation')) {
    // International Tax
    if (combined.includes('international') || combined.includes('cross-border')) {
      return { category: 'tax_optimization', subcategory: 'international_tax' }
    }
    // Offshore Structures
    if (combined.includes('offshore') || combined.includes('structure')) {
      return { category: 'tax_optimization', subcategory: 'offshore_structures' }
    }
    // Residency Planning
    if (combined.includes('residency') || combined.includes('relocation')) {
      return { category: 'tax_optimization', subcategory: 'residency_planning' }
    }
    // Tax Compliance
    if (combined.includes('compliance') || combined.includes('filing')) {
      return { category: 'tax_optimization', subcategory: 'compliance' }
    }
    return { category: 'tax_optimization', subcategory: null }
  }

  // Immigration & Visa → Legal Services > Immigration
  if (combined.includes('visa') || combined.includes('immigration') ||
      combined.includes('citizenship') || combined.includes('residency')) {
    return { category: 'legal_services', subcategory: 'immigration' }
  }

  // Trust → Legal Services > Trust Formation or Wealth Planning > Estate Planning
  if (combined.includes('trust')) {
    if (combined.includes('formation') || combined.includes('setup')) {
      return { category: 'legal_services', subcategory: 'trust_formation' }
    }
    return { category: 'wealth_planning', subcategory: 'estate_planning' }
  }

  // Estate Planning → Wealth Planning > Estate Planning
  if (combined.includes('estate planning') || combined.includes('inheritance') ||
      combined.includes('succession')) {
    return { category: 'wealth_planning', subcategory: 'estate_planning' }
  }

  // Retirement → Wealth Planning > Retirement Planning
  if (combined.includes('retirement') || combined.includes('pension')) {
    return { category: 'wealth_planning', subcategory: 'retirement_planning' }
  }

  // Philanthropy → Wealth Planning > Philanthropy
  if (combined.includes('philanthropy') || combined.includes('charity') ||
      combined.includes('giving') || combined.includes('foundation')) {
    return { category: 'wealth_planning', subcategory: 'philanthropy' }
  }

  // Insurance → Wealth Planning > Insurance
  if (combined.includes('insurance') || combined.includes('risk management')) {
    return { category: 'wealth_planning', subcategory: 'insurance' }
  }

  // Corporate Law → Legal Services > Corporate Law
  if (combined.includes('corporate') || combined.includes('company formation') ||
      combined.includes('business structure')) {
    return { category: 'legal_services', subcategory: 'corporate_law' }
  }

  // Legal/Compliance → Legal Services
  if (combined.includes('legal') || combined.includes('law') ||
      combined.includes('compliance') || combined.includes('regulation')) {
    return { category: 'legal_services', subcategory: null }
  }

  // Family Office → Family Office
  if (combined.includes('family office')) {
    // Setup
    if (combined.includes('setup') || combined.includes('establish')) {
      return { category: 'family_office', subcategory: 'setup' }
    }
    // Governance
    if (combined.includes('governance') || combined.includes('succession')) {
      return { category: 'family_office', subcategory: 'governance' }
    }
    // Concierge
    if (combined.includes('concierge') || combined.includes('lifestyle')) {
      return { category: 'family_office', subcategory: 'concierge' }
    }
    // Education
    if (combined.includes('education') || combined.includes('next-gen')) {
      return { category: 'family_office', subcategory: 'education' }
    }
    return { category: 'family_office', subcategory: null }
  }

  // Portfolio Management → Family Office
  if (combined.includes('portfolio management') || combined.includes('wealth management')) {
    return { category: 'family_office', subcategory: null }
  }

  // Default: no filters
  return { category: null, subcategory: null }
}

/**
 * Build navigation route for an opportunity
 */
export function getOpportunityRoute(opportunity: City): string {
  // Crown Vault asset - go to Crown Vault page
  if (opportunity.source?.toLowerCase().includes('crown vault')) {
    return 'crown-vault'
  }

  // Privé Exchange opportunity with Victor analysis - go to Privé Exchange with ID
  if (opportunity.victor_score) {
    const opportunityParam = opportunity._id || opportunity.id || encodeURIComponent(opportunity.title || opportunity.name || '')
    return `prive-exchange?opportunity=${opportunityParam}`
  }

  // All other opportunities (MOEv4, etc.) - go to Executors page with filters
  const filters = mapOpportunityToExecutorFilters(opportunity)
  let route = 'trusted-network'

  // Build URL with filters
  const params = new URLSearchParams()
  if (filters.category) params.append('category', filters.category)
  if (filters.subcategory) params.append('subcategory', filters.subcategory)

  if (params.toString()) {
    route = `trusted-network?${params.toString()}`
  }

  return route
}

/**
 * Get action button label for an opportunity
 */
export function getActionButtonLabel(opportunity: City): string {
  if (opportunity.source?.toLowerCase().includes('crown vault') || opportunity.victor_score) {
    return 'Know More →'
  }
  return 'Execute →'
}
