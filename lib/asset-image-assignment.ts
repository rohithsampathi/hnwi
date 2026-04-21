// lib/asset-image-assignment.ts
// LLM-powered intelligent image assignment during asset creation

import { ASSET_IMAGE_MAP, getAssetImageFallbackUrl, getAssetImageUrl } from './asset-images';
import { createLabeledCoverImage } from './playbook-cover';

export interface AssetImageAssignment {
  imageId: string;
  imageUrl: string;
  altText: string;
  confidence: number; // 0-1 confidence score
}

// Available image categories for LLM to choose from
export const AVAILABLE_IMAGE_CATEGORIES = Object.keys(ASSET_IMAGE_MAP);

// Lightweight LLM prompt for image assignment
export const createImageAssignmentPrompt = (assetName: string, assetType: string, assetDescription?: string): string => {
  return `
Analyze this asset and assign the most appropriate image category:

Asset Name: "${assetName}"
Asset Type: "${assetType}"
${assetDescription ? `Description: "${assetDescription}"` : ''}

Available Categories:
${AVAILABLE_IMAGE_CATEGORIES.join(', ')}

Rules:
- For "Aquaculture Land" or "Fish Farm" → use "land"
- For "Mango Orchard" or any orchard → use "orchard" 
- For "Gold Bars" or precious metals → use "gold" or "precious metals"
- For "Villa" or luxury villas → use "villa"
- For "Complex" or commercial buildings → use "commercial complex"
- For specific vehicle brands (Rolls Royce, Ferrari) → use appropriate vehicle type
- For luxury watches (Rolex, Patek Philippe) → use "watch"
- Match the most specific category possible

Respond with only the category name from the list above.
`.trim();
};

// Simulate LLM response (replace with actual API call)
export const assignImageWithLLM = async (assetName: string, assetType: string, assetDescription?: string): Promise<AssetImageAssignment> => {
  try {
    // For now, implement smart rule-based logic
    // Later replace with actual LLM API call
    const category = getSmartImageCategory(assetName, assetType, assetDescription);
    const config = ASSET_IMAGE_MAP[category] || ASSET_IMAGE_MAP.default;
    
    return {
      imageId: category,
      imageUrl: generateImageUrl(assetName || config.alt, category, config.alt),
      altText: config.alt,
      confidence: 0.95
    };
  } catch (error) {
    // Fallback to default
    const defaultConfig = ASSET_IMAGE_MAP.default;
    return {
      imageId: 'default',
      imageUrl: generateImageUrl(assetName || defaultConfig.alt, 'default', defaultConfig.alt),
      altText: defaultConfig.alt,
      confidence: 0.5
    };
  }
};

// Smart rule-based logic (can be replaced with LLM later)
const getSmartImageCategory = (assetName: string, assetType: string, assetDescription?: string): string => {
  const fullText = `${assetName} ${assetType} ${assetDescription || ''}`.toLowerCase();
  
  // Specific keyword matching with priority
  const rules = [
    // Agriculture & Land
    { keywords: ['aquaculture', 'fish farm', 'fishery'], category: 'land' },
    { keywords: ['mango orchard', 'orchard', 'plantation'], category: 'orchard' },
    { keywords: ['vineyard', 'wine estate'], category: 'vineyard' },
    { keywords: ['farm', 'agricultural land'], category: 'farm' },
    
    // Precious Metals (high priority)
    { keywords: ['gold bar', 'gold bars'], category: 'gold' },
    { keywords: ['silver bar', 'silver bars'], category: 'silver' },
    { keywords: ['platinum bar', 'platinum bars'], category: 'platinum' },
    { keywords: ['precious metal'], category: 'precious metals' },
    
    // Real Estate
    { keywords: ['plot', 'land plot', 'fenced plot'], category: 'plot' },
    { keywords: ['villa', 'luxury villa'], category: 'villa' },
    { keywords: ['mansion', 'luxury mansion'], category: 'mansion' },
    { keywords: ['complex', 'commercial complex'], category: 'commercial complex' },
    { keywords: ['penthouse'], category: 'penthouse' },
    { keywords: ['apartment', 'condo'], category: 'apartment' },
    
    // Vehicles
    { keywords: ['rolls royce', 'bentley'], category: 'car' },
    { keywords: ['ferrari', 'lamborghini', 'supercar'], category: 'supercar' },
    { keywords: ['yacht', 'mega yacht'], category: 'yacht' },
    { keywords: ['private jet', 'aircraft'], category: 'private jet' },
    
    // Luxury Items
    { keywords: ['rolex', 'patek philippe', 'luxury watch'], category: 'watch' },
    { keywords: ['diamond', 'jewelry'], category: 'jewelry' },
    { keywords: ['art', 'painting'], category: 'art' },
    { keywords: ['wine collection', 'vintage wine'], category: 'wine' },
  ];
  
  // Find best matching rule
  for (const rule of rules) {
    if (rule.keywords.some(keyword => fullText.includes(keyword))) {
      return rule.category;
    }
  }
  
  // Fallback to asset type
  return assetType.toLowerCase().replace(/\s+/g, '_') in ASSET_IMAGE_MAP 
    ? assetType.toLowerCase().replace(/\s+/g, '_')
    : 'default';
};

const generateImageUrl = (
  assetName: string,
  assetType: string,
  label: string,
  width = 600,
  height = 400,
): string =>
  createLabeledCoverImage({
    seed: `${assetName}:${assetType}:${label}`,
    title: assetName || label,
    label,
    width,
    height,
    footer: 'HNWI CHRONICLES ASSET',
  });

// Process assets to assign images after creation
export const enhanceAssetsWithImages = async (assets: any[]): Promise<any[]> => {
  const enhancedAssets = await Promise.all(
    assets.map(async (asset) => {
      if (!asset?.asset_data?.assigned_image) {
        // Assign image if not already assigned
        const imageAssignment = await assignImageWithLLM(
          asset.asset_data?.name || '',
          asset.asset_data?.asset_type || '',
          asset.asset_data?.notes || ''
        );
        
        return {
          ...asset,
          asset_data: {
            ...asset.asset_data,
            assigned_image: imageAssignment
          }
        };
      }
      return asset;
    })
  );
  
  return enhancedAssets;
};

// Client-side image assignment using API
export const assignImageViaAPI = async (
  assetName: string, 
  assetType: string, 
  assetDescription?: string
): Promise<AssetImageAssignment> => {
  try {
    const response = await fetch('/api/crown-vault/assign-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // CRITICAL: Send cookies with request
      body: JSON.stringify({
        assetName,
        assetType,
        assetDescription
      })
    });

    const data = await response.json();
    
    if (data.success && data.assignment) {
      return data.assignment;
    } else {
      throw new Error(data.error || 'API assignment failed');
    }
    
  } catch (error) {
    
    // Fallback to local smart assignment
    return assignImageWithLLM(assetName, assetType, assetDescription);
  }
};

// Simple function to get image URL for display
export const getAssetImageForDisplay = (asset: any): string => {
  const assetName = asset?.asset_data?.name || '';
  const assetType = asset?.asset_data?.asset_type || '';
  const assignedImageUrl = asset?.asset_data?.assigned_image?.imageUrl;

  // Keep real assigned images, but bypass old generated SVG covers for the richer photo rail.
  if (typeof assignedImageUrl === 'string' && assignedImageUrl.trim()) {
    if (!assignedImageUrl.startsWith('data:image/svg+xml')) {
      return assignedImageUrl;
    }
  }

  const premiumImageUrl = getAssetImageUrl(assetName, assetType, 'md');
  if (premiumImageUrl) {
    return premiumImageUrl;
  }

  return getAssetImageFallbackUrl(assetName, assetType, 'md');
};

// Lightweight image URL generation for immediate display
const getSmartImageUrl = (assetName: string, assetType: string): string => {
  const fullText = `${assetName} ${assetType}`.toLowerCase();
  
  // Quick rules for common cases
  if (fullText.includes('plot') || fullText.includes('land plot')) {
    return generateImageUrl(assetName || 'Land Plot', assetType || 'plot', 'Land');
  }
  if (fullText.includes('gold bar') || fullText.includes('gold bars')) {
    return generateImageUrl(assetName || 'Gold Bars', assetType || 'gold', 'Gold');
  }
  if (fullText.includes('villa')) {
    return generateImageUrl(assetName || 'Villa', assetType || 'villa', 'Villa');
  }
  if (fullText.includes('complex')) {
    return generateImageUrl(assetName || 'Commercial Complex', assetType || 'commercial complex', 'Commercial');
  }
  if (fullText.includes('orchard') || fullText.includes('aquaculture')) {
    return generateImageUrl(assetName || 'Land Asset', assetType || 'land', 'Land');
  }
  if (fullText.includes('precious metal')) {
    return generateImageUrl(assetName || 'Precious Metals', assetType || 'metals', 'Metals');
  }
  
  // Default fallback
  return generateImageUrl(assetName || 'HNWI Asset', assetType || 'asset', 'Asset');
};

// LLM-powered image assignment with Claude Sonnet
export const assignImageWithActualLLM = async (assetName: string, assetType: string, assetDescription?: string): Promise<AssetImageAssignment> => {
  try {
    // Try Claude first (server-side only)
    if (typeof window === 'undefined') {
      const { assignImageWithClaude } = await import('./anthropic-client');
      const imageCategory = await assignImageWithClaude(assetName, assetType, assetDescription);
      
      const config = ASSET_IMAGE_MAP[imageCategory] || ASSET_IMAGE_MAP.default;
      
      return {
        imageId: imageCategory,
        imageUrl: generateImageUrl(assetName || config.alt, imageCategory, config.alt),
        altText: config.alt,
        confidence: 0.95 // High confidence for LLM assignments
      };
    }
  } catch (error) {
  }
  
  // Fallback to rule-based assignment
  return assignImageWithLLM(assetName, assetType, assetDescription);
};
