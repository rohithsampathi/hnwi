// components/pages/calendar-page.tsx

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DayView } from "@/components/calendar/day-view"
import { WeekView } from "@/components/calendar/week-view"
import { MonthView } from "@/components/calendar/month-view"
import { YearView } from "@/components/calendar/year-view"
import { EventDetailsSection } from "@/components/calendar/event-details-section"
import { Heading2, Heading3 } from "@/components/ui/typography"
import { PageHeaderWithBack } from "@/components/ui/back-button"
import { getMonthYearString, isSameDay } from "@/utils/calendar"
import { format } from 'date-fns'

type CalendarView = "day" | "week" | "month" | "year"

export function CalendarPage({ onNavigate }: { onNavigate: (route: string) => void }) {
  const [view, setView] = useState<CalendarView>("month")
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState<any[]>([])
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null)
  const [selectedDateEvents, setSelectedDateEvents] = useState<any[]>([])

  useEffect(() => {
    const storedEvents = localStorage.getItem("userEvents")
    if (storedEvents) {
      try {
        // Convert stored events back to proper objects with Date objects
        const parsedEvents = JSON.parse(storedEvents).map((event: any) => ({
          ...event,
          date: new Date(event.date),
          endDate: event.endDate ? new Date(event.endDate) : undefined
        }))
        setEvents(parsedEvents)
      } catch (error) {
        // Initialize with empty array on error
        setEvents([])
        localStorage.setItem("userEvents", JSON.stringify([]))
      }
    } else {
      // Initialize with empty array if no events
      setEvents([])
      localStorage.setItem("userEvents", JSON.stringify([]))
    }
  }, [])

  const navigateToToday = () => {
    setCurrentDate(new Date())
  }

  const navigatePrevious = () => {
    const newDate = new Date(currentDate)
    switch (view) {
      case "day":
        newDate.setDate(currentDate.getDate() - 1)
        break
      case "week":
        newDate.setDate(currentDate.getDate() - 7)
        break
      case "month":
        newDate.setMonth(currentDate.getMonth() - 1)
        break
      case "year":
        newDate.setFullYear(currentDate.getFullYear() - 1)
        break
    }
    setCurrentDate(newDate)
  }

  const navigateNext = () => {
    const newDate = new Date(currentDate)
    switch (view) {
      case "day":
        newDate.setDate(currentDate.getDate() + 1)
        break
      case "week":
        newDate.setDate(currentDate.getDate() + 7)
        break
      case "month":
        newDate.setMonth(currentDate.getMonth() + 1)
        break
      case "year":
        newDate.setFullYear(currentDate.getFullYear() + 1)
        break
    }
    setCurrentDate(newDate)
  }

  const handleSelectEvent = (event: any) => {
    setSelectedEvent(event)
    setSelectedDateEvents([]) // Clear multiple event selection when viewing a single event
  }

  const handleSelectDate = (date: Date) => {
    // Set the current date to the selected date
    setCurrentDate(date)
    
    // Filter events for the selected date
    const dateEvents = events.filter(event => isSameDay(new Date(event.date), date))
    
    if (dateEvents.length === 1) {
      // If only one event, select it directly
      setSelectedEvent(dateEvents[0])
      setSelectedDateEvents([])
    } else if (dateEvents.length > 1) {
      // If multiple events, show them in the list
      setSelectedDateEvents(dateEvents)
      setSelectedEvent(null) // Clear single event selection
    } else {
      // No events for this date
      setSelectedDateEvents([])
      setSelectedEvent(null)
    }
  }

  const renderCalendarView = () => {
    switch (view) {
      case "day":
        return <DayView date={currentDate} events={events} onSelectEvent={handleSelectEvent} />
      case "week":
        return <WeekView date={currentDate} events={events} onSelectEvent={handleSelectEvent} />
      case "month":
        return (
          <MonthView
            date={currentDate}
            events={events}
            onSelectDate={handleSelectDate}
            onSelectEvent={handleSelectEvent}
          />
        )
      case "year":
        return (
          <YearView
            date={currentDate}
            events={events}
            onSelectMonth={(date) => {
              setCurrentDate(date)
              setView("month")
            }}
          />
        )
      default:
        return null
    }
  }

  // Render the list of events for the selected date (used for Month view)
  const renderSelectedDateEvents = () => {
    if (view !== "month" || selectedDateEvents.length === 0) return null;
    
    return (
      <div className="w-full">
        {/* Top heading for date with event count */}
        <h2 className="text-2xl font-bold mb-4">
          Events for {format(currentDate, 'EEEE, MMMM do, yyyy')} 
          <span className="ml-2 text-muted-foreground text-base font-normal">
            ({selectedDateEvents.length} event{selectedDateEvents.length !== 1 ? 's' : ''})
          </span>
        </h2>
        
        {/* Single "Event Details" heading for all events */}
        <h3 className="text-xl font-bold mb-4">Event Details</h3>
        
        {/* Map through events without individual headings */}
        <div className="space-y-6">
          {selectedDateEvents.map(event => (
            <div key={event.id}>
              <EventDetailsSection 
                event={event} 
                hideHeading={true} // Pass prop to hide the heading in the component
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="w-full">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="text-2xl font-bold">
                <div className="flex items-center space-x-4">
                  <Button variant="outline" size="icon" onClick={navigatePrevious}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="min-w-[200px] text-center">{getMonthYearString(currentDate)}</span>
                  <Button variant="outline" size="icon" onClick={navigateNext}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div>
                <Button variant="outline" onClick={navigateToToday}>
                  Today
                </Button>
              </div>
            </div>
            <Tabs value={view} onValueChange={(v) => setView(v as CalendarView)} className="w-full">
              <TabsList className="grid w-full max-w-[400px] grid-cols-4">
                <TabsTrigger value="day">Day</TabsTrigger>
                <TabsTrigger value="week">Week</TabsTrigger>
                <TabsTrigger value="month">Month</TabsTrigger>
                <TabsTrigger value="year">Year</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <div className="w-full">
            {renderCalendarView()}
            {/* Display events for selected date in Month view */}
            {renderSelectedDateEvents()}
            {/* Display selected event details */}
            {selectedEvent && !selectedDateEvents.length && <EventDetailsSection event={selectedEvent} />}
          </div>
      </div>
    </>
  )
}