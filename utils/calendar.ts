// utils/calendar.ts
import type { CalendarEvent, CalendarViewEvent } from "@/types/calendar"
import { getIndustryColor, getCategoryColorClass, getCategoryDarkColorClass } from "@/utils/color-utils"

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

export const getCategoryColor = (category: string, theme: string = 'light'): string => {
  // Use the updated category color system
  return theme === 'dark' 
    ? getCategoryDarkColorClass(category)
    : getCategoryColorClass(category);
}

export const getCategoryTextColor = (): string => {
  return 'text-white'; // All categories use white text for better contrast
}

export const getCategoryBorderColor = (category: string): string => {
  // Map specific categories to Tailwind border classes
  const categoryToBorder: Record<string, string> = {
    Jewelry: "border-purple-600",
    Collectibles: "border-amber-600",
    Art: "border-teal-600",
    "Fine Art": "border-teal-700",
    Lifestyle: "border-cyan-600",
    Fashion: "border-pink-600",
    "Luxury Fashion": "border-pink-700",
    Watches: "border-blue-600",
    Antiques: "border-yellow-800",
    social: "border-purple-600",
    work: "border-blue-600",
    personal: "border-green-600",
    entertainment: "border-red-500",
    wellness: "border-teal-500",
    education: "border-amber-500",
  }
  
  return categoryToBorder[category] || "border-gray-600";
}

export const formatEventForView = (event: CalendarEvent): CalendarViewEvent => {
  return {
    ...event,
    startTime: event.date ? formatTime(event.date) : undefined,
    endTime: event.endDate ? formatTime(event.endDate) : undefined,
    formattedDate: event.date ? formatDate(event.date) : undefined,
  }
}

// Get a pattern class for background (used for event cards)
export const getPatternClass = (index: number, theme: string) => {
  const PREMIUM_PATTERNS_LIGHT = [
    "bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-100 via-slate-50 to-slate-100",
    "bg-[conic-gradient(at_top,_var(--tw-gradient-stops))] from-gray-100 via-gray-50 to-white",
    "bg-[linear-gradient(45deg,_var(--tw-gradient-stops))] from-slate-100 via-purple-50 to-white",
    "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-100 via-gray-50 to-white",
    "bg-[conic-gradient(at_bottom_left,_var(--tw-gradient-stops))] from-slate-100 via-slate-50 to-white",
  ];

  const PREMIUM_PATTERNS_DARK = [
    "bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-800 to-slate-900",
    "bg-[conic-gradient(at_top,_var(--tw-gradient-stops))] from-gray-900 via-gray-800 to-gray-900",
    "bg-[linear-gradient(45deg,_var(--tw-gradient-stops))] from-slate-900 via-purple-900 to-slate-900",
    "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-gray-800 to-gray-900",
    "bg-[conic-gradient(at_bottom_left,_var(--tw-gradient-stops))] from-slate-900 via-slate-800 to-slate-900",
  ];

  return theme === "dark"
    ? PREMIUM_PATTERNS_DARK[index % PREMIUM_PATTERNS_DARK.length]
    : PREMIUM_PATTERNS_LIGHT[index % PREMIUM_PATTERNS_LIGHT.length];
}

export const getPatternClassForEvent = (event: CalendarEvent, theme: string) => {
  // Generate a consistent index for the same event
  let hash = 0;
  const str = event.id || event.title || "";
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return getPatternClass(Math.abs(hash) % 5, theme);
}