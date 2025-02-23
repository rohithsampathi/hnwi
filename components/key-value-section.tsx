"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronRight } from "lucide-react"
import { useTheme } from "@/contexts/theme-context"

interface KeyValuePair {
  key: string
  value: string
}

interface KeyValueSectionProps {
  pairs: KeyValuePair[]
}

export function KeyValueSection({ pairs }: KeyValueSectionProps) {
  const [expandedKey, setExpandedKey] = useState<string | null>(null)
  const { theme } = useTheme()

  const handleKeyClick = (key: string) => {
    setExpandedKey(expandedKey === key ? null : key)
  }

  return (
    <div className="space-y-2">
      {pairs.map((pair) => (
        <div key={pair.key} className="rounded-lg overflow-hidden">
          <button
            onClick={() => handleKeyClick(pair.key)}
            className={`w-full flex items-center justify-between p-3 text-left transition-colors border-0 ${
              expandedKey === pair.key
                ? theme === "dark"
                  ? "bg-primary/20"
                  : "bg-primary/10"
                : theme === "dark"
                  ? "bg-primary/10 hover:bg-primary/15"
                  : "bg-primary/5 hover:bg-primary/10"
            }`}
            aria-expanded={expandedKey === pair.key}
          >
            <span className="font-medium">{pair.key}</span>
            <ChevronRight
              className={`w-4 h-4 transform transition-transform ${expandedKey === pair.key ? "rotate-90" : ""}`}
            />
          </button>
          <AnimatePresence>
            {expandedKey === pair.key && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className={`overflow-hidden border-0 ${theme === "dark" ? "bg-primary/5" : "bg-primary/5"}`}
              >
                <div className="p-3 text-sm">{pair.value}</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  )
}

