"use client"

import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { useTheme } from "@/contexts/theme-context"
import { getSubtleCardStyle } from "@/lib/colors"
import { 
  Building2, 
  Car, 
  Gem, 
  Palette, 
  Bitcoin,
  TrendingUp,
  Briefcase,
  Home,
  Plane,
  Shield,
  Vault
} from "lucide-react"

interface CategoryData {
  name: string
  displayName?: string  // Optional improved display name
  value: number
  count: number
  percentage: string
}

interface PortfolioCategoryGridProps {
  data: CategoryData[]
  className?: string
}

const getCategoryIcon = (categoryName: string) => {
  const name = categoryName.toLowerCase()
  
  if (name.includes('real_estate') || name.includes('property') || name.includes('land')) {
    return <Home className="w-8 h-8" />
  }
  if (name.includes('crypto') || name.includes('bitcoin') || name.includes('ethereum')) {
    return <Bitcoin className="w-8 h-8" />
  }
  if (name.includes('stock') || name.includes('equity') || name.includes('share')) {
    return <TrendingUp className="w-8 h-8" />
  }
  if (name.includes('business') || name.includes('company') || name.includes('enterprise')) {
    return <Building2 className="w-8 h-8" />
  }
  if (name.includes('vehicle') || name.includes('car') || name.includes('auto')) {
    return <Car className="w-8 h-8" />
  }
  if (name.includes('art') || name.includes('collectible') || name.includes('antique')) {
    return <Palette className="w-8 h-8" />
  }
  if (name.includes('jewelry') || name.includes('gem') || name.includes('diamond')) {
    return <Gem className="w-8 h-8" />
  }
  if (name.includes('investment') || name.includes('portfolio')) {
    return <Briefcase className="w-8 h-8" />
  }
  if (name.includes('private') || name.includes('jet') || name.includes('yacht')) {
    return <Plane className="w-8 h-8" />
  }
  
  // Default icon
  return <Shield className="w-8 h-8" />
}

const getCategoryAccentColor = (index: number, theme: 'light' | 'dark') => {
  // Using secondary black shades for dark mode, varied grays for light mode
  const darkColors = [
    'text-gray-300 border-gray-600/30',
    'text-gray-400 border-gray-500/30', 
    'text-gray-200 border-gray-700/30',
    'text-gray-350 border-gray-550/30',
    'text-gray-250 border-gray-650/30',
    'text-gray-300 border-gray-600/25',
    'text-gray-400 border-gray-500/25',
    'text-gray-200 border-gray-700/25'
  ]
  
  const lightColors = [
    'text-gray-700 border-gray-300/40',
    'text-gray-800 border-gray-400/40',
    'text-gray-600 border-gray-350/40',
    'text-gray-750 border-gray-450/40',
    'text-gray-650 border-gray-325/40',
    'text-gray-700 border-gray-300/35',
    'text-gray-800 border-gray-400/35',
    'text-gray-600 border-gray-350/35'
  ]
  
  const colors = theme === 'dark' ? darkColors : lightColors
  return colors[index % colors.length]
}

export function PortfolioCategoryGrid({ data, className = "" }: PortfolioCategoryGridProps) {
  const { theme } = useTheme()
  const formatCurrency = (value: number) => {
    if (!value || value === 0) {
      return '$0'
    }
    if (value >= 1000000000) {
      return `$${(value / 1000000000).toFixed(1)}B`
    } else if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`
    }
    return `$${value.toLocaleString()}`
  }

  const formatCategoryName = (category: CategoryData) => {
    // Use displayName if available, otherwise format the name
    return category.displayName || category.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }


  if (!data || data.length === 0) {
    return (
      <div className={`flex items-center justify-center py-8 ${className}`}>
        <div className="text-center space-y-3">
          <Vault className="w-16 h-16 text-muted-foreground mx-auto opacity-50" />
          <div>
            <p className="text-lg font-medium text-muted-foreground">No Assets Yet</p>
            <p className="text-sm text-muted-foreground/70">Start building your Crown Vault portfolio</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 ${className}`}>
      {data.map((category, index) => {
        const subtleStyle = getSubtleCardStyle(theme);
        const accentColors = getCategoryAccentColor(index, theme);
        
        return (
          <Card 
            key={category.name} 
            className={`group relative overflow-hidden ${subtleStyle.className} ${accentColors} hover:scale-[1.02] transition-all duration-200 cursor-pointer`}
            style={subtleStyle.style}
          >
            <CardContent className="p-4">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className={`p-2 ${theme === 'dark' ? 'bg-gray-700/20' : 'bg-gray-200/50'} backdrop-blur-sm rounded-lg group-hover:bg-opacity-30 transition-colors`}>
                  {React.cloneElement(getCategoryIcon(category.name), { 
                    className: `w-5 h-5 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}` 
                  })}
                </div>
                
                <div className="space-y-1">
                  <h3 className={`font-semibold text-sm leading-tight ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                    {formatCategoryName(category)}
                  </h3>
                  <p className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                    {formatCurrency(category.value)}
                  </p>
                  <p className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {category.count} {category.count === 1 ? 'asset' : 'assets'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}