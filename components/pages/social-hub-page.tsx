// components/pages/social-hub-page.tsx

"use client"

import { Layout } from "@/components/layout/layout"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { ThemeProvider, useTheme } from "@/contexts/theme-context"
import { Heading2 } from "@/components/ui/typography"
import { Users } from "lucide-react"
import { SocialHub } from "@/components/social-hub"
import { Paragraph } from "@/components/ui/paragraph"
import { PremiumBadge } from "@/components/ui/premium-badge"

export function SocialHubPage({ onNavigate }: { onNavigate: (route: string) => void }) {
  const { theme } = useTheme();
  return (
    <Layout
        currentPage="social-hub"
        title={
          <div className="flex items-center space-x-2">
            <Users className={`w-6 h-6 ${theme === "dark" ? "text-primary" : "text-black"}`} />
            <Heading2 className={`${theme === "dark" ? "text-white" : "text-black"}`}>Social Hub</Heading2>
            <PremiumBadge>Beta</PremiumBadge>
          </div>
        }
        showBackButton
        onNavigate={onNavigate}
      >
        <div className="w-full">
          <div className="mb-8 -mt-2">
            <p className="text-muted-foreground text-base leading-tight">
              Where influence meets capital. Invitation verification required.
            </p>
          </div>
          <SocialHub />
        </div>
      </Layout>
  )
}

