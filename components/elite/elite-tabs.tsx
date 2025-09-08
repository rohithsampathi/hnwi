// components/elite/elite-tabs.tsx
// Main content tabs for elite dashboard

"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, Gem, Globe, Users, Crown } from "lucide-react"
import { OverviewTab } from "./tabs/overview-tab"
import { OpportunitiesTab } from "./tabs/opportunities-tab"
import { ElitePulseTab } from "./tabs/wealth-flow-tab"
// import { NetworkTab } from "./tabs/network-tab"
import { CrownVaultTab } from "./tabs/crown-vault-tab"
import type { ProcessedIntelligenceData, User } from "@/types/dashboard"

interface EliteTabsProps {
  data: ProcessedIntelligenceData
  onNavigate: (route: string) => void
  user: User
  variant?: 'default' | 'sidebar' | 'mobile' | 'content' | 'mobile-content' | 'mobile-sticky'
  activeTab?: string
  setActiveTab?: (tab: string) => void
}

export function EliteTabs({ data, onNavigate, user, variant = 'default', activeTab: propActiveTab, setActiveTab: propSetActiveTab }: EliteTabsProps) {
  const [localActiveTab, setLocalActiveTab] = useState('overview')
  
  // Use prop state if provided, otherwise use local state
  const activeTab = propActiveTab || localActiveTab
  const setActiveTab = propSetActiveTab || setLocalActiveTab

  const tabItems = [
    {
      value: 'overview',
      label: 'Overview',
      icon: BarChart3,
      component: <OverviewTab data={data} activeTab={activeTab} setActiveTab={setActiveTab} />
    },
    {
      value: 'elite-pulse',
      label: 'Elite Pulse',
      icon: Globe,
      component: <ElitePulseTab data={data} />
    },
    {
      value: 'opportunities',
      label: 'Privé Exchange Updates', 
      icon: Gem,
      component: <OpportunitiesTab data={data} onNavigate={onNavigate} />
    },
    {
      value: 'crown-vault',
      label: 'Crown Vault Impact',
      icon: Crown,
      component: <CrownVaultTab data={data} onNavigate={onNavigate} user={user} />
    },
    // {
    //   value: 'network',
    //   label: 'Network',
    //   icon: Users,
    //   component: <NetworkTab data={data} />
    // }
  ]

  // Sidebar variant (desktop left column)
  if (variant === 'sidebar') {
    return (
      <div className="space-y-2">
        {tabItems.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-colors ${
              activeTab === tab.value
                ? 'bg-primary/10 text-primary border border-primary/20'
                : 'hover:bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            <tab.icon className="h-4 w-4 mr-3" />
            <span className="text-sm font-medium">{tab.label}</span>
          </button>
        ))}
      </div>
    )
  }

  // Mobile variant (horizontal tabs)
  if (variant === 'mobile') {
    return (
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {tabItems.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`flex items-center px-4 py-1.5 rounded-xl whitespace-nowrap text-sm font-medium transition-all duration-200 shadow-sm ${
              activeTab === tab.value
                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-105'
                : 'bg-card/50 backdrop-blur-sm text-muted-foreground hover:text-foreground hover:bg-card hover:shadow-md'
            }`}
          >
            <tab.icon className="h-3 w-3 mr-2" />
            {tab.label}
          </button>
        ))}
      </div>
    )
  }

  // Mobile sticky variant (compact horizontal tabs)
  if (variant === 'mobile-sticky') {
    return (
      <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
        {tabItems.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`flex items-center px-3 py-1 rounded-lg whitespace-nowrap text-xs font-medium transition-all duration-200 ${
              activeTab === tab.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-card/40 text-muted-foreground hover:text-foreground hover:bg-card/60'
            }`}
          >
            <tab.icon className="h-2.5 w-2.5 mr-1.5" />
            {tab.label}
          </button>
        ))}
      </div>
    )
  }

  // Content variant (desktop right column)
  if (variant === 'content') {
    const activeTabItem = tabItems.find(tab => tab.value === activeTab)
    return (
      <div>
        {activeTabItem?.component}
      </div>
    )
  }

  // Mobile content variant
  if (variant === 'mobile-content') {
    const activeTabItem = tabItems.find(tab => tab.value === activeTab)
    return (
      <div>
        {activeTabItem?.component}
      </div>
    )
  }

  // Default variant (enhanced layout)
  return (
    <div className="pb-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 bg-gradient-to-r from-background/80 via-background/50 to-background/80 backdrop-blur-md p-1 rounded-xl shadow-sm border border-border/50">
          {tabItems.map((tab) => (
            <TabsTrigger 
              key={tab.value}
              value={tab.value} 
              className="text-xs sm:text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-primary/25 transition-all duration-200 rounded-lg px-2 sm:px-3 py-2 data-[state=inactive]:hover:bg-muted/50"
            >
              <tab.icon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.label.slice(0, 3)}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {tabItems.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="mt-6">
            <div className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
              {tab.component}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}