import type { CalendarEvent, CalendarViewEvent } from "@/types/calendar"

export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
}

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export const getWeekDates = (date: Date): Date[] => {
  const week: Date[] = []
  const current = new Date(date)
  current.setDate(current.getDate() - current.getDay())

  for (let i = 0; i < 7; i++) {
    week.push(new Date(current))
    current.setDate(current.getDate() + 1)
  }

  return week
}

export const getDaysInMonth = (date: Date): Date[] => {
  const days: Date[] = []
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1)
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0)

  // Add days from previous month to start the calendar from Sunday
  const startPadding = firstDay.getDay()
  for (let i = startPadding - 1; i >= 0; i--) {
    const paddingDate = new Date(firstDay)
    paddingDate.setDate(paddingDate.getDate() - i - 1)
    days.push(paddingDate)
  }

  // Add all days of the current month
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push(new Date(date.getFullYear(), date.getMonth(), d))
  }

  // Add days from next month to complete the calendar grid
  const endPadding = 42 - days.length // 6 rows * 7 days = 42
  for (let i = 1; i <= endPadding; i++) {
    const paddingDate = new Date(lastDay)
    paddingDate.setDate(paddingDate.getDate() + i)
    days.push(paddingDate)
  }

  return days
}

export const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}

export const getMonthYearString = (date: Date): string => {
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" })
}

export const getCategoryColor = (category: CalendarEvent["category"]): string => {
  switch (category) {
    case "work":
      return "bg-blue-500"
    case "personal":
      return "bg-green-500"
    case "social":
      return "bg-purple-500"
    case "important":
      return "bg-red-500"
    default:
      return "bg-gray-500"
  }
}

export const formatEventForView = (event: CalendarEvent): CalendarViewEvent => {
  return {
    ...event,
    startTime: event.date ? formatTime(event.date) : undefined,
    endTime: event.endDate ? formatTime(event.endDate) : undefined,
    formattedDate: event.date ? formatDate(event.date) : undefined,
  }
}

