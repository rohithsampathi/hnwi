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

// Base color mapping for known industries
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

  // Base industries
  "Real Estate": "#32CD32",
  Finance: "#FFD700",
  Banking: "#FF8C00",
  "Wealth Management": "#DAA520",
}

// Function to get color for any industry
export function getIndustryColor(industry: string): string {
  return baseIndustryColors[industry] || generateConsistentColor(industry)
}

