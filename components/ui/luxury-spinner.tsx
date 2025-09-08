import { useTheme } from "@/contexts/theme-context"

interface LuxurySpinnerProps {
  size?: "xs" | "sm" | "md" | "lg"
  text?: string
}

export function LuxurySpinner({ size = "md", text }: LuxurySpinnerProps) {
  const { theme } = useTheme()
  
  const sizeClasses = {
    xs: { spinner: "w-4 h-4", text: "text-xs" },
    sm: { spinner: "w-6 h-6", text: "text-sm" },
    md: { spinner: "w-8 h-8", text: "text-base" },
    lg: { spinner: "w-12 h-12", text: "text-lg" }
  }

  const currentSize = sizeClasses[size]
  
  // Luxury colors matching app theme
  const primaryColor = theme === "dark" ? "#DAA520" : "#000000"
  const primaryColorRgba = theme === "dark" ? "218, 165, 32" : "0, 0, 0"
  const textColor = theme === "dark" ? "text-white" : "text-black"

  return (
    <div className="flex items-center justify-center space-x-3">
      <div className="relative">
        <style>
          {`
            @keyframes luxurySpin {
              0% { 
                transform: rotate(0deg);
                opacity: 1;
              }
              25% { 
                opacity: 0.8;
              }
              50% { 
                transform: rotate(180deg);
                opacity: 1;
              }
              75% { 
                opacity: 0.8;
              }
              100% { 
                transform: rotate(360deg);
                opacity: 1;
              }
            }

            @keyframes luxuryPulse {
              0%, 100% { 
                opacity: 0.6;
                transform: scale(0.95);
              }
              50% { 
                opacity: 1;
                transform: scale(1.05);
              }
            }
          `}
        </style>

        {/* Luxury Spinning Ring */}
        <div 
          className={`${currentSize.spinner} rounded-full border-2`}
          style={{
            borderColor: `rgba(${primaryColorRgba}, 0.2)`,
            borderTopColor: primaryColor,
            borderRightColor: primaryColor,
            animation: "luxurySpin 1.2s ease-in-out infinite"
          }}
        />

        {/* Inner Glow */}
        <div 
          className={`absolute inset-1 rounded-full`}
          style={{
            background: `radial-gradient(circle, rgba(${primaryColorRgba}, 0.1), transparent 70%)`,
            animation: "luxuryPulse 2s ease-in-out infinite"
          }}
        />
      </div>
      
      {text && (
        <span className={`${currentSize.text} font-medium ${textColor} font-heading`}>
          {text}
        </span>
      )}
    </div>
  )
}