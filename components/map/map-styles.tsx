// components/map/map-styles.tsx
// Global styles for the map component

"use client"

interface MapStylesProps {
  theme: string
}

export function MapStyles({ theme }: MapStylesProps) {
  return (
    <style jsx global>{`
      /* Clip tooltips/popups to map bounds — prevents overflow outside map frame */
      .leaflet-container {
        overflow: hidden !important;
      }
      .leaflet-tooltip-pane {
        overflow: visible !important;
        z-index: 45000 !important;
      }
      /* Keep hover summaries and detail popups above every map overlay/control layer */
      .leaflet-popup-pane {
        z-index: 46000 !important;
      }
      /* CRITICAL: Override Leaflet's default scroll blocking on popup content */
      .leaflet-popup-content {
        pointer-events: auto !important;
        touch-action: auto !important;
      }
      .leaflet-popup-content * {
        pointer-events: auto !important;
      }
      /* Allow scrolling in Radix ScrollArea viewport */
      [data-radix-scroll-area-viewport] {
        touch-action: pan-y !important;
        -webkit-overflow-scrolling: touch !important;
        cursor: auto !important;
        user-select: auto !important;
        overscroll-behavior: contain !important;
      }
      /* Ensure scroll container events work properly */
      .leaflet-popup-content [data-radix-scroll-area-viewport] {
        user-select: auto !important;
      }
      .leaflet-popup-content [data-radix-scroll-area-viewport] * {
        pointer-events: auto !important;
      }
      .custom-marker {
        background: transparent;
        border: none;
      }
      .cluster-marker {
        background: transparent;
        border: none;
      }
      .midpoint-marker {
        background: transparent !important;
        border: none !important;
        box-shadow: none !important;
      }
      /* Position popup below marker */
      .leaflet-popup {
        bottom: auto !important;
        top: 0 !important;
      }
      .leaflet-popup-content-wrapper {
        background: ${theme === "dark" ? "#1a1a1a" : "#fff"} !important;
        color: ${theme === "dark" ? "#fff" : "#000"} !important;
        border-radius: 8px !important;
        box-shadow: 0 4px 12px rgba(0, 0, 0, ${theme === "dark" ? "0.5" : "0.15"}) !important;
        border: 1px solid ${theme === "dark" ? "#444" : "transparent"} !important;
        /* CRITICAL: Let Leaflet handle popup sizing naturally */
        max-height: none !important;
        overflow: visible !important;
      }
      .leaflet-popup-tip {
        background: ${theme === "dark" ? "#1a1a1a" : "#fff"} !important;
        border: 1px solid ${theme === "dark" ? "#444" : "transparent"} !important;
      }
      .leaflet-popup-content {
        margin: 0 !important;
        width: auto !important;
        min-width: 280px !important;
        max-width: 340px !important;
      }
      .border-border {
        border-color: ${theme === "dark" ? "#555" : "#e5e5e5"} !important;
      }
      .text-muted-foreground {
        color: ${theme === "dark" ? "#bbb" : "#666"} !important;
      }
      .text-primary {
        color: hsl(var(--primary)) !important;
      }
      .text-primary-foreground {
        color: hsl(var(--primary-foreground)) !important;
      }
      .bg-primary {
        background-color: hsl(var(--primary)) !important;
      }
      .verdict-proceed {
        color: #22C55E !important;
      }
      .verdict-restructure {
        color: #D4A843 !important;
      }
      .verdict-abort {
        color: #EF4444 !important;
      }
      .scrollbar-hide {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
      .scrollbar-hide::-webkit-scrollbar {
        display: none;
      }
      /* Citation styles - clickable Dev ID references */
      citation {
        display: inline;
        color: hsl(var(--primary));
        font-weight: 600;
        cursor: pointer;
        text-decoration: none;
        border-bottom: 1px dashed hsl(var(--primary));
        transition: all 0.2s ease;
        padding: 0 2px;
      }
      citation:hover {
        background-color: hsl(var(--primary) / 0.1);
        border-bottom-style: solid;
      }
      citation:active {
        transform: translateY(1px);
      }
      .citation-content {
        line-height: 1.6;
      }
      /* Expand/Collapse button hover effect */
      .leaflet-popup-content button:hover {
        opacity: 0.8;
      }
      /* Custom scrollbar for Radix ScrollArea viewport */
      [data-radix-scroll-area-viewport]::-webkit-scrollbar {
        width: 6px;
      }
      [data-radix-scroll-area-viewport]::-webkit-scrollbar-track {
        background: transparent;
      }
      [data-radix-scroll-area-viewport]::-webkit-scrollbar-thumb {
        background: ${theme === "dark" ? "rgba(128, 128, 128, 0.5)" : "rgba(0, 0, 0, 0.2)"};
        border-radius: 3px;
      }
      [data-radix-scroll-area-viewport]::-webkit-scrollbar-thumb:hover {
        background: ${theme === "dark" ? "rgba(128, 128, 128, 0.7)" : "rgba(0, 0, 0, 0.3)"};
      }
      /* Pulsing ring animation for new opportunities */
      @keyframes pulse-ring {
        0% {
          transform: translate(-50%, -50%) scale(0.8);
          opacity: 1;
        }
        100% {
          transform: translate(-50%, -50%) scale(1.5);
          opacity: 0;
        }
      }
      .pulse-ring {
        animation: pulse-ring 1.5s ease-out infinite;
      }
      /* Blinking dot animation for NEW badges */
      @keyframes ping {
        75%, 100% {
          transform: scale(2);
          opacity: 0;
        }
      }
      .animate-ping {
        animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
      }

      /* Migration flow animation — flowing dots along arc */
      @keyframes dash-flow {
        0% { stroke-dashoffset: 0; }
        100% { stroke-dashoffset: -48; }
      }

      /* Apply flow animation to all dashed polylines (migration arcs) */
      .leaflet-overlay-pane path[stroke-dasharray] {
        animation: dash-flow 1.5s linear infinite;
      }

      /* Premium glow on hover */
      .leaflet-interactive[stroke-dasharray]:hover {
        filter: drop-shadow(0 0 6px currentColor);
        transition: filter 0.3s ease;
      }

      /* Corridor label tooltip - remove default Leaflet styles */
      .corridor-label-tooltip.leaflet-tooltip {
        background: transparent !important;
        border: none !important;
        box-shadow: none !important;
        padding: 0 !important;
        margin: 0 !important;
        /* Remove the tooltip arrow/tip */
        &::before {
          display: none !important;
        }
      }
      /* Ensure tooltip content inherits our custom styles */
      .corridor-label-tooltip.leaflet-tooltip > * {
        pointer-events: none;
      }

      /* Remove blue focus outline from map elements */
      .leaflet-container,
      .leaflet-container *,
      .leaflet-interactive,
      .leaflet-popup,
      .leaflet-popup-content-wrapper {
        outline: none !important;
      }

      /* Remove focus outline from polylines and paths */
      .leaflet-overlay-pane path,
      .leaflet-overlay-pane svg {
        outline: none !important;
      }

      /* ─── Crisis Overlay ──────────────────────────────────────── */

      /* Clip SVG to prevent crisis polygon paths from extending across world wrap copies */
      .leaflet-overlay-pane svg {
        overflow: hidden !important;
      }

      /* Red zones only: slow blink between dim and bright (3.5s cycle) */
      @keyframes crisis-blink-red {
        0%, 100% { fill-opacity: 0.12; stroke-opacity: 0.4; }
        50%      { fill-opacity: 0.28; stroke-opacity: 0.75; }
      }
      .crisis-blink-red {
        animation: crisis-blink-red 3.5s ease-in-out infinite;
      }

      /* Amber/Yellow zones: static (no blink) */
      .crisis-static-amber,
      .crisis-static-yellow {
        /* No animation — static fill/stroke from GeoJSON style prop */
      }

      /* Crisis alert box pulsing dot */
      @keyframes crisis-dot-ping {
        0% { transform: scale(1); opacity: 0.6; }
        75%, 100% { transform: scale(1.8); opacity: 0; }
      }

      /* AI disruption marker — fuchsia neon pulse */
      @keyframes ai-dot-ping {
        0% { transform: scale(1); opacity: 0.5; }
        50% { opacity: 0.3; }
        75%, 100% { transform: scale(2.2); opacity: 0; }
      }

      /* AI polygon — fuchsia pulse (for country fills) */
      @keyframes crisis-pulse-ai {
        0%, 100% { fill-opacity: 0.10; stroke-opacity: 0.35; }
        50%      { fill-opacity: 0.22; stroke-opacity: 0.65; }
      }
      .crisis-pulse-ai {
        animation: crisis-pulse-ai 4s ease-in-out infinite;
      }
      .crisis-static-ai {
        /* No animation — static fuchsia fill */
      }

      /* Crisis tooltip — dark themed, constrained width */
      .crisis-tooltip.leaflet-tooltip {
        background: rgba(10, 10, 10, 0.95) !important;
        border: 1px solid rgba(255, 255, 255, 0.1) !important;
        border-radius: 8px !important;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5) !important;
        padding: 10px 12px !important;
        max-width: 290px !important;
        width: 290px !important;
        overflow: visible !important;
        word-wrap: break-word !important;
        overflow-wrap: break-word !important;
        white-space: normal !important;
      }
      .crisis-tooltip.leaflet-tooltip-top::before {
        border-top-color: rgba(10, 10, 10, 0.95) !important;
      }
      .crisis-tooltip.leaflet-tooltip-bottom::before {
        border-bottom-color: rgba(10, 10, 10, 0.95) !important;
      }
      .crisis-tooltip.leaflet-tooltip-left::before {
        border-left-color: rgba(10, 10, 10, 0.95) !important;
      }
      .crisis-tooltip.leaflet-tooltip-right::before {
        border-right-color: rgba(10, 10, 10, 0.95) !important;
      }

      /* AI crisis tooltip — fuchsia neon themed */
      .ai-crisis-tooltip.leaflet-tooltip {
        background: rgba(12, 8, 16, 0.96) !important;
        border: 1px solid rgba(217, 70, 239, 0.2) !important;
        border-radius: 8px !important;
        box-shadow: 0 4px 24px rgba(0, 0, 0, 0.5), 0 0 20px rgba(217, 70, 239, 0.1) !important;
        padding: 10px 12px !important;
        max-width: 300px !important;
        width: min(300px, calc(100vw - 40px)) !important;
        overflow: visible !important;
        word-wrap: break-word !important;
        overflow-wrap: break-word !important;
        white-space: normal !important;
      }
      .ai-crisis-tooltip .ai-tooltip-scroll {
        max-height: min(240px, calc(100vh - 220px)) !important;
        overflow-y: auto !important;
        overflow-x: hidden !important;
        padding-right: 4px !important;
        scrollbar-width: thin;
        scrollbar-color: rgba(232, 121, 249, 0.45) transparent;
      }
      .ai-crisis-tooltip .ai-tooltip-scroll::-webkit-scrollbar {
        width: 6px;
      }
      .ai-crisis-tooltip .ai-tooltip-scroll::-webkit-scrollbar-track {
        background: transparent;
      }
      .ai-crisis-tooltip .ai-tooltip-scroll::-webkit-scrollbar-thumb {
        background: rgba(232, 121, 249, 0.45);
        border-radius: 999px;
      }
      .ai-crisis-tooltip .ai-tooltip-scroll::-webkit-scrollbar-thumb:hover {
        background: rgba(232, 121, 249, 0.7);
      }
      .ai-crisis-tooltip.leaflet-tooltip-top::before {
        border-top-color: rgba(8, 12, 20, 0.96) !important;
      }
      .ai-crisis-tooltip.leaflet-tooltip-bottom::before {
        border-bottom-color: rgba(8, 12, 20, 0.96) !important;
      }
      .ai-crisis-tooltip.leaflet-tooltip-left::before {
        border-left-color: rgba(8, 12, 20, 0.96) !important;
      }
      .ai-crisis-tooltip.leaflet-tooltip-right::before {
        border-right-color: rgba(8, 12, 20, 0.96) !important;
      }
    `}</style>
  )
}
