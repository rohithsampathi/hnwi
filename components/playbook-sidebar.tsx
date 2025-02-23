import type React from "react"
import { useTheme } from "@/contexts/theme-context"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Crown, BarChart2, PieChart, Brain, Swords } from "lucide-react"

interface PlaybookSection {
  type: string
  content: string
  elements: any[]
}

interface PlaybookSidebarProps {
  sections: PlaybookSection[]
  activeSection: number
  onSectionChange: (index: number) => void
}

const cleanSectionContent = (content: string): string => {
  return content.replace(/^Section \d+:\s*/, "").trim()
}

const SidebarItem: React.FC<{
  section: PlaybookSection
  isActive: boolean
  onClick: () => void
}> = ({ section, isActive, onClick }) => {
  const { theme } = useTheme()
  const IconComponent =
    section.type === "market_data"
      ? PieChart
      : section.type === "channel_performance_rating"
        ? BarChart2
        : section.type === "hnwi_thinking"
          ? Brain
          : section.type === "competitive_intelligence"
            ? Swords
            : Crown
  const cleanedContent = cleanSectionContent(section.content)

  const description = section.type === "competitive_intelligence" ? "Competitive Intelligence" : cleanedContent

  return (
    <Button
      variant={isActive ? "default" : "ghost"}
      className="w-full justify-start items-start text-left h-auto py-2 px-3"
      onClick={onClick}
    >
      <div className="flex items-start">
        {IconComponent && <IconComponent className="w-5 h-5 mr-2 mt-1 flex-shrink-0" />}
        <span className="text-sm leading-tight">{description}</span>
      </div>
    </Button>
  )
}

export function PlaybookSidebar({ sections, activeSection, onSectionChange }: PlaybookSidebarProps) {
  const { theme } = useTheme()

  return (
    <ScrollArea className="h-[calc(100vh-8rem)]">
      <div className={`w-full space-y-2 p-4 ${theme === "dark" ? "text-white" : "text-[#121212]"}`}>
        {sections.map((section, index) => (
          <SidebarItem
            key={index}
            section={section}
            isActive={activeSection === index}
            onClick={() => onSectionChange(index)}
          />
        ))}
      </div>
    </ScrollArea>
  )
}

