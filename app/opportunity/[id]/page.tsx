// app/opportunity/[id]/page.tsx

import { OpportunityPage } from "@/components/pages/opportunity-page"

export default function Page({
  params: { id },
}: {
  params: { id: string }
}) {
  // Pass a dummy region since we now fetch by ID
  return <OpportunityPage region="" opportunityId={id} />
}