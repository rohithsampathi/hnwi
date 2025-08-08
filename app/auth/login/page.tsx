"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { SplashScreen } from "@/components/splash-screen";

export default function AuthLoginPage() {
  const router = useRouter();

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