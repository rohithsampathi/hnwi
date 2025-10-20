// components/map/map-styles.tsx
// Global styles for the map component

"use client"

interface MapStylesProps {
  theme: string
}

export function MapStyles({ theme }: MapStylesProps) {
  return (
    <style jsx global>{`
      /* Force Leaflet popup pane to high z-index to appear above Live Data button */
      .leaflet-popup-pane {
        z-index: 700 !important;
      }
      .custom-marker {
        background: transparent;
        border: none;
      }
      .cluster-marker {
        background: transparent;
        border: none;
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
        max-height: 500px !important;
        overflow-y: auto !important;
      }
      .leaflet-popup-tip {
        background: ${theme === "dark" ? "#1a1a1a" : "#fff"} !important;
        border: 1px solid ${theme === "dark" ? "#444" : "transparent"} !important;
      }
      .leaflet-popup-content {
        margin: 0 !important;
        width: auto !important;
        min-width: 300px !important;
        max-width: 400px !important;
      }
      .border-border {
        border-color: ${theme === "dark" ? "#555" : "#e5e5e5"} !important;
      }
      .text-muted-foreground {
        color: ${theme === "dark" ? "#bbb" : "#666"} !important;
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
      /* Smooth expand/collapse animation - grow downward */
      .expanded-details {
        animation: slideDown 0.2s ease-out;
        transform-origin: top;
      }
      @keyframes slideDown {
        from {
          opacity: 0;
          transform: scaleY(0.8);
        }
        to {
          opacity: 1;
          transform: scaleY(1);
        }
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
    `}</style>
  )
}
