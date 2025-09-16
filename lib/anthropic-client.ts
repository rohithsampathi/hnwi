// lib/anthropic-client.ts
// Anthropic Claude Sonnet client for intelligent image assignment

import Anthropic from '@anthropic-ai/sdk';

// Initialize Anthropic client
let anthropicClient: Anthropic | null = null;

const getAnthropicClient = (): Anthropic => {
  if (!anthropicClient) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    
    if (!apiKey) {
      throw new Error(
        'ANTHROPIC_API_KEY is not configured. Please add your Anthropic API key to environment variables.'
      );
    }
    
    anthropicClient = new Anthropic({
      apiKey: apiKey,
    });
  }
  
  return anthropicClient;
};

// Configuration
export const ANTHROPIC_CONFIG = {
  model: process.env.ANTHROPIC_MODEL || 'claude-3-sonnet-20240229',
  maxTokens: 150, // Keep responses short for image assignment
  temperature: 0.1, // Low temperature for consistent, accurate responses
};

// LLM-powered image assignment
export const assignImageWithClaude = async (
  assetName: string,
  assetType: string,
  assetDescription?: string
): Promise<string> => {
  try {
    const client = getAnthropicClient();
    
    const prompt = createImageAssignmentPrompt(assetName, assetType, assetDescription);
    
    const response = await client.messages.create({
      model: ANTHROPIC_CONFIG.model,
      max_tokens: ANTHROPIC_CONFIG.maxTokens,
      temperature: ANTHROPIC_CONFIG.temperature,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });
    
    // Extract the response text
    const responseText = response.content[0]?.type === 'text' 
      ? response.content[0].text.trim().toLowerCase()
      : '';
    
    // Validate the response is a valid image category
    const validatedCategory = validateImageCategory(responseText);
    
    return validatedCategory;
    
  } catch (error) {
    
    // Fallback to rule-based assignment on API failure
    return getFallbackImageCategory(assetName, assetType);
  }
};

// Create the optimized prompt for Claude
const createImageAssignmentPrompt = (
  assetName: string,
  assetType: string,
  assetDescription?: string
): string => {
  return `
You are an expert asset categorization specialist for a luxury wealth management platform. Analyze this asset and select the MOST APPROPRIATE image category.

Asset Details:
- Name: "${assetName}"
- Type: "${assetType}"
${assetDescription ? `- Description: "${assetDescription}"` : ''}

Available Image Categories:
real estate, villa, mansion, penthouse, apartment, commercial, office, hotel, land, orchard, farm, vineyard, gold, silver, platinum, precious metals, diamonds, jewelry, watch, car, supercar, yacht, private jet, helicopter, art, painting, wine, stocks, bonds, crypto, business, technology, mining, energy, default

Assignment Rules:
- "Aquaculture Land" or "Fish Farm" → "land"
- "Mango Orchard" or any orchard → "orchard"
- "Gold Bars" or gold-related → "gold"
- "Villa" or luxury residential → "villa"
- "Complex" or commercial building → "commercial"
- Real estate properties → match specific type (villa, mansion, apartment, etc.)
- Precious metals → match specific metal (gold, silver, platinum)
- Vehicles → match specific type (car, supercar, yacht, etc.)
- Investment assets → match category (stocks, bonds, crypto, etc.)

Respond with ONLY the category name from the list above. No explanation, no additional text.
`.trim();
};

// Available image categories for validation
const VALID_IMAGE_CATEGORIES = [
  'real estate', 'villa', 'mansion', 'penthouse', 'apartment', 'commercial', 'office', 'hotel',
  'land', 'orchard', 'farm', 'vineyard', 'gold', 'silver', 'platinum', 'precious metals',
  'diamonds', 'jewelry', 'watch', 'car', 'supercar', 'yacht', 'private jet', 'helicopter',
  'art', 'painting', 'wine', 'stocks', 'bonds', 'crypto', 'business', 'technology',
  'mining', 'energy', 'default'
];

// Validate Claude's response
const validateImageCategory = (category: string): string => {
  const normalizedCategory = category.trim().toLowerCase();
  
  // Direct match
  if (VALID_IMAGE_CATEGORIES.includes(normalizedCategory)) {
    return normalizedCategory;
  }
  
  // Partial matching for variations
  for (const validCategory of VALID_IMAGE_CATEGORIES) {
    if (normalizedCategory.includes(validCategory) || validCategory.includes(normalizedCategory)) {
      return validCategory;
    }
  }
  
  // Default fallback
  return 'default';
};

// Fallback logic when Claude API fails
const getFallbackImageCategory = (assetName: string, assetType: string): string => {
  const fullText = `${assetName} ${assetType}`.toLowerCase();
  
  // High-priority mappings
  if (fullText.includes('gold bar') || fullText.includes('gold bars')) return 'gold';
  if (fullText.includes('villa')) return 'villa';
  if (fullText.includes('orchard') || fullText.includes('aquaculture')) return 'orchard';
  if (fullText.includes('complex')) return 'commercial';
  if (fullText.includes('mansion')) return 'mansion';
  if (fullText.includes('precious metal')) return 'precious metals';
  if (fullText.includes('real estate')) return 'real estate';
  
  return 'default';
};

// Test the connection
export const testAnthropicConnection = async (): Promise<boolean> => {
  try {
    const client = getAnthropicClient();
    
    // Simple test message
    const response = await client.messages.create({
      model: ANTHROPIC_CONFIG.model,
      max_tokens: 10,
      messages: [
        {
          role: 'user',
          content: 'Respond with only the word "connected"'
        }
      ]
    });
    
    const responseText = response.content[0]?.type === 'text' 
      ? response.content[0].text.trim().toLowerCase()
      : '';
    
    return responseText.includes('connected');
    
  } catch (error) {
    return false;
  }
};