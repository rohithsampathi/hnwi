// Unified Luxury Loader System for HNWI Chronicles
// Matches the app's gold/black luxury aesthetic with premium animations

export { CrownLoader } from './crown-loader'
export { LuxuryShieldLoader } from './luxury-shield-loader'
export { LuxurySpinner } from './luxury-spinner'

// Re-export as default aliases for common usage patterns
export { LuxuryShieldLoader as ShieldLoader } from './luxury-shield-loader'
export { CrownLoader as PageLoader } from './crown-loader'
export { LuxurySpinner as InlineLoader } from './luxury-spinner'

// Usage Guide:
// - LuxuryShieldLoader: For page-level authentication and security-related loading
// - CrownLoader: For app sections, profile loading, and premium content
// - LuxurySpinner: For inline loading states and small UI components