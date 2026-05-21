// app/(authenticated)/ask-rohith/page.tsx

"use client"

import { useState } from "react"
import { usePageTitle } from "@/hooks/use-page-title"
import { RohithProvider, useRohith } from "@/contexts/rohith-context"
import PremiumRohithInterface from "@/components/ask-rohith-jarvis/PremiumRohithInterface"
import { Button } from "@/components/ui/button"
import { History, Plus } from "lucide-react"

function AskRohithContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { clearCurrentConversation } = useRohith()

  const handleNewChat = () => {
    clearCurrentConversation()
    setSidebarOpen(false)
  }

  return (
    <div className="flex min-h-[calc(var(--app-viewport-height,100dvh)-190px)] flex-col gap-4">
      <div className="flex shrink-0 items-center justify-end gap-3">
        {!sidebarOpen && (
          <Button onClick={handleNewChat} variant="default" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            New Chat
          </Button>
        )}
        <Button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          variant="outline"
          size="sm"
          className="hover:text-white dark:hover:text-accent-foreground"
        >
          <History className="w-4 h-4 mr-2" />
          History
        </Button>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        <PremiumRohithInterface
          sidebarOpen={sidebarOpen}
          onSidebarToggle={setSidebarOpen}
          onNewChat={handleNewChat}
        />
      </div>
    </div>
  )
}

export default function AskRohithRoute() {
  // Set page title and meta description
  usePageTitle(
    "Ask Rohith",
    "Your 24/7 AI intelligence ally with complete conversation memory and portfolio awareness. Strategic analysis, market research, and wealth preservation strategies from 50+ years HNWI patterns."
  )

  return (
    <RohithProvider>
      <AskRohithContent />
    </RohithProvider>
  )
}
