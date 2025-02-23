// app/prive-exchange/[region]/[opportunityId]/page.tsx

import { OpportunityPage } from "@/components/pages/opportunity-page"

export default function Page({
  params: { region, opportunityId },
}: {
  params: { region: string; opportunityId: string }
}) {
  return <OpportunityPage region={region} opportunityId={opportunityId} />
}

