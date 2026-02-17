"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { secureApi } from "@/lib/secure-api"

export function QuickLogin() {
  // Dev-only component — never render in production builds
  if (process.env.NODE_ENV === 'production') return null

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState("")

  const handleLogin = async () => {
    if (!email || !password) {
      setResult("Please enter email and password")
      return
    }

    // Prevent multiple submissions
    if (isLoading) {
      return
    }

    setIsLoading(true)
    setResult("Attempting login...")

    try {
      const response = await secureApi.post('/api/auth/login', {
        email,
        password
      }, false)

      if (response.token) {
        // Backend sets httpOnly cookies
        setResult("✅ Login successful! Token stored.")
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      } else {
        setResult("❌ Login failed - no token returned")
      }
    } catch (error: any) {
      // Handle 401 specifically for incorrect password
      if (error.message?.includes('401') || error.status === 401) {
        setResult("❌ Incorrect password. Please retry or click forgot password.")
      } else {
        setResult(`❌ Login failed: ${error.message}`)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-4 border rounded-lg bg-slate-50 dark:bg-slate-900/20 space-y-3">
      <h4 className="font-semibold">🔑 Quick Login Test</h4>
      
      <div className="space-y-2">
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="text-sm"
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="text-sm"
        />
      </div>
      
      <Button 
        onClick={handleLogin} 
        disabled={isLoading}
        className="w-full"
        size="sm"
      >
        {isLoading ? "Logging in..." : "Test Login"}
      </Button>
      
      {result && (
        <div className="text-xs bg-white dark:bg-gray-800 p-2 rounded">
          {result}
        </div>
      )}
    </div>
  )
}