// components/calendar/month-view.tsx
"use client"

import { useMemo } from "react"
import { isSameMonth, format } from "date-fns"
import { getDaysInMonth, isSameDay as isSameDayUtil } from "@/utils/calendar"
import { useTheme } from "@/contexts/theme-context"
import { getCategoryColorClass, getCategoryDarkColorClass, getDisplayCategory } from "@/utils/color-utils"

interface MonthViewProps {
  date: Date
  events: any[]
  onSelectDate: (date: Date) => void
  onSelectEvent: (event: any) => void
}

export function MonthView({ date, events, onSelectDate, onSelectEvent }: MonthViewProps) {
  const { theme } = useTheme()
  
  // Get all calendar dates to display
  const calendarDays = useMemo(() => {
    return getDaysInMonth(date)
  }, [date])

  // Group the days into weeks
  const calendarWeeks = useMemo(() => {
    const weeks = []
    for (let i = 0; i < calendarDays.length; i += 7) {
      weeks.push(calendarDays.slice(i, i + 7))
    }
    return weeks
  }, [calendarDays])

  return (
    <div className="mt-4">
      <div className="grid grid-cols-7 gap-px">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="p-2 text-center font-medium">
            {day}
          </div>
        ))}

        {calendarWeeks.map((week, weekIndex) => (
          week.map((day, dayIndex) => {
            const dayEvents = events.filter(event => isSameDayUtil(new Date(event.date), day))
            const isCurrentMonth = isSameMonth(day, date)
            const isToday = isSameDayUtil(day, new Date())
            
            return (
              <div
                key={`${weekIndex}-${dayIndex}`}
                className={`
                  min-h-[120px] p-1 border border-border
                  ${isCurrentMonth ? 'bg-background' : 'bg-muted/30'}
                  ${isToday ? 'ring-2 ring-primary ring-inset' : ''}
                  hover:bg-muted/20 cursor-pointer transition-colors
                `}
                onClick={() => onSelectDate(day)}
              >
                <div className="flex justify-between items-center mb-1">
                  <span
                    className={`
                      inline-block h-6 w-6 rounded-full text-center leading-6 text-xs
                      ${isToday ? 'bg-primary text-primary-foreground' : ''}
                    `}
                  >
                    {format(day, "d")}
                  </span>
                  {dayEvents.length > 0 && (
                    <span className="text-xs text-muted-foreground">
                      {dayEvents.length} event{dayEvents.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                
                <div className="space-y-1 overflow-y-auto max-h-[80px]">
                  {dayEvents.slice(0, 3).map((event) => {
                    // Get the display category and its color class based on theme
                    const displayCategory = getDisplayCategory(event);
                    const colorClass = theme === 'dark' 
                      ? getCategoryDarkColorClass(displayCategory)
                      : getCategoryColorClass(displayCategory);
                    
                    return (
                      <div
                        key={event.id}
                        onClick={(e) => {
                          e.stopPropagation()
                          onSelectEvent(event)
                        }}
                        className="cursor-pointer"
                      >
                        <div 
                          className={`${colorClass} text-white text-xs px-2 py-1 rounded truncate shadow hover:shadow-md transition-shadow`}
                        >
                          {event.title}
                        </div>
                        {event.attendees && Array.isArray(event.attendees) && event.attendees.length > 0 && (
                          <div className="text-xs text-muted-foreground ml-1 mt-0.5 truncate">
                            {event.attendees.length > 1 
                              ? `${event.attendees[0]} +${event.attendees.length - 1}`
                              : event.attendees[0]}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-center text-muted-foreground">
                      +{dayEvents.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            )
          })
        ))}
      </div>
    </div>
  )
}