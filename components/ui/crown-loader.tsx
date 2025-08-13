import { Crown } from "lucide-react"
import { useTheme } from "@/contexts/theme-context"

interface CrownLoaderProps {
  size?: "sm" | "md" | "lg"
  text?: string
}

export function CrownLoader({ size = "md", text = "Loading..." }: CrownLoaderProps) {
  const { theme } = useTheme()
  
  const sizeClasses = {
    sm: { container: "w-20 h-20", icon: "w-8 h-8", text: "text-sm", orbit: "w-24 h-24" },
    md: { container: "w-24 h-24", icon: "w-12 h-12", text: "text-base", orbit: "w-32 h-32" },
    lg: { container: "w-32 h-32", icon: "w-16 h-16", text: "text-lg", orbit: "w-40 h-40" }
  }

  const currentSize = sizeClasses[size]

  return (
    <div className="flex flex-col items-center justify-center space-y-3">
      <div className="relative">
        <style>
          {`
            @keyframes luxuryPulse {
              0%, 100% { 
                transform: scale(1);
                filter: brightness(1);
              }
              50% { 
                transform: scale(1.05);
                filter: brightness(1.2);
              }
            }
            
            
            @keyframes shimmer {
              0% { transform: translateX(-100%); }
              100% { transform: translateX(100%); }
            }
            
            @keyframes fadeInOut {
              0%, 100% { opacity: 0.3; }
              50% { opacity: 1; }
            }
          `}
        </style>
        

        {/* Premium glow rings */}
        <div 
          className={`absolute inset-0 ${currentSize.container} rounded-full`}
          style={{
            background: `radial-gradient(circle, transparent 60%, ${theme === "dark" ? "rgba(218, 165, 32, 0.1)" : "rgba(192, 192, 192, 0.1)"} 70%, transparent 100%)`,
            animation: "fadeInOut 3s ease-in-out infinite"
          }}
        />
        <div 
          className={`absolute inset-2 rounded-full`}
          style={{
            background: `radial-gradient(circle, transparent 50%, ${theme === "dark" ? "rgba(218, 165, 32, 0.05)" : "rgba(192, 192, 192, 0.05)"} 60%, transparent 100%)`,
            animation: "fadeInOut 3s ease-in-out infinite 1s"
          }}
        />

        {/* Main crown container */}
        <div
          className={`relative flex items-center justify-center ${currentSize.container} rounded-full`}
          style={{
            background: theme === "dark" 
              ? "linear-gradient(135deg, #1f1f1f 0%, #2a2a2a 25%, #1a1a1a 50%, #2a2a2a 75%, #1f1f1f 100%)"
              : "linear-gradient(135deg, #f8f8f8 0%, #e0e0e0 25%, #ffffff 50%, #e0e0e0 75%, #f8f8f8 100%)",
            border: theme === "dark" 
              ? "2px solid rgba(218, 165, 32, 0.3)" 
              : "2px solid rgba(192, 192, 192, 0.4)",
            boxShadow: theme === "dark"
              ? "0 0 30px rgba(218, 165, 32, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
              : "0 0 30px rgba(192, 192, 192, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.8)",
            animation: "luxuryPulse 2.5s ease-in-out infinite",
            backdropFilter: "blur(8px)"
          }}
        >
          {/* Shimmer effect overlay */}
          <div 
            className="absolute inset-0 rounded-full overflow-hidden"
            style={{
              background: `linear-gradient(90deg, transparent, ${theme === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.6)"}, transparent)`,
              animation: "shimmer 2s infinite"
            }}
          />
          
          {/* Crown Icon */}
          <Crown 
            className={`${currentSize.icon} relative z-10`}
            style={{
              color: theme === "dark" ? "#DAA520" : "#000000",
              filter: `drop-shadow(0 4px 12px ${theme === "dark" ? "rgba(218, 165, 32, 0.4)" : "rgba(0, 0, 0, 0.2)"})`
            }}
          />
        </div>
      </div>
      
      {text && (
        <div className="text-center space-y-1">
          <p className={`${currentSize.text} font-semibold ${
            theme === "dark" ? "text-white" : "text-black"
          }`}>
            {text}
          </p>
          <div className="flex justify-center space-x-1">
            <div 
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: theme === "dark" ? "#DAA520" : "#C0C0C0",
                animation: "fadeInOut 1.5s ease-in-out infinite"
              }}
            />
            <div 
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: theme === "dark" ? "#DAA520" : "#C0C0C0",
                animation: "fadeInOut 1.5s ease-in-out infinite 0.5s"
              }}
            />
            <div 
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: theme === "dark" ? "#DAA520" : "#C0C0C0",
                animation: "fadeInOut 1.5s ease-in-out infinite 1s"
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}