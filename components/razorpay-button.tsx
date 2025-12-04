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

    // Only update if the form is empty or button ID changed
    const existingScript = formRef.current.querySelector('script[data-payment_button_id]');
    const currentButtonId = existingScript?.getAttribute('data-payment_button_id');

    if (currentButtonId === paymentButtonId) {
      return; // Skip if it's already the correct button ID
    }

    // Clear any existing content
    formRef.current.innerHTML = ""

    // Create and append the script element
    const script = document.createElement("script")
    script.src = "https://checkout.razorpay.com/v1/payment-button.js"
    script.async = true
    script.dataset.payment_button_id = paymentButtonId

    // Add error handling for script loading
    script.onerror = () => {

      // Create a fallback button in case script loading fails
      if (formRef.current) {
        formRef.current.innerHTML = "";
        const fallbackButton = document.createElement("button");
        fallbackButton.textContent = "Purchase Playbook";
        fallbackButton.className = "w-full bg-primary text-white py-2 px-4 rounded";
        fallbackButton.onclick = () => window.open("https://rzp.io/l/" + paymentButtonId, "_blank");
        formRef.current.appendChild(fallbackButton);
      }
    };

    formRef.current.appendChild(script);

    return () => {
      // Keep the cleanup to prevent memory leaks
      if (formRef.current) {
        formRef.current.innerHTML = "";
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

