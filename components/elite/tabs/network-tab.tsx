// components/elite/tabs/network-tab.tsx
// Elite peer network intelligence tab

"use client"

import React from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Large } from "@/components/ui/typography"
import { Users, TrendingUp, Activity, Globe, Clock, ArrowUp } from "lucide-react"
import { useTheme } from "@/contexts/theme-context"
import { getMetallicCardStyle } from "@/lib/colors"
import { cn } from "@/lib/utils"
import type { ProcessedIntelligenceData } from "@/types/dashboard"

interface NetworkTabProps {
  data: ProcessedIntelligenceData
}

export function NetworkTab({ data }: NetworkTabProps) {
  const { theme } = useTheme()
  const metallicStyle = getMetallicCardStyle(theme)
  const hasNetworkData = data.peerSignals && Object.keys(data.peerSignals).length > 0

  const networkData = data.peerSignals
  const shouldShowPlaceholder = !hasNetworkData

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-6">
        <div className="flex items-center space-x-3">
          <Users className="h-6 w-6 text-primary" />
          <div>
            <h2 className="text-xl font-bold">Elite Peer Network</h2>
            <p className="text-sm text-muted-foreground">Real-time network intelligence</p>
            {shouldShowPlaceholder && (
              <Badge variant="outline" className="text-xs mt-1">Demo Mode</Badge>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-6">

        {/* Trending Opportunities */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className={cn(metallicStyle.className, "p-6")}
          style={metallicStyle.style}
        >
          <div className="flex items-center space-x-3 mb-4">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Trending in Your Network</h3>
            {shouldShowPlaceholder && (
              <Badge variant="outline" className="text-xs">Preview</Badge>
            )}
          </div>
          
          <div className="space-y-3">
            {hasNetworkData && (networkData.trending_opportunities || []).map((opp: any, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 * index }}
                className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/20 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-sm ${
                    theme === 'dark' 
                      ? 'bg-primary text-black'
                      : 'bg-primary text-white'
                  }`}>
                    #{index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-foreground">{opp.sector || 'Private Equity'}</div>
                    <div className="text-sm text-muted-foreground flex items-center space-x-2">
                      <Globe className="h-3 w-3" />
                      <span>{opp.region || 'Europe'}</span>
                      {opp.members_interested && (
                        <>
                          <span>•</span>
                          <span>{opp.members_interested} members</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center space-x-2">
                    <Badge variant={
                      opp.peer_interest === 'Very High' ? 'default' :
                      opp.peer_interest === 'High' ? 'secondary' :
                      'outline'
                    } className="text-xs">
                      {opp.peer_interest || 'High Interest'}
                    </Badge>
                    <ArrowUp className="h-3 w-3 text-green-500" />
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    <Clock className="h-3 w-3 inline mr-1" />
                    {opp.timeline || '2-4 weeks'}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          {shouldShowPlaceholder && (
            <p className="text-xs text-muted-foreground mt-4 text-center">
              No network data available from the intelligence endpoint
            </p>
          )}
        </motion.div>
      </div>
    </motion.div>
  )
}