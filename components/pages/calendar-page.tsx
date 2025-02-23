// components/pages/calendar-page.tsx

"use client"

import { useState, useEffect } from "react"
import { Layout } from "@/components/layout/layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarIcon, ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DayView } from "@/components/calendar/day-view"
import { WeekView } from "@/components/calendar/week-view"
import { MonthView } from "@/components/calendar/month-view"
import { YearView } from "@/components/calendar/year-view"
import { EventDetailsSection } from "@/components/calendar/event-details-section"
import { Heading2 } from "@/components/ui/typography"
import { getMonthYearString } from "@/utils/calendar"
import type { CalendarEvent } from "@/types/calendar"
import { AddEventDialog } from "@/components/calendar/add-event-dialog"

type CalendarView = "day" | "week" | "month" | "year"

export function CalendarPage({ onNavigate }: { onNavigate: (route: string) => void }) {
  const [view, setView] = useState<CalendarView>("month")
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [isAddEventDialogOpen, setIsAddEventDialogOpen] = useState(false)

  useEffect(() => {
    const storedEvents = localStorage.getItem("userEvents")
    if (storedEvents) {
      setEvents(JSON.parse(storedEvents))
    } else {
      // Add placeholder events if no events are stored
      const placeholderEvents: CalendarEvent[] = [
        {
          id: "1",
          title: "Luxury Yacht Showcase",
          date: new Date(new Date().setDate(new Date().getDate() + 7)),
          category: "social",
          location: "Monaco Harbor",
          description:
            "Experience the epitome of maritime luxury with the latest superyacht designs and cutting-edge marine technology.",
        },
        {
          id: "2",
          title: "Private Art Auction",
          date: new Date(new Date().setDate(new Date().getDate() + 14)),
          category: "personal",
          location: "Gallery XYZ, New York",
          description: "Exclusive auction featuring rare pieces from renowned artists and private collections.",
        },
        {
          id: "3",
          title: "HNWI Investment Summit",
          date: new Date(new Date().setDate(new Date().getDate() + 21)),
          category: "work",
          location: "Ritz-Carlton, Singapore",
          description:
            "Annual gathering of global wealth managers and investment professionals discussing market trends and opportunities.",
        },
      ]
      setEvents(placeholderEvents)
      localStorage.setItem("userEvents", JSON.stringify(placeholderEvents))
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

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event)
  }

  const handleAddEvent = () => {
    setIsAddEventDialogOpen(true)
  }

  const handleEventAdded = (newEvent: CalendarEvent) => {
    const updatedEvents = [...events, newEvent]
    setEvents(updatedEvents)
    localStorage.setItem("userEvents", JSON.stringify(updatedEvents))
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
            onSelectDate={(date) => setCurrentDate(date)}
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

  return (
    <Layout
      title={
        <div className="flex items-center space-x-2">
          <CalendarIcon className="w-6 h-6 text-primary" />
          <Heading2>My Calendar</Heading2>
        </div>
      }
      showBackButton
      onNavigate={onNavigate}
    >
      <Card>
        <CardHeader className="space-y-4">
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold">
              <div className="flex items-center space-x-4">
                <Button variant="outline" size="icon" onClick={navigatePrevious}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="min-w-[200px] text-center">{getMonthYearString(currentDate)}</span>
                <Button variant="outline" size="icon" onClick={navigateNext}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={navigateToToday}>
                Today
              </Button>
              <Button onClick={handleAddEvent}>
                <Plus className="h-4 w-4 mr-2" />
                Add Event
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
        </CardHeader>
        <CardContent>
          {renderCalendarView()}
          <EventDetailsSection event={selectedEvent} />
        </CardContent>
      </Card>
      <AddEventDialog
        isOpen={isAddEventDialogOpen}
        onClose={() => setIsAddEventDialogOpen(false)}
        onAddEvent={handleEventAdded}
        initialDate={currentDate}
      />
    </Layout>
  )
}

