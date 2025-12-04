// components/personal-mode-toggle.tsx
// Personal Mode power toggle for Home Dashboard personalization

"use client"

import React from "react"

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
  const isDisabled = !hasCompletedAssessment || isLoading

  return (
    <button
      onClick={onToggle}
      disabled={isDisabled}
      className={`
        relative inline-flex items-center justify-center
        w-8 h-8 sm:w-9 sm:h-9 rounded-full
        transition-all duration-300 ease-out
        ${isPersonalMode
          ? 'bg-gradient-to-br from-primary via-primary to-primary/80 shadow-lg shadow-primary/50'
          : 'bg-gradient-to-br from-muted to-muted-foreground/30 shadow-md'
        }
        ${isDisabled
          ? 'opacity-40 cursor-not-allowed'
          : 'cursor-pointer hover:scale-110 active:scale-95'
        }
      `}
      title={
        !hasCompletedAssessment
          ? 'Complete C10 Assessment to unlock Personal Mode'
          : isPersonalMode
            ? 'Personal Mode Active - Click to view all opportunities'
            : 'Click to activate Personal Mode'
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
          ${isPersonalMode ? 'text-white' : 'text-muted-foreground'}
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

        {/* Lock icon when disabled */}
        {!hasCompletedAssessment && (
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-background rounded-full flex items-center justify-center">
            <span className="text-[8px]">🔒</span>
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
      `}</style>
    </button>
  )
}
