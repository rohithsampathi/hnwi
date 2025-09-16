// app/(authenticated)/ask-rohith/page.tsx

"use client"

import { useRouter } from "next/navigation"
import { AskRohithPage } from "@/components/pages/ask-rohith-page"
import { MetaTags } from "@/components/meta-tags"

export default function AskRohithRoute() {
  const router = useRouter()

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

  return (
    <>
      <MetaTags
        title="Ask Rohith | Private Intelligence Ally - HNWI Chronicles"
        description="Chat with Rohith, your private intelligence ally with full portfolio awareness and memory. Get personalized investment insights, market analysis, and strategic intelligence."
        image="https://app.hnwichronicles.com/images/ask-rohith-og.png"
        url="https://app.hnwichronicles.com/ask-rohith"
      />
      <AskRohithPage onNavigate={handleNavigation} />
    </>
  )
}