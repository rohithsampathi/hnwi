"use client"

import dynamic from "next/dynamic"

const HomeRedirectController = dynamic(
  () => import("@/components/home-redirect-controller").then((mod) => mod.HomeRedirectController),
  {
    ssr: false,
  },
)

const SplashLandingAmbient = dynamic(
  () => import("@/components/splash-landing-ambient").then((mod) => mod.SplashLandingAmbient),
  {
    ssr: false,
  },
)

export function HomePageClientEnhancements() {
  return (
    <>
      <HomeRedirectController />
      <SplashLandingAmbient />
    </>
  )
}
