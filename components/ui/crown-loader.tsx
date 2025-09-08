import { Crown } from "lucide-react"
import { useTheme } from "@/contexts/theme-context"

interface CrownLoaderProps {
  size?: "sm" | "md" | "lg"
  text?: string
  subtext?: string
}

export function CrownLoader({ size = "md", text = "Loading...", subtext }: CrownLoaderProps) {
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
      <div className="relative flex items-center justify-center">
        <style>
          {`
            @keyframes luxuryCrownPulse {
              0%, 100% { 
                opacity: 1;
                transform: scale(1);
              }
              25% { 
                opacity: 0.6;
                transform: scale(1.1);
              }
              50% { 
                opacity: 1;
                transform: scale(1.15);
              }
              75% { 
                opacity: 0.7;
                transform: scale(1.08);
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

            @keyframes luxuryGlow {
              0%, 100% { 
                opacity: 0.2;
                transform: scale(0.95);
              }
              50% { 
                opacity: 0.4;
                transform: scale(1.05);
              }
            }

            @keyframes luxuryOrbitRing {
              0% { 
                transform: rotate(0deg) translateX(-50%) translateY(-50%);
                opacity: 0.1;
              }
              50% {
                opacity: 0.3;
              }
              100% { 
                transform: rotate(360deg) translateX(-50%) translateY(-50%);
                opacity: 0.1;
              }
            }

            @keyframes luxuryShimmer {
              0% { 
                transform: translateX(-100%);
                opacity: 0;
              }
              50% {
                opacity: 1;
              }
              100% { 
                transform: translateX(100%);
                opacity: 0;
              }
            }
          `}
        </style>

        {/* Luxury Glow Background */}
        <div 
          className={`absolute ${currentSize.orbit} rounded-full`}
          style={{
            background: `radial-gradient(circle, rgba(${primaryColorRgba}, 0.15), rgba(${primaryColorRgba}, 0.05) 50%, transparent 80%)`,
            animation: "luxuryGlow 4s ease-in-out infinite",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)"
          }}
        />

        {/* Outer Ring with rotation */}
        <div 
          className={`absolute ${currentSize.orbit} rounded-full border`}
          style={{
            borderColor: `rgba(${primaryColorRgba}, 0.2)`,
            borderWidth: '1px',
            animation: "luxuryOrbitRing 8s linear infinite",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)"
          }}
        />

        {/* Crown Icon with Luxury Pulse - No container box */}
        <Crown 
          className={`${currentSize.icon} relative z-10`}
          style={{
            color: primaryColor,
            filter: `drop-shadow(0 4px 16px rgba(${primaryColorRgba}, 0.5)) drop-shadow(0 8px 32px rgba(${primaryColorRgba}, 0.3)) drop-shadow(0 0 24px rgba(${primaryColorRgba}, 0.4))`,
            animation: "luxuryCrownPulse 3.5s ease-in-out infinite"
          }}
        />
      </div>
      
      {text && (
        <div className="text-center space-y-2">
          <div 
            className={`${currentSize.text} font-semibold ${textColor} font-heading`}
            style={{
              backgroundImage: theme === "dark" 
                ? `linear-gradient(135deg, ${primaryColor}, #B8860B, ${primaryColor})`
                : "none",
              backgroundColor: theme === "dark" ? "transparent" : primaryColor,
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
          <div className="flex justify-center space-x-2 mt-4">
            <div 
              className="w-2 h-2 rounded-full relative"
              style={{
                background: `linear-gradient(135deg, ${primaryColor}, rgba(${primaryColorRgba}, 0.6))`,
                boxShadow: `0 0 8px rgba(${primaryColorRgba}, 0.4), 0 0 16px rgba(${primaryColorRgba}, 0.2)`,
                animation: "luxuryDots 1.8s ease-in-out infinite"
              }}
            />
            <div 
              className="w-2 h-2 rounded-full relative"
              style={{
                background: `linear-gradient(135deg, ${primaryColor}, rgba(${primaryColorRgba}, 0.6))`,
                boxShadow: `0 0 8px rgba(${primaryColorRgba}, 0.4), 0 0 16px rgba(${primaryColorRgba}, 0.2)`,
                animation: "luxuryDots 1.8s ease-in-out infinite 0.6s"
              }}
            />
            <div 
              className="w-2 h-2 rounded-full relative"
              style={{
                background: `linear-gradient(135deg, ${primaryColor}, rgba(${primaryColorRgba}, 0.6))`,
                boxShadow: `0 0 8px rgba(${primaryColorRgba}, 0.4), 0 0 16px rgba(${primaryColorRgba}, 0.2)`,
                animation: "luxuryDots 1.8s ease-in-out infinite 1.2s"
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}