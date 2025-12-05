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
          ? 'bg-gradient-to-br from-zinc-300 via-zinc-200 to-zinc-300 dark:from-zinc-900 dark:via-black dark:to-zinc-900 shadow-lg shadow-zinc-300/50 dark:shadow-black/50 animate-heartbeat border border-zinc-400/50 dark:border-zinc-700/50'
          : isPersonalMode
            ? 'bg-gradient-to-br from-zinc-300 via-zinc-200 to-zinc-300 dark:from-zinc-900 dark:via-black dark:to-zinc-900 shadow-xl shadow-blue-500/30 border border-blue-500/30 ring-1 ring-blue-400/20'
            : 'bg-gradient-to-br from-zinc-300 via-zinc-200 to-zinc-300 dark:from-zinc-900 dark:via-black dark:to-zinc-900 shadow-xl shadow-[#DAA520]/30 border border-[#DAA520]/30 ring-1 ring-[#DAA520]/20'
        }
        ${isLoading
          ? 'opacity-40 cursor-not-allowed'
          : 'cursor-pointer hover:scale-110 hover:shadow-xl active:scale-95'
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
          <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping-slow" />
        )}
        {!isPersonalMode && hasCompletedAssessment && (
          <div className="absolute inset-0 rounded-full bg-[#DAA520]/20 animate-ping-slow" />
        )}

        {/* P Letter - Blue in Personal Mode, Gold in All Mode */}
        <span className={`
          relative z-10 font-black text-sm sm:text-base transition-all duration-300
          ${!hasCompletedAssessment
            ? 'text-zinc-500 dark:text-zinc-400'
            : isPersonalMode
              ? 'text-blue-500'
              : 'text-[#DAA520]'
          }
        `}>
          P
        </span>
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
