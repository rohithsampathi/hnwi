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

const MOCK_USER = {
  email: "rohith@bhai.ai",
  password: "rohith@bhai.ai",
  name: "Rohith",
}

export async function authenticateUser(email: string, password: string): Promise<User | null> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  if (email === MOCK_USER.email && password === MOCK_USER.password) {
    return {
      email: MOCK_USER.email,
      name: MOCK_USER.name,
    }
  }

  return null
}

// Login helper
export const login = (userData: any, token: string) => {
  // Store auth data in localStorage
  if (userData && token) {
    localStorage.setItem("userId", userData.id || userData.user_id);
    localStorage.setItem("token", token);
    localStorage.setItem("userObject", JSON.stringify(userData));
    
    // Track login event in Mixpanel
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

// Signup helper
export const signup = (userData: any, token: string) => {
  // Store auth data in localStorage
  if (userData && token) {
    localStorage.setItem("userId", userData.id || userData.user_id);
    localStorage.setItem("token", token);
    localStorage.setItem("userObject", JSON.stringify(userData));
    
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

// Logout helper
export const logout = () => {
  // Track logout event before clearing user data
  const userId = localStorage.getItem("userId");
  if (userId) {
    MixpanelTracker.track("User Logout", {
      userId
    });
  }
  
  // Clear auth data from localStorage
  localStorage.removeItem("userId");
  localStorage.removeItem("token");
  localStorage.removeItem("userObject");
};

// Profile update helper
export const updateProfile = (userData: any) => {
  // Update user object in localStorage
  const currentUserData = localStorage.getItem("userObject");
  if (currentUserData && userData) {
    const parsedUserData = JSON.parse(currentUserData);
    const updatedUserData = { ...parsedUserData, ...userData };
    localStorage.setItem("userObject", JSON.stringify(updatedUserData));
    
    // Track profile update in Mixpanel
    MixpanelTracker.track("Profile Updated", {
      userId: updatedUserData.id || updatedUserData.user_id,
      updatedFields: Object.keys(userData)
    });
    
    // Update user profile in Mixpanel
    MixpanelTracker.setProfile({
      $name: `${updatedUserData.firstName || ''} ${updatedUserData.lastName || ''}`.trim() || updatedUserData.email,
      $email: updatedUserData.email
    });
  }
};

// Add tracking for other user events
export const trackEvent = (eventName: string, properties: Record<string, any> = {}) => {
  // Add user ID to properties if available
  const userId = localStorage.getItem("userId");
  if (userId) {
    properties.userId = userId;
  }
  
  // Track the event in Mixpanel
  MixpanelTracker.track(eventName, properties);
};