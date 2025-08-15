// components/premium-playbook-card.tsx
import { useState } from "react"
import { Card } from "@/components/ui/card"
import { useTheme } from "@/contexts/theme-context"
import { Button } from "@/components/ui/button"
import { PaymentPopupButton } from "./payment-popup-button"
import { PremiumBadge } from "@/components/ui/premium-badge"
import { getMetallicCardStyle } from "@/lib/colors"
import Image from "next/image"
import { BookOpen, TrendingUp, Star, Lock } from "lucide-react"

interface Playbook {
  id: string
  title: string
  description: string
  image: string | JSX.Element | string
  isPurchased: boolean
  industry: string
  paymentButtonId?: string
}

interface PremiumPlaybookCardProps {
  playbook: Playbook
  onPurchase: (playbookId: string) => void
  onClick: () => void
}

export function PremiumPlaybookCard({ playbook, onPurchase, onClick }: PremiumPlaybookCardProps) {
  const { theme } = useTheme()
  const [imgError, setImgError] = useState(false);
  
  // Function to get the correct image source
  const getImageSource = (playbook: Playbook) => {
    if (imgError) {
      // Return a safe fallback image
      return "/placeholder.svg";
    }
    if (playbook.id === "pb_001") {
      return "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
    }
    return typeof playbook.image === 'string' ? playbook.image : "/placeholder.svg"
  }
  
  // Handler for image load errors
  const handleImageError = () => {
    setImgError(true);
  }
  
  // Check if it's a premium playbook based on paymentButtonId
  const isPremium = playbook.paymentButtonId === "pl_PpVywDxD3udMiw";
  
  const cardStyle = getMetallicCardStyle(theme);
  
  return (
    <div
      className={`${cardStyle.className} group`}
      style={cardStyle.style}
    >
      <div className="relative h-[240px] overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-black/30 to-black/80 z-10"></div>
        
        <Image
          src={getImageSource(playbook)}
          alt={playbook.title}
          fill
          style={{ objectFit: 'cover' }}
          onError={handleImageError}
          className="group-hover:scale-110 transition-transform duration-1000"
          priority={playbook.id === "pb_001"}
        />
        
        {isPremium && (
          <div className="absolute top-4 right-4 z-30">
            <PremiumBadge className="font-bold">
              <Star className="w-3 h-3 mr-1" />
              PREMIUM
            </PremiumBadge>
          </div>
        )}
        
        <div className="absolute top-4 left-4 z-30">
          <PremiumBadge className="font-bold bg-white/90 text-black backdrop-blur-sm">
            {playbook.industry}
          </PremiumBadge>
        </div>
        
        <div className="absolute bottom-0 left-0 w-full p-6 z-20">
          <h3 className="text-2xl font-bold font-heading text-white tracking-tight line-clamp-2 mb-2 drop-shadow-md">{playbook.title}</h3>
          <p className="text-sm font-body text-gray-100 dark:text-gray-200 line-clamp-2 mb-4 drop-shadow-md">{playbook.description}</p>
        </div>
      </div>
      
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <TrendingUp className="w-4 h-4 mr-2 text-primary" />
            <span className="text-sm font-medium">High ROI Potential</span>
          </div>
          <PremiumBadge className="font-medium">
            Exclusive Content
          </PremiumBadge>
        </div>
        
        {playbook.isPurchased ? (
          <Button 
            onClick={onClick} 
            className={`w-full bg-primary hover:bg-primary/90 font-bold ${
              theme === "dark" ? "text-black hover:text-black" : "text-white hover:text-white"
            }`}
            variant="default"
          >
            <BookOpen className={`w-4 h-4 mr-2 ${theme === "dark" ? "text-black" : "text-white"}`} />
            View Playbook
          </Button>
        ) : (
          <PaymentPopupButton
            playbookId={playbook.id}
            onSuccess={() => onPurchase(playbook.id)}
            paymentButtonId={playbook.paymentButtonId || ""}
          />
        )}
      </div>
    </div>
  )
}