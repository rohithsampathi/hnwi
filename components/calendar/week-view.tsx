// components/calendar/week-view.tsx

"use client"

import type { CalendarEvent } from "@/types/calendar"
import { formatTime, getWeekDates, getCategoryColor } from "@/utils/calendar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { motion } from "framer-motion"

interface WeekViewProps {
  date: Date
  events: CalendarEvent[]
}

export function WeekView({ date, events }: WeekViewProps) {
  const weekDays = getWeekDates(date)
  const hours = Array.from({ length: 24 }, (_, i) => i)

  const getEventsForDayAndHour = (day: Date, hour: number) => {
    return events.filter((event) => {
      const eventDate = new Date(event.date)
      return (
        eventDate.getDate() === day.getDate() &&
        eventDate.getMonth() === day.getMonth() &&
        eventDate.getFullYear() === day.getFullYear() &&
        eventDate.getHours() === hour
      )
    })
  }

  return (
    <ScrollArea className="h-[calc(100vh-300px)]">
      <div className="min-w-[900px]">
        <div className="grid grid-cols-8 border-b border-border">
          <div className="w-20" />
          {weekDays.map((day, index) => (
            <div key={index} className="py-2 text-center border-l border-border first:border-l-0">
              <div className="font-semibold">{day.toLocaleDateString("en-US", { weekday: "short" })}</div>
              <div className="text-sm text-muted-foreground">
                {day.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </div>
            </div>
          ))}
        </div>
        <div>
          {hours.map((hour) => (
            <div key={hour} className="grid grid-cols-8 border-t border-border min-h-[60px]">
              <div className="w-20 py-2 px-4 text-sm text-muted-foreground">
                {hour === 0 ? "12 AM" : hour < 12 ? `${hour} AM` : hour === 12 ? "12 PM" : `${hour - 12} PM`}
              </div>
              {weekDays.map((day, dayIndex) => (
                <div key={dayIndex} className="border-l border-border first:border-l-0 p-1">
                  {getEventsForDayAndHour(day, hour).map((event) => (
                    <motion.div
                      key={event.id}
                      layoutId={event.id}
                      className={`${getCategoryColor(
                        event.category,
                      )} text-white rounded-md p-2 text-sm mb-1 cursor-pointer hover:opacity-90 transition-opacity`}
                    >
                      <div className="font-semibold truncate">{event.title}</div>
                      <div className="text-xs opacity-90">
                        {formatTime(event.date)}
                        {event.endDate && ` - ${formatTime(event.endDate)}`}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </ScrollArea>
  )
}

