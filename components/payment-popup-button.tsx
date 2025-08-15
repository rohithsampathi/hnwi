// components/payment-popup-button.tsx

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { RazorpayButton } from "./razorpay-button"
import { useTheme } from "@/contexts/theme-context"

interface PaymentPopupButtonProps {
  playbookId: string
  onSuccess: (playbookId: string) => void
  paymentButtonId: string
}

export function PaymentPopupButton({ playbookId, onSuccess, paymentButtonId }: PaymentPopupButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { theme } = useTheme()

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          className={`w-full bg-primary hover:bg-primary/90 font-bold ${
            theme === "dark" ? "text-black hover:text-black" : "text-white hover:text-white"
          }`}
          onClick={() => setIsOpen(true)}
        >
          Unlock Playbook
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-xl border shadow-xl">
        <DialogHeader>
          <DialogTitle className={`text-lg font-semibold tracking-tight ${theme === 'dark' ? 'text-white' : 'text-black'}`}>Unlock Playbook</DialogTitle>
          <DialogDescription className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
            Our transactions are securely facilitated by Razorpay, ensuring a seamless experience. International
            transactions are processed via PayPal for added convenience.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-black'}`}>For any queries regarding payments, feel free to reach out to us at:</p>
          <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-black'}`}>📧 hnwi@montaigne.co</p>
        </div>
        <div className="flex justify-between items-center mt-4">
          <Button variant="outline" onClick={() => setIsOpen(false)} className={`${theme === 'dark' ? 'text-white border-white' : 'text-black border-black'}`}>
            Cancel
          </Button>
          <div className="w-[200px]">
            <RazorpayButton
              playbookId={playbookId}
              onSuccess={(id) => {
                onSuccess(id)
                setIsOpen(false)
              }}
              paymentButtonId={paymentButtonId}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

