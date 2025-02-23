export interface CalendarEvent {
  id: string
  title: string
  date: Date
  endDate?: Date
  description?: string
  category: "work" | "personal" | "social" | "important"
  location?: string
  notes?: string
}

export interface CalendarCategory {
  id: string
  name: string
  color: string
  events: CalendarEvent[]
}

export interface CalendarViewEvent extends CalendarEvent {
  startTime?: string
  endTime?: string
  formattedDate?: string
}

