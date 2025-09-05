// components/intelligence/peer-intelligence.tsx
// Peer Intelligence Component - Anonymous Peer Activity Signals
// Aggregated HNWI community intelligence without personal data

"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Users, 
  TrendingUp, 
  Clock, 
  Brain,
  Activity,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Timer,
  Eye,
  DollarSign,
  Crown,
  Zap
} from "lucide-react"
import { usePeerIntelligence, useElitePulse } from "@/contexts/elite-pulse-context"
import { useState, useMemo } from "react"
import { cn } from "@/lib/utils"

interface PeerIntelligenceProps {
  className?: string
  onPeerActionClick?: (action: string, context: any) => void
}

export function PeerIntelligence({ className, onPeerActionClick }: PeerIntelligenceProps) {
  const peerData = usePeerIntelligence()
  const { trackIntelligenceAction } = useElitePulse()
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['activity']))

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId)
    } else {
      newExpanded.add(sectionId)
    }
    setExpandedSections(newExpanded)
    
    trackIntelligenceAction('peer_intelligence', 'section_toggle', { section: sectionId })
  }

  const handlePeerActionClick = (action: string, context: any) => {
    trackIntelligenceAction('peer_intelligence', action, context)
    onPeerActionClick?.(action, context)
  }

  const getActivityLevelConfig = (level: string) => {
    const configs = {
      HIGH: {
        color: "text-red-600",
        bgColor: "bg-red-50 border-red-200",
        icon: Zap,
        label: "High Activity",
        description: "Market urgency detected"
      },
      MODERATE: {
        color: "text-orange-600",
        bgColor: "bg-orange-50 border-orange-200", 
        icon: TrendingUp,
        label: "Moderate Activity",
        description: "Steady positioning"
      },
      LOW: {
        color: "text-green-600",
        bgColor: "bg-green-50 border-green-200",
        icon: Users,
        label: "Low Activity", 
        description: "Calm market conditions"
      }
    }
    return configs[level as keyof typeof configs] || configs.MODERATE
  }

  const getUrgencyConfig = (level: string) => {
    const configs = {
      HIGH: {
        color: "text-red-600",
        bgColor: "bg-red-100",
        pulse: true,
        label: "Urgent"
      },
      MEDIUM: {
        color: "text-orange-600", 
        bgColor: "bg-orange-100",
        pulse: false,
        label: "Important"
      },
      NORMAL: {
        color: "text-green-600",
        bgColor: "bg-green-100",
        pulse: false,
        label: "Normal"
      }
    }
    return configs[level as keyof typeof configs] || configs.NORMAL
  }

  if (!peerData) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Peer Intelligence</h3>
            <Badge variant="outline" className="text-xs">Anonymous</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            <Users className="h-8 w-8 mx-auto mb-3 opacity-50" />
            <p>Peer intelligence not available</p>
            <p className="text-sm">Community activity data being aggregated</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const activityConfig = getActivityLevelConfig(peerData.activity_level)
  const urgencyConfig = getUrgencyConfig(peerData.timing_signals?.urgency_level || 'NORMAL')
  const ActivityIcon = activityConfig.icon

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Users className="h-6 w-6 text-primary" />
              <Activity className="h-3 w-3 text-primary absolute -top-1 -right-1" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Peer Intelligence</h3>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="secondary" className="text-xs">Anonymous Network</Badge>
                <Badge variant="outline" className="text-xs">Real-time</Badge>
                <div className="flex items-center space-x-1">
                  <div className={cn("w-2 h-2 rounded-full", urgencyConfig.pulse ? "animate-pulse bg-red-500" : "bg-green-500")} />
                  <span className="text-xs text-muted-foreground">
                    {peerData.active_members_today} active today
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handlePeerActionClick('refresh_peer_data', {})}
            className="text-xs"
          >
            Refresh Data
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Live Activity Overview */}
        <div className="space-y-3">
          <button
            className="flex items-center justify-between w-full text-left"
            onClick={() => toggleSection('activity')}
          >
            <div className="flex items-center space-x-2">
              <ActivityIcon className={cn("h-4 w-4", activityConfig.color)} />
              <h4 className="font-semibold">Live Activity</h4>
              <Badge className={cn("text-xs", activityConfig.bgColor, activityConfig.color)}>
                {activityConfig.label}
              </Badge>
            </div>
            {expandedSections.has('activity') ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>

          {expandedSections.has('activity') && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className={cn("p-4 rounded-lg border-2", activityConfig.bgColor)}>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">{peerData.active_members_today}</div>
                    <div className="text-sm text-muted-foreground">Active Members</div>
                  </div>
                  <div className="text-center">
                    <div className={cn("text-2xl font-bold", activityConfig.color)}>{peerData.activity_level}</div>
                    <div className="text-sm text-muted-foreground">Activity Level</div>
                  </div>
                </div>
                <p className="text-sm text-center text-muted-foreground">
                  {activityConfig.description}
                </p>
              </div>
            </motion.div>
          )}
        </div>

        {/* Portfolio Moves */}
        {peerData.portfolio_moves && peerData.portfolio_moves.length > 0 && (
          <div className="space-y-3">
            <button
              className="flex items-center justify-between w-full text-left"
              onClick={() => toggleSection('portfolio')}
            >
              <div className="flex items-center space-x-2">
                <Crown className="h-4 w-4 text-purple-600" />
                <h4 className="font-semibold">Anonymous Portfolio Moves</h4>
                <Badge variant="outline" className="text-xs">
                  {peerData.portfolio_moves.length} Recent Moves
                </Badge>
              </div>
              {expandedSections.has('portfolio') ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>

            {expandedSections.has('portfolio') && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-3"
              >
                {peerData.portfolio_moves.map((move, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg bg-purple-50 border-2 border-purple-200"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h5 className="font-bold text-purple-900">{move.action}</h5>
                          <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-800">
                            {move.portfolio_size}
                          </Badge>
                        </div>
                        <p className="text-sm text-purple-700 font-medium mb-1">{move.rationale}</p>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{move.timeframe}</span>
                        </div>
                      </div>
                    </div>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      onClick={() => handlePeerActionClick('similar_strategy', {
                        action: move.action,
                        rationale: move.rationale
                      })}
                    >
                      Explore Similar Strategy
                      <ArrowRight className="h-3 w-3 ml-2" />
                    </Button>
                  </div>
                ))}
              </motion.div>
            )}
          </div>
        )}

        {/* Timing Signals */}
        {peerData.timing_signals && (
          <div className="space-y-3">
            <button
              className="flex items-center justify-between w-full text-left"
              onClick={() => toggleSection('timing')}
            >
              <div className="flex items-center space-x-2">
                <Timer className="h-4 w-4 text-orange-600" />
                <h4 className="font-semibold">Timing Signals</h4>
                <div className={cn("px-2 py-1 rounded-full text-xs font-bold", urgencyConfig.bgColor, urgencyConfig.color)}>
                  {urgencyConfig.label}
                </div>
              </div>
              {expandedSections.has('timing') ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>

            {expandedSections.has('timing') && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="p-4 rounded-lg bg-orange-50 border-2 border-orange-200 space-y-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertCircle className="h-4 w-4 text-orange-600" />
                      <span className="text-sm font-medium text-orange-900">Window Status:</span>
                    </div>
                    <p className="text-sm font-semibold text-orange-800 pl-6">
                      {peerData.timing_signals.window_closing}
                    </p>
                  </div>
                  
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-orange-600" />
                      <span className="text-sm font-medium text-orange-900">Peer Advantage:</span>
                    </div>
                    <p className="text-sm font-semibold text-orange-800 pl-6">
                      {peerData.timing_signals.peer_advantage}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* Social Proof */}
        {peerData.social_proof && (
          <div className="space-y-3">
            <button
              className="flex items-center justify-between w-full text-left"
              onClick={() => toggleSection('social')}
            >
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-blue-600" />
                <h4 className="font-semibold">Social Proof</h4>
                <Badge variant="outline" className="text-xs">Similar Profiles</Badge>
              </div>
              {expandedSections.has('social') ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>

            {expandedSections.has('social') && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="p-4 rounded-lg bg-blue-50 border-2 border-blue-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-xl font-bold text-blue-600">{peerData.social_proof.similar_profiles_active}</div>
                      <div className="text-xs text-muted-foreground">Similar Profiles Active</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-blue-600">{peerData.social_proof.average_portfolio_size}</div>
                      <div className="text-xs text-muted-foreground">Avg Portfolio Size</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-medium text-blue-600">{peerData.social_proof.common_background}</div>
                      <div className="text-xs text-muted-foreground">Common Background</div>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handlePeerActionClick('view_similar_profiles', {
                        similar_count: peerData.social_proof.similar_profiles_active,
                        avg_portfolio: peerData.social_proof.average_portfolio_size
                      })}
                    >
                      View Similar Profile Activity
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* Whisper Network */}
        {peerData.whisper_network && (
          <div className="space-y-3">
            <button
              className="flex items-center justify-between w-full text-left"
              onClick={() => toggleSection('whisper')}
            >
              <div className="flex items-center space-x-2">
                <Brain className="h-4 w-4 text-purple-600" />
                <h4 className="font-semibold">Whisper Network</h4>
                <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-800">
                  Exclusive
                </Badge>
              </div>
              {expandedSections.has('whisper') ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>

            {expandedSections.has('whisper') && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="p-4 rounded-lg bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200">
                  <div className="relative">
                    <div className="absolute -left-1 top-0 w-0.5 h-full bg-gradient-to-b from-purple-600 to-indigo-400 rounded-full"></div>
                    <blockquote className="text-base leading-relaxed italic font-medium text-foreground pl-4">
                      "{peerData.whisper_network}"
                    </blockquote>
                  </div>
                  
                  <div className="flex items-center justify-center space-x-2 pt-3 mt-3 border-t border-purple-200">
                    <Eye className="h-4 w-4 text-purple-600" />
                    <span className="text-xs font-medium text-purple-600">
                      Anonymous Network Intelligence • {new Date().toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePeerActionClick('view_peer_dashboard', {})}
          >
            <Users className="h-3 w-3 mr-2" />
            Peer Dashboard
          </Button>
          <Button
            size="sm"
            onClick={() => handlePeerActionClick('join_discussions', {})}
            className="bg-primary hover:bg-primary/90"
          >
            <Brain className="h-3 w-3 mr-2" />
            Join Network
          </Button>
        </div>

        {/* Privacy Notice */}
        <div className="text-center pt-4 border-t">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Eye className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground font-medium">
              100% Anonymous • Privacy Protected
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            All data is aggregated and anonymized. No personal information is shared or stored.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}