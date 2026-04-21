// app/(authenticated)/playbook/[id]/page.tsx

"use client"

import { useParams, useRouter } from "next/navigation"
import { PlaybookPage } from "@/components/pages/playbook-page"

export default function PlaybookRoute() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()

  const handleNavigation = (route: string) => {
    if (route === "back" || route === "dashboard") {
      router.push("/dashboard")
    } else if (route === "playbooks") {
      router.push("/playbooks")
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

  return <PlaybookPage playbookId={id} onNavigate={handleNavigation} />
}
