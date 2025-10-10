// lib/page-headers.ts
// Configuration for page titles and descriptions based on routes

export interface PageHeaderConfig {
  title: string
  description?: string
  showBackButton?: boolean
  showOnRoutes?: string[] // If specified, only show on these exact routes
  hideOnRoutes?: string[] // If specified, hide on these routes
}

export const PAGE_HEADERS: Record<string, PageHeaderConfig> = {
  // Main sections that need headers
  'dashboard': {
    title: '', // Will be dynamically set with greeting
    description: 'Your personalized wealth intelligence command center',
    showBackButton: false,
  },
  'crown-vault': {
    title: 'Crown Vault',
    description: 'Your secured legacy with military-grade encryption. Manage assets, designate heirs, and protect your wealth.',
    showBackButton: true,
  },
  'social-hub': {
    title: 'Social Hub',
    description: 'Connect with fellow HNWIs, discover exclusive events, and expand your elite network.',
    showBackButton: true,
  },
  'prive-exchange': {
    title: 'Privé Exchange',
    description: 'Exclusive investment opportunities curated for discerning investors.',
    showBackButton: true,
  },
  'tactics-lab': {
    title: 'Tactics Lab',
    description: 'Advanced strategies and tools for wealth optimization and growth.',
    showBackButton: true,
  },
  'strategy-engine': {
    title: 'Strategy Engine',
    description: 'AI-powered investment analysis and portfolio optimization.',
    showBackButton: true,
  },
  'strategy-vault': {
    title: 'Strategy Vault',
    description: 'Your personalized collection of wealth-building strategies.',
    showBackButton: true,
  },
  'playbooks': {
    title: 'Playbooks',
    description: 'Proven strategies and methodologies for wealth management.',
    showBackButton: true,
  },
  'industry-pulse': {
    title: 'Industry Pulse',
    description: 'Real-time insights and trends across key industries.',
    showBackButton: true,
  },
  'invest-scan': {
    title: 'Invest Scan',
    description: 'Global investment opportunities mapped and analyzed.',
    showBackButton: true,
  },
  'calendar': {
    title: 'Calendar',
    description: 'Your schedule of exclusive events and important dates.',
    showBackButton: true,
  },
  'hnwi-world': {
    title: 'HNWI World',
    description: 'Global insights and intelligence for high-net-worth individuals.',
    showBackButton: true,
  },
  'ask-rohith': {
    title: 'Ask Rohith',
    description: 'Your private intelligence ally with full portfolio awareness and memory. Get strategic insights and market intelligence.',
    showBackButton: true,
  },
  'industry-pulse': {
    title: 'Industry Pulse', 
    description: 'Real-time insights and trends across key industries.',
    showBackButton: true,
  },
  'profile': {
    title: 'Profile',
    description: 'Manage your account settings and preferences.',
    showBackButton: true,
  },
}

// Routes that should never show headers
export const NO_HEADER_ROUTES = [
  '/',
  '/login',
  '/register',
  '/onboarding',
  '/dashboard',
]

// Generate personalized greeting for dashboard
function getDashboardGreeting(user: any): string {
  // Get user's full name - same logic as profile page
  let fullName = 'User'

  // Try name field first (most reliable for full name)
  if (user?.name) {
    fullName = user.name
  } else {
    // Then try firstName + lastName combination
    const firstName = user?.firstName || user?.first_name
    const lastName = user?.lastName || user?.last_name

    if (firstName && lastName) {
      fullName = `${firstName} ${lastName}`
    } else if (firstName) {
      fullName = firstName
    } else {
      // Fallback to email username
      fullName = user?.email?.split('@')[0] || 'User'
    }
  }

  const hour = new Date().getHours()

  if (hour < 6) return `Midnight Wealth Watchlist, ${fullName}`
  if (hour < 12) return `Morning Intelligence Brief, ${fullName}`
  if (hour < 17) return `Midday Market Synthesis, ${fullName}`
  if (hour < 22) return `Evening Capital Insights, ${fullName}`
  return `Night Watch: Global Capital Flow, ${fullName}`
}

export function getPageHeader(pathname: string, user?: any): PageHeaderConfig | null {
  // Remove leading slash and get the main route
  const cleanPath = pathname.replace(/^\/+/, '')
  const mainRoute = cleanPath.split('/')[0] || ''
  
  // Check if this route should never show headers
  if (NO_HEADER_ROUTES.includes(pathname) || NO_HEADER_ROUTES.includes('/' + mainRoute)) {
    return null
  }
  
  // Look for exact match first
  const exactMatch = PAGE_HEADERS[cleanPath]
  if (exactMatch) {
    // Special handling for dashboard to add dynamic greeting
    if (cleanPath === 'dashboard') {
      return {
        ...exactMatch,
        title: getDashboardGreeting(user)
      }
    }
    return exactMatch
  }
  
  // Look for main route match
  const mainRouteMatch = PAGE_HEADERS[mainRoute]
  if (mainRouteMatch) {
    // Special handling for dashboard to add dynamic greeting
    if (mainRoute === 'dashboard') {
      return {
        ...mainRouteMatch,
        title: getDashboardGreeting(user)
      }
    }
    return mainRouteMatch
  }
  
  return null
}