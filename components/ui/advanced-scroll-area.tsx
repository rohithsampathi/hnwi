// components/ui/advanced-scroll-area.tsx
// Advanced scroll container with overscroll prevention and rubber band fix
// Uses OverlayScrollbars for professional scroll handling

"use client"

import * as React from "react"
import { OverlayScrollbarsComponent } from "overlayscrollbars-react"
import "overlayscrollbars/overlayscrollbars.css"

interface AdvancedScrollAreaProps {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
  maxHeight?: string | number
}

export function AdvancedScrollArea({
  children,
  className = "",
  style = {},
  maxHeight = "100%"
}: AdvancedScrollAreaProps) {
  return (
    <OverlayScrollbarsComponent
      element="div"
      options={{
        scrollbars: {
          theme: "os-theme-dark",
          visibility: "auto",
          autoHide: "leave",
          autoHideDelay: 800,
        },
        overflow: {
          x: "hidden",
          y: "scroll",
        },
        // CRITICAL: Prevent rubber band/overscroll
        paddingAbsolute: false,
        showNativeOverlaidScrollbars: false,
        update: {
          elementEvents: [["scroll"]],
          debounce: [0, 0],
        },
      }}
      style={{
        maxHeight: typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight,
        // CSS containment for performance and isolation
        contain: "layout style paint",
        // Prevent overscroll/rubber band
        overscrollBehavior: "contain",
        // Touch action for mobile gestures
        touchAction: "pan-y",
        // Prevent momentum scrolling propagation
        WebkitOverflowScrolling: "auto",
        ...style,
      }}
      className={className}
      defer
    >
      <div
        style={{
          // Inner content container with proper isolation
          contain: "layout style",
          willChange: "auto",
        }}
      >
        {children}
      </div>
    </OverlayScrollbarsComponent>
  )
}
