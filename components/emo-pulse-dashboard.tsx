"use client"

import { Card, CardContent } from "@/components/ui/card"
import { useTheme } from "@/contexts/theme-context"
import { Heading3, Paragraph } from "@/components/ui/typography"

export function EmoPulseDashboard() {
  const { theme } = useTheme()

  return (
    <Card className={`w-full ${theme === "dark" ? "bg-[#1A1A1A] text-white" : "bg-white text-[#121212]"}`}>
      <CardContent>
        <Heading3>EmoPulse Dashboard</Heading3>
        <Paragraph>This is a placeholder for the EmoPulse Dashboard.</Paragraph>
      </CardContent>
    </Card>
  )
}

