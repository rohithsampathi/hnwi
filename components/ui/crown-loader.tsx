import { Crown } from "lucide-react"
import { useTheme } from "@/contexts/theme-context"

interface CrownLoaderProps {
  size?: "sm" | "md" | "lg"
  text?: string
}

export function CrownLoader({ size = "md", text = "Loading..." }: CrownLoaderProps) {
  const { theme } = useTheme()
  
  const sizeClasses = {
    sm: { container: "w-16 h-16", icon: "w-8 h-8", text: "text-sm" },
    md: { container: "w-20 h-20", icon: "w-12 h-12", text: "text-base" },
    lg: { container: "w-24 h-24 md:w-28 md:h-28", icon: "w-12 h-12 md:w-14 md:h-14", text: "text-base md:text-lg" }
  }

  const currentSize = sizeClasses[size]

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="relative">
        {/* Clean Crown Icon with heartbeat animation */}
        <div
          className={`relative flex items-center justify-center ${currentSize.container}`}
          style={{
            animation: "heartbeat 2s ease-in-out infinite"
          }}
        >
          <style>
            {`
              @keyframes heartbeat {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.15); }
              }
            `}
          </style>
          
          {/* Subtle glow background */}
          <div 
            className="absolute inset-0 rounded-full premium-pulse"
            style={{
              background: `radial-gradient(circle, ${theme === "dark" ? "rgba(34, 197, 94, 0.2)" : "rgba(4, 120, 87, 0.2)"} 0%, transparent 70%)`,
              filter: "blur(8px)"
            }}
          />
          
          {/* Crown Icon */}
          <Crown 
            className={`${currentSize.icon} relative z-10 ${
              theme === "dark" ? "text-primary" : "text-primary"
            }`}
            style={{
              filter: `drop-shadow(0 4px 8px ${theme === "dark" ? "rgba(34, 197, 94, 0.3)" : "rgba(4, 120, 87, 0.3)"})`
            }}
          />
        </div>
      </div>
      
      {text && (
        <p className={`${currentSize.text} font-medium ${
          theme === "dark" ? "text-gray-300" : "text-gray-600"
        }`}>
          {text}
        </p>
      )}
    </div>
  )
}