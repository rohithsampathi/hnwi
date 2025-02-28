// app/page.tsx
"use client"

import dynamic from "next/dynamic"
import { useEffect, useState } from "react"

const AppWrapper = dynamic(() => import("@/components/app-wrapper"), { 
  ssr: false,
  loading: () => null // Optional: Add a loading component here
})

export default function Home() {
  const [targetRoute, setTargetRoute] = useState<string | null>(null)
  const [skipSplash, setSkipSplash] = useState<boolean>(false)
  
  useEffect(() => {
    // Check if there's a redirect target in localStorage
    const redirectTo = localStorage.getItem("redirectTo")
    if (redirectTo) {
      setTargetRoute(redirectTo)
      localStorage.removeItem("redirectTo")
    }
    
    // Check if we should skip splash screen and go directly to dashboard
    const skipSplashFlag = sessionStorage.getItem("skipSplash")
    if (skipSplashFlag === "true") {
      // console.log("Detected skipSplash flag, going directly to dashboard");
      setTargetRoute("dashboard")
      setSkipSplash(true)
      sessionStorage.removeItem("skipSplash")
    }
  }, [])
  
  return <AppWrapper initialRoute={targetRoute} skipSplash={skipSplash} />
}