// components/calendar/add-event-dialog.tsx

"use client"

import type React from "react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { CalendarEvent } from "@/types/calendar"
import { Heading3, Paragraph } from "@/components/ui/typography"
import { useTheme } from "@/contexts/theme-context"

interface AddEventDialogProps {
  isOpen: boolean
  onClose: () => void
  onAddEvent: (event: CalendarEvent) => void
  initialDate?: Date
}

export function AddEventDialog({ isOpen, onClose, onAddEvent, initialDate = new Date() }: AddEventDialogProps) {
  const [title, setTitle] = useState("")
  const [date, setDate] = useState<Date | undefined>(initialDate)
  const [location, setLocation] = useState("")
  const [summary, setSummary] = useState("")
  const [notes, setNotes] = useState("")
  const { theme } = useTheme()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (title && date) {
      onAddEvent({
        id: crypto.randomUUID(),
        title,
        date,
        location,
        description: summary,
        category: "personal",
        notes,
      })
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={cn("sm:max-w-[425px]", theme === "dark" ? "bg-background border-border" : "bg-background")}
      >
        <DialogHeader className="space-y-2">
          <Heading3 className="text-foreground">Add New Event</Heading3>
          <Paragraph className="text-muted-foreground">Fill in the details for your new event.</Paragraph>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-foreground">
                Event Name
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className={cn("border-input bg-background text-foreground", theme === "dark" && "focus:ring-ring")}
                placeholder="Enter event name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date" className="text-foreground">
                Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground",
                      "bg-background border-input hover:bg-accent hover:text-accent-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className={cn("w-auto p-0", theme === "dark" ? "bg-background border-border" : "bg-background")}
                >
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    className={cn(
                      "rounded-md border",
                      theme === "dark" ? "bg-background border-border" : "bg-background",
                    )}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location" className="text-foreground">
                Location
              </Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className={cn("border-input bg-background text-foreground", theme === "dark" && "focus:ring-ring")}
                placeholder="Enter location"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="summary" className="text-foreground">
                Summary
              </Label>
              <Input
                id="summary"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className={cn("border-input bg-background text-foreground", theme === "dark" && "focus:ring-ring")}
                placeholder="Enter summary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-foreground">
                Notes
              </Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className={cn(
                  "border-input bg-background text-foreground min-h-[100px]",
                  theme === "dark" && "focus:ring-ring",
                )}
                placeholder="Enter additional notes"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              className={cn("w-full sm:w-auto", "bg-primary text-primary-foreground hover:bg-primary/90")}
            >
              Add Event
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

