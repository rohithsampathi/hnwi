// components/calendar/day-view.tsx

"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import type { CalendarEvent } from "@/types/calendar"
import { formatTime, getCategoryColor } from "@/utils/calendar"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

interface DayViewProps {
  date: Date
  events: CalendarEvent[]
}

export function DayView({ date, events }: DayViewProps) {
  const hours = Array.from({ length: 24 }, (_, i) => i)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)

  const getEventsForHour = (hour: number) => {
    return events.filter((event) => {
      const eventHour = event.date.getHours()
      return eventHour === hour
    })
  }

  return (
    <ScrollArea className="h-[calc(100vh-300px)]">
      <div className="min-w-[600px]">
        {hours.map((hour) => (
          <div key={hour} className="flex border-t border-border min-h-[60px] relative group">
            <div className="w-20 py-2 px-4 text-sm text-muted-foreground">
              {hour === 0 ? "12 AM" : hour < 12 ? `${hour} AM` : hour === 12 ? "12 PM" : `${hour - 12} PM`}
            </div>
            <div className="flex-1 grid grid-cols-1 gap-2 p-2">
              {getEventsForHour(hour).map((event) => (
                <motion.div
                  key={event.id}
                  layoutId={event.id}
                  onClick={() => setSelectedEvent(event)}
                  className={`${getCategoryColor(
                    event.category,
                  )} text-white rounded-md p-2 cursor-pointer hover:opacity-90 transition-opacity`}
                >
                  <div className="font-semibold">{event.title}</div>
                  <div className="text-sm opacity-90">
                    {formatTime(event.date)}
                    {event.endDate && ` - ${formatTime(event.endDate)}`}
                  </div>
                  {event.location && <div className="text-sm opacity-90">{event.location}</div>}
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
      {selectedEvent && (
        <Card className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-4 w-96">
          <h3 className="font-semibold text-lg mb-2">{selectedEvent.title}</h3>
          <p className="text-sm text-muted-foreground mb-2">{selectedEvent.description}</p>
          <div className="text-sm">
            <div>
              {formatTime(selectedEvent.date)}
              {selectedEvent.endDate && ` - ${formatTime(selectedEvent.endDate)}`}
            </div>
            {selectedEvent.location && <div>{selectedEvent.location}</div>}
          </div>
        </Card>
      )}
    </ScrollArea>
  )
}

