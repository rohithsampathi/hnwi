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
    
    // Test login (cookies handle auth - no token needed)
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

      return authManager.login(testUser)
    },
    
    // Check localStorage (legacy data only)
    checkLocalStorage: () => ({
      // Cookies handle auth - no token needed in localStorage
      userId: localStorage.getItem('userId'),
      userObject: localStorage.getItem('userObject'),
      // Note: hnwi_auth_token removed - tokens now in httpOnly cookies
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