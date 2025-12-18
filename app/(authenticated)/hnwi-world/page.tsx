// app/(authenticated)/hnwi-world/page.tsx

"use client"

import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { StrategyVaultPage } from "@/components/pages/strategy-vault-page"
import { usePageTitle } from "@/hooks/use-page-title"

export default function HNWIWorldPage() {
  const router = useRouter()
  const [briefCount, setBriefCount] = useState<number>(1900) // Default fallback

  // Fetch actual development count
  useEffect(() => {
    async function fetchBriefCount() {
      try {
        const response = await fetch('/api/developments/counts')
        if (response.ok) {
          const data = await response.json()
          const count = data.developments?.total_count || data.total || data.count || data.total_count || data.briefs
          if (count && typeof count === 'number') {
            setBriefCount(count)
          }
        }
      } catch (error) {
        // Keep default fallback value
      }
    }

    fetchBriefCount()
  }, [])

  // Set page title and meta description with dynamic count
  usePageTitle(
    "HNWI World",
    `Strategic intelligence vault with ${briefCount.toLocaleString()}+ accumulated briefs since February 2023. Pattern recognition engine predicting regulatory changes and wealth migration 3-7 days ahead of markets.`
  )

  const handleNavigation = (route: string) => {
    if (route === "back" || route === "dashboard") {
      router.push("/dashboard")
    } else if (route === "strategy-engine") {
      router.push("/tactics-lab")
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
    } else if (route.startsWith("development-view/")) {
      // Handle development view navigation - stay on same page but update state
      const devId = route.split('/')[1]
      // The component will handle this internally
    } else {
      router.push(`/${route}`)
    }
  }

  return <StrategyVaultPage onNavigate={handleNavigation} />
}