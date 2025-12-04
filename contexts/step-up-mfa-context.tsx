"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import {
  StepUpActionResult,
  StepUpChallengeInfo,
  StepUpHandlerPayload,
  StepUpHandlerResult,
  registerStepUpChallengeHandler,
  resendStepUpChallenge,
  submitStepUpVerification
} from "@/lib/secure-api"
import { StepUpMfaDialog } from "@/components/step-up-mfa-dialog"
import { useToast } from "@/components/ui/use-toast"

interface StepUpContextValue {
  acknowledgeStepUp: () => void
}

const StepUpContext = createContext<StepUpContextValue | undefined>(undefined)

interface StepUpState {
  open: boolean
  payload: StepUpHandlerPayload | null
  challenge: StepUpChallengeInfo | undefined
  error: string | null
  isSubmitting: boolean
  isResending: boolean
  resolver: ((result: StepUpHandlerResult) => void) | null
}

const INITIAL_STATE: StepUpState = {
  open: false,
  payload: null,
  challenge: undefined,
  error: null,
  isSubmitting: false,
  isResending: false,
  resolver: null
}

export function StepUpMfaProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast()
  const [state, setState] = useState<StepUpState>(INITIAL_STATE)

  const resetState = useCallback(() => {
    setState(INITIAL_STATE)
  }, [])

  const resolveAndReset = useCallback((result: StepUpHandlerResult) => {
    state.resolver?.(result)
    resetState()
  }, [resetState, state.resolver])

  const showChallenge = useCallback((payload: StepUpHandlerPayload) => {
    setState({
      open: true,
      payload,
      challenge: payload.challenge,
      error: payload.challenge ? null : "Verification challenge unavailable. Try again in a moment or contact support.",
      isSubmitting: false,
      isResending: false,
      resolver: null
    })
  }, [])

  const handleVerificationResult = useCallback((result: StepUpActionResult) => {
    if (result.success) {
      toast({
        title: "Identity verified",
        description: "Security check complete. Resuming your request."
      })
      resolveAndReset({ status: "verified" })
      return
    }

    if (result.status === 429) {
      const retryAfter = result.data?.retryAfter || result.data?.retry_after || 60
      setState((prev) => ({
        ...prev,
        error: `Too many attempts. Please wait ${retryAfter} seconds before trying again.`,
        isSubmitting: false
      }))
      return
    }

    setState((prev) => ({
      ...prev,
      error: result.message || "Verification failed. Please try again.",
      isSubmitting: false
    }))
  }, [resolveAndReset, toast])

  const handleSubmitCode = useCallback(async (code: string) => {
    if (!state.challenge) {
      resolveAndReset({
        status: "failed",
        error: "Verification challenge unavailable."
      })
      return
    }

    setState((prev) => ({
      ...prev,
      isSubmitting: true,
      error: null
    }))

    const result = await submitStepUpVerification({
      mfaToken: state.challenge.mfaToken,
      code
    })

    handleVerificationResult(result)
  }, [handleVerificationResult, resolveAndReset, state.challenge])

  const handleResend = useCallback(async () => {
    if (!state.challenge) {
      setState((prev) => ({
        ...prev,
        error: "No active verification challenge to resend."
      }))
      return
    }

    if (state.isResending) {
      return
    }

    setState((prev) => ({
      ...prev,
      isResending: true,
      error: null
    }))

    const result = await resendStepUpChallenge({
      mfaToken: state.challenge.mfaToken
    })

    setState((prev) => ({
      ...prev,
      isResending: false,
      error: result.success ? null : result.message || "Failed to resend code. Please try again."
    }))

    if (result.success) {
      toast({
        title: "Verification code resent",
        description: result.message || "Check your inbox for the new code."
      })
    }
  }, [state.challenge, state.isResending, toast])

  const attachResolver = useCallback((resolver: (result: StepUpHandlerResult) => void) => {
    setState((prev) => ({
      ...prev,
      resolver
    }))
  }, [])

  const stepUpHandler = useCallback(async (payload: StepUpHandlerPayload) => {
    return await new Promise<StepUpHandlerResult>((resolve) => {
      showChallenge(payload)
      attachResolver(resolve)
    })
  }, [attachResolver, showChallenge])

  useEffect(() => {
    registerStepUpChallengeHandler(stepUpHandler)
    return () => {
      registerStepUpChallengeHandler(null)
    }
  }, [stepUpHandler])

  const handleClose = useCallback(() => {
    resolveAndReset({ status: "cancelled", error: "Verification dismissed by user." })
  }, [resolveAndReset])

  const handleRetry = useCallback(() => {
    resolveAndReset({ status: "retry" })
  }, [resolveAndReset])

  const contextValue = useMemo<StepUpContextValue>(() => ({
    acknowledgeStepUp: () => {
      // Placeholder for future telemetry hooks
    }
  }), [])

  return (
    <StepUpContext.Provider value={contextValue}>
      {children}
      <StepUpMfaDialog
        open={state.open}
        reason={state.payload?.reason}
        challenge={state.challenge}
        isSubmitting={state.isSubmitting}
        isResending={state.isResending}
        error={state.error}
        onSubmitCode={handleSubmitCode}
        onResend={handleResend}
        onClose={handleClose}
        onRetry={state.challenge ? undefined : handleRetry}
      />
    </StepUpContext.Provider>
  )
}

export const useStepUpContext = (): StepUpContextValue => {
  const context = useContext(StepUpContext)
  if (!context) {
    throw new Error("useStepUpContext must be used within a StepUpMfaProvider")
  }
  return context
}
