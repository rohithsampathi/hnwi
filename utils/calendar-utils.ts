// utils/calendar-utils.ts
import type { CalendarEvent } from "@/types/calendar"

export function addEventToCalendar(event: CalendarEvent) {
  const storedEvents = localStorage.getItem("userEvents")
  let events = storedEvents ? JSON.parse(storedEvents) : []
  
  // Convert date strings to Date objects if needed
  if (typeof event.date === 'string') {
    event.date = new Date(event.date)
  }
  
  if (event.endDate && typeof event.endDate === 'string') {
    event.endDate = new Date(event.endDate)
  }
  
  // Handle social events from the SocialHub component (map fields appropriately)
  if (event.start_date && !event.date) {
    event.date = new Date(event.start_date)
  }
  
  if (event.end_date && !event.endDate) {
    event.endDate = new Date(event.end_date)
  }
  
  // Check if event already exists to avoid duplicates
  const isDuplicate = events.some(
    (existingEvent: CalendarEvent) =>
      existingEvent.id === event.id ||
      (existingEvent.title === event.title && 
       new Date(existingEvent.date).toISOString() === new Date(event.date).toISOString())
  )
  
  if (!isDuplicate) {
    // Format event for storage with all necessary fields
    const formattedEvent = {
      ...event,
      id: event.id || `event-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`,
      title: event.title || event.name, // Support for social events that use "name" instead of "title"
      category: event.category, // Preserve the original category (Jewelry, Art, etc.)
      venue: event.venue,
      attendees: event.attendees,
      tags: event.tags,
      description: event.description || event.summary,
      location: event.location,
      industry: event.industry,
      metadata: {
        ...(event.metadata || {}),
        capacity: event.metadata?.capacity,
        source: event.source || "manual"
      }
    }
    
    events.push(formattedEvent)
    localStorage.setItem("userEvents", JSON.stringify(events))
    return true
  } else {
    return false
  }
}

export function getMonthYearString(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export function formatDateRange(start: Date, end?: Date): string {
  if (!end) return new Date(start).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  
  return `${new Date(start).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - 
          ${new Date(end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
}

// Function to submit event reservation to formspree
export async function reserveEvent(event: any, email: string, name: string): Promise<boolean> {
  try {
    // Use environment variable for formspree endpoint - NO hardcoded URLs
    const formspreeEndpoint = process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT;
    if (!formspreeEndpoint) {
      console.error('Formspree endpoint not configured');
      return false;
    }
    
    const response = await fetch(formspreeEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        eventId: event.id,
        eventTitle: event.title,
        eventCategory: event.category,
        eventDate: event.date,
        eventLocation: event.location,
        eventVenue: event.venue,
        attendeeEmail: email,
        attendeeName: name,
        reservationTime: new Date(),
      }),
    });
    
    return response.ok;
  } catch (error) {
    return false;
  }
}