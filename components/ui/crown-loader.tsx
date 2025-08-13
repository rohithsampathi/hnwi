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
            @keyframes heartbeatBlink {
              0%, 100% { 
                opacity: 1;
                transform: scale(1);
              }
              20% { 
                opacity: 0.3;
                transform: scale(1.15);
              }
              40% { 
                opacity: 1;
                transform: scale(1);
              }
              50% { 
                opacity: 0.4;
                transform: scale(1.1);
              }
              70% { 
                opacity: 1;
                transform: scale(1);
              }
            }
            
            @keyframes fadeInOut {
              0%, 100% { opacity: 0.3; }
              50% { opacity: 1; }
            }
          `}
        </style>

        {/* Crown Icon with Heartbeat Blink */}
        <Crown 
          className={`${currentSize.icon} relative z-10`}
          style={{
            color: theme === "dark" ? "#DAA520" : "#000000",
            filter: `drop-shadow(0 4px 12px ${theme === "dark" ? "rgba(218, 165, 32, 0.4)" : "rgba(0, 0, 0, 0.2)"})`,
            animation: "heartbeatBlink 3s ease-in-out infinite"
          }}
        />
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