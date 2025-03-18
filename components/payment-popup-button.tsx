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

interface PaymentPopupButtonProps {
  playbookId: string
  onSuccess: (playbookId: string) => void
  paymentButtonId: string
}

export function PaymentPopupButton({ playbookId, onSuccess, paymentButtonId }: PaymentPopupButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          className="w-full bg-primary hover:bg-primary/90 dark:text-black text-white font-bold"
          onClick={() => setIsOpen(true)}
        >
          Unlock Playbook
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-xl border shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-heading tracking-tight text-[#121212] dark:text-white">Unlock Playbook</DialogTitle>
          <DialogDescription className="text-sm text-[#121212] dark:text-white">
            Our transactions are securely facilitated by Razorpay, ensuring a seamless experience. International
            transactions are processed via PayPal for added convenience.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-[#121212] dark:text-white">For any queries regarding payments, feel free to reach out to us at:</p>
          <p className="text-sm font-medium text-[#121212] dark:text-white">📧 info@montaigne.co</p>
        </div>
        <div className="flex justify-between items-center mt-4">
          <Button variant="outline" onClick={() => setIsOpen(false)} className="text-[#121212] dark:text-white border-[#121212] dark:border-white">
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

