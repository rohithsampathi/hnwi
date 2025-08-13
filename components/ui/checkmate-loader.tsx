import { useTheme } from "@/contexts/theme-context"

interface CheckmateLoaderProps {
  size?: "sm" | "md" | "lg"
  text?: string
}

export function CheckmateLoader({ size = "md", text = "Loading..." }: CheckmateLoaderProps) {
  const { theme } = useTheme()
  
  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24", 
    lg: "w-32 h-32"
  }
  
  const textSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg"
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className={`relative ${sizeClasses[size]}`}>
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Chessboard background pattern */}
          <defs>
            <pattern
              id="chessboard"
              patternUnits="userSpaceOnUse"
              width="20"
              height="20"
            >
              <rect width="10" height="10" fill={theme === "dark" ? "#374151" : "#4a4a4a"} />
              <rect x="10" y="10" width="10" height="10" fill={theme === "dark" ? "#374151" : "#4a4a4a"} />
              <rect x="10" y="0" width="10" height="10" fill={theme === "dark" ? "#1f2937" : "#2a2a2a"} />
              <rect x="0" y="10" width="10" height="10" fill={theme === "dark" ? "#1f2937" : "#2a2a2a"} />
            </pattern>
          </defs>
          
          <circle
            cx="100"
            cy="100"
            r="95"
            fill="url(#chessboard)"
            opacity="0.3"
            className="animate-spin"
            style={{ animationDuration: "8s" }}
          />
          
          {/* Falling king (defeated) */}
          <g className="animate-bounce" style={{ animationDuration: "2s", transformOrigin: "140px 120px" }}>
            <g transform="translate(140, 120) rotate(45)">
              {/* King base */}
              <rect
                x="-8"
                y="10"
                width="16"
                height="8"
                fill={theme === "dark" ? "#6b7280" : "#1a1a1a"}
              />
              {/* King body */}
              <rect
                x="-6"
                y="0"
                width="12"
                height="15"
                fill={theme === "dark" ? "#6b7280" : "#1a1a1a"}
              />
              {/* Crown */}
              <path
                d="M-6,-5 L-3,-10 L0,-7 L3,-10 L6,-5 L6,0 L-6,0 Z"
                fill={theme === "dark" ? "#6b7280" : "#1a1a1a"}
              />
              {/* Cross on crown */}
              <rect x="-1" y="-12" width="2" height="8" fill={theme === "dark" ? "#9ca3af" : "#333333"} />
              <rect x="-3" y="-10" width="6" height="2" fill={theme === "dark" ? "#9ca3af" : "#333333"} />
            </g>
          </g>
          
          {/* Standing victorious king */}
          <g className="animate-pulse" style={{ animationDuration: "1.5s", transformOrigin: "60px 120px" }}>
            <g transform="translate(60, 120)">
              {/* King base */}
              <rect
                x="-10"
                y="10"
                width="20"
                height="10"
                fill={theme === "dark" ? "#fbbf24" : "#f59e0b"}
              />
              {/* King body */}
              <rect
                x="-8"
                y="-5"
                width="16"
                height="20"
                fill={theme === "dark" ? "#fbbf24" : "#f59e0b"}
              />
              {/* Crown */}
              <path
                d="M-8,-10 L-4,-18 L0,-12 L4,-18 L8,-10 L8,-5 L-8,-5 Z"
                fill={theme === "dark" ? "#fbbf24" : "#f59e0b"}
              />
              {/* Cross on crown */}
              <rect x="-1.5" y="-22" width="3" height="12" fill={theme === "dark" ? "#fde047" : "#eab308"} />
              <rect x="-4" y="-19" width="8" height="3" fill={theme === "dark" ? "#fde047" : "#eab308"} />
              
              {/* Victory sparkles */}
              <circle cx="-15" cy="-15" r="1" fill={theme === "dark" ? "#fde047" : "#eab308"} className="animate-ping" />
              <circle cx="15" cy="-10" r="1" fill={theme === "dark" ? "#fde047" : "#eab308"} className="animate-ping" style={{ animationDelay: "0.5s" }} />
              <circle cx="18" cy="5" r="1" fill={theme === "dark" ? "#fde047" : "#eab308"} className="animate-ping" style={{ animationDelay: "1s" }} />
            </g>
          </g>
          
          {/* Rotating crown effect around the loader */}
          <g className="animate-spin" style={{ animationDuration: "3s", transformOrigin: "100px 100px" }}>
            <circle cx="160" cy="100" r="2" fill={theme === "dark" ? "#fbbf24" : "#f59e0b"} opacity="0.7" />
            <circle cx="100" cy="40" r="2" fill={theme === "dark" ? "#fbbf24" : "#f59e0b"} opacity="0.7" />
            <circle cx="40" cy="100" r="2" fill={theme === "dark" ? "#fbbf24" : "#f59e0b"} opacity="0.7" />
            <circle cx="100" cy="160" r="2" fill={theme === "dark" ? "#fbbf24" : "#f59e0b"} opacity="0.7" />
          </g>
        </svg>
      </div>
      
      {text && (
        <p className={`${textSizes[size]} font-medium text-muted-foreground animate-pulse`}>
          {text}
        </p>
      )}
    </div>
  )
}