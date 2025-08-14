"use client"

import { cn } from "@/lib/utils"
import { useTheme } from "@/contexts/theme-context"

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
  const { theme } = useTheme()
  
  return (
    <div 
      className={cn(
        "golden-scroll overflow-y-auto",
        className
      )}
      style={{ 
        maxHeight,
        // Custom scrollbar styling
        scrollbarWidth: "thin",
        scrollbarColor: theme === 'dark' 
          ? "#DAA520 rgba(218, 165, 32, 0.1)" 
          : "#C0C0C0 rgba(192, 192, 192, 0.1)"
      }}
    >
      {children}
      
      <style jsx>{`
        .golden-scroll::-webkit-scrollbar {
          width: 8px;
        }
        
        .golden-scroll::-webkit-scrollbar-track {
          background: ${theme === 'dark' 
            ? 'rgba(218, 165, 32, 0.1)' 
            : 'rgba(192, 192, 192, 0.1)'};
          border-radius: 4px;
          margin: 4px;
        }
        
        .golden-scroll::-webkit-scrollbar-thumb {
          background: ${theme === 'dark' 
            ? 'linear-gradient(to bottom, #DAA520, #B8860B)' 
            : 'linear-gradient(to bottom, #C0C0C0, #A0A0A0)'};
          border-radius: 4px;
          border: 1px solid ${theme === 'dark' 
            ? 'rgba(218, 165, 32, 0.3)' 
            : 'rgba(192, 192, 192, 0.3)'};
          box-shadow: ${theme === 'dark' 
            ? '0 0 8px rgba(218, 165, 32, 0.3)' 
            : '0 0 8px rgba(192, 192, 192, 0.3)'};
          position: relative;
        }
        
        .golden-scroll::-webkit-scrollbar-thumb::before {
          content: '$';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: ${theme === 'dark' ? '#000' : '#fff'};
          font-size: 10px;
          font-weight: bold;
          pointer-events: none;
        }
        
        .golden-scroll::-webkit-scrollbar-thumb:hover {
          background: ${theme === 'dark' 
            ? 'linear-gradient(to bottom, #FFD700, #DAA520)' 
            : 'linear-gradient(to bottom, #D3D3D3, #C0C0C0)'};
          box-shadow: ${theme === 'dark' 
            ? '0 0 12px rgba(218, 165, 32, 0.5)' 
            : '0 0 12px rgba(192, 192, 192, 0.5)'};
        }
        
        .golden-scroll::-webkit-scrollbar-thumb:active {
          background: ${theme === 'dark' 
            ? 'linear-gradient(to bottom, #FFD700, #FFA500)' 
            : 'linear-gradient(to bottom, #E6E6E6, #D3D3D3)'};
        }
        
        /* Custom scrollbar corner */
        .golden-scroll::-webkit-scrollbar-corner {
          background: transparent;
        }
      `}</style>
    </div>
  )
}

// Hook for consistent scroll styling across the app
export function useGoldenScroll() {
  const { theme } = useTheme()
  
  const getScrollStyles = () => ({
    scrollbarWidth: "thin" as const,
    scrollbarColor: theme === 'dark' 
      ? "#DAA520 rgba(218, 165, 32, 0.1)" 
      : "#C0C0C0 rgba(192, 192, 192, 0.1)"
  })
  
  const getScrollClasses = () => "golden-scroll overflow-y-auto"
  
  return { getScrollStyles, getScrollClasses }
}