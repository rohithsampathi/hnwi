"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { SplashScreen } from "@/components/splash-screen";
import { usePageTitleSimple } from "@/hooks/use-page-title";

export default function AuthLoginPage() {
  const router = useRouter();

  // Set page title and meta description
  usePageTitleSimple(
    "Sign In - HNWI Chronicles",
    "Sign in to HNWI Chronicles. Access exclusive wealth intelligence, AI-scored investment opportunities, and strategic insights for ultra-high-net-worth individuals."
  );

  const handleLoginSuccess = (userData: any) => {
    // Redirect to dashboard after successful login
    router.push("/");
  };

  const handleBack = () => {
    // Go back to home page
    router.push("/");
  };

  return (
    <SplashScreen 
      onLoginSuccess={handleLoginSuccess}
    />
  );
}