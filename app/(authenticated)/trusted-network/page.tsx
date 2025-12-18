// app/(authenticated)/trusted-network/page.tsx

"use client"

import { useRouter } from "next/navigation"
import { TrustedNetworkPage } from "@/components/pages/trusted-network-page"
import { usePageTitle } from "@/hooks/use-page-title"

export default function TrustedNetworkRoute() {
  const router = useRouter()

  // Set page title and meta description
  usePageTitle(
    "Executor Directory",
    "Vetted executors for intelligence-driven action. Trusted professionals and service providers for implementing your wealth strategies."
  )

  const handleNavigation = (route: string) => {
    if (route === "back" || route === "dashboard") {
      router.push("/dashboard")
    } else if (route === "prive-exchange") {
      router.push("/prive-exchange")
    } else if (route === "hnwi-world" || route === "strategy-vault") {
      router.push("/hnwi-world")
    } else if (route === "ask-rohith" || route === "strategy-engine") {
      router.push("/ask-rohith")
    } else if (route === "social-hub") {
      router.push("/social-hub")
    } else if (route === "invest-scan") {
      router.push("/invest-scan")
    } else if (route === "crown-vault") {
      router.push("/crown-vault")
    } else if (route === "playbooks") {
      router.push("/playbooks")
    } else if (route === "calendar" || route === "calendar-page") {
      router.push("/calendar")
    } else if (route === "profile") {
      router.push("/profile")
    } else if (route === "trusted-network") {
      router.push("/trusted-network")
    } else if (route.startsWith("opportunity/")) {
      const opportunityId = route.split("/")[1]
      router.push(`/opportunity/${opportunityId}`)
    } else if (route.startsWith("playbook/")) {
      const playbookId = route.split("/")[1]
      router.push(`/playbook/${playbookId}`)
    } else if (route.startsWith("crown-vault")) {
      // Handle Crown Vault with query params (e.g., crown-vault?tab=assets&asset=123)
      router.push(`/${route}`)
    } else {
      router.push(`/${route}`)
    }
  }

  return <TrustedNetworkPage onNavigate={handleNavigation} />
}
