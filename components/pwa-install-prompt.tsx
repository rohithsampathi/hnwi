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
      <div className="bg-black border border-white/20 rounded-lg p-4 shadow-2xl">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-white font-medium text-sm">
              Install Intelligence
            </h3>
            <p className="text-gray-400 text-xs mt-1">
              Access HNWI Chronicles directly from your device
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="text-gray-400 hover:text-white p-1 h-auto"
          >
            <X size={16} />
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={handleInstall}
            className="flex-1 bg-white text-black hover:bg-gray-100 text-xs"
          >
            Install
          </Button>
          <Button
            variant="outline"
            onClick={handleDismiss}
            className="flex-1 border-white/20 text-white hover:bg-white hover:text-black text-xs"
          >
            Later
          </Button>
        </div>
      </div>
    </div>
  )
}