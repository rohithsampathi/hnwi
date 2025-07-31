// components/social-hub.tsx

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Users, Tag, Clock, Building, Check, Loader2, ThumbsUp, Phone } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useTheme } from "@/contexts/theme-context"
import { Heading3, Paragraph } from "@/components/ui/typography"
import { fonts } from "@/styles/fonts"
import { colors } from "@/styles/colors"
// import { addEventToCalendar } from "@/utils/calendar-utils"
import { useToast } from "@/components/ui/use-toast"
import { SocialEvent, getEvents } from "@/lib/api"
import { getCategoryColorClass, getCategoryDarkColorClass } from "@/utils/color-utils"
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
      } catch (err) {
        setError("Failed to load events")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadEvents()
  }, [])

  const handleTalkToConcierge = async (event: SocialEvent) => {
    setIsProcessing(true)
    setSelectedEvent(event)
    
    const userId = user?.id || localStorage.getItem("userId") || ""
    const userEmail = user?.email || localStorage.getItem("userEmail") || ""
    const userName = user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.firstName || user?.lastName || "Unknown User"
    
    console.log("Submitting event form to Formspree with data:", {
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
    })
    
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
      
      console.log("Formspree response status:", response.status)
      console.log("Formspree response headers:", response.headers)
      
      const responseData = await response.text()
      console.log("Formspree response data:", responseData)
      
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
      console.error("Error submitting concierge request:", error)
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
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
                className={`mb-8 md:flex ${index % 2 === 0 ? "md:flex-row-reverse" : ""}`}
              >
                {/* Card Column */}
                <div className="md:w-1/2 p-4">
                  <Card
                    className="overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
                    style={{
                      backgroundColor: theme === "dark" ? "hsl(165, 46%, 8%)" : "white"
                    }}
                  >
                    {/* Using same dark green as Elite Pulse cards in dark mode, white in light mode */}
                    <div
                      style={{
                        backgroundColor: theme === "dark" ? "hsl(165, 46%, 8%)" : "white"
                      }}
                    >
                      {/* Ensure text is readable in both themes */}
                      <CardContent className="p-6 relative dark:text-white text-black">
                        {/* Remove gradient overlay to match Wealth Radar style */}

                        <div className="relative">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <Heading3
                                className={`${fonts.heading} mb-1 dark:text-white text-black`}
                              >
                                {event.name}
                              </Heading3>
                              
                              {/* Tags displayed below the title */}
                              <div className="flex flex-wrap gap-1 md:gap-2 mb-3 max-w-full overflow-hidden">
                                {event.tags?.map((tag, tagIndex) => {
                                  // Get a unique color for each tag based on the tag name
                                  const colorClasses = [
                                    "bg-amber-100 border-amber-200 text-amber-800",
                                    "bg-teal-100 border-teal-200 text-teal-800",
                                    "bg-purple-100 border-purple-200 text-purple-800",
                                    "bg-blue-100 border-blue-200 text-blue-800",
                                    "bg-pink-100 border-pink-200 text-pink-800",
                                    "bg-indigo-100 border-indigo-200 text-indigo-800",
                                    "bg-rose-100 border-rose-200 text-rose-800",
                                    "bg-emerald-100 border-emerald-200 text-emerald-800"
                                  ];
                                  const colorClass = colorClasses[tagIndex % colorClasses.length];
                                  
                                  // In dark mode, keep the same vibrant colors as light mode
                                  // but with transparency for better contrast
                                  const darkModeColorClass = colorClass.replace(
                                    /bg-(\w+)-100 border-(\w+)-200 text-(\w+)-800/,
                                    "bg-$1-100/20 border-$1-300/30 text-$1-300"
                                  );
                                  
                                  return (
                                    <Badge
                                      key={tag}
                                      variant="outline"
                                      className={`flex items-center gap-1 text-xs
                                                ${theme === "dark" ? darkModeColorClass : colorClass} 
                                                hover:opacity-80`}
                                    >
                                      <Tag className="w-2 h-2 md:w-3 md:h-3" />
                                      {tag}
                                    </Badge>
                                  );
                                })}
                              </div>
                              
                              <div className="flex items-center gap-2 text-sm dark:text-white/70 text-black/70">
                                <Clock className="w-4 h-4" />
                                <span>{formatDateRange(event.start_date, event.end_date)}</span>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3 dark:text-white/90 text-black/90">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 dark:text-white/70 text-black/70 flex-shrink-0" />
                              <span className="text-sm line-clamp-1">{event.location}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Building className="w-4 h-4 dark:text-white/70 text-black/70 flex-shrink-0" />
                              <span className="text-sm line-clamp-1">{event.venue}</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <Users className="w-4 h-4 dark:text-white/70 text-black/70 mt-1 flex-shrink-0" />
                              <span className="text-sm line-clamp-2">
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
                                <Paragraph className="text-sm mb-4 dark:text-white/80 text-black/80">
                                  {event.summary}
                                </Paragraph>

                                {/* Capacity: if valid, show number; otherwise "Capacity: Talk to Concierge" */}
                                {event.metadata?.capacity && !isNaN(event.metadata.capacity) ? (
                                  <div className="mt-2 text-sm dark:text-white/70 text-black/70">
                                    Capacity: {event.metadata.capacity} attendees
                                  </div>
                                ) : (
                                  <div className="mt-2 text-sm dark:text-white/70 text-black/70">
                                    Capacity: Talk to Concierge
                                  </div>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>

                          <div className="flex justify-between items-center mt-6">
                            {/* Show More/Less button */}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleEventExpansion(event.id)}
                              className={`
                                ${theme === "dark"
                                  ? 'bg-green-600/20 border-green-500/30 text-green-300 hover:bg-green-600/30'
                                  : 'bg-green-100 border-green-300 text-green-700 hover:bg-green-200'
                                }
                              `}
                            >
                              {expandedEvent === event.id ? "Show Less" : "Show More"}
                            </Button>
                            {/* Talk to Concierge button */}
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleTalkToConcierge(event)}
                              className={`
                                ${theme === "dark"
                                  ? 'bg-green-600 hover:bg-green-700 text-white border border-green-500'
                                  : 'bg-green-500 hover:bg-green-600 text-white border border-green-400'
                                } 
                                text-xs md:text-sm whitespace-nowrap
                              `}
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

                {/* Date Bubble Column (hidden on small) */}
                <div className="hidden md:flex items-center justify-center w-1/2">
                  <div
                    className={`w-32 h-32 rounded-full flex items-center justify-center shadow-lg 
                                backdrop-blur-sm border
                                ${theme === "dark" 
                                  ? "bg-gradient-to-br from-green-600/60 to-green-800/60 border-white/10" 
                                  : "bg-gradient-to-br from-green-400/60 to-green-600/60 border-black/10"
                                }`}
                  >
                    <div className="text-center dark:text-white text-white">
                      <div className={`text-2xl ${fonts.heading} font-bold`}>
                        {new Date(event.start_date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                      <div className={`text-sm ${fonts.body}`}>
                        {new Date(event.start_date).getFullYear()}
                      </div>
                    </div>
                  </div>
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
              <Button onClick={() => setShowSuccessDialog(false)}>
                Continue Exploring
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
    </div>
  )
}