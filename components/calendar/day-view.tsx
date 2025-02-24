// components/calendar/day-view.tsx
"use client"

import { format } from "date-fns"
import { isSameDay } from "@/utils/calendar"
import { useTheme } from "@/contexts/theme-context"
import { Users, MapPin } from "lucide-react"
import { getCategoryColorClass, getCategoryDarkColorClass, getDisplayCategory } from "@/utils/color-utils"

interface DayViewProps {
  date: Date
  events: any[]
  onSelectEvent: (event: any) => void
}

export function DayView({ date, events, onSelectEvent }: DayViewProps) {
  const { theme } = useTheme()
  const hours = Array.from({ length: 24 }, (_, i) => i)
  const dayEvents = events.filter(event => isSameDay(new Date(event.date), date))

  const getEventPosition = (eventDate: Date) => {
    const hour = eventDate.getHours()
    const minute = eventDate.getMinutes()
    return { hour, minute }
  }

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
    <div className="mt-4">
      <div className="text-center mb-4">
        <h3 className="text-xl font-bold">{format(date, "EEEE, MMMM do, yyyy")}</h3>
      </div>
      
      <div className="flex">
        <div className="w-16 pr-2">
          {hours.map(hour => (
            <div key={hour} className="h-16 text-right text-sm text-muted-foreground">
              {hour === 0 ? "12 AM" : hour < 12 ? `${hour} AM` : hour === 12 ? "12 PM" : `${hour - 12} PM`}
            </div>
          ))}
        </div>
        
        <div className="flex-1 relative">
          {hours.map(hour => (
            <div key={hour} className="h-16 border-t border-border relative">
              {/* Hour line */}
            </div>
          ))}
          
          {/* Events */}
          {dayEvents.map(event => {
            const { hour, minute } = getEventPosition(new Date(event.date))
            const topPosition = (hour * 60 + minute) * (16/60); // 16px per hour, converted to minutes
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
                  absolute left-1 right-1 rounded shadow-md
                  hover:shadow-lg transition-shadow cursor-pointer overflow-hidden
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
                  <div className="font-medium text-sm truncate">{event.title}</div>
                  <div className="text-xs truncate">
                    {format(new Date(event.date), "h:mm a")}
                    {event.endDate && ` - ${format(new Date(event.endDate), "h:mm a")}`}
                  </div>
                  
                  {event.location && (
                    <div className="text-xs truncate flex items-center">
                      <MapPin className="w-3 h-3 mr-1" />
                      <span>{event.location}</span>
                    </div>
                  )}
                  
                  {event.attendees && event.attendees.length > 0 && (
                    <div className="text-xs truncate flex items-center">
                      <Users className="w-3 h-3 mr-1" />
                      {typeof event.attendees === 'string' 
                        ? event.attendees 
                        : Array.isArray(event.attendees) && event.attendees.length > 0
                          ? (event.attendees.length > 2 
                              ? `${event.attendees[0]}, ${event.attendees[1]} +${event.attendees.length - 2}`
                              : event.attendees.join(", ")) 
                          : "None"}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}