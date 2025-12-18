// app/(authenticated)/social-hub/page.tsx

"use client"

import { useRouter } from "next/navigation"
import { SocialHubPage } from "@/components/pages/social-hub-page"
import { usePageTitle } from "@/hooks/use-page-title"

export default function SocialHubRoute() {
  const router = useRouter()

  // Set page title and meta description
  usePageTitle(
    "Social Hub",
    "Where the right people gather. Elite events with average attendee $5M+ net worth. Investment syndication, Art Basel VIP access, Davos side events, and co-investment opportunities."
  )

  const handleNavigation = (route: string) => {
    if (route === "back" || route === "dashboard") {
      router.push("/dashboard")
    } else if (route === "strategy-vault") {
      router.push("/prive-exchange")
    } else if (route === "strategy-engine") {
      router.push("/tactics-lab")
    } else if (route === "prive-exchange") {
      router.push("/prive-exchange")
    } else if (route === "invest-scan") {
      router.push("/invest-scan")
    } else if (route === "crown-vault") {
      router.push("/crown-vault")
    } else if (route === "calendar-page") {
      router.push("/calendar")
    } else if (route === "profile") {
      router.push("/profile")
    } else if (route.startsWith("opportunity/")) {
      const opportunityId = route.split("/")[1]
      router.push(`/opportunity/${opportunityId}`)
    } else {
      router.push(`/${route}`)
    }
  }

  return <SocialHubPage onNavigate={handleNavigation} />
}