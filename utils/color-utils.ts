// utils/color-utils.ts
// Function to generate a consistent color based on string input
export function generateConsistentColor(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  // Generate HSL color with:
  // - Hue: full range (0-360)
  // - Saturation: 60-80% for vibrant but not overwhelming colors
  // - Lightness: 45-65% for good contrast with white text
  const hue = Math.abs(hash % 360)
  const saturation = 60 + (hash % 20)
  const lightness = 45 + (hash % 20)
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`
}

// Base color mapping for known categories and industries
export const baseIndustryColors: Record<string, string> = {
  // Financial Sector
  Finance: "#FFD700",
  "Financial Services": "#DAA520",
  "Financial Technology": "#FFA500",
  Banking: "#FF8C00",
  Fintech: "#FFB6C1",
  Insurance: "#FF7F50",
  "Government Finance/Taxation": "#F4A460",
  
  // Real Estate & Infrastructure
  "Real Estate": "#32CD32",
  "Real Estate Development": "#228B22",
  Infrastructure: "#3CB371",
  "Transportation Infrastructure": "#2E8B57",
  
  // Retail & Consumer
  Retail: "#9932CC",
  "Luxury Goods": "#8A2BE2",
  Fashion: "#9370DB",
  "Food & Beverages": "#BA55D3",
  
  // Technology & Digital
  Cybersecurity: "#4169E1",
  "Social Media": "#1E90FF",
  
  // Automotive & Transportation
  Automotive: "#483D8B",
  "Luxury Vehicles": "#6A5ACD",
  Aviation: "#4682B4",
  
  // Tourism & Hospitality
  Tourism: "#FF6347",
  "Tourism & Immigration": "#FF4500",
  "Immigration Services": "#FF7F50",
  Hospitality: "#FF7F50",
  
  // Art & Lifestyle
  Art: "#20B2AA",
  Lifestyle: "#48D1CC",
  Jewelry: "#8E44AD", // Purple for jewelry
  Collectibles: "#D35400", // Orange-brown for collectibles
  "Fine Art": "#1ABC9C", // Turquoise for fine art
  Antiques: "#996515", // Dark gold for antiques
  Watches: "#2471A3", // Deep blue for watches
  "Luxury Fashion": "#B03A2E", // Deep red for luxury fashion
  
  // Base industries
  "Real Estate": "#32CD32",
  Finance: "#FFD700",
  Banking: "#FF8C00",
  "Wealth Management": "#DAA520",
  
  // Event categories
  social: "#8E44AD", // Purple
  work: "#3498DB",   // Blue
  personal: "#2ECC71", // Green
  entertainment: "#E74C3C", // Red
  wellness: "#1ABC9C", // Turquoise
  education: "#F39C12", // Orange
}

// Function to get color for any industry or category
export function getIndustryColor(industry: string): string {
  return baseIndustryColors[industry] || generateConsistentColor(industry)
}

// Map of categories to Tailwind classes
export const categoryToTailwind: Record<string, string> = {
  Jewelry: "bg-purple-600",
  Collectibles: "bg-amber-600",
  Art: "bg-teal-600",
  "Fine Art": "bg-teal-700",
  "Private Art": "bg-teal-600",
  Lifestyle: "bg-cyan-600",
  Fashion: "bg-pink-600",
  "Luxury Fashion": "bg-pink-700",
  Watches: "bg-blue-600",
  Antiques: "bg-yellow-800",
  "Real Estate": "bg-green-600", 
  "Yacht": "bg-blue-600",
  "Luxury Yacht": "bg-blue-600",
  social: "bg-purple-600",
  work: "bg-blue-600",
  personal: "bg-green-600",
  entertainment: "bg-red-500",
  wellness: "bg-teal-500",
  education: "bg-amber-500",
}

// Map of categories to dark Tailwind classes
export const categoryToDarkTailwind: Record<string, string> = {
  Jewelry: "bg-purple-700",
  Collectibles: "bg-amber-700",
  Art: "bg-teal-700",
  "Fine Art": "bg-teal-800",
  "Private Art": "bg-teal-700",
  Lifestyle: "bg-cyan-700",
  Fashion: "bg-pink-700",
  "Luxury Fashion": "bg-pink-800",
  Watches: "bg-blue-700",
  Antiques: "bg-yellow-900",
  "Real Estate": "bg-green-700",
  "Yacht": "bg-blue-700",
  "Luxury Yacht": "bg-blue-700",
  social: "bg-purple-700",
  work: "bg-blue-700",
  personal: "bg-green-700",
  entertainment: "bg-red-600",
  wellness: "bg-teal-600",
  education: "bg-amber-600",
}

// Function to get Tailwind color classes for categories
export function getCategoryColorClass(category: string): string {
  return getCategoryColorClassWithFallback(category, categoryToTailwind, "bg-gray-600");
}

// Function to get Tailwind dark mode color classes for categories
export function getCategoryDarkColorClass(category: string): string {
  return getCategoryColorClassWithFallback(category, categoryToDarkTailwind, "bg-gray-700");
}

// Smart category matching function that handles case insensitivity and partial matches
function getCategoryColorClassWithFallback(
  category: string, 
  categoryMap: Record<string, string>, 
  fallback: string
): string {
  if (!category) return fallback;
  
  // Check for direct match
  if (categoryMap[category]) {
    return categoryMap[category];
  }
  
  // Try case-insensitive match
  const lowercaseCategory = category.toLowerCase();
  for (const [key, value] of Object.entries(categoryMap)) {
    if (key.toLowerCase() === lowercaseCategory) {
      return value;
    }
  }
  
  // Try partial match - for example "Luxury Yacht Showcase" should match "Luxury Yacht"
  for (const [key, value] of Object.entries(categoryMap)) {
    if (lowercaseCategory.includes(key.toLowerCase()) || key.toLowerCase().includes(lowercaseCategory)) {
      return value;
    }
  }
  
  return fallback;
}

// Common category mappings for display, to convert generic categories or extract from event titles
export const categoryMapping: Record<string, string> = {
  "realestate": "Real Estate",
  "real estate": "Real Estate",
  "watches": "Watches",
  "watch": "Watches",
  "art": "Fine Art",
  "fineart": "Fine Art",
  "private art": "Fine Art",
  "auction": "Art Auction",
  "yacht": "Luxury Yacht",
  "luxury yacht": "Luxury Yacht",
  "jewelry": "Jewelry",
  "collectibles": "Collectibles",
  "lifestyle": "Lifestyle",
  "fashion": "Fashion",
  "luxury fashion": "Luxury Fashion"
};

// Function to get display category from event title or category
export function getDisplayCategory(event: any): string {
  if (!event) return "Event";
  
  // If valid category exists, use it
  if (event.category && event.category !== "social" && 
      event.category !== "personal" && event.category !== "work") {
    return event.category;
  }
  
  // Try to extract category from title
  const titleLower = event.title ? event.title.toLowerCase() : "";
  for (const [key, value] of Object.entries(categoryMapping)) {
    if (titleLower.includes(key)) {
      return value;
    }
  }
  
  // Return original category or default
  return event.category || "Event";
}