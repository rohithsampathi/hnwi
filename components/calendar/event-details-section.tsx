// components/calendar/event-details-section.tsx
"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Users, Tag, Clock, Building, Calendar, ThumbsUp, Loader2, Phone } from "lucide-react"
import { useTheme } from "@/contexts/theme-context"
import { Heading3, Paragraph } from "@/components/ui/typography"
import { fonts } from "@/styles/fonts"
import { useToast } from "@/components/ui/use-toast"
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"
import { getPatternClassForEvent } from "@/utils/calendar"
import { 
  getCategoryColorClass, 
  getCategoryDarkColorClass, 
  getDisplayCategory,
  getIndustryColor 
} from "@/utils/color-utils"
import { useAuth } from "@/components/auth-provider"

interface EventDetailsSectionProps {
  event: any;
  hideHeading?: boolean; // New prop to hide the heading
}

export function EventDetailsSection({ event, hideHeading = false }: EventDetailsSectionProps) {
  const { theme } = useTheme()
  const { toast } = useToast()
  const { user } = useAuth()
  const [isProcessing, setIsProcessing] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)

  if (!event) {
    return null;
  }

  const handleReserveEvent = async () => {
    setIsProcessing(true);
    
    // Get user information from localStorage
    const userId = localStorage.getItem("userId") || ""
    const userEmail = localStorage.getItem("userEmail") || ""
    const userName = user?.name || "Unknown User"
    
    try {
      const response = await fetch("/api/concierge", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          source: "calendar",
          eventTitle: event.title,
          userName: userName,
          userId: userId,
          userEmail: userEmail,
          eventId: event.id,
          eventCategory: event.category,
          eventDate: new Date(event.date).toISOString(),
          eventLocation: event.location,
          eventVenue: event.venue,
          eventAttendees: event.attendees,
          timestamp: new Date().toISOString(),
          _subject: `Event Reservation: ${event.title}`,
          message: `User ${userName} (${userEmail}) reserved a spot for event: ${event.title}.`,
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to submit event reservation")
      }
      
      // Show success dialog
      setShowSuccessDialog(true)
      
      // Also show toast notification
      toast({
        title: "Reservation Confirmed",
        description: `Your reservation for ${event.title} has been confirmed.`,
        duration: 5000,
      })
    } catch (error) {
      toast({
        title: "Reservation Failed",
        description: "We couldn't process your reservation. Please try again later.",
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setIsProcessing(false)
    }
  };

  const formatEventDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    });
  };

  // Use the pattern class from utils
  const patternClass = getPatternClassForEvent(event, theme);
  
  // Get the display category for this event
  const displayCategory = getDisplayCategory(event);
  
  // Get the appropriate color class based on theme
  const categoryColorClass = theme === 'dark'
    ? getCategoryDarkColorClass(displayCategory)
    : getCategoryColorClass(displayCategory);

  return (
    <>
      {event && (
        <div className="mt-0">
          {/* Only show the heading if hideHeading is false */}
          {!hideHeading && <Heading3 className="mb-4">Event Details</Heading3>}
          
          <Card className={`overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 ${patternClass}`}>
            <div
              className={`backdrop-blur-sm ${
                theme === "dark" ? "bg-black/30" : "bg-white/50"
              }`}
            >
              <CardContent className="p-6 relative dark:text-white text-black">
                {/* Category badge at the top */}
                <Badge
                  className={`absolute top-2 left-2 ${categoryColorClass} text-white`}
                >
                  {displayCategory}
                </Badge>
                
                {/* Premium accent overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10 opacity-20 pointer-events-none"></div>
                
                <div className="relative mt-6">
                  <div className="mb-4">
                    <Heading3
                      className={`${fonts.heading} mb-1 dark:text-white text-black`}
                    >
                      {event.title}
                    </Heading3>
                    <div className="flex items-center gap-2 text-sm dark:text-white/70 text-black/70">
                      <Clock className="w-4 h-4" />
                      <span>{formatEventDate(event.date)}</span>
                      {event.endDate && (
                        <span>to {formatEventDate(event.endDate)}</span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3 dark:text-white/90 text-black/90">
                    {event.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 dark:text-white/70 text-black/70" />
                        <span>{event.location}</span>
                      </div>
                    )}
                    
                    {event.venue && (
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 dark:text-white/70 text-black/70" />
                        <span>{event.venue}</span>
                      </div>
                    )}

                    {/* Display attendees if available */}
                    {event.attendees && (
                      <div className="flex items-start gap-2">
                        <Users className="w-4 h-4 dark:text-white/70 text-black/70 mt-1" />
                        <span>
                          {typeof event.attendees === 'string' 
                            ? event.attendees 
                            : Array.isArray(event.attendees) && event.attendees.length > 0
                              ? event.attendees.join(", ")
                              : "No attendees yet"}
                        </span>
                      </div>
                    )}

                    {/* Display description */}
                    {event.description && (
                      <Paragraph className="text-sm mt-4 dark:text-white/80 text-black/80">
                        {event.description}
                      </Paragraph>
                    )}

                    {/* Display tags if available */}
                    {event.tags && event.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {event.tags.map((tag: string) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="flex items-center gap-1 
                                      dark:bg-white/5 dark:border-white/20 dark:text-white/90
                                      bg-black/10 border-black/20 text-black/90"
                          >
                            <Tag className="w-3 h-3" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Display industry if available */}
                    {event.industry && (
                      <div className="mt-4">
                        <Badge
                          style={{ 
                            backgroundColor: getIndustryColor(event.industry),
                            color: 'white'
                          }}
                          className="text-xs px-2 py-1"
                        >
                          {event.industry}
                        </Badge>
                      </div>
                    )}

                    {/* Display metadata if available */}
                    {event.metadata && Object.keys(event.metadata).length > 0 && (
                      <div className="mt-4 space-y-2">
                        {Object.entries(event.metadata).map(([key, value]: [string, any]) => {
                          if (key !== 'source' && value) {
                            return (
                              <div key={key} className="text-sm dark:text-white/70 text-black/70">
                                {key.charAt(0).toUpperCase() + key.slice(1)}: {value.toString()}
                              </div>
                            );
                          }
                          return null;
                        })}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end items-center mt-6">
                    <Button
                      onClick={handleReserveEvent}
                      disabled={isProcessing}
                      className={`
                        dark:bg-white/10 dark:hover:bg-white/20 dark:text-white
                        bg-black/10 hover:bg-black/20 text-black
                      `}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing
                        </>
                      ) : (
                        <>
                          <Calendar className="w-4 h-4 mr-2" />
                          Reserve Event
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </div>
          </Card>
        </div>
      )}

      {/* Success Dialog - Similar to Opportunity Page */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ThumbsUp className="h-5 w-5 text-green-500" />
              Reservation Confirmed
            </DialogTitle>
            <DialogDescription>
              Your reservation for <span className="font-semibold">{event?.title}</span> has been confirmed.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-muted/30 p-4 rounded-lg my-4">
            <p className="text-sm">
              Our concierge will be in touch with you shortly to provide additional details about this event.
            </p>
            <div className="flex items-center gap-2 mt-3 text-primary">
              <Phone className="h-4 w-4" />
              <p className="text-sm font-medium">Expect a response within 24 hours</p>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowSuccessDialog(false)}>
              Continue Exploring
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}