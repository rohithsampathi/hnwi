"use client"

import { useState, useEffect } from "react"
import { isAuthenticated, getValidToken } from "@/lib/auth-utils"
import { secureApi } from "@/lib/secure-api"
import { Button } from "@/components/ui/button"
import { QuickLogin } from "@/components/quick-login"

export function DebugAuth() {
  const [authStatus, setAuthStatus] = useState<string>("Checking...")
  const [token, setToken] = useState<string | null>(null)
  const [apiTest, setApiTest] = useState<string>("Not tested")
  const [wealthRadarTest, setWealthRadarTest] = useState<string>("Not tested")
  const [endpointTests, setEndpointTests] = useState<Record<string, string>>({})
  const [authRouteTest, setAuthRouteTest] = useState<string>("Not tested")
  const [implementationResults, setImplementationResults] = useState<string[]>([])

  useEffect(() => {
    const checkAuth = () => {
      const isAuth = isAuthenticated()
      const validToken = getValidToken()
      
      setAuthStatus(isAuth ? "Authenticated" : "Not authenticated")
      setToken(validToken)
    }
    
    checkAuth()
  }, [])

  const testDevelopments = async () => {
    setApiTest("Testing...")
    try {
      const data = await secureApi.post('/api/developments', {
        page: 1,
        page_size: 10,
        sort_by: "date",
        sort_order: "desc"
      }, true, { enableCache: false })
      
      const count = data.developments?.length || 0
      const sample = count > 0 ? data.developments[0] : null
      setApiTest(`Success: ${count} developments found${sample ? ` (Sample: ${sample.title?.slice(0, 50)}...)` : ''}`)
    } catch (error: any) {
      setApiTest(`Error: ${error.message}`)
    }
  }

  const testWealthRadar = async () => {
    setWealthRadarTest("Testing...")
    try {
      const data = await secureApi.post('/api/developments', {
        page: 1,
        page_size: 5,
        sort_by: "date",
        sort_order: "desc"
      }, true, { enableCache: false })
      
      setWealthRadarTest(`Success: ${data.developments?.length || 0} wealth radar items found`)
    } catch (error: any) {
      setWealthRadarTest(`Error: ${error.message}`)
    }
  }

  const testAllEndpoints = async () => {
    const endpoints = [
      { name: 'Developments (All)', body: { page: 1, page_size: 5 } },
      { name: 'Elite Pulse (Recent)', body: { page: 1, page_size: 10, sort_by: 'date', sort_order: 'desc' } },
      { name: 'Wealth Radar (1w)', body: { page: 1, page_size: 15, time_range: '1w' } },
      { name: 'Insider Brief (Tech)', body: { page: 1, page_size: 8, industry: 'Technology' } },
      { name: 'Developments (Finance)', body: { page: 1, page_size: 5, industry: 'Finance' } },
      { name: 'Developments (Healthcare)', body: { page: 1, page_size: 5, industry: 'Healthcare' } },
      { name: 'Elite Pulse (1d)', body: { page: 1, page_size: 5, time_range: '1d', sort_by: 'date' } },
    ]

    for (const endpoint of endpoints) {
      setEndpointTests(prev => ({ ...prev, [endpoint.name]: 'Testing...' }))
      
      try {
        const data = await secureApi.post('/api/developments', endpoint.body, true, { enableCache: false })
        
        const count = data.developments?.length || 0
        const sample = count > 0 ? data.developments[0] : null
        const sampleTitle = sample?.title?.slice(0, 30) || 'No title'
        
        setEndpointTests(prev => ({ 
          ...prev, 
          [endpoint.name]: `✅ ${count} items${count > 0 ? ` (${sampleTitle}...)` : ''}` 
        }))
      } catch (error: any) {
        setEndpointTests(prev => ({ 
          ...prev, 
          [endpoint.name]: `❌ ${error.message}` 
        }))
      }
    }
  }

  const testElitePulse = async () => {
    setEndpointTests(prev => ({ ...prev, 'Elite Pulse Test': 'Testing...' }))
    try {
      const data = await secureApi.post('/api/developments', {
        page: 1,
        page_size: 10,
        sort_by: "date",
        sort_order: "desc"
      }, true, { enableCache: false })
      
      const count = data.developments?.length || 0
      const industries = [...new Set(data.developments?.map((d: any) => d.industry) || [])]
      
      setEndpointTests(prev => ({ 
        ...prev, 
        'Elite Pulse Test': `✅ ${count} items, ${industries.length} industries (${industries.slice(0, 3).join(', ')})` 
      }))
    } catch (error: any) {
      setEndpointTests(prev => ({ 
        ...prev, 
        'Elite Pulse Test': `❌ ${error.message}` 
      }))
    }
  }

  const testInsiderBrief = async () => {
    setEndpointTests(prev => ({ ...prev, 'Insider Brief Test': 'Testing...' }))
    try {
      const data = await secureApi.post('/api/developments', {
        page: 1,
        page_size: 8,
        sort_by: "date",
        sort_order: "desc",
        time_range: "1w"
      }, true, { enableCache: false })
      
      const count = data.developments?.length || 0
      const withSummary = data.developments?.filter((d: any) => d.summary && d.summary.length > 0) || []
      
      setEndpointTests(prev => ({ 
        ...prev, 
        'Insider Brief Test': `✅ ${count} items, ${withSummary.length} with analysis` 
      }))
    } catch (error: any) {
      setEndpointTests(prev => ({ 
        ...prev, 
        'Insider Brief Test': `❌ ${error.message}` 
      }))
    }
  }

  const testAuthenticationRoute = async () => {
    setAuthRouteTest("Testing authentication routes...")
    const results: string[] = []
    
    try {
      // Test 1: Check token validity (skip session endpoint - doesn't exist)
      const currentToken = getValidToken()
      if (currentToken) {
        try {
          const payload = JSON.parse(atob(currentToken.split('.')[1]))
          const isExpired = payload.exp && payload.exp * 1000 < Date.now()
          results.push(`✅ Token analysis: Valid=${!isExpired}, Expires=${new Date(payload.exp * 1000).toISOString()}`)
        } catch {
          results.push(`❌ Token analysis: Malformed token`)
        }
      } else {
        results.push(`⚠️ No token found - user needs to log in`)
      }

      // Test 2: Skip CSRF endpoint (doesn't exist) - this is JWT-based auth
      results.push(`ℹ️ Session/CSRF endpoints not available - JWT-only authentication`)

      // Test 3: Test developments with current token
      try {
        const devData = await secureApi.post('/api/developments', {
          page: 1,
          page_size: 3
        }, true, { enableCache: false })
        results.push(`✅ Developments with auth: ${devData.developments?.length || 0} items`)
      } catch (error: any) {
        results.push(`❌ Developments with auth: ${error.message}`)
        
        // If auth fails, try to understand why
        const currentToken = getValidToken()
        if (!currentToken) {
          results.push(`🔍 No valid token found in localStorage`)
        } else {
          try {
            const payload = JSON.parse(atob(currentToken.split('.')[1]))
            const isExpired = payload.exp && payload.exp * 1000 < Date.now()
            results.push(`🔍 Token exists, expired: ${isExpired}, exp: ${new Date(payload.exp * 1000).toISOString()}`)
          } catch {
            results.push(`🔍 Token exists but malformed`)
          }
        }
      }

      setAuthRouteTest(results.join('\n'))
      setImplementationResults(results)
      
    } catch (error: any) {
      setAuthRouteTest(`❌ Auth route testing failed: ${error.message}`)
    }
  }

  const implementFixes = async () => {
    setImplementationResults(['Implementing fixes based on test results...'])
    
    try {
      // Check if we need to redirect to login
      if (!isAuthenticated()) {
        setImplementationResults(prev => [...prev, '🔄 No valid authentication - user needs to log in'])
        
        // If we're not on login page, suggest redirect
        if (window.location.pathname !== '/auth/login') {
          setImplementationResults(prev => [...prev, '🔄 Redirecting to login page...'])
          setTimeout(() => {
            window.location.href = '/auth/login'
          }, 2000)
        }
        return
      }

      // Test API connectivity with current auth
      const testResult = await secureApi.post('/api/developments', {
        page: 1,
        page_size: 1
      }, true, { enableCache: false })

      if (testResult.developments && testResult.developments.length > 0) {
        setImplementationResults(prev => [...prev, '✅ API working - data available'])
        setImplementationResults(prev => [...prev, '🔄 Clearing cache to force fresh data...'])
        
        // Clear cache and reload components
        localStorage.removeItem('api-cache')
        
        setImplementationResults(prev => [...prev, '✅ Implementation complete - reload page to see results'])
      } else {
        setImplementationResults(prev => [...prev, '⚠️ API working but no data returned'])
      }

    } catch (error: any) {
      setImplementationResults(prev => [...prev, `❌ Implementation failed: ${error.message}`])
    }
  }

  return (
    <div className="p-4 border rounded-lg bg-muted/50 space-y-4">
      <h3 className="text-lg font-semibold">🔍 API & Auth Debug Panel</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <h4 className="font-semibold">Authentication</h4>
          <p><strong>Status:</strong> <span className={authStatus.includes("Authenticated") ? "text-green-600" : "text-red-600"}>{authStatus}</span></p>
          <p><strong>Token:</strong> {token ? `${token.slice(0, 20)}...` : "None"}</p>
        </div>
        
        <div className="space-y-2">
          <h4 className="font-semibold">Quick Tests</h4>
          <p><strong>Developments:</strong> {apiTest}</p>
          <p><strong>Wealth Radar:</strong> {wealthRadarTest}</p>
          <div className="text-xs">
            <strong>Auth Route Test:</strong> 
            <pre className="mt-1 text-xs bg-muted/20 p-2 rounded whitespace-pre-wrap">{authRouteTest}</pre>
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <h4 className="font-semibold">Endpoint Tests</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          {Object.entries(endpointTests).map(([name, result]) => (
            <div key={name} className="flex justify-between">
              <span>{name}:</span>
              <span className="font-mono">{result}</span>
            </div>
          ))}
        </div>
      </div>
      
      {implementationResults.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-semibold">🔧 Implementation Results</h4>
          <div className="text-xs bg-green-50 dark:bg-green-900/20 p-3 rounded">
            {implementationResults.map((result, index) => (
              <div key={index} className="mb-1">{result}</div>
            ))}
          </div>
        </div>
      )}
      
      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          <Button onClick={testAuthenticationRoute} variant="default" size="sm">
            🔐 Test Auth Routes
          </Button>
          <Button onClick={implementFixes} variant="default" size="sm" className="bg-green-600 hover:bg-green-700">
            🛠️ Implement Fixes
          </Button>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button onClick={testElitePulse} variant="outline" size="sm">
            🏆 Test Elite Pulse
          </Button>
          <Button onClick={testInsiderBrief} variant="outline" size="sm">
            📊 Test Insider Brief
          </Button>
          <Button onClick={testWealthRadar} variant="outline" size="sm">
            💎 Test Wealth Radar
          </Button>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button onClick={testDevelopments} variant="outline" size="sm">
            Test Developments
          </Button>
          <Button onClick={testAllEndpoints} variant="secondary" size="sm">
            Test All Endpoints
          </Button>
          <Button 
            onClick={() => {
              localStorage.removeItem('token')
              window.location.reload()
            }} 
            variant="destructive" 
            size="sm"
          >
            Clear Token & Reload
          </Button>
        </div>
      </div>
      
      {!isAuthenticated() && <QuickLogin />}
      
      <div className="text-xs text-muted-foreground">
        Debug Panel v1.0 - Environment: {process.env.NODE_ENV || "development"}
      </div>
    </div>
  )
}