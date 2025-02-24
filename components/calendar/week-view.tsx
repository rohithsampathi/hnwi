// components/calendar/week-view.tsx
"use client"

import { useMemo } from "react"
import { format } from "date-fns"
import { getWeekDates, isSameDay } from "@/utils/calendar"
import { useTheme } from "@/contexts/theme-context"
import { Users } from "lucide-react"
import { getCategoryColorClass, getCategoryDarkColorClass, getDisplayCategory } from "@/utils/color-utils"

interface WeekViewProps {
  date: Date
  events: any[]
  onSelectEvent: (event: any) => void
}

export function WeekView({ date, events, onSelectEvent }: WeekViewProps) {
  const { theme } = useTheme()
  const weekDays = useMemo(() => {
    return getWeekDates(date)
  }, [date])

  const hours = Array.from({ length: 24 }, (_, i) => i)

  // Calculate event duration in minutes (default to 60 min if no end date)
  const getEventDuration = (event: any) => {
    if (!event.endDate) return 60;
    
    const start = new Date(event.date);
    const end = new Date(event.endDate);
    
    return Math.max(
      30, // Minimum height
      (end.getTime() - start.getTime()) / (1000 * 60) // Duration in minutes
    );
  }

  return (
    <div className="mt-4 overflow-x-auto">
      <div className="min-w-[800px]">
        {/* Day headers */}
        <div className="grid grid-cols-8 gap-px">
          <div className="p-2 text-center font-medium"></div>
          {weekDays.map((day) => (
            <div key={day.toString()} className="p-2 text-center font-medium">
              <div>{format(day, "EEE")}</div>
              <div className={`text-sm ${isSameDay(day, new Date()) ? "bg-primary text-primary-foreground rounded-full px-2" : ""}`}>
                {format(day, "d")}
              </div>
            </div>
          ))}
        </div>

        {/* Time grid */}
        <div className="grid grid-cols-8 gap-px">
          {/* Time labels */}
          <div>
            {hours.map(hour => (
              <div key={hour} className="h-16 text-right pr-2 text-sm text-muted-foreground">
                {hour === 0 ? "12 AM" : hour < 12 ? `${hour} AM` : hour === 12 ? "12 PM" : `${hour - 12} PM`}
              </div>
            ))}
          </div>

          {/* Day columns */}
          {weekDays.map((day, dayIndex) => (
            <div key={day.toString()} className="relative">
              {hours.map(hour => (
                <div key={hour} className="h-16 border-t border-border"></div>
              ))}

              {/* Events for this day */}
              {events
                .filter(event => isSameDay(new Date(event.date), day))
                .map(event => {
                  const eventDate = new Date(event.date)
                  const hour = eventDate.getHours()
                  const minute = eventDate.getMinutes()
                  const topPosition = (hour * 60 + minute) * (16/60); // 16px per hour
                  const duration = getEventDuration(event);
                  const height = Math.min(24 * 60, duration) * (16/60); // Convert minutes to pixels (max 24h)

                  // Get display category and color class
                  const displayCategory = getDisplayCategory(event);
                  const colorClass = theme === 'dark' 
                    ? getCategoryDarkColorClass(displayCategory)
                    : getCategoryColorClass(displayCategory);

                  return (
                    <div
                      key={event.id}
                      className={`
                        absolute left-1 right-1 rounded shadow-sm overflow-hidden
                        hover:shadow-md transition-shadow cursor-pointer
                        ${colorClass}
                      `}
                      style={{
                        top: `${topPosition}px`,
                        height: `${Math.max(32, height)}px`, // Minimum height of 32px
                        zIndex: 10
                      }}
                      onClick={() => onSelectEvent(event)}
                    >
                      <div className="h-full p-1 text-white">
                        <div className="font-medium text-xs truncate">{event.title}</div>
                        <div className="text-xs truncate">{format(eventDate, "h:mm a")}</div>
                        
                        {event.attendees && (
                          <div className="text-xs truncate flex items-center">
                            <Users className="w-3 h-3 mr-1" />
                            {typeof event.attendees === 'string' 
                              ? event.attendees 
                              : Array.isArray(event.attendees) && event.attendees.length > 0
                                ? (event.attendees.length > 1 
                                    ? `${event.attendees[0]} +${event.attendees.length - 1}`
                                    : event.attendees[0]) 
                                : ""}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}