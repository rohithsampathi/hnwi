// Dynamic category mapping and grouping utilities
// Handles UI improvements for portfolio categorization

export interface CategoryConfig {
  displayName: string;
  keywords: string[];
  groupWith?: string[];  // Categories to merge with this one
  icon?: string;
}

// Dynamic category configuration - easily extensible
export const CATEGORY_CONFIG: Record<string, CategoryConfig> = {
  'real_estate': {
    displayName: 'Real Estate & Property',
    keywords: ['real', 'estate', 'property', 'land', 'residential', 'commercial', 'plot', 'building'],
    groupWith: ['land', 'property', 'residential', 'commercial'],
  },
  'jewelry_precious_metals': {
    displayName: 'Jewelry & Precious Metals',
    keywords: ['jewelry', 'jewellery', 'precious', 'metals', 'gold', 'silver', 'platinum', 'diamond', 'gems'],
    groupWith: ['jewelry', 'precious_metals', 'gold', 'silver', 'diamonds', 'gems'],
  },
  'vehicles': {
    displayName: 'Vehicles & Transportation',
    keywords: ['vehicle', 'car', 'auto', 'motorcycle', 'boat', 'yacht', 'aircraft', 'jet'],
    groupWith: ['vehicle', 'car', 'auto', 'transportation'],
  },
  'crypto_digital': {
    displayName: 'Cryptocurrency & Digital Assets',
    keywords: ['crypto', 'bitcoin', 'ethereum', 'blockchain', 'digital', 'nft', 'token'],
    groupWith: ['crypto', 'cryptocurrency', 'bitcoin', 'ethereum', 'digital_assets'],
  },
  'stocks_equity': {
    displayName: 'Stocks & Equity Investments',
    keywords: ['stock', 'equity', 'share', 'securities', 'investment', 'mutual', 'fund'],
    groupWith: ['stocks', 'shares', 'equity', 'securities'],
  },
  'art_collectibles': {
    displayName: 'Art & Collectibles',
    keywords: ['art', 'collectible', 'antique', 'painting', 'sculpture', 'vintage', 'rare'],
    groupWith: ['art', 'collectibles', 'antiques', 'paintings'],
  },
  'business_enterprise': {
    displayName: 'Business & Enterprise Assets',
    keywords: ['business', 'company', 'enterprise', 'startup', 'firm', 'corporation'],
    groupWith: ['business', 'company', 'enterprise'],
  },
  'bonds_fixed_income': {
    displayName: 'Bonds & Fixed Income',
    keywords: ['bond', 'fixed', 'income', 'treasury', 'government', 'corporate'],
    groupWith: ['bonds', 'treasury', 'fixed_income'],
  },
  'commodities': {
    displayName: 'Commodities & Raw Materials',
    keywords: ['commodity', 'oil', 'gas', 'agricultural', 'raw', 'materials'],
    groupWith: ['commodities', 'oil', 'gas', 'agricultural'],
  },
  'cash_deposits': {
    displayName: 'Cash & Bank Deposits',
    keywords: ['cash', 'deposit', 'savings', 'checking', 'bank', 'money'],
    groupWith: ['cash', 'deposits', 'savings', 'bank'],
  },
};

// Fallback display names for common patterns
export const FALLBACK_PATTERNS = [
  { pattern: /^real[\s_]?estate$/i, displayName: 'Real Estate' },
  { pattern: /^vehicle[s]?$/i, displayName: 'Vehicles' },
  { pattern: /^crypto[\s_]?currency$/i, displayName: 'Cryptocurrency' },
  { pattern: /^stock[s]?$/i, displayName: 'Stocks' },
  { pattern: /^art$/i, displayName: 'Art & Collectibles' },
  { pattern: /^business$/i, displayName: 'Business Assets' },
  { pattern: /^jewelry$/i, displayName: 'Jewelry' },
  { pattern: /^precious[\s_]?metals$/i, displayName: 'Precious Metals' },
  { pattern: /^land$/i, displayName: 'Land & Property' },
  { pattern: /^collectibles?$/i, displayName: 'Collectibles' },
];

/**
 * Dynamically determine the category group for an asset type
 * @param assetType - Raw asset type from the API
 * @returns Normalized category key
 */
export function getCategoryGroup(assetType: string): string {
  if (!assetType) return 'other';
  
  const normalizedType = assetType.toLowerCase().trim();
  
  // Check against each category config
  for (const [categoryKey, config] of Object.entries(CATEGORY_CONFIG)) {
    // Direct match with groupWith array
    if (config.groupWith?.some(keyword => 
      normalizedType.includes(keyword.toLowerCase()) || 
      keyword.toLowerCase().includes(normalizedType)
    )) {
      return categoryKey;
    }
    
    // Keyword-based matching
    if (config.keywords.some(keyword => 
      normalizedType.includes(keyword.toLowerCase()) ||
      keyword.toLowerCase().includes(normalizedType)
    )) {
      return categoryKey;
    }
  }
  
  // If no match found, return normalized original type
  return normalizedType.replace(/[\s_]+/g, '_');
}

/**
 * Get the display name for a category
 * @param categoryKey - Category key (can be raw asset type or grouped key)
 * @returns User-friendly display name
 */
export function getCategoryDisplayName(categoryKey: string): string {
  // Check if it's a configured category
  const config = CATEGORY_CONFIG[categoryKey];
  if (config) {
    return config.displayName;
  }
  
  // Check fallback patterns
  for (const { pattern, displayName } of FALLBACK_PATTERNS) {
    if (pattern.test(categoryKey)) {
      return displayName;
    }
  }
  
  // Default formatting: replace underscores/hyphens with spaces and title case
  return categoryKey
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, letter => letter.toUpperCase())
    .trim();
}

/**
 * Process raw asset types into grouped categories with improved display names
 * @param assets - Array of assets with asset_data.asset_type
 * @returns Grouped and formatted category data
 */
export function processAssetCategories(assets: any[]): Array<{
  name: string;
  displayName: string;
  value: number;
  count: number;
  percentage: string;
}> {
  const categoryMap: Record<string, { count: number, value: number }> = {};
  
  // Group assets by category
  assets.forEach(asset => {
    if (asset?.asset_data?.asset_type && asset?.asset_data?.value) {
      const categoryGroup = getCategoryGroup(asset.asset_data.asset_type);
      
      if (!categoryMap[categoryGroup]) {
        categoryMap[categoryGroup] = { count: 0, value: 0 };
      }
      categoryMap[categoryGroup].count += 1;
      categoryMap[categoryGroup].value += asset.asset_data.value;
    }
  });
  
  const totalValue = Object.values(categoryMap).reduce((sum, cat) => sum + cat.value, 0);
  
  return Object.entries(categoryMap).map(([categoryKey, data]) => ({
    name: categoryKey,
    displayName: getCategoryDisplayName(categoryKey),
    value: data.value,
    count: data.count,
    percentage: totalValue > 0 ? ((data.value / totalValue) * 100).toFixed(1) : '0'
  }));
}

// Export for use in components
export default {
  getCategoryGroup,
  getCategoryDisplayName,
  processAssetCategories,
  CATEGORY_CONFIG,
  FALLBACK_PATTERNS
};