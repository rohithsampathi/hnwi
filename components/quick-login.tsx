"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { secureApi } from "@/lib/secure-api"

export function QuickLogin() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState("")

  const handleLogin = async () => {
    if (!email || !password) {
      setResult("Please enter email and password")
      return
    }

    setIsLoading(true)
    setResult("Attempting login...")

    try {
      const response = await secureApi.post('/api/auth/login', {
        email,
        password
      }, false, { enableCache: false })

      if (response.token) {
        localStorage.setItem('token', response.token)
        setResult("✅ Login successful! Token stored.")
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      } else {
        setResult("❌ Login failed - no token returned")
      }
    } catch (error: any) {
      setResult(`❌ Login failed: ${error.message}`)
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