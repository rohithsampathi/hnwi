"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CalendarPlus, MapPin, Users } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useTheme } from "@/contexts/theme-context"
import { Heading3, Paragraph } from "@/components/ui/typography"
import { fonts } from "@/styles/fonts"
import { colors } from "@/styles/colors"
import { addEventToCalendar } from "@/utils/calendar-utils"
import { useToast } from "@/components/ui/use-toast"

interface Event {
  id: string
  date: string
  time: string
  title: string
  location: string
  attendees: string
  summary: string
}

const events: Event[] = [
  {
    id: "1",
    date: "Mar 15, 2024",
    time: "7:00 PM",
    title: "Exclusive Art Gala",
    location: "New York City",
    attendees: "Art collectors, gallery owners, and HNWI enthusiasts",
    summary:
      "An evening of fine art, networking, and champagne. Featuring works from emerging and established artists.",
  },
  {
    id: "2",
    date: "Apr 5, 2024",
    time: "2:00 PM",
    title: "Luxury Yacht Showcase",
    location: "Monaco",
    attendees: "Yacht enthusiasts, brokers, and potential HNWI buyers",
    summary:
      "Experience the epitome of maritime luxury with the latest superyacht designs and cutting-edge marine technology.",
  },
  {
    id: "3",
    date: "May 20, 2024",
    time: "6:30 PM",
    title: "Private Wine Tasting Soirée",
    location: "Napa Valley, California",
    attendees: "Wine connoisseurs, sommeliers, and HNWI collectors",
    summary: "An intimate evening featuring rare vintages and gourmet pairings, hosted by world-renowned vintners.",
  },
  {
    id: "4",
    date: "Jun 10, 2024",
    time: "11:00 AM",
    title: "Exclusive Golf Tournament",
    location: "St Andrews, Scotland",
    attendees: "Professional golfers, celebrities, and HNWI golf enthusiasts",
    summary:
      "A prestigious golf event combining sport, luxury, and networking opportunities on the world's most iconic course.",
  },
]

export function SocialHub() {
  const { theme } = useTheme()
  const { toast } = useToast()
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null)

  const addToCalendar = (event: Event) => {
    addEventToCalendar({
      id: event.id,
      title: event.title,
      date: new Date(event.date + " " + event.time),
      endDate: event.time.includes("-") ? new Date(event.date + " " + event.time.split("-")[1].trim()) : undefined,
      category: "social",
      location: event.location,
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

  return (
    <Card className={`w-full ${colors.background} ${colors.foreground}`}>
      <CardContent>
        <div className="relative">
          <div className={`hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 ${colors.muted}`} />

          {events.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`mb-8 md:flex ${index % 2 === 0 ? "md:flex-row-reverse" : ""}`}
            >
              <div className="md:w-1/2 p-4">
                <Card className={`${colors.background} shadow-lg`}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <Heading3 className={`${fonts.heading} ${colors.primary}`}>{event.title}</Heading3>
                        <Paragraph className={`text-sm ${colors.muted}`}>
                          {event.date} at {event.time}
                        </Paragraph>
                      </div>
                      <Badge variant="outline" className="ml-2 flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span>{event.location}</span>
                      </Badge>
                    </div>
                    <Paragraph className={`text-sm mb-2 flex items-center ${colors.foreground}`}>
                      <Users className="w-4 h-4 mr-2" />
                      {event.attendees}
                    </Paragraph>
                    <AnimatePresence>
                      {expandedEvent === event.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          <Paragraph className={`text-sm mt-2 ${colors.foreground}`}>{event.summary}</Paragraph>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <div className="flex justify-between items-center mt-4">
                      <Button variant="outline" size="sm" onClick={() => toggleEventExpansion(event.id)}>
                        {expandedEvent === event.id ? "Less Info" : "More Info"}
                      </Button>
                      <Button variant="default" size="sm" onClick={() => addToCalendar(event)}>
                        <CalendarPlus className="w-4 h-4 mr-2" />
                        Add to Calendar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="hidden md:flex items-center justify-center w-1/2">
                <div className={`w-32 h-32 rounded-full ${colors.accent} flex items-center justify-center`}>
                  <div className="text-center">
                    <div className={`text-2xl ${fonts.heading} font-bold`}>{event.date.split(",")[0]}</div>
                    <div className={`text-sm ${fonts.body}`}>{event.date.split(",")[1]}</div>
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

