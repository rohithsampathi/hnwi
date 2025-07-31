import { Opportunity } from "@/lib/api";

export interface AssetCategoryData {
  id: string;
  name: string;
  color: string;
  liveDealCount: number;
  medianRisk: "Low" | "Medium" | "High";
  medianReturn: string;
  medianTicket: string;
  description: string;
  opportunities: Opportunity[];
}

// Map opportunity types/industries to asset categories
const categoryMappings: Record<string, string> = {
  // Real Estate
  "real estate": "real-estate",
  "property": "real-estate", 
  "residential": "real-estate",
  "commercial": "real-estate",
  "industrial": "real-estate",
  
  // Private Equity
  "private equity": "private-equity",
  "buyout": "private-equity",
  "acquisition": "private-equity",
  "merger": "private-equity",
  
  // Venture Capital
  "venture": "venture-capital",
  "startup": "venture-capital",
  "technology": "venture-capital",
  "tech": "venture-capital",
  "software": "venture-capital",
  "saas": "venture-capital",
  
  // Strategic Metals
  "metal": "strategic-metals",
  "metals": "strategic-metals",
  "gold": "strategic-metals",
  "silver": "strategic-metals",
  "platinum": "strategic-metals",
  "copper": "strategic-metals",
  "lithium": "strategic-metals",
  "rare earth": "strategic-metals",
  "mining": "strategic-metals",
  
  // Crypto & Digital
  "crypto": "crypto-digital",
  "cryptocurrency": "crypto-digital",
  "bitcoin": "crypto-digital",
  "blockchain": "crypto-digital",
  "defi": "crypto-digital",
  "nft": "crypto-digital",
  "digital asset": "crypto-digital",
  
  // Fixed Income
  "bond": "fixed-income",
  "bonds": "fixed-income",
  "debt": "fixed-income",
  "credit": "fixed-income",
  "fixed income": "fixed-income",
  "treasury": "fixed-income",
  "municipal": "fixed-income"
};

// Base asset categories with premium bright colors
const baseCategories = [
  {
    id: "strategic-metals",
    name: "Strategic Metals",
    color: "#FFD700", // Bright gold
    description: "Rare earth elements and precious metals with strategic value"
  },
  {
    id: "private-equity", 
    name: "Private Equity",
    color: "#4F46E5", // Bright indigo
    description: "Direct investment in private companies and buyout opportunities"
  },
  {
    id: "real-estate",
    name: "Real Estate", 
    color: "#DC2626", // Bright red
    description: "Premium commercial and residential properties worldwide"
  },
  {
    id: "venture-capital",
    name: "Venture Capital",
    color: "#7C3AED", // Bright purple
    description: "Early-stage technology and growth companies"
  },
  {
    id: "crypto-digital",
    name: "Crypto & Digital",
    color: "#06B6D4", // Bright cyan
    description: "Digital assets, DeFi protocols, and blockchain infrastructure"
  },
  {
    id: "fixed-income",
    name: "Fixed Income",
    color: "#10B981", // Bright emerald
    description: "Government bonds, corporate debt, and structured products"
  }
];

function categorizeOpportunity(opportunity: Opportunity): string {
  const searchText = `${opportunity.type || ''} ${opportunity.industry || ''} ${opportunity.product || ''} ${opportunity.title || ''}`.toLowerCase();
  
  for (const [keyword, categoryId] of Object.entries(categoryMappings)) {
    if (searchText.includes(keyword)) {
      return categoryId;
    }
  }
  
  // Default fallback based on common patterns
  if (searchText.includes('equity') || searchText.includes('fund')) {
    return 'private-equity';
  }
  if (searchText.includes('property') || searchText.includes('land')) {
    return 'real-estate';
  }
  
  return 'private-equity'; // Default category
}

function calculateMedianReturn(opportunities: Opportunity[]): string {
  const returns = opportunities
    .map(opp => opp.expectedReturn)
    .filter(ret => ret)
    .map(ret => {
      // Extract percentage values from strings like "15%", "12-18%", "25% IRR"
      const match = ret!.match(/(\d+(?:\.\d+)?)/);
      return match ? parseFloat(match[1]) : null;
    })
    .filter(ret => ret !== null) as number[];
    
  if (returns.length === 0) return "15-25%";
  
  returns.sort((a, b) => a - b);
  const median = returns[Math.floor(returns.length / 2)];
  
  // Create a reasonable range around the median
  const lowerBound = Math.max(1, Math.floor(median - 2));
  const upperBound = Math.ceil(median + 3);
  return `${lowerBound}-${upperBound}%`;
}

function calculateMedianTicket(opportunities: Opportunity[]): string {
  const values = opportunities
    .map(opp => opp.value)
    .filter(val => val)
    .map(val => {
      // Handle ranges like "$50M - $100M", "$25M - $50M"
      const cleaned = val!.replace(/[$,\s]/g, '').toLowerCase();
      
      // Check for range patterns (e.g., "50m-100m", "25m-50m")
      const rangeMatch = cleaned.match(/(\d+(?:\.\d+)?)[km]?\s*-\s*(\d+(?:\.\d+)?)[kmb]?/);
      
      let finalValue: number;
      
      if (rangeMatch) {
        // It's a range - take the average of min and max
        const minValue = parseFloat(rangeMatch[1]);
        const maxValue = parseFloat(rangeMatch[2]);
        
        // Determine multiplier from the original string
        let multiplier = 1;
        if (cleaned.includes('b') || cleaned.includes('billion')) {
          multiplier = 1000000000;
        } else if (cleaned.includes('m') || cleaned.includes('million')) {
          multiplier = 1000000;
        } else if (cleaned.includes('k') || cleaned.includes('thousand')) {
          multiplier = 1000;
        }
        
        // Calculate average of the range
        finalValue = ((minValue + maxValue) / 2) * multiplier;
      } else {
        // Single value - handle normally
        let multiplier = 1;
        if (cleaned.includes('b') || cleaned.includes('billion')) {
          multiplier = 1000000000;
        } else if (cleaned.includes('m') || cleaned.includes('million')) {
          multiplier = 1000000;
        } else if (cleaned.includes('k') || cleaned.includes('thousand')) {
          multiplier = 1000;
        }
        
        const numMatch = cleaned.match(/(\d+(?:\.\d+)?)/);
        if (!numMatch) return null;
        
        finalValue = parseFloat(numMatch[1]) * multiplier;
      }
      
      return finalValue;
    })
    .filter(val => val !== null && val > 0) as number[];
    
  if (values.length === 0) return "$2.5M";
  
  values.sort((a, b) => a - b);
  const median = values[Math.floor(values.length / 2)];
  
  // Format the median value appropriately
  if (median >= 1000000000) {
    return `$${(median / 1000000000).toFixed(1)}B`;
  } else if (median >= 1000000) {
    return `$${(median / 1000000).toFixed(1)}M`;
  } else if (median >= 1000) {
    return `$${(median / 1000).toFixed(0)}K`;
  }
  return `$${median.toLocaleString()}`;
}

function calculateMedianRisk(opportunities: Opportunity[]): "Low" | "Medium" | "High" {
  const riskCounts = { Low: 0, Medium: 0, High: 0 };
  
  opportunities.forEach(opp => {
    if (opp.riskLevel) {
      const risk = opp.riskLevel.toLowerCase();
      if (risk.includes('low')) riskCounts.Low++;
      else if (risk.includes('high')) riskCounts.High++;
      else riskCounts.Medium++;
    } else {
      riskCounts.Medium++; // Default to medium if not specified
    }
  });
  
  // Return the most common risk level
  const maxCount = Math.max(riskCounts.Low, riskCounts.Medium, riskCounts.High);
  if (riskCounts.High === maxCount) return "High";
  if (riskCounts.Low === maxCount) return "Low";
  return "Medium";
}

export function generateAssetCategoriesFromOpportunities(opportunities: Opportunity[]): AssetCategoryData[] {
  // Group opportunities by category
  const categoryGroups: Record<string, Opportunity[]> = {};
  
  opportunities.forEach(opp => {
    const categoryId = categorizeOpportunity(opp);
    if (!categoryGroups[categoryId]) {
      categoryGroups[categoryId] = [];
    }
    categoryGroups[categoryId].push(opp);
  });
  
  // Generate category data
  return baseCategories.map(baseCat => {
    const categoryOpportunities = categoryGroups[baseCat.id] || [];
    
    return {
      ...baseCat,
      liveDealCount: categoryOpportunities.length,
      medianRisk: calculateMedianRisk(categoryOpportunities),
      medianReturn: calculateMedianReturn(categoryOpportunities),
      medianTicket: calculateMedianTicket(categoryOpportunities),
      opportunities: categoryOpportunities
    };
  }).filter(cat => cat.liveDealCount > 0); // Only show categories with actual opportunities
}

export const getRiskColor = (risk: "Low" | "Medium" | "High"): string => {
  switch (risk) {
    case "Low":
      return "#10B981"; // green
    case "Medium":
      return "#F59E0B"; // amber
    case "High":
      return "#EF4444"; // red
    default:
      return "#6B7280"; // gray
  }
};