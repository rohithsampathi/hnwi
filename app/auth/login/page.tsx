"use client";

import { useRouter } from "next/navigation";
import { PublicAuthShell } from "@/components/public-auth-shell";
import { SplashScreen } from "@/components/splash-screen";
import { usePageTitleSimple } from "@/hooks/use-page-title";
import { DASHBOARD_ROUTE } from "@/lib/auth-navigation";

export default function AuthLoginPage() {
  const router = useRouter();

  usePageTitleSimple(
    "Sign In - HNWI Chronicles",
    "Sign in to HNWI Chronicles. Access exclusive wealth intelligence, AI-scored investment opportunities, and strategic insights for ultra-high-net-worth individuals."
  );

  const handleLoginSuccess = () => {
    router.replace(DASHBOARD_ROUTE);
  };

  return (
    <PublicAuthShell>
      <SplashScreen 
        showLogin
        onLoginSuccess={handleLoginSuccess}
      />
    </PublicAuthShell>
  );
}
