"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, ChevronUp, Megaphone, UserPlus, Shield, Film, Info, Edit2 } from "lucide-react"
import * as d3 from "d3"
import { useTheme } from "@/contexts/theme-context"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Slider } from "@/components/ui/slider"
import { TopPerformerBadge } from "./top-performer-badge"
import { useToast } from "@/components/ui/use-toast"
import { StrategyAtomAnimation } from "./strategy-atom-animation"
import { Paragraph } from "@/components/ui/typography"
import { secureApi } from "@/lib/secure-api"

interface SubChannel {
  name: string
  score: number
  userScore: number
  color: string
  tooltip: string
}

interface ChannelCategory {
  name: string
  icon: typeof Megaphone
  subChannels: SubChannel[]
}

// Update the color constants at the top of the file
const richRuby = "#E0115F"
const richGold = "#FFD700"
const richEmerald = "#50C878"

// Update the getScoreColor function
const getScoreColor = (score: number) => {
  if (score <= 1) return richRuby
  if (score >= 5) return richEmerald

  // For scores between 1-3, interpolate between richRuby and richGold
  if (score < 3) {
    const t = (score - 1) / 2
    return d3.interpolateRgb(richRuby, richGold)(t)
  }

  // For scores between 3-5, interpolate between richGold and richEmerald
  const t = (score - 3) / 2
  return d3.interpolateRgb(richGold, richEmerald)(t)
}

// Initialize categories with colors and tooltips
const initializeCategories = (config: any): ChannelCategory[] => {
  const defaultStockScores: { [key: string]: number } = {
    "Google Display": 3.7,
    "Meta Awareness": 4.1,
    Billboards: 3.9,
    AdOnMo: 1.2,
    "Mobile Signage": 3.5,
    YouTube: 4.8,
    "Search ADs": 4.8,
    "Meta Leads": 4.9,
    Email: 3.1,
    "Cold Calls": 2.8,
    Partners: 4.9,
    Influencers: 4.7,
    "Micro Influencers": 4.9,
    Celebrities: 4.3,
    Podcasts: 4.8,
    Events: 4.1,
    Awards: 4.7,
    Shorts: 4.9,
    Snaps: 5.0,
    Video: 4.7,
    Images: 2.8,
  }

  const defaultTooltips: { [key: string]: string } = {
    "Meta Leads":
      "Don't rely on generic 'luxury lifestyle' interest targeting – HNIs are masked by aspirational audiences.",
    Partners: "Don't let partners blast promotions to their entire list – insist on curated, pre-qualified leads.",
    "Micro Influencers":
      "Don't partner with influencers who post paid collabs >2x/week – their audience tunes out ads.",
    "Search ADs": "Don't use vague CTAs like 'Explore Luxury' – focus on 'Last 3 Units Left in Boat Club'.",
    YouTube: "Don't run ads on 'top 10 luxury homes' videos – viewers are passive researchers, not buyers.",
    Podcasts: "Don't sponsor shows without host demos – mismatched tone alienates elites.",
    "Meta Awareness": "Don't use stock images of 'happy families' – UHNIs prioritize status, not sentimentality.",
    Events: "Don't serve cheap catering (e.g., buffet lines) – hire Michelin-starred chefs for tastings.",
    Celebrities:
      "Don't let celebrities post generic praise – script captions around unique specs (e.g., 'My 3rd parking slot!').",
    Billboards: "Don't use billboards without dusk-to-dawn lighting – high-value buyers drive late.",
    "Mobile Signage": "Don't place ads on auto-rickshaws – stick to luxury chauffeur fleets near 5-star hotels.",
    Email: "Don't use 'Buy Now' CTAs – HNIs respond to 'Schedule a Private Architect Walkthrough'.",
    "Cold Calls": "Don't mention pricing upfront – say 'This is for our VIP list only; are you eligible?'.",
    AdOnMo: "Don't run ads in residential elevators – target premium office lobbies during lunch hours.",
    Awards:
      "Don't apply for awards without jury credibility checks (e.g., 'Asia Property Awards' yes, 'Luxury Realty Stars' no).",
    "Google Display":
      "Don't run ads on non-premium websites – use whitelists to target elite business/finance publishers.",
  }

  const stockScores = config.stockScores || defaultStockScores
  const tooltips = config.tooltips || defaultTooltips

  const rawCategories = [
    {
      name: "Signalling",
      icon: Megaphone,
      subChannels: [
        { name: "Google Display", score: 0, color: "", tooltip: "Whitelist only premium finance and business sites. No mass placements." },
        { name: "Meta Awareness", score: 0, color: "", tooltip: "Skip generic ‘luxury lifestyle’ targeting—HNIs blend in with aspirational buyers." },
        { name: "Billboards", score: 0, color: "", tooltip: "Ensure high-traffic zones & dusk-to-dawn lighting. Late-night drives matter." },
        { name: "AdOnMo", score: 0, color: "", tooltip: "Target premium office lobbies, not random residential elevators." },
        { name: "Mobile Signage", score: 0, color: "", tooltip: "Luxury chauffeur fleets near 5-star hotels. Not autos, not public transit." },
        { name: "YouTube", score: 0, color: "", tooltip: "Skip ‘top 10 luxury homes’ videos—viewers are just window shoppers." },
      ],
    },
    {
      name: "Lead Generation",
      icon: UserPlus,
      subChannels: [
        { name: "Search Ads", score: 0, color: "", tooltip: "Direct CTAs only. ‘Schedule a private walkthrough’ > ‘Explore Luxury’." },
        { name: "Meta Leads", score: 0, color: "", tooltip: "Filter hard—HNIs don’t fill forms. Optimize for curated inquiries, not volume." },
        { name: "Email", score: 0, color: "", tooltip: "No ‘Buy Now.’ Use ‘Private Preview Available’ instead. Subtle urgency." },
        { name: "Cold Calls", score: 0, color: "", tooltip: "No prices upfront. Ask, ‘This is for select clients only—are you eligible?’" },
        { name: "Partner Promotions", score: 0, color: "", tooltip: "Partners must pre-qualify leads. No bulk-blasting lists." },
      ],
    },
    {
      name: "Trust Creation",
      icon: Shield,
      subChannels: [
        { name: "Influencers", score: 0, color: "", tooltip: "No paid hype—pick those with real HNI networks, not just high follower counts." },
        { name: "Micro Influencers", score: 0, color: "", tooltip: "Skip influencers posting >2 collabs/week. If it feels like an ad, it’s ignored." },
        { name: "Celebrities", score: 0, color: "", tooltip: "No generic endorsements. Script it around an actual purchase/use case." },
        { name: "Podcasts", score: 0, color: "", tooltip: "Hosts must demo or discuss firsthand. HNIs tune out forced sponsorships." },
        { name: "Events", score: 0, color: "", tooltip: "Venue, guest list, experience > everything. No budget events. No buffet lines." },
        { name: "Awards", score: 0, color: "", tooltip: "No fake trophies. Jury credibility matters—stick to elite recognitions." },
      ],
    },
    {
      name: "Content Format",
      icon: Film,
      subChannels: [
        { name: "Shorts", score: 0, color: "", tooltip: "Make them sharp. No hard sells. Just insight and exclusivity." },
        { name: "Snaps", score: 0, color: "", tooltip: "No overused stock photos. Original, premium-quality only." },
        { name: "Videos", score: 0, color: "", tooltip: "Storytelling over selling. HNIs don’t respond to ‘Act Now’ tactics." },
        { name: "Images", score: 0, color: "", tooltip: "Composition, lighting, and exclusivity > everything. Make it feel private." },
      ],
    },
  ];

  return rawCategories.map((category) => ({
    ...category,
    subChannels: category.subChannels.map((subChannel) => ({
      ...subChannel,
      score: 0,
      userScore: 0,
      color: getScoreColor(0),
      // Use tooltip from raw categories instead of default tooltips
    })),
  }))
}

const RatingArc: React.FC<{
  subChannel: SubChannel
  onScoreChange: (newScore: number) => void
  isTopPerformer: boolean
}> = ({ subChannel, onScoreChange, isTopPerformer }) => {
  const svgRef = useRef<SVGSVGElement>(null)
  const { theme } = useTheme()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaved, setIsSaved] = useState(true)
  const [localScore, setLocalScore] = useState(subChannel.userScore)

  const calculateDelta = () => {
    const delta = ((localScore - subChannel.score) / subChannel.score) * 100
    return delta.toFixed(1)
  }

  useEffect(() => {
    if (!svgRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()

    const width = 150
    const height = 150
    const thickness = 20

    svg.attr("width", width).attr("height", height)

    const g = svg.append("g").attr("transform", `translate(${width / 2},${height / 2})`)

    const arc = d3
      .arc()
      .innerRadius(width / 2 - thickness)
      .outerRadius(width / 2)
      .startAngle(0)
      .cornerRadius(thickness / 2)

    // Background arc
    g.append("path")
      .datum({ endAngle: 2 * Math.PI })
      .style("fill", theme === "dark" ? "#333" : "#e0e0e0")
      .attr("d", arc as any)

    // Score arc
    g.append("path")
      .datum({ endAngle: 2 * Math.PI * (localScore / 5) })
      .style("fill", getScoreColor(localScore))
      .attr("d", arc as any)

    // Score text
    g.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "-0.2em")
      .style("font-size", "32px")
      .style("font-weight", "bold")
      .style("fill", theme === "dark" ? "#fff" : "#000")
      .text(localScore.toFixed(1))

    // Delta text
    const delta = calculateDelta()
    const deltaColor = Number.parseFloat(delta) >= 0 ? "#4CAF50" : "#F44336"
    g.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "1.5em")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .style("fill", deltaColor)
      .text(`${delta}%`)
  }, [localScore, theme, subChannel.score])

  const handleTickClick = () => {
    if (isEditing) {
      onScoreChange(localScore)
      setIsSaved(true)
      setIsEditing(false)
    } else {
      setIsEditing(true)
      setIsSaved(false)
    }
  }

  const handleSliderChange = (value: number[]) => {
    const newScore = value[0]
    setLocalScore(newScore)
    setIsEditing(true)
    setIsSaved(false)
  }

  return (
    <div className="flex flex-col items-center relative">
      <div className="flex items-center justify-between w-full mb-2">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-lg font-body">{subChannel.name}</span>
          {isTopPerformer && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <TopPerformerBadge />
                  </span>
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  align="center"
                  className="bg-yellow-100 text-yellow-900 border border-yellow-400"
                >
                  <Paragraph className="font-semibold text-xs">Top Performer</Paragraph>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="w-4 h-4 text-muted-foreground cursor-help flex-shrink-0" />
            </TooltipTrigger>
            <TooltipContent side="left" align="start" className="w-[200px] break-words text-xs p-2">
              <p className="font-normal text-xs leading-tight m-0">{subChannel.tooltip}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <svg ref={svgRef}></svg>
      <div className="flex items-center gap-2 mt-4 w-full">
        <Slider value={[localScore]} max={5} step={0.1} className="flex-grow" onValueChange={handleSliderChange} />
        <span className="font-bold min-w-[3ch] text-sm">{localScore.toFixed(1)}</span>
        <motion.div
          className="cursor-pointer"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleTickClick}
        >
          <Edit2 className={`w-6 h-6 ${isEditing || !isSaved ? "text-blue-500" : "text-green-500"}`} />
        </motion.div>
      </div>
    </div>
  )
}

const ChannelPerformanceRating: React.FC = () => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const { theme } = useTheme()
  const [localCategories, setLocalCategories] = useState<ChannelCategory[]>(initializeCategories({}))
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const { toast } = useToast()


  const updateRating = useCallback(
    async (channel: string, score: number) => {
      const userId = localStorage.getItem("userId")
      if (!userId) {
        toast({
          title: "Error",
          description: "User ID not found. Please log in again.",
          variant: "destructive",
        })
        return
      }

      try {
        await secureApi.put(`/api/ratings/${userId}`, {
          channel,
          score,
        })

        toast({
          title: "Success",
          description: `Rating for ${channel} updated successfully.`,
        })
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to update rating. Please try again.",
          variant: "destructive",
        })
      }
    },
    [toast],
  )

  const handleScoreChange = useCallback(
    (categoryIndex: number, subChannelIndex: number, newScore: number) => {
      setLocalCategories((prev) => {
        const newCategories = [...prev]
        const subChannel = newCategories[categoryIndex].subChannels[subChannelIndex]
        subChannel.userScore = newScore
        updateRating(subChannel.name, newScore)
        return newCategories
      })
      // Trigger a refresh after updating the rating
      setRefreshTrigger((prev) => prev + 1)
    },
    [updateRating, setRefreshTrigger],
  )

  useEffect(() => {
    const fetchAggregatedRatings = async () => {
      setIsRefreshing(true)
      setIsLoading(true)
      try {
        const data = await secureApi.get('/api/ratings/aggregated', true, { enableCache: true, cacheDuration: 600000 }); // 10 minutes for ratings

        if (data.status === "success" && Array.isArray(data.data)) {
          setLocalCategories((prevCategories) => {
            const updatedCategories = prevCategories.map((category) => ({
              ...category,
              subChannels: category.subChannels.map((subChannel) => {
                const matchingData = data.data.find(
                  (item) => item.channel.toLowerCase() === subChannel.name.toLowerCase(),
                )
                if (matchingData) {
                  return {
                    ...subChannel,
                    score: matchingData.average_score,
                    userScore: matchingData.average_score,
                    color: getScoreColor(matchingData.average_score),
                  }
                }
                return subChannel
              }),
            }))
            return updatedCategories
          })
        } else {
          throw new Error("Invalid data format received from API")
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load ratings. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
        setIsRefreshing(false)
      }
    }

    fetchAggregatedRatings()
  }, [toast, refreshTrigger])

  useEffect(() => {
  }, [localCategories])

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(categoryName)) {
        newSet.delete(categoryName)
      } else {
        newSet.add(categoryName)
      }
      return newSet
    })
  }

  const getTopPerformer = (subChannels: SubChannel[]) => {
    return subChannels.reduce((max, channel) => (channel.score > max.score ? channel : max), subChannels[0])
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <StrategyAtomAnimation />
        <Paragraph className="mt-4 text-lg font-semibold font-body">Loading channel performance data...</Paragraph>
      </div>
    )
  }


  return (
    <div className="space-y-3 p-3 bg-transparent">
      {isRefreshing && (
        <div className="fixed top-4 right-4 bg-primary text-primary-foreground px-4 py-2 rounded-md shadow-md">
          <span className="animate-pulse">Refreshing data...</span>
        </div>
      )}
      {localCategories.map((category, categoryIndex) => {
        const Icon = category.icon
        const topPerformer = getTopPerformer(category.subChannels)
        return (
          <Card key={category.name} className="overflow-hidden mb-6 border-none bg-transparent shadow-none">
            <CardContent className="p-3">
              <Button
                variant="ghost"
                className="w-full p-6 justify-between hover:bg-transparent bg-white dark:bg-gray-800 rounded-lg shadow-sm"
                onClick={() => toggleCategory(category.name)}
              >
                <div className="flex items-center space-x-4">
                  <div className="p-2 rounded-full flex-shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-xl font-semibold font-heading">{category.name}</span>
                </div>
                {expandedCategories.has(category.name) ? (
                  <ChevronUp className="flex-shrink-0" />
                ) : (
                  <ChevronDown className="flex-shrink-0" />
                )}
              </Button>
              <AnimatePresence>
                {expandedCategories.has(category.name) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="p-3 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 bg-transparent">
                      {category.subChannels.map((subChannel, subChannelIndex) => (
                        <RatingArc
                          key={subChannel.name}
                          subChannel={subChannel}
                          onScoreChange={(newScore) => handleScoreChange(categoryIndex, subChannelIndex, newScore)}
                          isTopPerformer={subChannel.name === topPerformer.name}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

export default ChannelPerformanceRating

