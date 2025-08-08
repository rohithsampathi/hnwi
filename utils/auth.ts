// utils/auth.ts - Client-side auth helper functions
"use client";

import MixpanelTracker from "@/lib/mixpanel";

type User = {
  email: string
  name: string
  id?: string
  user_id?: string
  firstName?: string
  lastName?: string
  role?: string
}

// REMOVED: Hardcoded credentials are a critical security vulnerability
// Authentication must be handled through secure server-side endpoints only

export async function authenticateUser(email: string, password: string): Promise<User | null> {
  // SECURITY NOTICE: Client-side authentication is disabled for security
  // All authentication must be handled server-side through secure endpoints
  throw new Error("Client-side authentication disabled for security. Use server-side auth endpoints.");
}

// Secure login helper - uses server-side session management
export const login = (userData: any, token: string) => {
  // SECURITY: No client-side token storage - all handled server-side via httpOnly cookies
  if (userData) {
    // Only store non-sensitive user display data in sessionStorage (cleared on browser close)
    sessionStorage.setItem("userDisplay", JSON.stringify({
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      role: userData.role
    }));
    
    // Track login event in Mixpanel (no sensitive data)
    MixpanelTracker.identify(userData.id || userData.user_id);
    MixpanelTracker.track("User Login", {
      userId: userData.id || userData.user_id,
      email: userData.email,
      method: "email"
    });
    
    // Set user profile in Mixpanel
    MixpanelTracker.setProfile({
      $name: `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || userData.email,
      $email: userData.email,
      userId: userData.id || userData.user_id,
      role: userData.role || "user"
    });
  }
};

// Secure signup helper - uses server-side session management
export const signup = (userData: any, token: string) => {
  // SECURITY: No client-side token storage - all handled server-side via httpOnly cookies
  if (userData) {
    // Only store non-sensitive user display data in sessionStorage
    sessionStorage.setItem("userDisplay", JSON.stringify({
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      role: userData.role
    }));
    
    // Track signup event in Mixpanel
    MixpanelTracker.identify(userData.id || userData.user_id);
    MixpanelTracker.track("User Signup", {
      userId: userData.id || userData.user_id,
      email: userData.email
    });
    
    // Set user profile in Mixpanel
    MixpanelTracker.setProfile({
      $name: `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || userData.email,
      $email: userData.email,
      userId: userData.id || userData.user_id,
      role: userData.role || "user",
      $created: new Date().toISOString()
    });
  }
};

// Secure logout helper
export const logout = () => {
  // Track logout event before clearing user data
  const userDisplay = sessionStorage.getItem("userDisplay");
  if (userDisplay) {
    try {
      const userData = JSON.parse(userDisplay);
      MixpanelTracker.track("User Logout", {
        email: userData.email
      });
    } catch (e) {
      // Ignore JSON parse errors
    }
  }
  
  // Clear display data from sessionStorage (tokens handled server-side)
  sessionStorage.removeItem("userDisplay");
  
  // Clear any remaining localStorage items for security
  const keysToRemove = ["userId", "token", "userObject"];
  keysToRemove.forEach(key => localStorage.removeItem(key));
};

// Secure profile update helper
export const updateProfile = (userData: any) => {
  // Update display data in sessionStorage (non-sensitive only)
  const currentUserDisplay = sessionStorage.getItem("userDisplay");
  if (currentUserDisplay && userData) {
    try {
      const parsedUserData = JSON.parse(currentUserDisplay);
      const updatedUserData = { 
        ...parsedUserData, 
        firstName: userData.firstName || parsedUserData.firstName,
        lastName: userData.lastName || parsedUserData.lastName,
        email: userData.email || parsedUserData.email,
        role: userData.role || parsedUserData.role
      };
      sessionStorage.setItem("userDisplay", JSON.stringify(updatedUserData));
      
      // Track profile update in Mixpanel
      MixpanelTracker.track("Profile Updated", {
        email: updatedUserData.email,
        updatedFields: Object.keys(userData)
      });
      
      // Update user profile in Mixpanel
      MixpanelTracker.setProfile({
        $name: `${updatedUserData.firstName || ''} ${updatedUserData.lastName || ''}`.trim() || updatedUserData.email,
        $email: updatedUserData.email
      });
    } catch (e) {
      // Ignore JSON parse errors
    }
  }
};

// Secure event tracking helper
export const trackEvent = (eventName: string, properties: Record<string, any> = {}) => {
  // Add user email to properties if available (no sensitive IDs)
  const userDisplay = sessionStorage.getItem("userDisplay");
  if (userDisplay) {
    try {
      const userData = JSON.parse(userDisplay);
      properties.email = userData.email;
    } catch (e) {
      // Ignore JSON parse errors
    }
  }
  
  // Track the event in Mixpanel
  MixpanelTracker.track(eventName, properties);
};