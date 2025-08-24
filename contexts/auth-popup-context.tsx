"use client"

import React, { createContext, useContext, useState, useCallback, useEffect } from "react"
import { AuthPopup } from "@/components/auth-popup"

interface AuthPopupContextType {
  showAuthPopup: (options?: {
    title?: string
    description?: string
    onSuccess?: () => void
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
    onSuccess?: () => void
  }>({})

  const showAuthPopup = useCallback((options: {
    title?: string
    description?: string
    onSuccess?: () => void
  } = {}) => {
    setPopupOptions(options)
    setIsOpen(true)
  }, [])

  const hideAuthPopup = useCallback(() => {
    setIsOpen(false)
    setPopupOptions({})
  }, [])

  const handleSuccess = useCallback(() => {
    popupOptions.onSuccess?.()
    hideAuthPopup()
  }, [popupOptions, hideAuthPopup])

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