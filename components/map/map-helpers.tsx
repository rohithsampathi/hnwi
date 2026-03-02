// components/map/map-helpers.tsx
// Helper components for map interactions

"use client"

import React from "react"
import { useMap, useMapEvents } from "react-leaflet"
import type { City } from "@/components/interactive-world-map"
import type L from "leaflet"
import { MAP_CONFIG } from "@/lib/map-config"

/**
 * Component to fly to a specific city on the map
 */
export function FlyToCity({ city, zoomLevel }: { city: City | null; zoomLevel?: number }) {
  const map = useMap()

  React.useEffect(() => {
    if (city) {
      // Get current zoom level - don't zoom out if already zoomed in
      const currentZoom = map.getZoom()
      const targetZoom = Math.max(currentZoom, zoomLevel ?? MAP_CONFIG.zoom.cityDetail)

      // Fly to city
      map.flyTo([city.latitude, city.longitude], targetZoom, {
        duration: MAP_CONFIG.animation.flyToCity,
        easeLinearity: MAP_CONFIG.animation.easeLinearity,
        animate: true,
      })
    }
  }, [city, map, zoomLevel])

  return null
}

/**
 * Component to reset map view to world overview
 */
export function ResetView({ shouldReset, onReset, minZoom }: { shouldReset: boolean; onReset: () => void; minZoom?: number }) {
  const map = useMap()

  React.useEffect(() => {
    if (shouldReset) {
      const targetZoom = minZoom ?? MAP_CONFIG.zoom.resetWorld
      const duration = MAP_CONFIG.animation.resetView

      // Smooth, progressive zoom out animation
      map.flyTo([20, 0], targetZoom, {
        duration,
        easeLinearity: MAP_CONFIG.animation.easeLinearity,
        animate: true
      })

      // Reset state after animation completes (duration in seconds * 1000 + buffer)
      setTimeout(() => {
        onReset()
      }, duration * 1000 + 100)
    }
  }, [shouldReset, map, onReset, minZoom])

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
      onZoomChange(newZoom)
    },
  })

  return null
}

/**
 * Component to auto-zoom when popups open
 * Flies to destination and positions popup below the page header
 * Uses centralized MAP_CONFIG for all parameters
 */
export function PopupZoomHandler() {
  const [isZooming, setIsZooming] = React.useState(false)

  const map = useMapEvents({
    popupopen: (e) => {
      // Prevent multiple concurrent zoom operations
      if (isZooming) return

      const popup = e.popup

      // Get the layer (Marker or Polyline) that triggered the popup
      const source = (popup as any)._source

      // For Markers, use the marker's position (which is the destination)
      // For Polylines, use the popup's position
      const latlng = source && source.getLatLng ? source.getLatLng() : popup.getLatLng()

      if (latlng) {
        setIsZooming(true)
        const targetZoom = MAP_CONFIG.zoom.popupDetail

        // Wait for popup to fully render and DOM to settle
        setTimeout(() => {
          const mapSize = map.getSize()

          // Calculate pixel offset using centralized config
          const pixelOffset = MAP_CONFIG.calculatePopupOffset(mapSize.y)

          // Convert the latlng to a point, apply offset, convert back to latlng
          const targetPoint = map.project(latlng, targetZoom)
          const offsetPoint = targetPoint.add([0, pixelOffset]) // Add to move center down, marker up
          const offsetLatLng = map.unproject(offsetPoint, targetZoom)

          // Fly to the destination with popup positioned below header
          map.flyTo(offsetLatLng, targetZoom, {
            duration: MAP_CONFIG.animation.flyToPopup,
            easeLinearity: MAP_CONFIG.animation.popupEase,
            animate: true
          })

          // Reset zooming flag after animation completes
          setTimeout(() => {
            setIsZooming(false)
          }, MAP_CONFIG.animation.flyToPopup * 1000 + 50)
        }, 150) // Increased delay slightly for DOM to fully settle
      }
    },
  })

  return null
}
