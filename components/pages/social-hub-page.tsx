// components/pages/social-hub-page.tsx

"use client"

import { Layout } from "@/components/layout/layout"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { ThemeProvider } from "@/contexts/theme-context"
import { Heading2 } from "@/components/ui/typography"
import { Users } from "lucide-react"
import { SocialHub } from "@/components/social-hub"
import { Paragraph } from "@/components/ui/paragraph"
import { Badge } from "@/components/ui/badge"
import { LiveButton } from "@/components/live-button"

export function SocialHubPage({ onNavigate }: { onNavigate: (route: string) => void }) {
  return (
    <Layout
        title={
          <div className="flex items-center space-x-2">
            <Users className="w-6 h-6 text-primary" />
            <Heading2>Social Hub</Heading2>
            <Badge className="bg-primary">Beta</Badge>
            <LiveButton />
          </div>
        }
        showBackButton
        onNavigate={onNavigate}
      >
        <div className="w-full">
          <div className="mb-6">
            <div className="flex items-center gap-2">
              <Heading2 className="text-2xl font-bold text-primary">The Social Hub</Heading2>
              <Badge className="bg-primary">Beta</Badge>
              <LiveButton />
            </div>
            <Paragraph className="font-body tracking-wide text-xl text-muted-foreground mt-2">
              Connect with the elite HNWI community and explore exclusive events
            </Paragraph>
          </div>
          <SocialHub />
        </div>
      </Layout>
  )
}

