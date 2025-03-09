// app/profile/page.tsx

"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function Page() {
  const router = useRouter()
  
  // Set up a navigation handler for the profile page
  useEffect(() => {
    // Profile page doesn't exist as a standalone page
    // So we'll route back to the dashboard with a flag to show the profile
    sessionStorage.setItem("skipSplash", "true")
    sessionStorage.setItem("showProfile", "true") 
    router.push("/")
    
    // Clean up function
    return () => {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem("showProfile")
      }
    }
  }, [router])
  
  // This is just a loading state while we redirect
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
        <h2 className="text-lg font-medium text-foreground">Loading profile...</h2>
      </div>
    </div>
  )
}