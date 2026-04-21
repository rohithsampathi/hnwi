"use client"

import dynamic from "next/dynamic"
import { useEffect, useState } from "react"

import { ThemeProvider } from "@/contexts/theme-context"
import { ThemeToggle } from "./theme-toggle"

const ParticlesBackground = dynamic(
  () => import("./particles-background").then((mod) => mod.ParticlesBackground),
  {
    ssr: false,
  },
)

export function SplashLandingAmbient() {
  const [showParticles, setShowParticles] = useState(false)

  useEffect(() => {
    let cancelled = false

    const showDeferredParticles = () => {
      if (!cancelled) {
        setShowParticles(true)
      }
    }

    if (typeof window === "undefined") {
      return
    }

    const idleApi = window as Window & {
      requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number
      cancelIdleCallback?: (handle: number) => void
    }

    if (idleApi.requestIdleCallback) {
      const handle = idleApi.requestIdleCallback(showDeferredParticles, { timeout: 1200 })
      return () => {
        cancelled = true
        idleApi.cancelIdleCallback?.(handle)
      }
    }

    const timer = window.setTimeout(showDeferredParticles, 180)
    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [])

  return (
    <ThemeProvider>
      {showParticles ? <ParticlesBackground /> : null}
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>
    </ThemeProvider>
  )
}
