// app/(authenticated)/ask-rohith/page.tsx

"use client"

import { useRouter } from "next/navigation"
import { AskRohithPage } from "@/components/pages/ask-rohith-page"
import { usePageTitle } from "@/hooks/use-page-title"

export default function AskRohithRoute() {
  const router = useRouter()

  // Set page title and meta description
  usePageTitle(
    "Ask Rohith",
    "Your 24/7 AI intelligence ally with complete conversation memory and portfolio awareness. Strategic analysis, market research, and wealth preservation strategies from 50+ years HNWI patterns."
  )

  const handleNavigation = (route: string) => {
    if (route === "back" || route === "dashboard") {
      router.push("/dashboard")
    } else if (route === "strategy-vault") {
      router.push("/hnwi-world")
    } else if (route === "social-hub") {
      router.push("/social-hub")
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

  return <AskRohithPage onNavigate={handleNavigation} />
}