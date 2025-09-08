// app/(authenticated)/hnwi-world/page.tsx

"use client"

import { useRouter } from "next/navigation"
import { StrategyVaultPage } from "@/components/pages/strategy-vault-page"

export default function HNWIWorldPage() {
  const router = useRouter()

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