"use client";

import { useRouter } from "next/navigation";
import { SingaporeAcquisitionFlow } from "@/components/acquisition";
import { usePageTitle } from "@/hooks/use-page-title";

export default function AcquisitionDemoPage() {
  const router = useRouter();

  usePageTitle(
    "Acquisition Simulation",
    "Cross-border real estate acquisition flow with tax optimization and executor recommendations"
  );

  const handleNavigateToExecutor = (executorId: string) => {
    router.push(`/trusted-network?executor=${executorId}`);
  };

  const handleRequestIntroduction = (executorId: string) => {
    router.push(`/trusted-network?executor=${executorId}&action=intro`);
  };

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <SingaporeAcquisitionFlow
        purchasePrice={10000000}
        expectedYield={9}
        expectedAppreciation={16}
        holdPeriod={5}
        buyerType="family_office"
        onNavigateToExecutor={handleNavigateToExecutor}
        onRequestIntroduction={handleRequestIntroduction}
      />
    </div>
  );
}
