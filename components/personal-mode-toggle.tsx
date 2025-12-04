// components/personal-mode-toggle.tsx
// Personal Mode power toggle for Home Dashboard personalization

"use client"

import React from "react"
import { useRouter } from "next/navigation"

interface PersonalModeToggleProps {
  isPersonalMode: boolean
  onToggle: () => void
  hasCompletedAssessment: boolean
  isLoading?: boolean
}

export function PersonalModeToggle({
  isPersonalMode,
  onToggle,
  hasCompletedAssessment,
  isLoading = false
}: PersonalModeToggleProps) {
  const router = useRouter()

  const handleClick = () => {
    if (!hasCompletedAssessment) {
      // Navigate to assessment if not completed
      router.push('/assessment')
    } else {
      // Toggle Personal Mode if assessment is complete
      onToggle()
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`
        relative inline-flex items-center justify-center
        w-8 h-8 sm:w-9 sm:h-9 rounded-full
        transition-all duration-300 ease-out
        ${!hasCompletedAssessment
          ? 'bg-gradient-to-br from-zinc-300 via-zinc-200 to-zinc-300 dark:from-zinc-800 dark:via-zinc-900 dark:to-zinc-800 shadow-lg shadow-zinc-300/50 dark:shadow-zinc-900/50 animate-heartbeat border-2 border-blue-400/40 dark:border-blue-500/40'
          : isPersonalMode
            ? 'bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 shadow-lg shadow-blue-500/50 border-2 border-blue-400/70 ring-2 ring-blue-300/30'
            : 'bg-gradient-to-br from-zinc-400 via-zinc-500 to-zinc-600 dark:from-zinc-700 dark:via-zinc-600 dark:to-zinc-700 shadow-md border-2 border-zinc-400/50 dark:border-zinc-500/50'
        }
        ${isLoading
          ? 'opacity-40 cursor-not-allowed'
          : 'cursor-pointer hover:scale-110 active:scale-95'
        }
      `}
      title={
        !hasCompletedAssessment
          ? 'Complete C10 Assessment to unlock Personal Mode - Click to start'
          : isPersonalMode
            ? 'Personal Mode ON - Click to turn OFF and view all opportunities'
            : 'Personal Mode OFF - Click to turn ON and filter by your DNA'
      }
    >
      {/* Power "P" Symbol */}
      <div className="relative">
        {/* Outer glow ring when active */}
        {isPersonalMode && (
          <div className="absolute inset-0 rounded-full bg-white/30 animate-ping-slow" />
        )}

        {/* P Letter */}
        <span className={`
          relative z-10 font-black text-sm sm:text-base
          ${!hasCompletedAssessment
            ? 'text-blue-500 dark:text-blue-400'
            : isPersonalMode
              ? 'text-white'
              : 'text-zinc-200 dark:text-zinc-300'
          }
          transition-colors duration-300
        `}>
          P
        </span>

        {/* Active pulse dot */}
        {isPersonalMode && (
          <div className="absolute -top-1 -right-1 w-2 h-2">
            <div className="absolute inset-0 rounded-full bg-green-400 animate-pulse" />
            <div className="absolute inset-0 rounded-full bg-green-400 opacity-75" />
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes ping-slow {
          0%, 100% {
            transform: scale(1);
            opacity: 0.5;
          }
          50% {
            transform: scale(1.5);
            opacity: 0;
          }
        }
        .animate-ping-slow {
          animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        @keyframes heartbeat {
          0%, 100% {
            transform: scale(1);
          }
          10%, 30% {
            transform: scale(1.1);
          }
          20%, 40% {
            transform: scale(0.95);
          }
        }
        .animate-heartbeat {
          animation: heartbeat 1.5s ease-in-out infinite;
        }
      `}</style>
    </button>
  )
}
