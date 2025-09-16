// components/pages/ask-rohith-page.tsx

"use client"

import React, { useEffect } from "react"
import { RohithProvider } from "@/contexts/rohith-context"
import { RohithChat } from "@/components/ask-rohith/rohith-chat"

interface AskRohithPageProps {
  onNavigate: (route: string) => void
}

export function AskRohithPage({ onNavigate }: AskRohithPageProps) {
  return (
    <RohithProvider>
      <RohithChat onNavigate={onNavigate} />
    </RohithProvider>
  )
}

export default AskRohithPage