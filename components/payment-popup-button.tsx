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
          className="w-full bg-gray-400 text-white hover:bg-gray-600 transition-colors duration-200"
          onClick={() => setIsOpen(true)}
        >
          Purchase Playbook
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Payment Information</DialogTitle>
          <DialogDescription>
            Our transactions are securely facilitated by Razorpay, ensuring a seamless experience. International
            transactions are processed via PayPal for added convenience.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-gray-500">For any queries regarding payments, feel free to reach out to us at:</p>
          <p className="text-sm font-medium text-white">📧 info@montaigne.co</p>
        </div>
        <div className="flex justify-between items-center mt-4">
          <Button variant="outline" onClick={() => setIsOpen(false)} className="text-white">
            Close
          </Button>
          <div className="w-[200px]">
            {" "}
            {/* Fixed width container for Razorpay button */}
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

