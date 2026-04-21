import {
  BadgeCheck,
  Fingerprint,
  GlobeLock,
  KeyRound,
  LockKeyhole,
  ShieldCheck,
  WalletCards,
} from "lucide-react"
import { Paragraph } from "@/components/ui/typography"

const SECURITY_BADGES = [
  {
    icon: ShieldCheck,
    label: "SOC 2-STYLE CONTROLS",
  },
  {
    icon: BadgeCheck,
    label: "ISO-ALIGNED CONTROLS",
  },
  {
    icon: WalletCards,
    label: "PCI DSS",
  },
  {
    icon: GlobeLock,
    label: "GDPR PRIVACY GATES",
  },
  {
    icon: Fingerprint,
    label: "PRIVACY RIGHTS",
  },
  {
    icon: KeyRound,
    label: "AES-256",
  },
  {
    icon: LockKeyhole,
    label: "ZERO-TRUST",
  },
] as const

function SecurityBadge({ badge }: { badge: (typeof SECURITY_BADGES)[number] }) {
  const Icon = badge.icon

  return (
    <div className="flex items-center justify-center min-w-fit px-4 py-3 bg-card/95 backdrop-blur-sm rounded-lg border border-border/30 shadow-md">
      <Icon className="mr-2 h-5 w-5 opacity-80" aria-hidden="true" />
      <span className="text-foreground font-bold text-sm tracking-tight">{badge.label}</span>
    </div>
  )
}

export function SecurityArchitectureStrip({
  title = "Enterprise Security Architecture",
}: {
  title?: string
}) {
  return (
    <div className="w-full flex justify-center py-6 md:py-8 border-t border-border/20">
      <div className="w-full max-w-7xl px-4">
        <p className="text-center text-base md:text-lg font-medium text-muted-foreground mb-6 md:mb-8">
          {title}
        </p>

        <div className="relative overflow-hidden w-full h-20">
          <div
            className="absolute flex animate-scroll space-x-8 md:space-x-12 whitespace-nowrap"
            style={{ animationDuration: "30s" }}
          >
            {[...SECURITY_BADGES, ...SECURITY_BADGES].map((badge, index) => (
              <SecurityBadge
                key={`${badge.label}-${index}`}
                badge={badge}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function SplashScreenFooter() {
  return (
    <footer className="w-full py-4 md:py-6 px-4 text-center z-10 bg-background/80 backdrop-blur-sm border-t border-border/20">
      <div className="max-w-2xl mx-auto space-y-1 md:space-y-2">
        <Paragraph className="text-[10px] md:text-xs text-muted-foreground leading-tight">
          A product of <span className="font-semibold text-primary">Montaigne</span>
        </Paragraph>
        <Paragraph className="text-[10px] md:text-xs text-muted-foreground leading-tight">
          © 2026 All Rights Reserved. HNWI Chronicles.
        </Paragraph>
      </div>
    </footer>
  )
}
