// app/(authenticated)/crown-vault/page.tsx

"use client"

import { useRouter } from "next/navigation"
import CrownVaultPage from "@/components/pages/crown-vault-page"

export default function CrownVaultRoute() {
  const router = useRouter()

  const handleNavigation = (route: string) => {
    if (route === "back" || route === "dashboard") {
      router.push("/dashboard")
    } else if (route === "strategy-vault") {
      router.push("/prive-exchange")
    } else if (route === "strategy-engine") {
      router.push("/tactics-lab")
    } else if (route === "social-hub") {
      router.push("/social-hub")
    } else if (route === "prive-exchange") {
      router.push("/prive-exchange")
    } else if (route === "invest-scan") {
      router.push("/invest-scan")
    } else if (route === "playbooks") {
      router.push("/playbooks")
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

  return <CrownVaultPage onNavigate={handleNavigation} />
}