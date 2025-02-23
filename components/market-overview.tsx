"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronDown, ArrowRight, Globe } from "lucide-react"
import { useTheme } from "@/contexts/theme-context"
import { cn } from "@/lib/utils"
import { Heading2, Paragraph } from "@/components/ui/typography"

interface MarketOverviewPoint {
  title: string
  content: string
}

interface MarketOverviewSection {
  title: string
  points: MarketOverviewPoint[]
}

interface MarketOverviewProps {
  sections: MarketOverviewSection[]
}

const SectionPoint = ({ point, theme }: { point: MarketOverviewPoint; theme: string }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className={cn("group border-b last:border-0", theme === "dark" ? "border-gray-800" : "border-gray-100")}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center gap-4 py-6 text-left transition-colors",
          theme === "dark" ? "hover:bg-gray-900/50" : "hover:bg-gray-50",
        )}
      >
        <ArrowRight
          className={cn(
            "w-5 h-5 flex-shrink-0 transition-transform",
            isOpen && "rotate-90",
            theme === "dark" ? "text-blue-400" : "text-blue-600",
          )}
        />
        <div>
          <h4 className={cn("text-lg font-medium mb-1", theme === "dark" ? "text-gray-200" : "text-gray-800")}>
            {point.title}
          </h4>
          {isOpen && (
            <p className={cn("text-base leading-relaxed mt-2", theme === "dark" ? "text-gray-400" : "text-gray-600")}>
              {point.content}
            </p>
          )}
        </div>
      </button>
    </div>
  )
}

const Section = ({
  section,
  isActive,
  onClick,
  theme,
}: {
  section: MarketOverviewSection
  isActive: boolean
  onClick: () => void
  theme: string
}) => {
  return (
    <Card
      className={cn(
        "mb-4 overflow-hidden transition-all duration-300",
        theme === "dark" ? "bg-[#1A1A1A]" : "bg-white",
        isActive && "ring-1 ring-primary",
      )}
    >
      <button
        onClick={onClick}
        className={cn(
          "w-full flex items-center justify-between p-6 text-left",
          theme === "dark" ? "bg-gray-900/50" : "bg-gray-50",
        )}
      >
        <h3 className={cn("text-xl font-semibold", theme === "dark" ? "text-white" : "text-gray-900")}>
          {section.title}
        </h3>
        <ChevronDown
          className={cn(
            "w-6 h-6 transition-transform",
            isActive && "rotate-180",
            theme === "dark" ? "text-gray-400" : "text-gray-600",
          )}
        />
      </button>
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <CardContent className="px-6">
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {section.points.map((point, index) => (
                  <SectionPoint key={index} point={point} theme={theme} />
                ))}
              </div>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  )
}

export function MarketOverview({ sections }: MarketOverviewProps) {
  const { theme } = useTheme()
  const [activeSection, setActiveSection] = useState<number | null>(0)

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <div className="flex items-center mb-2">
          <Globe className="w-6 h-6 mr-2 text-primary" />
          <Heading2 className="text-2xl font-bold text-primary">Market Overview</Heading2>
        </div>
        <Paragraph className="text-sm text-muted-foreground mb-4">
          Comprehensive analysis of the current market landscape for High Net Worth Individuals
        </Paragraph>
      </div>
      {sections.map((section, index) => (
        <Section
          key={index}
          section={section}
          isActive={activeSection === index}
          onClick={() => setActiveSection(activeSection === index ? null : index)}
          theme={theme}
        />
      ))}
    </div>
  )
}

