// components/social-hub.tsx

"use client"

import { useState, useEffect } from "react"
import { getCurrentUser, getCurrentUserId } from "@/lib/auth-manager"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PremiumBadge } from "@/components/ui/premium-badge"
import { MapPin, Users, Tag, Clock, Building, Check, Loader2, ThumbsUp, Phone } from "lucide-react"
import { CrownLoader } from "@/components/ui/crown-loader"
import { motion, AnimatePresence } from "framer-motion"
import { useTheme } from "@/contexts/theme-context"
import { Heading3, Paragraph } from "@/components/ui/typography"
import { fonts } from "@/styles/fonts"
import { colors } from "@/styles/colors"
// import { addEventToCalendar } from "@/utils/calendar-utils"
import { useToast } from "@/components/ui/use-toast"
import { SocialEvent, getEvents } from "@/lib/api"
import { getCategoryColorClass, getCategoryDarkColorClass } from "@/utils/color-utils"
import { getMetallicCardStyle, getCardColors } from "@/lib/colors"
import { useAuth } from "@/components/auth-provider"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"

const PREMIUM_PATTERNS_LIGHT = [
  "bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-100 via-slate-50 to-slate-100",
  "bg-[conic-gradient(at_top,_var(--tw-gradient-stops))] from-gray-100 via-gray-50 to-white",
  "bg-[linear-gradient(45deg,_var(--tw-gradient-stops))] from-slate-100 via-purple-50 to-white",
  "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-100 via-gray-50 to-white",
  "bg-[conic-gradient(at_bottom_left,_var(--tw-gradient-stops))] from-slate-100 via-slate-50 to-white",
]

const PREMIUM_PATTERNS_DARK = [
  "bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-800 to-slate-900",
  "bg-[conic-gradient(at_top,_var(--tw-gradient-stops))] from-gray-900 via-gray-800 to-gray-900",
  "bg-[linear-gradient(45deg,_var(--tw-gradient-stops))] from-slate-900 via-purple-900 to-slate-900",
  "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-gray-800 to-gray-900",
  "bg-[conic-gradient(at_bottom_left,_var(--tw-gradient-stops))] from-slate-900 via-slate-800 to-slate-900",
]

function getPatternClass(index: number, theme: string) {
  return theme === "dark"
    ? PREMIUM_PATTERNS_DARK[index % PREMIUM_PATTERNS_DARK.length]
    : PREMIUM_PATTERNS_LIGHT[index % PREMIUM_PATTERNS_LIGHT.length]
}

export function SocialHub() {
  const { theme } = useTheme()
  const { toast } = useToast()
  const { user } = useAuth()
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null)
  const [events, setEvents] = useState<SocialEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<SocialEvent | null>(null)

  useEffect(() => {
    async function loadEvents() {
      try {
        setLoading(true)
        const fetchedEvents = await getEvents()
        setEvents(fetchedEvents)
        setError(null)
      } catch (err: any) {
        console.error('Failed to fetch events:', err);
        
        // Handle Family Office tier requirement
        if (err?.status === 403 && err?.detail) {
          setError(`Family Office Access Required: ${err.detail.error}`);
        } else {
          setError("Failed to load events");
        }
      } finally {
        setLoading(false)
      }
    }

    loadEvents()
  }, [])

  const handleTalkToConcierge = async (event: SocialEvent) => {
    setIsProcessing(true)
    setSelectedEvent(event)
    
    // Use centralized auth manager
    const authUser = getCurrentUser()
    const userId = user?.id || authUser?.userId || getCurrentUserId() || ""
    const userEmail = user?.email || authUser?.email || ""
    const userName = user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.firstName || user?.lastName || "Unknown User"
    
    try {
      const response = await fetch("https://formspree.io/f/xwpvjjpz", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          eventName: event.name,
          userName,
          userId,
          userEmail,
          eventId: event.id,
          eventCategory: event.category,
          eventLocation: event.location,
          eventVenue: event.venue,
          eventDate: event.start_date,
          eventEndDate: event.end_date,
          timestamp: new Date().toISOString(),
          _subject: `Talk to Concierge: ${event.name}`,
          message: `User ${userName} (${userEmail}) wants to talk to concierge about event: ${event.name}. Details: Category: ${event.category}, Location: ${event.location}, Venue: ${event.venue}, Date: ${event.start_date}`
        }),
      })
      
      
      const responseData = await response.text()
      
      if (!response.ok) {
        throw new Error(`Failed to submit concierge request: ${response.status} ${responseData}`)
      }
      
      setShowSuccessDialog(true)
      toast({
        title: "Concierge Notified",
        description: `Our concierge has been notified about your interest in ${event.name}.`,
        duration: 5000,
      })
    } catch (error) {
      toast({
        title: "Request Failed",
        description: "We couldn't process your request. Please try again later.",
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const toggleEventExpansion = (eventId: string) => {
    setExpandedEvent(expandedEvent === eventId ? null : eventId)
  }

  const formatDateRange = (start: string, end: string) => {
    const startDate = new Date(start)
    const endDate = new Date(end)
    const options = { month: "short", day: "numeric", year: "numeric" }
    return `${startDate.toLocaleDateString("en-US", options)} - ${endDate.toLocaleDateString("en-US", options)}`
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <CrownLoader size="lg" text="Loading elite events..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center p-4 text-red-500">
        <p>Error: {error}</p>
      </div>
    )
  }

  return (
    <div className="w-full">
        <div className="relative">
          {/* Vertical timeline line for medium+ screens */}
          <div className={`hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 ${colors.muted}`} />

          {events.map((event, index) => {
            // Get category color class based on theme
            const colorClass = theme === 'dark'
              ? getCategoryDarkColorClass(event.category)
              : getCategoryColorClass(event.category);
            
            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`mb-8 md:flex`}
              >
                {/* Date Bubble Column - always on left */}
                <div className="hidden md:flex items-center justify-center w-1/4 p-2">
                  <div
                    className={`w-24 h-24 rounded-full flex items-center justify-center shadow-xl 
                                backdrop-blur-sm border relative overflow-hidden
                                ${theme === "dark" 
                                  ? "border-primary/30" 
                                  : "border-primary/20"
                                }`}
                    style={{
                      background: theme === "dark" 
                        ? "linear-gradient(135deg, #1f1f1f 0%, #2a2a2a 25%, #1a1a1a 50%, #2a2a2a 75%, #1f1f1f 100%)"
                        : "linear-gradient(135deg, #f8f8f8 0%, #e0e0e0 25%, #ffffff 50%, #e0e0e0 75%, #f8f8f8 100%)",
                      border: theme === "dark" 
                        ? "2px solid rgba(255, 255, 255, 0.1)" 
                        : "2px solid rgba(192, 192, 192, 0.4)",
                      boxShadow: theme === "dark"
                        ? "0 10px 25px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
                        : "0 10px 25px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.8)",
                      backdropFilter: "blur(8px)"
                    }}
                  >
                    {/* Metallic shine effect */}
                    <div 
                      className="absolute inset-0 rounded-full opacity-40"
                      style={{
                        background: theme === "dark"
                          ? "linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.15) 50%, transparent 70%)"
                          : "linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.7) 50%, transparent 70%)"
                      }}
                    />
                    <div className={`text-center relative z-10 ${theme === "dark" ? "text-white" : "text-black"}`}>
                      <div className={`text-lg ${fonts.heading} font-bold drop-shadow-sm`}>
                        {new Date(event.start_date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                      <div className={`text-xs ${fonts.body} opacity-80`}>
                        {new Date(event.start_date).getFullYear()}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Card Column - expanded */}
                <div className="md:w-3/4 p-4">
                  <Card 
                        className="overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border-none bg-card"
                  >
                    <div>
                      {/* Ensure text is readable in both themes */}
                      <CardContent className="p-6 relative">
                        {/* Remove gradient overlay to match Wealth Radar style */}

                        <div className="relative">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <Heading3 className={`${fonts.heading} mb-4`}>
                                {event.name}
                              </Heading3>
                              
                              {/* Tags displayed below the title */}
                              <div className="flex flex-wrap gap-1 md:gap-2 mb-3 max-w-full">
                                {event.tags?.map((tag, tagIndex) => {
                                  return (
                                    <PremiumBadge
                                      key={tag}
                                      className="flex items-center gap-1 text-xs"
                                    >
                                      <Tag className="w-2 h-2 md:w-3 md:h-3" />
                                      {tag}
                                    </PremiumBadge>
                                  );
                                })}
                              </div>
                              
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="w-4 h-4" />
                                <span>{formatDateRange(event.start_date, event.end_date)}</span>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                              <span className="text-sm">{event.location}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Building className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                              <span className="text-sm">{event.venue}</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <Users className="w-4 h-4 text-muted-foreground mt-1 flex-shrink-0" />
                              <span className="text-sm">
                                {event.attendees && event.attendees.length > 0
                                  ? event.attendees.join(", ")
                                  : "Talk to Concierge"}
                              </span>
                            </div>
                          </div>

                          <AnimatePresence>
                            {expandedEvent === event.id && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-4"
                              >
                                <Paragraph className="text-sm mb-4 text-muted-foreground">
                                  {event.summary}
                                </Paragraph>

                                {/* Capacity: if valid, show number; otherwise "Capacity: Talk to Concierge" */}
                                {event.metadata?.capacity && !isNaN(event.metadata.capacity) ? (
                                  <div className="mt-2 text-sm text-muted-foreground">
                                    Capacity: {event.metadata.capacity} attendees
                                  </div>
                                ) : (
                                  <div className="mt-2 text-sm text-muted-foreground">
                                    Capacity: Talk to Concierge
                                  </div>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>

                          <div className="flex justify-between items-center mt-6 mb-2">
                            {/* Show More/Less as bold text */}
                            <button
                              onClick={() => toggleEventExpansion(event.id)}
                              className={`text-xs md:text-sm font-bold hover:underline cursor-pointer transition-all duration-200 ${
                                theme === "dark" ? "text-white hover:text-primary" : "text-black hover:text-primary"
                              }`}
                            >
                              {expandedEvent === event.id ? "Show Less" : "Show More"}
                            </button>
                            {/* Talk to Concierge button with primary colors */}
                            <Button
                              size="sm"
                              onClick={() => handleTalkToConcierge(event)}
                              className={`text-xs md:text-sm whitespace-nowrap ${
                                theme === "dark" 
                                  ? "bg-primary hover:bg-primary/90 text-black" 
                                  : "bg-primary hover:bg-primary/90 text-white"
                              }`}
                              disabled={isProcessing && selectedEvent?.id === event.id}
                            >
                              {isProcessing && selectedEvent?.id === event.id ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-1 md:mr-2 animate-spin flex-shrink-0" />
                                  Processing
                                </>
                              ) : (
                                <>
                                  <Phone className="w-4 h-4 mr-1 md:mr-2 flex-shrink-0" />
                                  Talk to Concierge
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                </div>
              </motion.div>
            )
          })}
        </div>
        
        {/* Success Dialog */}
        <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ThumbsUp className="h-5 w-5 text-green-500" />
                Concierge Notified
              </DialogTitle>
              <DialogDescription>
                Our concierge has been informed about your interest in{" "}
                <span className="font-semibold">{selectedEvent?.name}</span>.
              </DialogDescription>
            </DialogHeader>
            <div className="bg-muted/30 p-4 rounded-lg my-4">
              <p className="text-sm">
                Our events specialist will contact you shortly to discuss this event in detail
                and answer any questions you may have about attending.
              </p>
              <div className="flex items-center gap-2 mt-3 text-primary">
                <Phone className="h-4 w-4" />
                <p className="text-sm font-medium">Expect a call within 24 hours</p>
              </div>
            </div>
            <DialogFooter>
              <Button 
                onClick={() => setShowSuccessDialog(false)}
                className={`${getMetallicCardStyle(theme).className}`}
                style={{
                  ...getMetallicCardStyle(theme).style,
                  color: theme === "dark" ? "white" : "black"
                }}
              >
                Continue Exploring
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
    </div>
  )
}