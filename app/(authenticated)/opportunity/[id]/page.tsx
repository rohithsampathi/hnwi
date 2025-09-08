// app/(authenticated)/opportunity/[id]/page.tsx

"use client"

import { useRouter } from "next/navigation"
import { OpportunityPage } from "@/components/pages/opportunity-page"

interface OpportunityPageProps {
  params: {
    id: string
  }
}

export default function OpportunityRoute({ params }: OpportunityPageProps) {
  const router = useRouter()

  const handleNavigation = (route: string) => {
    if (route === "back") {
      // Navigate back to Privé Exchange as default
      router.push("/prive-exchange")
    } else if (route === "dashboard") {
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
    } else if (route === "crown-vault") {
      router.push("/crown-vault")
    } else if (route === "calendar-page") {
      router.push("/calendar")
    } else if (route === "profile") {
      router.push("/profile")
    } else if (route === "playbooks") {
      router.push("/playbooks")
    } else if (route.startsWith("playbook/")) {
      const playbookId = route.split("/")[1]
      router.push(`/playbook/${playbookId}`)
    } else {
      router.push(`/${route}`)
    }
  }

  return <OpportunityPage opportunityId={params.id} onNavigate={handleNavigation} />
}