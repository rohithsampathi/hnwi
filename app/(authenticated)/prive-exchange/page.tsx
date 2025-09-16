// app/(authenticated)/prive-exchange/page.tsx

"use client"

import { useRouter } from "next/navigation"
import { PriveExchangePage } from "@/components/pages/prive-exchange-page"

export default function PriveExchangeRoute() {
  const router = useRouter()

  const handleNavigation = (route: string) => {
    if (route === "back" || route === "dashboard") {
      router.push("/dashboard")
    } else if (route === "strategy-vault") {
      router.push("/prive-exchange")
    } else if (route === "hnwi-world") {
      router.push("/hnwi-world")
    } else if (route === "strategy-engine") {
      router.push("/ask-rohith")
    } else if (route === "social-hub") {
      router.push("/social-hub")
    } else if (route === "invest-scan") {
      router.push("/invest-scan")
    } else if (route === "crown-vault") {
      router.push("/crown-vault")
    } else if (route === "playbooks") {
      router.push("/playbooks")
    } else if (route === "calendar-page") {
      router.push("/calendar")
    } else if (route === "profile") {
      router.push("/profile")
    } else if (route.startsWith("opportunity/")) {
      const opportunityId = route.split("/")[1]
      router.push(`/opportunity/${opportunityId}`)
    } else if (route.startsWith("playbook/")) {
      const playbookId = route.split("/")[1]
      router.push(`/playbook/${playbookId}`)
    } else {
      router.push(`/${route}`)
    }
  }

  return <PriveExchangePage onNavigate={handleNavigation} />
}