"use client";

import dynamic from "next/dynamic";

// Dynamically load the AppWrapper to avoid SSR issues
const AppWrapper = dynamic(() => import("@/components/app-wrapper"), { 
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading Crown Vault...</p>
      </div>
    </div>
  )
});

export default function CrownVaultRoute() {
  return <AppWrapper initialRoute="crown-vault" skipSplash={true} />;
}