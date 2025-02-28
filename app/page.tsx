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
  
  useEffect(() => {
    // Check if there's a redirect target in localStorage
    const redirectTo = localStorage.getItem("redirectTo")
    if (redirectTo) {
      setTargetRoute(redirectTo)
      localStorage.removeItem("redirectTo")
    }
  }, [])
  
  return <AppWrapper initialRoute={targetRoute} />
}