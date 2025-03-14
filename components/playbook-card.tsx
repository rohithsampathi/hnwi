// components/playbook-card.tsx

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/contexts/theme-context"
import { Lock, BookOpen, BarChart, Tag } from "lucide-react"

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
  const [imgError, setImgError] = useState(false)

  return (
    <div className="transform transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1">
      <Card
        className={`relative overflow-hidden transition-all duration-300 shadow-xl hover:shadow-2xl rounded-2xl border-0 ${
          theme === "dark" ? "bg-[#2A2A2A] text-white" : "bg-white text-[#121212]"
        }`}
      >
        <div className="relative h-52 overflow-hidden">
          <Image 
            src={imgError ? "/placeholder.svg" : (playbook.image || "/placeholder.svg")} 
            alt={playbook.title} 
            fill 
            style={{ objectFit: 'cover' }} 
            className="transition-transform duration-700 hover:scale-105"
            onError={() => setImgError(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30 opacity-80"></div>
          
          {!playbook.isPurchased && (
            <div className="absolute top-0 right-0 m-4">
              <div className="bg-secondary/80 backdrop-blur-sm text-secondary-foreground px-3 py-1 rounded-full text-xs font-medium">
                <Tag className="w-3 h-3 inline mr-1" /> Standard
              </div>
            </div>
          )}
        </div>
        
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-xl font-bold font-heading tracking-tight text-primary line-clamp-2">{playbook.title}</CardTitle>
            <BarChart className="w-5 h-5 text-muted-foreground flex-shrink-0 ml-2" />
          </div>
        </CardHeader>
        
        <CardContent className="pb-2">
          <p className="text-sm text-muted-foreground line-clamp-3 mb-2">{playbook.description}</p>
        </CardContent>
        
        <CardFooter className="pt-0">
          <Button 
            onClick={onClick} 
            className="w-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300" 
            variant={playbook.isPurchased ? "default" : "secondary"}
          >
            {playbook.isPurchased ? (
              <>
                <BookOpen className="w-4 h-4 mr-2" />
                View Playbook
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 mr-2" />
                Locked
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

