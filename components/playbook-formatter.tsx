// components/playbook-formatter.tsx

"use client"

import type React from "react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/contexts/theme-context"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface PlaybookSection {
  type: string
  content: string
  elements?: PlaybookSection[]
}

interface PlaybookFormatterProps {
  sections: PlaybookSection[]
}

const sectionIcons: { [key: string]: React.ReactNode } = {
  executive_summary: "📊",
  key_strategies: "🎯",
  market_analysis: "📈",
  implementation_plan: "📅",
  financial_projections: "💰",
  risk_assessment: "⚠️",
  conclusion: "🏁",
}

const SectionContent: React.FC<{ content: string; elements?: PlaybookSection[] }> = ({ content, elements }) => {
  const { theme } = useTheme()
  const [isExpanded, setIsExpanded] = useState(false)

  const formatContent = (text: string) => {
    const bulletPointRegex = /^[-*]\s(.+)$/gm
    text = text.replace(bulletPointRegex, "<li>$1</li>")
    text = text.replace(/<li>/g, "<ul><li>").replace(/<\/li>(?![\s\S]*<li>)/g, "</li></ul>")

    const numberedListRegex = /^\d+\.\s(.+)$/gm
    text = text.replace(numberedListRegex, "<li>$1</li>")
    text = text.replace(/<li>/g, "<ol><li>").replace(/<\/li>(?![\s\S]*<li>)/g, "</li></ol>")

    const boldRegex = /\*\*(.*?)\*\*/g
    text = text.replace(boldRegex, "<strong>$1</strong>")

    const italicRegex = /\*(.*?)\*/g
    text = text.replace(italicRegex, "<em>$1</em>")

    return text
  }

  return (
    <div className="mt-4">
      <div
        className={`prose ${theme === "dark" ? "prose-invert" : ""} max-w-none`}
        dangerouslySetInnerHTML={{ __html: formatContent(content) }}
      />
      {elements && elements.length > 0 && (
        <Accordion type="single" collapsible className="w-full mt-4">
          {elements.map((element, index) => (
            <AccordionItem value={`item-${index}`} key={index}>
              <AccordionTrigger>{element.type}</AccordionTrigger>
              <AccordionContent>
                <SectionContent content={element.content} elements={element.elements} />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  )
}

export const PlaybookFormatter: React.FC<PlaybookFormatterProps> = ({ sections }) => {
  const { theme } = useTheme()
  const [activeSection, setActiveSection] = useState(0)

  return (
    <div className="space-y-6">
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {sections.map((section, index) => (
          <Button
            key={index}
            variant={activeSection === index ? "default" : "outline"}
            onClick={() => setActiveSection(index)}
            className="whitespace-nowrap"
          >
            {sectionIcons[section.type]} {section.type.replace(/_/g, " ")}
          </Button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card className={`${theme === "dark" ? "bg-[#1A1A1A] text-white" : "bg-white text-[#121212]"} shadow-lg`}>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center">
                {sectionIcons[sections[activeSection].type]} {sections[activeSection].type.replace(/_/g, " ")}
              </h2>
              <SectionContent content={sections[activeSection].content} elements={sections[activeSection].elements} />
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

