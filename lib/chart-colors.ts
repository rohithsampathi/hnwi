// Luxury color palette for charts, bubbles, and visualizations
export const LUXURY_COLOR_PALETTE = [
  '#DAA520',  // Rich Gold - primary luxury color
  '#DC2626',  // Deep Red - classic wealth color
  '#059669',  // Rich Emerald - premium green
  '#7C3AED',  // Royal Purple - luxury accent
  '#EA580C',  // Burnt Orange - sophisticated warmth
  '#0284C7',  // Deep Blue - trust and stability
  '#BE185D',  // Rich Magenta - premium accent
  '#065F46',  // Forest Green - wealth/growth
  '#B45309',  // Rich Amber - luxury variant
  '#4338CA',  // Deep Indigo - premium blue
  '#BE123C',  // Crimson Red - luxury red
  '#047857',  // Deep Teal - sophisticated green
  '#9333EA',  // Rich Violet - premium purple
  '#C2410C',  // Terracotta - earthy luxury
  '#1D4ED8',  // Rich Blue - premium variant
  '#A21CAF',  // Rose - elegant accent
  '#0D9488',  // Dark Green - wealth tone
  '#7C2D12',  // Rich Brown - luxury earth
  '#581C87',  // Deep Purple - royal variant
  '#92400E',  // Golden Brown - premium earth
  '#1E40AF',  // Navy Blue - trust variant
  '#991B1B',  // Dark Red - luxury crimson
  '#15803D',  // Emerald Green - growth
  '#7C3AED',  // Amethyst - luxury purple
  '#DC2626',  // Ruby Red - premium red
  '#0369A1',  // Sapphire Blue - trust blue
  '#CA8A04',  // Topaz Gold - luxury gold
  '#9333EA',  // Orchid Purple - elegant
  '#DC2626',  // Garnet Red - deep red
  '#059669',  // Jade Green - prosperity
  '#1F2937',  // Onyx - sophisticated dark
  '#6366F1',  // Lapis Blue - royal blue
  '#F59E0B',  // Amber - warm luxury
  '#8B5CF6',  // Lavender - soft luxury
  '#EF4444',  // Coral Red - vibrant
  '#10B981',  // Mint Green - fresh wealth
  '#3B82F6',  // Sky Blue - open trust
  '#F97316',  // Sunset Orange - warmth
  '#8B5CF6',  // Violet - elegance
  '#14B8A6',  // Teal - balance
  '#F59E0B',  // Gold - prosperity
  '#6366F1',  // Indigo - depth
  '#EF4444',  // Red - power
  '#10B981',  // Green - growth
  '#3B82F6',  // Blue - stability
  '#F97316',  // Orange - energy
  '#8B5CF6',  // Purple - luxury
  '#14B8A6',  // Cyan - innovation
  '#F59E0B',  // Yellow - optimism
  '#6B7280'   // Gray - sophistication
];

export const getLuxuryColor = (index: number): string => {
  return LUXURY_COLOR_PALETTE[index % LUXURY_COLOR_PALETTE.length];
};