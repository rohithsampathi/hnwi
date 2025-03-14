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

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove("light", "dark")
    root.classList.add(theme)
  }, [theme])
  
  // Initialize theme from localStorage or system preference once on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme
    if (savedTheme) {
      setTheme(savedTheme)
    } else {
      // Only use system preference if no saved theme
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
      setTheme(mediaQuery.matches ? "dark" : "light")
    }
  }, [])

  // We've moved this logic to the initial mount effect above

  // When theme changes, save to localStorage
  useEffect(() => {
    localStorage.setItem('theme', theme)
  }, [theme])

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

