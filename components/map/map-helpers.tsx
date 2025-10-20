// components/map/map-helpers.tsx
// Helper components for map interactions

"use client"

import React from "react"
import { useMap, useMapEvents } from "react-leaflet"
import type { City } from "@/components/interactive-world-map"
import type L from "leaflet"

/**
 * Component to fly to a specific city on the map
 */
export function FlyToCity({ city, zoomLevel = 8 }: { city: City | null; zoomLevel?: number }) {
  const map = useMap()

  React.useEffect(() => {
    if (city) {
      // Get current zoom level - don't zoom out if already zoomed in
      const currentZoom = map.getZoom()
      const targetZoom = Math.max(currentZoom, zoomLevel)

      // Fly to city with offset so marker appears in upper area with popup below
      map.flyTo([city.latitude, city.longitude], targetZoom, {
        duration: 2.5,
        easeLinearity: 0.15,
        animate: true,
        // Offset to position marker in upper third of screen
        offset: [0, -150]
      })
    }
  }, [city, map, zoomLevel])

  return null
}

/**
 * Component to reset map view to world overview
 */
export function ResetView({ shouldReset, onReset }: { shouldReset: boolean; onReset: () => void }) {
  const map = useMap()

  React.useEffect(() => {
    if (shouldReset) {
      // Smooth, progressive zoom out animation (3.5 seconds)
      map.flyTo([20, 0], 2, {
        duration: 3.5,
        easeLinearity: 0.15,
        animate: true
      })
      // Reset state after animation completes
      setTimeout(() => {
        onReset()
      }, 3600)
    }
  }, [shouldReset, map, onReset])

  return null
}

/**
 * Component to handle map clicks (close popups and reset icons)
 */
export function MapClickHandler({
  onMapClick
}: {
  onMapClick: () => void
}) {
  const map = useMap()

  React.useEffect(() => {
    const handleMapClick = (e: L.LeafletMouseEvent) => {
      // Check if click target is the map itself (not a marker or popup)
      const target = e.originalEvent.target as HTMLElement

      // If clicking on the map tile layer (not markers or popups)
      if (target.classList.contains('leaflet-container') ||
          target.classList.contains('leaflet-tile') ||
          target.classList.contains('leaflet-tile-pane') ||
          target.parentElement?.classList.contains('leaflet-tile-pane')) {
        onMapClick()
      }
    }

    map.on('click', handleMapClick)

    return () => {
      map.off('click', handleMapClick)
    }
  }, [map, onMapClick])

  return null
}

/**
 * Component to track zoom level changes
 * Uses useMapEvents for reliable event handling in react-leaflet
 */
export function ZoomTracker({ onZoomChange }: { onZoomChange: (zoom: number) => void }) {
  const map = useMapEvents({
    zoomend: () => {
      const newZoom = map.getZoom()
      console.log(`[ZOOM TRACKER] Zoom level changed to: ${newZoom}`)
      onZoomChange(newZoom)
    },
  })

  return null
}
