import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPercentage(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    signDisplay: "always",
  }).format(value)
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function generateUniqueColors(count: number): string[] {
  const hueStep = 360 / count
  return Array.from({ length: count }, (_, i) => `hsl(${i * hueStep}, 70%, 50%)`)
}

// Helper function to parse JSON content or return the original string
export function parseMessageContent(content: string): string {
  if (!content) return content

  try {
    // Check if the content looks like JSON
    if (content.trim().startsWith('{') || content.trim().startsWith('[')) {
      const parsed = JSON.parse(content)

      // If it's an object with a message property, extract that
      if (typeof parsed === 'object' && parsed !== null) {
        if (parsed.message) return parsed.message
        if (parsed.content) return parsed.content
        if (parsed.text) return parsed.text
        // If it's just a JSON object without obvious message content, stringify it nicely
        return JSON.stringify(parsed, null, 2)
      }

      return content
    }

    return content
  } catch {
    // If parsing fails, return the original content
    return content
  }
}

// Helper function to create a sentence case title from a message
export function createConversationTitle(message: string): string {
  if (!message) return "New Conversation"

  // First, parse the message in case it's JSON
  const parsedMessage = parseMessageContent(message)

  // Clean up the message for title use
  let title = parsedMessage
    .trim()
    .replace(/\n+/g, ' ') // Replace newlines with spaces
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim()

  // Capitalize first letter and ensure rest is lowercase except for proper nouns
  if (title.length > 0) {
    title = title.charAt(0).toUpperCase() + title.slice(1).toLowerCase()
  }

  // Truncate if too long and add ellipsis
  if (title.length > 60) {
    title = title.substring(0, 57) + "..."
  }

  return title || "New Conversation"
}

