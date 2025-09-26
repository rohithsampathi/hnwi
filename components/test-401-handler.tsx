"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { secureApi } from "@/lib/secure-api"
import { useToast } from "@/components/ui/use-toast"

export function Test401Handler() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const { toast } = useToast()

  const testAuthenticatedCall = async () => {
    setLoading(true)
    setResult(null)

    try {
      // This will trigger 401 if session expired
      const data = await secureApi.get('/api/user/profile', true)
      setResult(data)
      toast({
        title: "Success",
        description: "Authenticated API call successful",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "API call failed",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const testPublicCall = async () => {
    setLoading(true)
    setResult(null)

    try {
      // This should work without auth
      const data = await secureApi.get('/api/health', false)
      setResult(data)
      toast({
        title: "Success",
        description: "Public API call successful",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "API call failed",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const simulateExpiredSession = async () => {
    // Clear cookies to simulate expired session
    document.cookie = "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
    document.cookie = "refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"

    toast({
      title: "Session Cleared",
      description: "Cookies cleared. Next authenticated call will trigger 401.",
    })
  }

  return (
    <div className="p-6 space-y-4 border rounded-lg">
      <h3 className="text-lg font-semibold">401 Handler Test</h3>

      <div className="space-y-2">
        <Button
          onClick={testAuthenticatedCall}
          disabled={loading}
          className="w-full"
        >
          {loading ? "Loading..." : "Test Authenticated Call"}
        </Button>

        <Button
          onClick={testPublicCall}
          disabled={loading}
          variant="outline"
          className="w-full"
        >
          {loading ? "Loading..." : "Test Public Call"}
        </Button>

        <Button
          onClick={simulateExpiredSession}
          variant="destructive"
          className="w-full"
        >
          Simulate Expired Session
        </Button>
      </div>

      {result && (
        <pre className="p-3 bg-muted rounded text-xs overflow-auto max-h-40">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  )
}