// lib/map-utils.ts
// Utility functions for the interactive world map

import type { City } from "@/components/interactive-world-map"

/**
 * Parse value string to number for calculations
 */
export function parseValueToNumber(value: string | undefined): number {
  if (!value) return 0

  // Remove $ and commas
  const cleanValue = value.replace(/[$,]/g, '')

  // Extract number and suffix
  const match = cleanValue.match(/([\d.]+)([KMB])?/)
  if (!match) return 0

  const num = parseFloat(match[1])
  const suffix = match[2]

  // Convert to actual value
  if (suffix === 'K') return num * 1000
  if (suffix === 'M') return num * 1000000
  if (suffix === 'B') return num * 1000000000

  return num
}

/**
 * Format text labels: First Letter Of Every Word Capital, remove underscores, no all caps
 */
export function formatLabel(text: string | undefined): string | undefined {
  if (!text) return text

  // Replace underscores with spaces
  let formatted = text.replace(/_/g, ' ')

  // Convert from all caps or mixed case to Title Case
  formatted = formatted.toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

  return formatted
}

/**
 * Format value to ensure K/M suffix
 */
export function formatValue(value: string | undefined): string | undefined {
  if (!value) return value

  // If already has K, M, B suffix, return as is
  if (/[KMB]$/i.test(value)) return value

  // Extract number from string like "$420" or "420" or "$1,000,000"
  const match = value.match(/\$?([\d,]+)/)
  if (!match) return value

  const num = parseFloat(match[1].replace(/,/g, ''))
  const prefix = value.startsWith('$') ? '$' : ''

  // Always format based on the actual numeric value
  if (num >= 1000000) {
    return `${prefix}${(num / 1000000).toFixed(0)}M`
  } else if (num >= 1000) {
    return `${prefix}${(num / 1000).toFixed(0)}K`
  } else if (num >= 1) {
    // For values < 1000, assume they represent thousands in the data model
    return `${prefix}${num}K`
  }

  return value
}

/**
 * Clean analysis text by removing redundant prefix
 * SOTA solution: Find "Risk Profile:" then parse everything after the next " - "
 */
export function cleanAnalysisText(analysis: string | undefined): string | undefined {
  if (!analysis) return analysis

  // Check if text contains "Risk Profile:"
  const riskProfileIndex = analysis.indexOf('Risk Profile:')

  if (riskProfileIndex !== -1) {
    // Find the first " - " after "Risk Profile:"
    const dashIndex = analysis.indexOf(' - ', riskProfileIndex)

    if (dashIndex !== -1) {
      // Return everything after " - "
      return analysis.substring(dashIndex + 3).trim() // +3 to skip " - "
    }
  }

  // Fallback: If no "Risk Profile:" found, check for "Entry Investment:" at the start
  if (analysis.startsWith('Entry Investment:')) {
    // Find first " - " and take everything after it
    const dashIndex = analysis.indexOf(' - ')
    if (dashIndex !== -1) {
      return analysis.substring(dashIndex + 3).trim()
    }
  }

  // Return original if no patterns matched
  return analysis.trim()
}

/**
 * Format source label
 */
export function formatSource(source: string | undefined): string | undefined {
  if (!source) return source
  const lowerSource = source.toLowerCase()

  if (lowerSource === 'moev4' || lowerSource === 'moe v4') {
    return 'Live HNWI Data'
  }

  if (lowerSource === 'prive exchange' || lowerSource === 'privé exchange') {
    return 'Market Place'
  }

  return source
}

/**
 * Remove lock emoji from Crown Vault titles
 */
export function cleanTitle(title: string | undefined, source: string | undefined): string | undefined {
  if (!title) return title

  // Remove 🔐 emoji from Crown Vault opportunities
  if (source?.toLowerCase().includes('crown vault')) {
    return title.replace(/🔐\s*/g, '').trim()
  }

  return title
}

/**
 * Generate tier based on value for Market Place opportunities
 */
export function generateTier(value: string | undefined, source: string | undefined): string | undefined {
  if (!value || !source) return undefined

  // Only generate tier for Prive Exchange/Market Place
  const lowerSource = source.toLowerCase()
  if (lowerSource !== 'prive exchange' && lowerSource !== 'privé exchange') {
    return undefined
  }

  // Extract numeric value
  const match = value.match(/\$?([\d,]+)/)
  if (!match) return undefined

  let num = parseFloat(match[1].replace(/,/g, ''))

  // If value has K suffix, multiply by 1000
  if (/K$/i.test(value)) {
    num = num * 1000
  }
  // If value has M suffix, multiply by 1,000,000
  else if (/M$/i.test(value)) {
    num = num * 1000000
  }
  // Assume values without suffix are in thousands
  else if (num >= 1 && num < 1000) {
    num = num * 1000
  }

  // Classify into tiers
  if (num >= 1000000) {
    return '$1M+ Tier'
  } else if (num >= 500000) {
    return '$500K Tier'
  } else if (num >= 100000) {
    return '$100K Tier'
  }

  return undefined
}

/**
 * Get category-specific icon SVG based on asset type
 */
export function getCategoryIcon(city: City, iconColor: string): string {
  const title = (city.title || '').toLowerCase()
  const analysis = (city.analysis || '').toLowerCase()
  const combined = title + ' ' + analysis
  const category = (city.category || '').toLowerCase()
  const industry = (city.industry || '').toLowerCase()
  const product = (city.product || '').toLowerCase()

  // If backend provides category/industry/product, use it first (most accurate)
  if (category || industry || product) {
    const backendData = (category + ' ' + industry + ' ' + product).toLowerCase()

    // COMMERCIAL REAL ESTATE & BUILDINGS (CHECK FIRST!)
    // Must check before VILLAS because "Real Estate" contains "estate"
    if (backendData.includes('real estate') || backendData.includes('commercial') ||
        backendData.includes('office') || backendData.includes('building') ||
        backendData.includes('property')) {
      return `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="${iconColor}" stroke="${iconColor}" stroke-width="1.5"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>`
    }

    // WATCHES & TIMEPIECES
    if (backendData.includes('watch') || backendData.includes('timepiece') ||
        backendData.includes('rolex') || backendData.includes('omega') ||
        backendData.includes('patek') || backendData.includes('cartier')) {
      return `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="${iconColor}" stroke="${iconColor}" stroke-width="1.5"><circle cx="12" cy="12" r="6"/><polyline points="12 10 12 12 13 13"/><path d="m16.13 7.66-.81-4.05a2 2 0 0 0-2-1.61h-2.68a2 2 0 0 0-2 1.61l-.78 4.05"/><path d="m7.88 16.36.8 4a2 2 0 0 0 2 1.61h2.72a2 2 0 0 0 2-1.61l.81-4.05"/></svg>`
    }

    // APARTMENTS & RESIDENTIAL
    if (backendData.includes('apartment') || backendData.includes('residential') ||
        backendData.includes('condo') || backendData.includes('flat')) {
      return `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="${iconColor}" stroke="${iconColor}" stroke-width="1.5"><rect x="6" y="3" width="12" height="18" rx="1"/><line x1="6" y1="7" x2="18" y2="7"/><line x1="6" y1="11" x2="18" y2="11"/><line x1="6" y1="15" x2="18" y2="15"/><line x1="10" y1="3" x2="10" y2="21"/><line x1="14" y1="3" x2="14" y2="21"/></svg>`
    }

    // VILLAS & LUXURY HOMES (after real estate check)
    if (backendData.includes('villa') || backendData.includes('mansion') ||
        backendData.includes('luxury home') || backendData.includes('estate')) {
      return `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="${iconColor}" stroke="${iconColor}" stroke-width="1.5"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`
    }

    // VEHICLES & AUTOMOBILES
    if (backendData.includes('vehicle') || backendData.includes('car') ||
        backendData.includes('automobile') || backendData.includes('auto')) {
      return `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="${iconColor}" stroke="${iconColor}" stroke-width="1.5"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>`
    }

    // LAND & AGRICULTURE
    if (backendData.includes('land') || backendData.includes('agriculture') ||
        backendData.includes('farm') || backendData.includes('plot') ||
        backendData.includes('acres') || backendData.includes('aquaculture')) {
      return `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="${iconColor}" stroke="${iconColor}" stroke-width="1.5"><path d="M2 22h20"/><path d="M3.77 10.77 2 9l2-2 1.77 1.77z"/><path d="M7.54 14.54 6 13l2-2 1.54 1.54z"/><path d="M11.31 18.31 10 17l2-2 1.31 1.31z"/><path d="M15.08 22.08 14 21l2-2 1.08 1.08z"/><path d="M18.77 10.77 17 9l2-2 1.77 1.77z"/><path d="M14.54 14.54 13 13l2-2 1.54 1.54z"/><path d="M10.31 18.31 9 17l2-2 1.31 1.31z"/><path d="M6.08 22.08 5 21l2-2 1.08 1.08z"/></svg>`
    }

    // GOLD & PRECIOUS METALS
    if (backendData.includes('gold') || backendData.includes('silver') ||
        backendData.includes('metal') || backendData.includes('precious metal') ||
        backendData.includes('bullion')) {
      return `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="${iconColor}" stroke="${iconColor}" stroke-width="1.5"><rect x="3" y="4" width="18" height="4" rx="1"/><rect x="3" y="10" width="18" height="4" rx="1"/><rect x="3" y="16" width="18" height="4" rx="1"/></svg>`
    }

    // JEWELRY & COLLECTIBLES
    if (backendData.includes('jewelry') || backendData.includes('jewellery') ||
        backendData.includes('gem') || backendData.includes('diamond') ||
        backendData.includes('collectible')) {
      return `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="${iconColor}" stroke="${iconColor}" stroke-width="1.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>`
    }

    // ART & LUXURY GOODS
    if (backendData.includes('art') || backendData.includes('painting') ||
        backendData.includes('sculpture') || backendData.includes('luxury')) {
      return `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="${iconColor}" stroke="${iconColor}" stroke-width="1.5"><circle cx="13.5" cy="6.5" r=".5" fill="${iconColor}"/><circle cx="17.5" cy="10.5" r=".5" fill="${iconColor}"/><circle cx="8.5" cy="7.5" r=".5" fill="${iconColor}"/><circle cx="6.5" cy="12.5" r=".5" fill="${iconColor}"/><path d="M13.73 4a2 2 0 0 0-3.46 0l-3 5A2 2 0 0 0 8 11h8a2 2 0 0 0 .73-2Z"/><path d="M9.06 12c-.51.5-2.01 3.48-2.06 6-.06 3.5 2.5 6 6.5 6s6.56-2.5 6.5-6c-.05-2.52-1.55-5.5-2.06-6"/></svg>`
    }
  }

  // Fallback to text matching if no category provided or category didn't match

  // Land / Farm / Agriculture / Living Spaces
  if (combined.includes('land') || combined.includes('plot') ||
      combined.includes('agriculture') || combined.includes('aquaculture') ||
      combined.includes('farm') || combined.includes('acres') ||
      combined.includes('living space')) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="${iconColor}" stroke="${iconColor}" stroke-width="1.5"><path d="M2 22h20"/><path d="M3.77 10.77 2 9l2-2 1.77 1.77z"/><path d="M7.54 14.54 6 13l2-2 1.54 1.54z"/><path d="M11.31 18.31 10 17l2-2 1.31 1.31z"/><path d="M15.08 22.08 14 21l2-2 1.08 1.08z"/><path d="M18.77 10.77 17 9l2-2 1.77 1.77z"/><path d="M14.54 14.54 13 13l2-2 1.54 1.54z"/><path d="M10.31 18.31 9 17l2-2 1.31 1.31z"/><path d="M6.08 22.08 5 21l2-2 1.08 1.08z"/></svg>`
  }

  // Watches / Timepieces
  if (combined.includes('watch') || combined.includes('rolex') ||
      combined.includes('timepiece') || title.includes('tissot') ||
      title.includes('seiko') || title.includes('patek') ||
      combined.includes('omega') || combined.includes('cartier')) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="${iconColor}" stroke="${iconColor}" stroke-width="1.5"><circle cx="12" cy="12" r="6"/><polyline points="12 10 12 12 13 13"/><path d="m16.13 7.66-.81-4.05a2 2 0 0 0-2-1.61h-2.68a2 2 0 0 0-2 1.61l-.78 4.05"/><path d="m7.88 16.36.8 4a2 2 0 0 0 2 1.61h2.72a2 2 0 0 0 2-1.61l.81-4.05"/></svg>`
  }

  // Real Estate
  if (combined.includes('real estate') || combined.includes('property') ||
      combined.includes('commercial property') || combined.includes('real-estate')) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="${iconColor}" stroke="${iconColor}" stroke-width="1.5"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>`
  }

  // Vehicles / Cars
  if (combined.includes('car') || combined.includes('vehicle') ||
      title.includes('harrier') || title.includes('tata') ||
      combined.includes('automobile')) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="${iconColor}" stroke="${iconColor}" stroke-width="1.5"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>`
  }

  // Apartments / Buildings
  if (combined.includes('apartment') || title.includes('bhk') ||
      combined.includes('residential complex')) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="${iconColor}" stroke="${iconColor}" stroke-width="1.5"><rect x="6" y="3" width="12" height="18" rx="1"/><line x1="6" y1="7" x2="18" y2="7"/><line x1="6" y1="11" x2="18" y2="11"/><line x1="6" y1="15" x2="18" y2="15"/><line x1="10" y1="3" x2="10" y2="21"/><line x1="14" y1="3" x2="14" y2="21"/></svg>`
  }

  // Villas / Mansions
  if (combined.includes('villa') || combined.includes('mansion') ||
      combined.includes('luxury home') ||
      (combined.includes('residence') && !combined.includes('watch'))) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="${iconColor}" stroke="${iconColor}" stroke-width="1.5"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`
  }

  // Gold / Metal Bars
  if (combined.includes('gold bars') || combined.includes('gold bar') ||
      combined.includes('silver bars') || combined.includes('metal bars') ||
      (combined.includes('gold') && !combined.includes('jewelry'))) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="${iconColor}" stroke="${iconColor}" stroke-width="1.5"><rect x="3" y="4" width="18" height="4" rx="1"/><rect x="3" y="10" width="18" height="4" rx="1"/><rect x="3" y="16" width="18" height="4" rx="1"/></svg>`
  }

  // Default: Generic opportunity/investment icon (gem)
  return `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="${iconColor}" stroke="${iconColor}" stroke-width="1.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>`
}

/**
 * Calculate opacity based on opportunity age
 */
export function getOpacityFromAge(startDate: string | undefined): number {
  if (!startDate) return 0.30 // Default to 70% transparency if no date

  const opportunityDate = new Date(startDate)
  const now = new Date()
  const ageInMs = now.getTime() - opportunityDate.getTime()
  const ageInMonths = ageInMs / (1000 * 60 * 60 * 24 * 30) // Approximate months

  if (ageInMonths < 1) return 1.0  // Fresh opportunity - fully opaque
  if (ageInMonths < 3) return 0.80 // Recent - 20% transparency
  if (ageInMonths < 6) return 0.50 // Moderate age - 50% transparency
  return 0.30 // Old - 70% transparency
}
