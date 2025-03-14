"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence, useDragControls, useMotionValue } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/contexts/theme-context"
import { useOnboarding } from "@/contexts/onboarding-context"
import { PlayCircle, Activity, Lightbulb, ChevronRight, ChevronLeft, GripHorizontal, X } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Heading3, Paragraph } from "@/components/ui/typography"

const STEPS = [
  {
    key: "playbooks",
    title: "Play Books",
    icon: PlayCircle,
    color: "#FFC107",
    description: "Explore curated strategies for success in the HNWI market.",
  },
  {
    key: "industryTrends",
    title: "Industry Trends",
    icon: Activity,
    color: "#4CAF50",
    description: "Stay ahead with real-time insights on wealth management trends.",
  },
  {
    key: "strategyEngine",
    title: "Strategy Engine",
    icon: Lightbulb,
    color: "#2196F3",
    description: "Craft winning strategies with our AI-powered assistant.",
  },
] as const

interface OnboardingWizardProps {
  onClose?: () => void
}

export function OnboardingWizard({ onClose }: OnboardingWizardProps) {
  const { theme } = useTheme()
  const { currentStep, isWizardCompleted, completeWizard, markStepAsCompleted } = useOnboarding()
  const [isVisible, setIsVisible] = useState(true)
  const dragControls = useDragControls()
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const constraintsRef = useRef(null)

  const currentStepIndex = STEPS.findIndex((step) => step.key === currentStep)
  const currentStepData = STEPS[currentStepIndex] || STEPS[0]

  const handleNext = useCallback(() => {
    if (currentStepIndex === STEPS.length - 1) {
      completeWizard()
      if (onClose) onClose()
    } else {
      markStepAsCompleted(currentStep)
    }
  }, [currentStepIndex, completeWizard, markStepAsCompleted, currentStep, onClose])

  const handleSkip = useCallback(() => {
    completeWizard()
    if (onClose) onClose()
  }, [completeWizard, onClose])

  useEffect(() => {
    setIsVisible(true)
  }, [currentStep])

  if (isWizardCompleted) return null

  return (
    <div ref={constraintsRef} className="fixed inset-0 pointer-events-none z-50">
      <AnimatePresence>
        {isVisible && (
          <motion.div
            drag
            dragControls={dragControls}
            dragMomentum={false}
            dragElastic={0}
            dragConstraints={constraintsRef}
            style={{ x, y }}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-20 left-1/2 transform -translate-x-1/2 pointer-events-auto"
          >
            <Card className={`w-96 ${theme === "dark" ? "bg-[#1A1A1A] text-white" : "bg-white text-[#121212]"} shadow-[0_15px_35px_rgba(0,0,0,0.2)] border border-gray-100 dark:border-gray-800`}>
              <CardHeader className="cursor-move" onPointerDown={(e) => dragControls.start(e)}>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">Onboarding Guide</CardTitle>
                  <div className="flex items-center space-x-2">
                    <GripHorizontal className="w-5 h-5 text-gray-500" />
                    {onClose && (
                      <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0 rounded-full shadow-[0_2px_5px_rgba(0,0,0,0.1)] hover:shadow-[0_4px_10px_rgba(0,0,0,0.15)] transition-all transform hover:-translate-y-0.5 active:translate-y-0.5">
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                <CardDescription>
                  Step {currentStepIndex + 1} of {STEPS.length}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4 mb-4">
                  {STEPS.map((step, index) => {
                    const StepIcon = step.icon
                    return (
                      <div
                        key={step.key}
                        className={`w-8 h-8 rounded-full flex items-center justify-center shadow-[0_4px_8px_rgba(0,0,0,0.15)] ${
                          index === currentStepIndex
                            ? "bg-blue-500"
                            : index < currentStepIndex
                              ? "bg-green-500"
                              : "bg-gray-300"
                        }`}
                      >
                        <StepIcon className="w-5 h-5 text-white" />
                      </div>
                    )
                  })}
                </div>
                <Heading3 className="text-xl font-semibold mb-2 font-heading" style={{ color: currentStepData.color }}>
                  {currentStepData.title}
                </Heading3>
                <Paragraph className="text-sm font-body">{currentStepData.description}</Paragraph>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div>
                  {currentStepIndex > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => markStepAsCompleted(STEPS[currentStepIndex - 1].key)}
                      className="rounded-full shadow-[0_2px_5px_rgba(0,0,0,0.1)] hover:shadow-[0_4px_10px_rgba(0,0,0,0.15)] transition-all transform hover:-translate-y-0.5 active:translate-y-0.5"
                    >
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleSkip}
                    className="rounded-full shadow-[0_2px_5px_rgba(0,0,0,0.1)] hover:shadow-[0_4px_10px_rgba(0,0,0,0.15)] transition-all transform hover:-translate-y-0.5 active:translate-y-0.5"
                  >
                    Skip
                  </Button>
                  <Button 
                    onClick={handleNext}
                    className="rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.15)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.25)] transition-all transform hover:-translate-y-0.5 active:translate-y-0.5"
                  >
                    {currentStepIndex === STEPS.length - 1 ? "Finish" : "Next"}
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

