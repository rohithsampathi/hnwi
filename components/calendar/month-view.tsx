// components/calendar/month-view.tsx

"use client"

import type { CalendarEvent } from "@/types/calendar"
import { getDaysInMonth, isSameDay, getCategoryColor } from "@/utils/calendar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { motion } from "framer-motion"

interface MonthViewProps {
  date: Date
  events: CalendarEvent[]
  onSelectDate?: (date: Date) => void
  onSelectEvent?: (event: CalendarEvent) => void
}

export function MonthView({ date, events, onSelectDate, onSelectEvent }: MonthViewProps) {
  const days = getDaysInMonth(date)
  const today = new Date()

  const getEventsForDay = (day: Date) => {
    return events.filter((event) => isSameDay(new Date(event.date), day))
  }

  return (
    <ScrollArea className="h-[calc(100vh-300px)]">
      <div className="grid grid-cols-7 gap-px bg-muted p-px rounded-lg">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="bg-background p-2 text-center font-semibold">
            {day}
          </div>
        ))}
        {days.map((day, index) => {
          const dayEvents = getEventsForDay(day)
          const isToday = isSameDay(day, today)
          const isCurrentMonth = day.getMonth() === date.getMonth()

          return (
            <motion.div
              key={index}
              whileHover={{ scale: 1.02 }}
              className={`bg-background p-2 min-h-[100px] cursor-pointer ${!isCurrentMonth ? "opacity-50" : ""}`}
              onClick={() => onSelectDate?.(day)}
            >
              <div
                className={`text-sm font-semibold mb-1 ${
                  isToday
                    ? "bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center mx-auto"
                    : ""
                }`}
              >
                {day.getDate()}
              </div>
              <div className="space-y-1">
                {dayEvents.map((event) => (
                  <div
                    key={event.id}
                    className={`${getCategoryColor(
                      event.category,
                    )} text-white text-xs rounded px-1 py-px truncate cursor-pointer`}
                    onClick={(e) => {
                      e.stopPropagation()
                      onSelectEvent?.(event)
                    }}
                  >
                    {event.title}
                  </div>
                ))}
              </div>
            </motion.div>
          )
        })}
      </div>
    </ScrollArea>
  )
}

