// app/(authenticated)/ask-rohith/page.tsx

"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { usePageTitle } from "@/hooks/use-page-title"
import { RohithProvider, useRohith } from "@/contexts/rohith-context"
import PremiumRohithInterface from "@/components/ask-rohith-jarvis/PremiumRohithInterface"
import { Button } from "@/components/ui/button"
import { History, Plus } from "lucide-react"

function AskAudelleContent() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const restoringConversationRef = useRef<string | null>(null)
  const { activeConversationId, clearCurrentConversation, selectConversation } = useRohith()

  const syncConversationRoute = (conversationId: string | null) => {
    const nextUrl = conversationId
      ? `${pathname}?conversation=${encodeURIComponent(conversationId)}`
      : pathname
    router.replace(nextUrl, { scroll: false })
  }

  useEffect(() => {
    const conversationId = searchParams.get("conversation")
    if (!conversationId || conversationId === activeConversationId || restoringConversationRef.current === conversationId) {
      return
    }

    restoringConversationRef.current = conversationId
    selectConversation(conversationId).finally(() => {
      restoringConversationRef.current = null
    })
  }, [activeConversationId, searchParams, selectConversation])

  const handleNewChat = () => {
    clearCurrentConversation()
    syncConversationRoute(null)
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
          onConversationChange={syncConversationRoute}
        />
      </div>
    </div>
  )
}

export default function AskAudelleRoute() {
  // Set page title and meta description
  usePageTitle(
    "Ask Audelle",
    "Audelle by HNWI Chronicles is the private decision ally for families carrying wealth across borders, generations, and pressure."
  )

  return (
    <RohithProvider>
      <AskAudelleContent />
    </RohithProvider>
  )
}
