// app/share/rohith/[shareId]/not-found.tsx
// 404 page for shared conversations

"use client"

import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md text-center space-y-6">
        <div className="flex justify-center">
          <div className="p-4 bg-destructive/10 rounded-full">
            <AlertCircle className="h-16 w-16 text-destructive" />
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-foreground">Conversation Not Found</h1>
          <p className="text-muted-foreground">
            This shared conversation could not be found or may have expired.
          </p>
        </div>

        <div className="space-y-3">
          <Button
            onClick={() => window.location.href = "https://www.hnwichronicles.com"}
            variant="default"
            size="lg"
            className="w-full"
          >
            Return to Homepage
          </Button>

          <Button
            onClick={() => window.location.href = "https://www.hnwichronicles.com/pricing"}
            variant="outline"
            size="lg"
            className="w-full"
          >
            View Pricing
          </Button>
        </div>
      </div>
    </div>
  )
}
