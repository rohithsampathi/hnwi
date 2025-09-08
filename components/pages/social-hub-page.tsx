// components/pages/social-hub-page.tsx

"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { ThemeProvider, useTheme } from "@/contexts/theme-context"
import { Heading2 } from "@/components/ui/typography"
import { PageHeaderWithBack } from "@/components/ui/back-button"
import { Users } from "lucide-react"
import { SocialHub } from "@/components/social-hub"
import { Paragraph } from "@/components/ui/paragraph"
import { PremiumBadge } from "@/components/ui/premium-badge"
import { PageWrapper } from "@/components/ui/page-wrapper"

export function SocialHubPage({ onNavigate }: { onNavigate: (route: string) => void }) {
  const { theme } = useTheme();
  return (
      <div className="w-full">
        <SocialHub />
      </div>
  )
}

