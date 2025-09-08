import { Shield } from "lucide-react"
import { useTheme } from "@/contexts/theme-context"

interface LuxuryShieldLoaderProps {
  size?: "sm" | "md" | "lg"
  text?: string
  subtext?: string
}

export function LuxuryShieldLoader({ size = "md", text = "Authenticating...", subtext = "Securing your elite connection" }: LuxuryShieldLoaderProps) {
  const { theme } = useTheme()
  
  const sizeClasses = {
    sm: { container: "w-20 h-20", icon: "w-8 h-8", text: "text-sm", subtext: "text-xs", orbit: "w-24 h-24" },
    md: { container: "w-24 h-24", icon: "w-12 h-12", text: "text-base", subtext: "text-sm", orbit: "w-32 h-32" },
    lg: { container: "w-32 h-32", icon: "w-16 h-16", text: "text-lg", subtext: "text-base", orbit: "w-40 h-40" }
  }

  const currentSize = sizeClasses[size]
  
  // Luxury colors matching app theme
  const primaryColor = theme === "dark" ? "#DAA520" : "#000000" // Gold in dark, Black in light
  const primaryColorRgba = theme === "dark" ? "218, 165, 32" : "0, 0, 0"
  const textColor = theme === "dark" ? "text-white" : "text-black"
  const subtextColor = theme === "dark" ? "text-gray-400" : "text-gray-600"

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="relative">
        <style>
          {`
            @keyframes luxuryShieldPulse {
              0%, 100% { 
                opacity: 1;
                transform: scale(1);
              }
              25% { 
                opacity: 0.7;
                transform: scale(1.05);
              }
              50% { 
                opacity: 1;
                transform: scale(1.1);
              }
              75% { 
                opacity: 0.8;
                transform: scale(1.05);
              }
            }
            
            @keyframes luxuryOrbitGlow {
              0%, 100% { 
                opacity: 0.3;
                transform: scale(1);
              }
              50% { 
                opacity: 0.6;
                transform: scale(1.1);
              }
            }

            @keyframes luxuryDots {
              0%, 100% { opacity: 0.4; }
              50% { opacity: 1; }
            }

            @keyframes luxuryGradientShift {
              0%, 100% {
                background-position: 0% 50%;
              }
              50% {
                background-position: 100% 50%;
              }
            }
          `}
        </style>

        {/* Luxury Glow Ring */}
        <div 
          className={`absolute inset-0 ${currentSize.orbit} rounded-full`}
          style={{
            background: `conic-gradient(from 0deg, transparent, rgba(${primaryColorRgba}, 0.4), transparent)`,
            animation: "luxuryOrbitGlow 3s ease-in-out infinite, spin 6s linear infinite",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)"
          }}
        />

        {/* Secondary Ring */}
        <div 
          className={`absolute inset-0 ${currentSize.orbit} rounded-full border-2`}
          style={{
            borderColor: `rgba(${primaryColorRgba}, 0.2)`,
            animation: "luxuryOrbitGlow 2s ease-in-out infinite reverse",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)"
          }}
        />

        {/* Shield Icon with Luxury Animation */}
        <Shield 
          className={`${currentSize.icon} relative z-10`}
          style={{
            color: primaryColor,
            filter: `drop-shadow(0 4px 12px rgba(${primaryColorRgba}, 0.4)) drop-shadow(0 8px 24px rgba(${primaryColorRgba}, 0.2))`,
            animation: "luxuryShieldPulse 3s ease-in-out infinite"
          }}
        />
      </div>
      
      {text && (
        <div className="text-center space-y-2">
          <div 
            className={`${currentSize.text} font-semibold ${textColor} font-heading`}
            style={{
              background: theme === "dark" 
                ? `linear-gradient(135deg, ${primaryColor}, #B8860B, ${primaryColor})`
                : primaryColor,
              backgroundSize: "200% 200%",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: theme === "dark" ? "transparent" : primaryColor,
              animation: theme === "dark" ? "luxuryGradientShift 4s ease-in-out infinite" : "none"
            }}
          >
            {text}
          </div>
          
          {subtext && (
            <p className={`${currentSize.subtext} ${subtextColor} font-medium opacity-80`}>
              {subtext}
            </p>
          )}
          
          {/* Luxury Loading Dots */}
          <div className="flex justify-center space-x-1 mt-3">
            <div 
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: primaryColor,
                animation: "luxuryDots 1.8s ease-in-out infinite"
              }}
            />
            <div 
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: primaryColor,
                animation: "luxuryDots 1.8s ease-in-out infinite 0.6s"
              }}
            />
            <div 
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: primaryColor,
                animation: "luxuryDots 1.8s ease-in-out infinite 1.2s"
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}