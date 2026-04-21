import type React from "react"
import Link from "next/link"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Heading1, Lead } from "@/components/ui/typography"

import { SecurityArchitectureStrip, SplashScreenFooter } from "./splash-screen-security"

export function SplashLanding({ ambient }: { ambient?: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-background transition-colors duration-300">
      {ambient}

      <div className="flex-1 flex flex-col items-center justify-start px-4 py-8 pt-32">
        <div className="z-10 mt-20 w-full max-w-4xl text-center">
          <div className="globe-container relative mx-auto mb-6 h-24 w-24 animate-[spin_20s_linear_infinite] sm:h-32 sm:w-32">
            <div className="animate-[pulse_2.4s_ease-in-out_infinite]">
              <Image
                src="/logo.png"
                alt="HNWI Chronicles"
                width={256}
                height={256}
                className="h-auto w-auto"
                style={{ width: "256px", height: "auto" }}
                priority
              />
            </div>
          </div>

          <Heading1 className="mb-4 text-3xl text-foreground sm:text-5xl">
            <span className="text-primary dark:text-primary">HNWI</span>{" "}
            <span className="text-[#888888] dark:text-[#C0C0C0]">CHRONICLES</span>
          </Heading1>

          <Lead className="mb-8 text-muted-foreground">Private Intelligence for Modern Wealth.</Lead>

          <div className="flex items-center justify-center px-4">
            <div className="flex w-full max-w-[580px] flex-col items-center justify-center space-y-3 sm:flex-row sm:space-x-4 sm:space-y-0">
              <Button
                asChild
                className="h-[50px] w-full max-w-[280px] rounded-full bg-black text-lg font-semibold text-white transition-all duration-300 hover:scale-105 hover:bg-black/90 dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90 sm:w-[200px]"
              >
                <Link href="/auth/login">Log In</Link>
              </Button>

              <Button
                asChild
                className="h-[50px] w-full max-w-[280px] rounded-full border border-[hsl(0_0%_10%_/_0.2)] bg-[hsl(0_0%_10%_/_0.1)] text-[hsl(0_0%_20%)] text-lg font-semibold transition-all duration-300 hover:scale-105 hover:border-[hsl(0_0%_10%_/_0.3)] hover:bg-[hsl(0_0%_10%_/_0.15)] hover:text-[hsl(0_0%_10%)] dark:border-[hsl(43_74%_49%_/_0.3)] dark:bg-[hsl(43_74%_49%_/_0.2)] dark:text-[hsl(43_74%_49%)] dark:hover:border-[hsl(43_74%_49%_/_0.5)] dark:hover:bg-[hsl(43_74%_49%_/_0.3)] sm:w-[200px]"
              >
                <a href="https://www.hnwichronicles.com/clearance">Gain Access</a>
              </Button>
            </div>
          </div>
        </div>

        <SecurityArchitectureStrip title="Enterprise-Security Standard Architecture" />
      </div>

      <SplashScreenFooter />
    </div>
  )
}
