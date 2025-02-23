// components/calendar/event-details-modal.tsx

"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { CalendarEvent } from "@/types/calendar"
import { formatDate, formatTime } from "@/utils/calendar"
import { useToast } from "@/components/ui/use-toast"

interface EventDetailsModalProps {
  event: CalendarEvent | null
  isOpen: boolean
  onClose: () => void
}

export function EventDetailsModal({ event, isOpen, onClose }: EventDetailsModalProps) {
  const [isInforming, setIsInforming] = useState(false)
  const { toast } = useToast()

  const handleInformConcierge = async () => {
    setIsInforming(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsInforming(false)
    toast({
      title: "Concierge Informed",
      description: "The concierge desk has been notified about this event.",
    })
    onClose()
  }

  if (!event) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{event.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p>
            <strong>Date:</strong> {formatDate(event.date)}
          </p>
          <p>
            <strong>Time:</strong> {formatTime(event.date)}
            {event.endDate && ` - ${formatTime(event.endDate)}`}
          </p>
          {event.location && (
            <p>
              <strong>Location:</strong> {event.location}
            </p>
          )}
          {event.description && (
            <p>
              <strong>Description:</strong> {event.description}
            </p>
          )}
          <p>
            <strong>Category:</strong> {event.category}
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={handleInformConcierge} disabled={isInforming}>
            {isInforming ? "Informing..." : "Inform Concierge Desk"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

