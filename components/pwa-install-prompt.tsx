"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowPrompt(true)
    }

    window.addEventListener('beforeinstallprompt', handler)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      setDeferredPrompt(null)
      setShowPrompt(false)
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
  }

  if (!showPrompt || !deferredPrompt) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50">
      <div className="bg-background border border-border rounded-lg p-4 shadow-2xl">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-foreground font-medium text-sm">
              Add to Home Screen
            </h3>
            <p className="text-muted-foreground text-xs mt-1">
              Experience premium wealth intelligence at your fingertips
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="text-muted-foreground hover:text-foreground p-1 h-auto"
          >
            <X size={16} />
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={handleInstall}
            className="flex-1 bg-yellow-500 text-black hover:bg-yellow-600 text-xs font-bold"
          >
            Install
          </Button>
          <Button
            variant="outline"
            onClick={handleDismiss}
            className="flex-1 text-xs"
          >
            Later
          </Button>
        </div>
      </div>
    </div>
  )
}