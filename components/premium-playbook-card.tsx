import { Card } from "@/components/ui/card"
import { useTheme } from "@/contexts/theme-context"
import { Button } from "@/components/ui/button"
import { PaymentPopupButton } from "./payment-popup-button"
import Image from "next/image"

interface Playbook {
  id: string
  title: string
  description: string
  image: string
  isPurchased: boolean
  paymentButtonId: string
}

interface PremiumPlaybookCardProps {
  playbook: Playbook
  onPurchase: (playbookId: string) => void
  onClick: () => void
}

export function PremiumPlaybookCard({ playbook, onPurchase, onClick }: PremiumPlaybookCardProps) {
  const { theme } = useTheme()

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
            src={playbook.image || "/placeholder.svg"}
            alt={playbook.title}
            layout="fill"
            objectFit="cover"
            className="absolute inset-0"
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
                paymentButtonId={playbook.paymentButtonId}
              />
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}

