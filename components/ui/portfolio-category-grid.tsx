"use client"

import React from "react"
import { Card, CardContent } from "@/components/ui/card"
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

const getCategoryColor = (index: number) => {
  const colors = [
    'from-green-500/20 to-green-600/20 border-green-500/30 text-green-600',
    'from-emerald-500/20 to-emerald-600/20 border-emerald-500/30 text-emerald-600',
    'from-amber-500/20 to-amber-600/20 border-amber-500/30 text-amber-600',
    'from-violet-500/20 to-violet-600/20 border-violet-500/30 text-violet-600',
    'from-red-500/20 to-red-600/20 border-red-500/30 text-red-600',
    'from-cyan-500/20 to-cyan-600/20 border-cyan-500/30 text-cyan-600',
    'from-lime-500/20 to-lime-600/20 border-lime-500/30 text-lime-600',
    'from-orange-500/20 to-orange-600/20 border-orange-500/30 text-orange-600'
  ]
  return colors[index % colors.length]
}

export function PortfolioCategoryGrid({ data, className = "" }: PortfolioCategoryGridProps) {
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
      {data.map((category, index) => (
        <Card 
          key={category.name} 
          className={`group relative overflow-hidden border bg-gradient-to-br ${getCategoryColor(index)} hover:scale-[1.02] transition-all duration-200 hover:shadow-lg cursor-pointer`}
        >
          <CardContent className="p-4">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="p-2 bg-white/10 backdrop-blur-sm rounded-lg group-hover:bg-white/20 transition-colors">
                {React.cloneElement(getCategoryIcon(category.name), { 
                  className: "w-5 h-5" 
                })}
              </div>
              
              <div className="space-y-1">
                <h3 className="font-semibold text-sm text-foreground leading-tight">
                  {formatCategoryName(category)}
                </h3>
                <p className="text-lg font-bold text-foreground">
                  {formatCurrency(category.value)}
                </p>
                <p className="text-xs text-muted-foreground font-medium">
                  {category.count} {category.count === 1 ? 'asset' : 'assets'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}