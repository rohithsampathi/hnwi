// app/share/opportunity/[opportunityId]/not-found.tsx
// Not found page for shared opportunities

import { Button } from "@/components/ui/button"

export default function OpportunityNotFound() {
  const handleBack = () => {
    window.location.href = "https://www.hnwichronicles.com"
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4 px-4">
        <h2 className="text-2xl font-bold text-foreground">Opportunity Not Found</h2>
        <p className="text-muted-foreground">This opportunity is no longer available or does not exist</p>
        <Button onClick={handleBack} variant="outline">
          Return to Homepage
        </Button>
      </div>
    </div>
  )
}
