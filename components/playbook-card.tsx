// components/playbook-card.tsx

import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/contexts/theme-context"
import { Lock } from "lucide-react"

interface Playbook {
  id: string
  title: string
  description: string
  image: string
  isPurchased: boolean
}

interface PlaybookCardProps {
  playbook: Playbook
  onClick: () => void
}

export function PlaybookCard({ playbook, onClick }: PlaybookCardProps) {
  const { theme } = useTheme()

  return (
    <Card
      className={`overflow-hidden transition-all duration-300 hover:shadow-lg ${
        theme === "dark" ? "bg-[#2A2A2A] text-white" : "bg-white text-[#121212]"
      }`}
    >
      <div className="relative h-48">
        <Image src={playbook.image || "/placeholder.svg"} alt={playbook.title} layout="fill" objectFit="cover" />
      </div>
      <CardHeader>
        <CardTitle className="text-xl font-bold text-primary line-clamp-2">{playbook.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm mb-4 line-clamp-3">{playbook.description}</p>
        <Button onClick={onClick} className="w-full" variant={playbook.isPurchased ? "default" : "secondary"}>
          {playbook.isPurchased ? (
            "View Playbook"
          ) : (
            <>
              <Lock className="w-4 h-4 mr-2" />
              Locked
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}

