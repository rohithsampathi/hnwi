"use client"

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function OfflinePage() {
  useEffect(() => {
    // Auto-retry connection after 5 seconds
    const timer = setTimeout(() => {
      if (navigator.onLine) {
        window.location.reload()
      }
    }, 5000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">Intelligence Offline</h1>
          <p className="text-gray-400">
            Network connection interrupted. Cached intelligence remains accessible.
          </p>
        </div>
        
        <div className="space-y-4">
          <Button 
            onClick={() => window.location.reload()}
            className="w-full bg-white text-black hover:bg-gray-100"
          >
            Reconnect
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => window.history.back()}
            className="w-full border-white text-white hover:bg-white hover:text-black"
          >
            Access Cache
          </Button>
        </div>

        <div className="text-xs text-gray-500 space-y-1">
          <p>Recent intelligence cached locally</p>
          <p>Full features restore upon reconnection</p>
        </div>
      </div>
    </div>
  )
}