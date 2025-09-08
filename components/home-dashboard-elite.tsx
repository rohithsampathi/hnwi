// components/home-dashboard-elite.tsx
// Elite HNWI Intelligence Dashboard - Clean Implementation

"use client"

import React, { Suspense, useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useIntelligenceData } from "@/hooks/use-intelligence-data"
import { EliteTabs } from "./elite/elite-tabs"
import { EliteFooter } from "./elite/elite-footer"
import { CrownLoader } from "./ui/crown-loader"
import { EliteErrorState } from "./elite/elite-error-state"
import type { HomeDashboardEliteProps } from "@/types/dashboard"

export function HomeDashboardElite({ 
  user, 
  onNavigate, 
  userData 
}: HomeDashboardEliteProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [showStickyTabs, setShowStickyTabs] = useState(false)
  const [screenSize, setScreenSize] = useState<'mobile' | 'desktop'>('desktop')
  const tabsRef = useRef<HTMLDivElement>(null)

  const { 
    data: intelligenceData, 
    loading, 
    error, 
    refreshing,
    refresh 
  } = useIntelligenceData(userData)

  // Screen size detection
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth
      if (width < 768) {
        setScreenSize('mobile')
      } else {
        setScreenSize('desktop')
      }
    }
    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  // IntersectionObserver for sticky tabs
  useEffect(() => {
    // Run on all screen sizes for lg:hidden (mobile and tablet)
    if (window.innerWidth >= 1024) return
    
    const tabsElement = tabsRef.current
    if (!tabsElement) return
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Show sticky when tabs section is not visible
        setShowStickyTabs(!entry.isIntersecting)
      },
      {
        threshold: 0,
        rootMargin: '-65px 0px 0px 0px' // Account for header height
      }
    )
    
    observer.observe(tabsElement)
    
    return () => {
      observer.unobserve(tabsElement)
    }
  }, [screenSize, intelligenceData])

  if (loading && !intelligenceData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <CrownLoader 
          size="lg" 
          text="Loading Dashboard" 
          subtext="Preparing your personalized intelligence brief" 
        />
      </div>
    )
  }

  if (error && !intelligenceData) {
    return <EliteErrorState error={error} onRetry={refresh} />
  }

  if (!intelligenceData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <CrownLoader 
          size="lg" 
          text="Loading Dashboard" 
          subtext="Preparing your personalized intelligence brief" 
        />
      </div>
    )
  }

  return (
    <>
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex gap-6">
          {/* Left Column - Tabs (Desktop) */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-6">
              <Suspense fallback={<div className="h-96 animate-pulse bg-muted rounded-lg" />}>
                <EliteTabs 
                  data={intelligenceData}
                  onNavigate={onNavigate}
                  user={user}
                  variant="sidebar"
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                />
              </Suspense>
            </div>
          </div>

          {/* Right Column - Content */}
          <div className="flex-1 min-w-0">
            {/* Mobile Tabs - Static */}
            <div className="lg:hidden py-2 mb-4" ref={tabsRef}>
              <Suspense fallback={<div className="h-10 animate-pulse bg-muted rounded-lg" />}>
                <EliteTabs 
                  data={intelligenceData}
                  onNavigate={onNavigate}
                  user={user}
                  variant="mobile"
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                />
              </Suspense>
            </div>

            {/* Desktop Content */}
            <div className="hidden lg:block">
              <div className="h-[calc(100vh-280px)] overflow-y-auto scrollbar-hide pr-2">
                <Suspense fallback={<div className="h-96 animate-pulse bg-muted rounded-lg" />}>
                  <EliteTabs 
                    data={intelligenceData}
                    onNavigate={onNavigate}
                    user={user}
                    variant="content"
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                  />
                </Suspense>
              </div>
            </div>

            {/* Mobile Content */}
            <div className="lg:hidden">
              <Suspense fallback={<div className="h-96 animate-pulse bg-muted rounded-lg" />}>
                <EliteTabs 
                  data={intelligenceData}
                  onNavigate={onNavigate}
                  user={user}
                  variant="mobile-content"
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                />
              </Suspense>
            </div>
          </div>
        </div>

        <EliteFooter user={user} />
      </div>

      {/* Sticky Mobile Tabs - Only show when scrolled - Outside main content flow */}
      <AnimatePresence>
        {showStickyTabs && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden fixed top-[39px] z-50 bg-background border-b border-border px-8 py-1 border-t-0"
            style={{
              left: screenSize === 'mobile' ? '0' : '80px', // Position after collapsed sidebar on tablet
              right: '0'
            }}
          >
            <Suspense fallback={<div className="h-8 animate-pulse bg-muted rounded-lg" />}>
              <EliteTabs 
                data={intelligenceData}
                onNavigate={onNavigate}
                user={user}
                variant="mobile-sticky"
                activeTab={activeTab}
                setActiveTab={setActiveTab}
              />
            </Suspense>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}