// components/calendar/year-view.tsx

"use client"

import type { CalendarEvent } from "@/types/calendar"
import { getDaysInMonth, isSameDay } from "@/utils/calendar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { motion } from "framer-motion"

interface YearViewProps {
  date: Date
  events: CalendarEvent[]
  onSelectMonth?: (date: Date) => void
}

export function YearView({ date, events, onSelectMonth }: YearViewProps) {
  const months = Array.from({ length: 12 }, (_, i) => new Date(date.getFullYear(), i, 1))
  const today = new Date()

  const getEventsForMonth = (month: Date) => {
    return events.filter(
      (event) => event.date.getMonth() === month.getMonth() && event.date.getFullYear() === month.getFullYear(),
    )
  }

  return (
    <ScrollArea className="h-[calc(100vh-300px)]">
      <div className="grid grid-cols-3 gap-4 p-4">
        {months.map((month) => {
          const days = getDaysInMonth(month)
          const monthEvents = getEventsForMonth(month)

          return (
            <motion.div
              key={month.getMonth()}
              whileHover={{ scale: 1.02 }}
              className="bg-card rounded-lg shadow-sm overflow-hidden cursor-pointer"
              onClick={() => onSelectMonth?.(month)}
            >
              <div className="bg-primary p-2">
                <h3 className="text-primary-foreground font-semibold">
                  {month.toLocaleDateString("en-US", { month: "long" })}
                </h3>
              </div>
              <div className="grid grid-cols-7 gap-px p-2">
                {["S", "M", "T", "W", "T", "F", "S"].map((day) => (
                  <div key={day} className="text-center text-xs text-muted-foreground">
                    {day}
                  </div>
                ))}
                {days.map((day, i) => {
                  const isToday = isSameDay(day, today)
                  const isCurrentMonth = day.getMonth() === month.getMonth()
                  const hasEvents = monthEvents.some((event) => isSameDay(new Date(event.date), day))

                  return (
                    <div
                      key={i}
                      className={`text-center text-xs p-1 ${!isCurrentMonth ? "opacity-50" : ""} ${
                        isToday ? "bg-primary text-primary-foreground rounded-full" : ""
                      }`}
                    >
                      {day.getDate()}
                      {hasEvents && <div className="w-1 h-1 bg-primary rounded-full mx-auto mt-px" />}
                    </div>
                  )
                })}
              </div>
              <div className="p-2 border-t">
                <p className="text-sm text-muted-foreground">
                  {monthEvents.length} event{monthEvents.length !== 1 ? "s" : ""}
                </p>
              </div>
            </motion.div>
          )
        })}
      </div>
    </ScrollArea>
  )
}

export default YearView

