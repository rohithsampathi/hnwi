// app/prive-exchange/[region]/page.tsx

import { RegionPage } from "@/components/pages/region-page"

export default function Page({ params }: { params: { region: string } }) {
  return <RegionPage region={params.region} />
}

