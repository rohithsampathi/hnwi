// lib/auth/debug-helper.ts
// Debug helper for auth system

import { authManager } from '@/lib/auth-manager'

// Make auth manager available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).authDebug = {
    // Auth manager methods
    getCurrentUser: () => authManager.getCurrentUser(),
    getCurrentUserId: () => authManager.getUserId(),
    getAuthToken: () => authManager.getAuthToken(),
    isAuthenticated: () => authManager.isAuthenticated(),
    
    // Debug info
    debug: () => authManager.debug(),
    
    // Test login
    testLogin: () => {
      const testUser = {
        id: '59363d04-eb97-4224-94cf-16ca0d4f746e',
        user_id: '59363d04-eb97-4224-94cf-16ca0d4f746e',
        userId: '59363d04-eb97-4224-94cf-16ca0d4f746e',
        email: 'test@hnwi.com',
        firstName: 'HNWI',
        lastName: 'User',
        role: 'user'
      }
      
      const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1OTM2M2QwNC1lYjk3LTQyMjQtOTRjZi0xNmNhMGQ0Zjc0NmUiLCJlbWFpbCI6InRlc3RAaG53aS5jb20iLCJleHAiOjE5OTk5OTk5OTl9.test'
      
      return authManager.login(testUser, testToken)
    },
    
    // Check localStorage
    checkLocalStorage: () => ({
      token: localStorage.getItem('token'),
      userId: localStorage.getItem('userId'),
      userObject: localStorage.getItem('userObject'),
      hnwi_auth_token: localStorage.getItem('hnwi_auth_token'),
      hnwi_user_data: localStorage.getItem('hnwi_user_data')
    }),
    
    // Force initialization
    init: () => authManager.ensureInitialized(),
    
    // Clear all
    clearAll: () => {
      authManager.logout()
      localStorage.clear()
      sessionStorage.clear()
    }
  }
  
}

export {}