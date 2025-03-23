"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { BusinessModeProvider } from "./business-mode-context"

type Theme = "light" | "dark"

type ThemeContextType = {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark")
  const [isInitialized, setIsInitialized] = useState(false)

  const darkTheme = {
    background: "linear-gradient(to bottom, #004d40, #00695c, #121212)",
    color: "#fff",
    fontFamily: {
      heading: "'Cormorant Garamond', serif",
      body: "'Proza Libre', sans-serif",
    },
  }

  const lightTheme = {
    background: "linear-gradient(to bottom, #b2dfdb, #80cbc4, #ffffff)",
    color: "#000",
    fontFamily: {
      heading: "'Cormorant Garamond', serif",
      body: "'Proza Libre', sans-serif",
    },
  }

  // Apply theme to document when theme changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const root = window.document.documentElement
      root.classList.remove("light", "dark")
      root.classList.add(theme)
    }
  }, [theme])
  
  // Initialize theme from localStorage or system preference once on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') as Theme
      if (savedTheme === 'light' || savedTheme === 'dark') {
        setTheme(savedTheme)
      } else {
        // Only use system preference if no saved theme
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
        const systemTheme = mediaQuery.matches ? "dark" : "light"
        setTheme(systemTheme)
        // Save system preference as initial value
        localStorage.setItem('theme', systemTheme)
      }
      setIsInitialized(true)
    }
  }, [])

  // When theme changes, save to localStorage
  // Only save after initial load completes
  useEffect(() => {
    if (typeof window !== 'undefined' && isInitialized) {
      localStorage.setItem('theme', theme)
    }
  }, [theme, isInitialized])

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"))
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <BusinessModeProvider>
        <div
          style={{
            fontFamily: theme === "dark" ? darkTheme.fontFamily.body : lightTheme.fontFamily.body,
          }}
        >
          {children}
        </div>
      </BusinessModeProvider>
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}

