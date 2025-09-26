// components/home-dashboard-elite.tsx
// Elite HNWI Intelligence Dashboard - World Class Architecture
// Modular, efficient, and maintainable implementation

"use client"

import React, { Suspense, useState, useEffect } from "react"
import { useIntelligenceData } from "@/hooks/use-intelligence-data"
import { EliteHeader } from "./elite/elite-header"
import { EliteTabs } from "./elite/elite-tabs"
import { EliteFooter } from "./elite/elite-footer"
import { EliteLoadingState } from "./elite/elite-loading-state"
import { CrownLoader } from "./ui/crown-loader"
import { EliteErrorState } from "./elite/elite-error-state"
import type { HomeDashboardEliteProps } from "@/types/dashboard"

export function HomeDashboardElite({ 
  user, 
  onNavigate, 
  userData 
}: HomeDashboardEliteProps) {
  const [activeTab, setActiveTab] = useState('overview')

  const {
    data: intelligenceData,
    loading,
    error,
    refreshing,
    refresh
  } = useIntelligenceData(userData, {
    loadCrownVaultMongoDB: true,      // MongoDB data IS needed for Crown Vault Impact tab
    loadKatherineAnalysis: true,       // Katherine analysis for Crown Vault Impact tab
    loadVictorAnalysis: true           // Victor analysis for Opportunities tab
  })

  

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
    <div className="min-h-screen bg-background">
      <EliteHeader 
        user={user}
        intelligenceData={intelligenceData}
        refreshing={refreshing}
        onRefresh={refresh}
      />
      
      {/* Main Content Layout - Column Layout */}
      <div className="max-w-7xl mx-auto px-6 mt-8">
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
            <div className="lg:hidden -mx-6 px-4 py-3 mb-6">
              <Suspense fallback={<div className="h-12 animate-pulse bg-muted rounded-lg" />}>
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
              <div className="h-[calc(100vh-280px)] overflow-y-auto pr-2">
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
      </div>
    </div>
  )
}