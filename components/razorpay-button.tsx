// components/razorpay-button.tsx

"use client"

import { useEffect, useRef } from "react"

interface RazorpayButtonProps {
  playbookId: string
  onSuccess: (playbookId: string) => void
  paymentButtonId: string
}

export function RazorpayButton({ playbookId, onSuccess, paymentButtonId }: RazorpayButtonProps) {
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (!formRef.current) return

    // Clear any existing content
    formRef.current.innerHTML = ""

    // Create and append the script element
    const script = document.createElement("script")
    script.src = "https://checkout.razorpay.com/v1/payment-button.js"
    script.async = true
    script.dataset.payment_button_id = paymentButtonId

    formRef.current.appendChild(script)

    return () => {
      if (formRef.current) {
        formRef.current.innerHTML = ""
      }
    }
  }, [paymentButtonId])

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === "razorpay:payment:success") {
        onSuccess(playbookId)
      }
    }

    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [playbookId, onSuccess])

  return <form ref={formRef} className="w-full" />
}

