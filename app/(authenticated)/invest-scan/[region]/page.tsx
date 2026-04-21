// app/invest-scan/[region]/page.tsx

import { RegionPage } from "@/components/pages/region-page"

export default async function Page({ params }: { params: Promise<{ region: string }> }) {
  const { region } = await params
  return <RegionPage region={region} />
}
