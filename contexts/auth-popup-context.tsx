"use client"

import React, { createContext, useContext, useState, useCallback, useEffect } from "react"
import { AuthPopup } from "@/components/auth-popup"
import { registerAuthPopupCallback } from "@/lib/secure-api"

interface AuthPopupContextType {
  showAuthPopup: (options?: {
    title?: string
    description?: string
    onSuccess?: (userData?: any) => void
    onClose?: () => void
  }) => void
  hideAuthPopup: () => void
}

const AuthPopupContext = createContext<AuthPopupContextType | undefined>(undefined)

interface AuthPopupProviderProps {
  children: React.ReactNode
}

export function AuthPopupProvider({ children }: AuthPopupProviderProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [popupOptions, setPopupOptions] = useState<{
    title?: string
    description?: string
    onSuccess?: (userData?: any) => void
    onClose?: () => void
  }>({})

  const showAuthPopup = useCallback((options: {
    title?: string
    description?: string
    onSuccess?: (userData?: any) => void
    onClose?: () => void
  } = {}) => {
    // Prevent multiple popups
    if (isOpen) {
      return;
    }

    // CRITICAL FIX: Don't show auth popup if user just logged in
    // Cookies need time to propagate, especially in incognito mode
    if (typeof window !== 'undefined') {
      const loginTimestamp = sessionStorage.getItem('loginTimestamp')
      const justLoggedIn = loginTimestamp && (Date.now() - parseInt(loginTimestamp)) < 20000 // 20 seconds

      if (justLoggedIn) {
        console.debug('[AuthPopup] Skipping popup - user just logged in', {
          timeSinceLogin: loginTimestamp ? Date.now() - parseInt(loginTimestamp) : 'unknown'
        })
        return
      }
    }

    setPopupOptions(options)
    setIsOpen(true)
  }, [isOpen])

  const hideAuthPopup = useCallback(() => {
    // Call onClose if provided and popup was actually open
    if (isOpen && popupOptions.onClose) {
      popupOptions.onClose();
    }
    setIsOpen(false)
    setPopupOptions({})
  }, [isOpen, popupOptions])

  const handleSuccess = useCallback((userData?: any) => {
    popupOptions.onSuccess?.(userData)
    hideAuthPopup()
  }, [popupOptions, hideAuthPopup])

  // Register with secure API for automatic 401 handling
  useEffect(() => {
    registerAuthPopupCallback(showAuthPopup);
  }, [showAuthPopup])

  // Listen for session-locked events from ClientSecurityManager
  useEffect(() => {
    const handleSessionLocked = (event: CustomEvent) => {
      const { userId, reason } = event.detail;
      
      // Prevent multiple popups if one is already open
      if (isOpen) {
        return;
      }
      
      // Only show popup for inactivity locks, not other reasons
      if (reason === 'inactivity') {
        showAuthPopup({
          title: "Session Locked",
          description: "Due to inactivity, your secure line has been locked. Login to continue.",
          onSuccess: () => {
            // Session will be unlocked by auth popup success handler
          }
        });
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('session-locked', handleSessionLocked as EventListener);
      
      return () => {
        window.removeEventListener('session-locked', handleSessionLocked as EventListener);
      };
    }
  }, [showAuthPopup, isOpen]);

  return (
    <AuthPopupContext.Provider value={{ showAuthPopup, hideAuthPopup }}>
      {children}
      <AuthPopup
        isOpen={isOpen}
        onClose={hideAuthPopup}
        onSuccess={handleSuccess}
        title={popupOptions.title}
        description={popupOptions.description}
      />
    </AuthPopupContext.Provider>
  )
}

export function useAuthPopup() {
  const context = useContext(AuthPopupContext)
  if (context === undefined) {
    throw new Error("useAuthPopup must be used within an AuthPopupProvider")
  }
  return context
}