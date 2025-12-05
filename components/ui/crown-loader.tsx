import { Crown } from "lucide-react"

interface CrownLoaderProps {
  size?: "sm" | "md" | "lg"
  text?: string
  subtext?: string
}

export function CrownLoader({ size = "md", text = "Loading...", subtext }: CrownLoaderProps) {
  const sizeClasses = {
    sm: { icon: "w-8 h-8", text: "text-sm", subtext: "text-xs" },
    md: { icon: "w-12 h-12", text: "text-base", subtext: "text-sm" },
    lg: { icon: "w-16 h-16", text: "text-lg", subtext: "text-base" }
  }

  const currentSize = sizeClasses[size]

  return (
    <div className="flex flex-col items-center justify-center space-y-6">
      {/* Crown Icon with Premium Pulse */}
      <div className="relative flex items-center justify-center">
        <Crown
          className={`${currentSize.icon} text-primary premium-pulse`}
        />
      </div>

      {text && (
        <div className="text-center space-y-3">
          <h2 className={`${currentSize.text} font-semibold text-foreground tracking-wide`}>
            {text}
          </h2>

          {subtext && (
            <p className={`${currentSize.subtext} text-muted-foreground font-medium`}>
              {subtext}
            </p>
          )}

          {/* Premium Loading Dots */}
          <div className="flex justify-center gap-2 mt-4">
            <div className="w-2 h-2 rounded-full bg-primary premium-pulse" />
            <div className="w-2 h-2 rounded-full bg-primary premium-pulse" style={{ animationDelay: '0.6s' }} />
            <div className="w-2 h-2 rounded-full bg-primary premium-pulse" style={{ animationDelay: '1.2s' }} />
          </div>
        </div>
      )}
    </div>
  )
}