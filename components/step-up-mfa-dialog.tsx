"use client"

import { useMemo } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { MfaCodeInput } from "@/components/mfa-code-input"
import { StepUpChallengeInfo } from "@/lib/secure-api"
import { AlertOctagon, ShieldCheck } from "lucide-react"

interface StepUpMfaDialogProps {
  open: boolean
  reason?: string
  challenge?: StepUpChallengeInfo
  isSubmitting: boolean
  isResending: boolean
  error?: string | null
  onSubmitCode: (code: string) => void
  onResend: () => void
  onClose: () => void
  onRetry?: () => void
}

const formatDeliveryMessage = (challenge?: StepUpChallengeInfo): string => {
  if (!challenge) {
    return ""
  }

  const delivery = challenge.delivery
  if (!delivery) {
    return ""
  }

  const method = delivery.channel_label || delivery.method || delivery.channel
  const address = delivery.address

  if (method && address) {
    return `${method} code sent to ${address}`
  }

  if (method) {
    return `${method} code sent`
  }

  if (address) {
    return `Code sent to ${address}`
  }

  return ""
}

export function StepUpMfaDialog({
  open,
  reason,
  challenge,
  isSubmitting,
  isResending,
  error,
  onSubmitCode,
  onResend,
  onClose,
  onRetry
}: StepUpMfaDialogProps) {
  const deliveryMessage = useMemo(() => formatDeliveryMessage(challenge), [challenge])

  const showRetryState = !challenge

  return (
    <Dialog open={open} onOpenChange={(value) => {
      if (!value) {
        onClose()
      }
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            Verify it&apos;s you
          </DialogTitle>
          <DialogDescription>
            {reason || "We detected unusual activity and need an extra verification step before continuing."}
          </DialogDescription>
        </DialogHeader>

        {showRetryState ? (
          <div className="space-y-4">
            <div className="rounded-md border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-900 dark:border-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-100 flex items-start gap-3">
              <AlertOctagon className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Security challenge unavailable</p>
                <p className="mt-1 text-sm">
                  We couldn&apos;t send a verification code. You can retry the action or contact support if the issue
                  persists.
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row-reverse">
              <Button
                className="flex-1"
                onClick={() => {
                  onRetry?.()
                }}
              >
                Try again
              </Button>
              <Button variant="outline" className="flex-1" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {deliveryMessage && (
              <div className="rounded-md border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary">
                {deliveryMessage}
                {typeof challenge?.expiresInSeconds === "number" && challenge.expiresInSeconds > 0 && (
                  <span className="mt-2 block text-xs text-primary/80">
                    Expires in approximately {Math.ceil(challenge.expiresInSeconds / 60)} minute
                    {Math.ceil(challenge.expiresInSeconds / 60) === 1 ? "" : "s"}.
                  </span>
                )}
              </div>
            )}

            <MfaCodeInput
              disabled={isSubmitting}
              onComplete={(code) => {
                if (!isSubmitting) {
                  onSubmitCode(code)
                }
              }}
            />

            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-900/30 dark:text-red-100">
                {error}
              </div>
            )}

            <div className="flex justify-between items-center gap-3">
              <Button
                type="button"
                variant="secondary"
                disabled={isResending || isSubmitting}
                onClick={onResend}
              >
                {isResending ? "Sending..." : "Resend code"}
              </Button>
              <Button
                variant="outline"
                type="button"
                disabled={isSubmitting}
                onClick={onClose}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
