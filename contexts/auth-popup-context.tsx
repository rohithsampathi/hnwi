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

    // ROOT FIX: Never show auth popup on public routes (simulation, decision-memo)
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname
      if (pathname.includes('/simulation') || pathname.includes('/decision-memo')) {
        return;
      }
    }

    // PWA FIX: Only skip popup if BOTH conditions are true:
    // 1. User logged in within 2 minutes (reduced from 5 for PWA reliability)
    // 2. We're NOT in PWA standalone mode (PWA has cookie persistence issues)
    if (typeof window !== 'undefined') {
      const loginTimestamp = localStorage.getItem('loginTimestamp')
      const recentlyLoggedIn = loginTimestamp && (Date.now() - parseInt(loginTimestamp)) < 120000 // 2 minutes

      // Detect PWA standalone mode - always allow popup in PWA
      const isPWA = window.matchMedia('(display-mode: standalone)').matches ||
                    (window.navigator as any).standalone === true

      // Only skip if recently logged in AND not in PWA mode
      if (recentlyLoggedIn && !isPWA) {
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