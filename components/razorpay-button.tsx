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
    const formElement = formRef.current
    if (!formElement) return

    // Only update if the form is empty or button ID changed
    const existingScript = formElement.querySelector('script[data-payment_button_id]');
    const currentButtonId = existingScript?.getAttribute('data-payment_button_id');

    if (currentButtonId === paymentButtonId) {
      return; // Skip if it's already the correct button ID
    }

    // Clear any existing content
    formElement.innerHTML = ""

    // Create and append the script element
    const script = document.createElement("script")
    script.src = "https://checkout.razorpay.com/v1/payment-button.js"
    script.async = true
    script.dataset.payment_button_id = paymentButtonId

    // Add error handling for script loading
    script.onerror = () => {

      // Create a fallback button in case script loading fails
      if (formElement) {
        formElement.innerHTML = "";
        const fallbackButton = document.createElement("button");
        fallbackButton.textContent = "Purchase Playbook";
        fallbackButton.className = "w-full bg-primary text-white py-2 px-4 rounded";
        fallbackButton.onclick = () => window.open("https://rzp.io/l/" + paymentButtonId, "_blank");
        formElement.appendChild(fallbackButton);
      }
    };

    formElement.appendChild(script);

    return () => {
      // Keep the cleanup to prevent memory leaks
      formElement.innerHTML = "";
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
