// app/test-auth/page.tsx
"use client"

import { useEffect, useState } from "react"
import { 
  getCurrentUser, 
  getCurrentUserId, 
  getAuthToken, 
  isAuthenticated,
  loginUser,
  debugAuth 
} from "@/lib/auth-manager"

export default function TestAuthPage() {
  const [authState, setAuthState] = useState<any>({})
  
  useEffect(() => {
    // Test auth manager
    const checkAuth = () => {
      const state = {
        user: getCurrentUser(),
        userId: getCurrentUserId(),
        token: getAuthToken(),
        isAuthenticated: isAuthenticated(),
        localStorage: {
          token: localStorage.getItem('token'),
          userId: localStorage.getItem('userId'),
          userObject: localStorage.getItem('userObject')
        }
      }
      
      setAuthState(state)
      console.log('[TestAuth] Current state:', state)
      
      // Debug auth
      debugAuth()
    }
    
    checkAuth()
    
    // Listen for auth changes
    const handleAuthChange = () => checkAuth()
    window.addEventListener('auth:login', handleAuthChange)
    window.addEventListener('auth:logout', handleAuthChange)
    
    return () => {
      window.removeEventListener('auth:login', handleAuthChange)
      window.removeEventListener('auth:logout', handleAuthChange)
    }
  }, [])
  
  const testLogin = () => {
    // Simulate a login with test data
    const testUser = {
      id: 'test-user-123',
      user_id: 'test-user-123',
      userId: 'test-user-123',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User'
    }
    
    const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0LXVzZXItMTIzIiwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwiZXhwIjoxOTk5OTk5OTk5fQ.test'
    
    const user = loginUser(testUser, testToken)
    console.log('[TestAuth] Login result:', user)
    
    // Refresh state
    window.location.reload()
  }
  
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Auth System Test</h1>
      
      <div className="space-y-4">
        <div className="p-4 border rounded">
          <h2 className="font-bold mb-2">Current Auth State:</h2>
          <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-auto">
            {JSON.stringify(authState, null, 2)}
          </pre>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={testLogin}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Test Login
          </button>
          
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Refresh
          </button>
        </div>
        
        <div className="text-sm text-gray-600">
          <p>Check browser console for detailed debug info</p>
        </div>
      </div>
    </div>
  )
}