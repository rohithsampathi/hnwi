// components/calendar/event-details-section.tsx

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate, formatTime } from "@/utils/calendar"
import { motion, AnimatePresence } from "framer-motion"
import { MapPin, Clock, CalendarIcon, Tag } from "lucide-react"
import type { CalendarEvent } from "@/types/calendar"
import { useToast } from "@/components/ui/use-toast"

interface EventDetailsSectionProps {
  event: CalendarEvent | null
}

export function EventDetailsSection({ event }: EventDetailsSectionProps) {
  const [isReserving, setIsReserving] = useState(false)
  const { toast } = useToast()

  const handleReserveEvent = async () => {
    setIsReserving(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsReserving(false)

    toast({
      title: "Event Reserved",
      description: "Our Concierge has been informed and will contact you shortly to confirm the details.",
      duration: 5000,
    })
  }

  if (!event) return null

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-2xl">{event.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                <span>{formatDate(event.date)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <span>
                  {formatTime(event.date)}
                  {event.endDate && ` - ${formatTime(event.endDate)}`}
                </span>
              </div>
              {event.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <span>{event.location}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Tag className="h-5 w-5 text-muted-foreground" />
                <span className="capitalize">{event.category}</span>
              </div>
              {event.description && (
                <div className="mt-4">
                  <p className="text-muted-foreground">{event.description}</p>
                </div>
              )}
              <div className="mt-6">
                <Button onClick={handleReserveEvent} className="w-full sm:w-auto" disabled={isReserving}>
                  {isReserving ? "Reserving Event..." : "Reserve Event"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  )
}

