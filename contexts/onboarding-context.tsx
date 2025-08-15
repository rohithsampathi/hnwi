"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"

type OnboardingStep = "playbooks" | "industryTrends" | "strategyEngine"

interface OnboardingContextType {
  currentStep: OnboardingStep
  setCurrentStep: (step: OnboardingStep) => void
  isWizardCompleted: boolean
  completeWizard: () => void
  markStepAsCompleted: (step: OnboardingStep) => void
  areAllStepsCompleted: () => boolean
  resetOnboarding: () => void
  showOnboardingWizard: () => void
  isFromSignupFlow: boolean
  setIsFromSignupFlow: (value: boolean) => void
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined)

const STEPS: OnboardingStep[] = ["playbooks", "industryTrends", "strategyEngine"]

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("playbooks")
  const [isWizardCompleted, setIsWizardCompleted] = useState(false)
  const [completedSteps, setCompletedSteps] = useState<Set<OnboardingStep>>(new Set())
  const [isFromSignupFlow, setIsFromSignupFlow] = useState(false)

  // Load saved state only once on mount
  useEffect(() => {
    const savedStep = localStorage.getItem("onboardingStep") as OnboardingStep
    if (savedStep && STEPS.includes(savedStep)) {
      setCurrentStep(savedStep)
    }

    const wizardCompleted = localStorage.getItem("wizardCompleted")
    if (wizardCompleted === "true") {
      setIsWizardCompleted(true)
    }

    const savedCompletedSteps = localStorage.getItem("completedSteps")
    if (savedCompletedSteps) {
      try {
        const parsed = JSON.parse(savedCompletedSteps)
        setCompletedSteps(new Set(parsed))
      } catch (e) {
      }
    }

    const savedIsFromSignupFlow = localStorage.getItem("isFromSignupFlow")
    if (savedIsFromSignupFlow) {
      setIsFromSignupFlow(savedIsFromSignupFlow === "true")
    }
  }, [])

  // Memoize update functions to prevent unnecessary re-renders
  const updateStep = useCallback((step: OnboardingStep) => {
    if (STEPS.includes(step)) {
      setCurrentStep(step)
      localStorage.setItem("onboardingStep", step)
    }
  }, [])

  const completeWizard = useCallback(() => {
    setIsWizardCompleted(true)
    localStorage.setItem("wizardCompleted", "true")
  }, [])

  const areAllStepsCompleted = useCallback(() => {
    return STEPS.every((step) => completedSteps.has(step))
  }, [completedSteps])

  const markStepAsCompleted = useCallback(
    (step: OnboardingStep) => {
      setCompletedSteps((prev) => {
        const newCompletedSteps = new Set(prev)
        newCompletedSteps.add(step)
        localStorage.setItem("completedSteps", JSON.stringify(Array.from(newCompletedSteps)))
        return newCompletedSteps
      })

      const currentIndex = STEPS.indexOf(step)
      if (currentIndex < STEPS.length - 1) {
        const nextStep = STEPS[currentIndex + 1]
        updateStep(nextStep)
      } else {
        completeWizard()
      }
    },
    [completeWizard, updateStep],
  )

  const resetOnboarding = useCallback(() => {
    setCurrentStep("playbooks")
    setIsWizardCompleted(false)
    setCompletedSteps(new Set())
    setIsFromSignupFlow(false)
    localStorage.removeItem("onboardingStep")
    localStorage.removeItem("wizardCompleted")
    localStorage.removeItem("completedSteps")
    localStorage.removeItem("isFromSignupFlow")
  }, [])

  const showOnboardingWizard = useCallback(() => {
    setIsWizardCompleted(false)
    setCurrentStep("playbooks")
    setCompletedSteps(new Set())
    setIsFromSignupFlow(true)
    localStorage.removeItem("wizardCompleted")
    localStorage.removeItem("completedSteps")
    localStorage.setItem("isFromSignupFlow", "true")
  }, [])

  const updateIsFromSignupFlow = useCallback((value: boolean) => {
    setIsFromSignupFlow(value)
    localStorage.setItem("isFromSignupFlow", value.toString())
  }, [])

  const value = {
    currentStep,
    setCurrentStep: updateStep,
    isWizardCompleted,
    completeWizard,
    markStepAsCompleted,
    areAllStepsCompleted,
    resetOnboarding,
    showOnboardingWizard,
    isFromSignupFlow,
    setIsFromSignupFlow: updateIsFromSignupFlow,
  }

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>
}

export const useOnboarding = () => {
  const context = useContext(OnboardingContext)
  if (context === undefined) {
    throw new Error("useOnboarding must be used within an OnboardingProvider")
  }
  return context
}

