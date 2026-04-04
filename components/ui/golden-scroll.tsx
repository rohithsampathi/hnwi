"use client"

import { cn } from "@/lib/utils"

interface GoldenScrollProps {
  children: React.ReactNode
  className?: string
  maxHeight?: string
  showAfter?: number // Number of items after which scroll should appear
}

export function GoldenScroll({ 
  children, 
  className = "", 
  maxHeight = "400px",
  showAfter 
}: GoldenScrollProps) {
  return (
    <div 
      className={cn(
        "golden-scroll overflow-y-auto",
        className
      )}
      style={{ maxHeight }}
    >
      {children}
    </div>
  )
}

// Hook for consistent scroll styling across the app
export function useGoldenScroll() {
  const getScrollStyles = () => ({})
  
  const getScrollClasses = () => "golden-scroll overflow-y-auto"
  
  return { getScrollStyles, getScrollClasses }
}
