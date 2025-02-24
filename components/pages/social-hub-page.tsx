// components/pages/social-hub-page.tsx

"use client"

import { Layout } from "@/components/layout/layout"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { ThemeProvider } from "@/contexts/theme-context"
import { Heading2 } from "@/components/ui/typography"
import { Users } from "lucide-react"
import { SocialHub } from "@/components/social-hub"
import { Paragraph } from "@/components/ui/paragraph"

export function SocialHubPage({ onNavigate }: { onNavigate: (route: string) => void }) {
  return (
    <ThemeProvider>
      <Layout
        title={
          <div className="flex items-center space-x-2">
            <Users className="w-6 h-6 text-primary" />
            <Heading2>Social Hub</Heading2>
          </div>
        }
        showBackButton
        onNavigate={onNavigate}
      >
        <Card className="w-full bg-background text-foreground">
          <CardHeader>
            <Heading2 className="text-2xl font-bold text-primary">The Social Hub</Heading2>
            <Paragraph className="text-sm text-muted-foreground mt-2">
              Connect with the elite HNWI community and explore exclusive events
            </Paragraph>
          </CardHeader>
          <CardContent className="p-6">
            <SocialHub />
          </CardContent>
        </Card>
      </Layout>
    </ThemeProvider>
  )
}

