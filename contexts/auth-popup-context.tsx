"use client"

import React, { createContext, useContext, useState, useCallback } from "react"
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