// components/premium-playbook-card.tsx
import { useState } from "react"
import { Card } from "@/components/ui/card"
import { useTheme } from "@/contexts/theme-context"
import { Button } from "@/components/ui/button"
import { PaymentPopupButton } from "./payment-popup-button"
import Image from "next/image"

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
  
  return (
    <div>
      <Card
        className={`overflow-hidden transition-all duration-300 hover:shadow-lg ${
          theme === "dark" ? "bg-[#1E1E1E] text-white" : "bg-white text-[#121212]"
        }`}
      >
        <div className="relative h-48">
          <div className="absolute inset-0 bg-black bg-opacity-50 z-10"></div>
          <Image
            src={getImageSource(playbook)}
            alt={playbook.title}
            fill
            style={{ objectFit: 'cover' }}
            onError={handleImageError}
            className="absolute inset-0"
            priority={playbook.id === "pb_001"}
          />
          <div className="absolute inset-0 flex flex-col justify-end p-4 z-20">
            <h3 className="text-xl font-bold font-heading text-white line-clamp-2 mb-2">{playbook.title}</h3>
            <p className="text-sm font-body text-white line-clamp-2 mb-2">{playbook.description}</p>
            {playbook.isPurchased ? (
              <Button onClick={onClick} className="w-full" variant="default">
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
      </Card>
    </div>
  )
}