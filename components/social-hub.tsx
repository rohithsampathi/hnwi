// components/social-hub.tsx

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CalendarPlus, MapPin, Users, Tag, Clock, Building } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useTheme } from "@/contexts/theme-context"
import { Heading3, Paragraph } from "@/components/ui/typography"
import { fonts } from "@/styles/fonts"
import { colors } from "@/styles/colors"
import { addEventToCalendar } from "@/utils/calendar-utils"
import { useToast } from "@/components/ui/use-toast"
import { SocialEvent, getEvents } from "@/lib/api"

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
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null)
  const [events, setEvents] = useState<SocialEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  const addToCalendar = (event: SocialEvent) => {
    addEventToCalendar({
      id: event.id,
      title: event.name,
      date: new Date(event.start_date),
      endDate: new Date(event.end_date),
      category: event.category,
      location: event.venue,
      description: event.summary,
    })
    toast({
      title: "Event Added",
      description: "The event has been added to your calendar.",
    })
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
    <Card className={`w-full ${colors.background} ${colors.foreground}`}>
      <CardContent>
        <div className="relative">
          {/* Vertical timeline line for medium+ screens */}
          <div className={`hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 ${colors.muted}`} />

          {events.map((event, index) => (
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
                  className={`overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 
                              ${getPatternClass(index, theme)}`}
                >
                  {/* Overlay adjusted for both themes */}
                  <div
                    className={`backdrop-blur-sm ${
                      theme === "dark" ? "bg-black/30" : "bg-white/50"
                    }`}
                  >
                    {/* Ensure text is readable in both themes */}
                    <CardContent className="p-6 relative dark:text-white text-black">
                      {/* Premium accent overlay */}
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10 opacity-20 pointer-events-none"></div>

                      <div className="relative">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            {/* Category tag: black in light mode, white in dark mode */}
                            <Badge
                              className="
                                mb-2
                                dark:bg-white/10 dark:hover:bg-white/20 dark:text-white
                                bg-black/10 hover:bg-black/20 text-black
                              "
                            >
                              {event.category}
                            </Badge>
                            <Heading3
                              className={`${fonts.heading} mb-1 dark:text-white text-black`}
                            >
                              {event.name}
                            </Heading3>
                            <div className="flex items-center gap-2 text-sm dark:text-white/70 text-black/70">
                              <Clock className="w-4 h-4" />
                              <span>{formatDateRange(event.start_date, event.end_date)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3 dark:text-white/90 text-black/90">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 dark:text-white/70 text-black/70" />
                            <span>{event.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Building className="w-4 h-4 dark:text-white/70 text-black/70" />
                            <span>{event.venue}</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <Users className="w-4 h-4 dark:text-white/70 text-black/70 mt-1" />
                            <span>
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
                              <div className="flex flex-wrap gap-2">
                                {event.tags?.map((tag) => (
                                  <Badge
                                    key={tag}
                                    variant="outline"
                                    className="flex items-center gap-1 
                                               dark:bg-white/5 dark:border-white/20 dark:text-white/90
                                               bg-black/10 border-black/20 text-black/90"
                                  >
                                    <Tag className="w-3 h-3" />
                                    {tag}
                                  </Badge>
                                ))}
                              </div>

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
                              dark:bg-white/5 dark:border-white/20 dark:text-white dark:hover:bg-white/10
                              bg-black/10 border-black/20 text-black hover:bg-black/20
                            `}
                          >
                            {expandedEvent === event.id ? "Show Less" : "Show More"}
                          </Button>
                          {/* Add to Calendar button */}
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => addToCalendar(event)}
                            className={`
                              dark:bg-white/10 dark:hover:bg-white/20 dark:text-white
                              bg-black/10 hover:bg-black/20 text-black
                            `}
                          >
                            <CalendarPlus className="w-4 h-4 mr-2" />
                            Add to Calendar
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
                  className={`w-32 h-32 rounded-full bg-gradient-to-br 
                              from-purple-500/50 to-pink-500/50 
                              flex items-center justify-center shadow-lg 
                              backdrop-blur-sm 
                              dark:border-white/10 border-black/10`}
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
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
