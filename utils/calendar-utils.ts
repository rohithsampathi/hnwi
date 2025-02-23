import type { CalendarEvent } from "@/types/calendar"

export function addEventToCalendar(event: CalendarEvent) {
  const storedEvents = localStorage.getItem("userEvents")
  const events = storedEvents ? JSON.parse(storedEvents) : []

  events.push(event)
  localStorage.setItem("userEvents", JSON.stringify(events))

  console.log("Event added to calendar:", event)
}

