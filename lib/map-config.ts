// lib/map-config.ts
// Centralized map configuration - single source of truth for all zoom/positioning

export const MAP_CONFIG = {
  // Zoom levels
  zoom: {
    min: 2.0,           // Minimum zoom (calculated dynamically based on viewport)
    max: 18,            // Maximum zoom
    default: 2.5,       // Default starting zoom
    cityDetail: 8,      // Zoom level for city detail view
    popupDetail: 6,     // Zoom level when popup opens
    resetWorld: 2.5,    // Zoom level for world overview reset
  },

  // Positioning offsets (in pixels)
  positioning: {
    headerHeight: 96,      // Top header height (top-24 = 96px)
    headerContent: 80,     // Additional header content space
    headerTotal: 180,      // Total space reserved at top (96 + 80)
    popupTipOffset: 20,    // Distance from marker to popup tip
  },

  // Animation durations (in seconds)
  animation: {
    flyToCity: 2.5,        // Duration for flying to city
    flyToPopup: 1.5,       // Duration for flying to popup
    resetView: 3.5,        // Duration for reset animation
    easeLinearity: 0.15,   // Easing curve for smooth animations
    popupEase: 0.2,        // Easing for popup zoom
  },

  // Map bounds - single world copy, no infinite wrap
  bounds: {
    southwest: [-85, -180] as [number, number],
    northeast: [85, 180] as [number, number],
  },

  // Zoom granularity — moderate steps for comfortable scroll-wheel zoom
  zoomSnap: 0.5,     // Snap to half-level increments
  zoomDelta: 1.0,    // Each scroll tick zooms by one level

  // Viewport-based zoom calculation
  // Goal: tiles must always cover the full viewport — no white gaps on sides
  calculateMinZoom: (aspectRatio: number, screenHeight: number): number => {
    // Leaflet renders the world as 256 * 2^zoom pixels wide.
    // We need the zoom where that width >= screen width (no white gaps).
    // Formula: zoom = log2(screenWidth / 256), rounded up to nearest zoomSnap.
    const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1920;
    const rawZoom = Math.log2(screenWidth / 256);
    // Round up to nearest 0.5 (matches zoomSnap) — no extra buffer needed
    const zoom = Math.ceil(rawZoom * 2) / 2;

    // Floor at 2.0 — anything lower always shows white gaps on desktop
    return Math.max(zoom, 2.0);
  },

  // Calculate popup positioning offset
  calculatePopupOffset: (mapHeight: number): number => {
    const { headerTotal, popupTipOffset } = MAP_CONFIG.positioning;
    const targetMarkerY = headerTotal - popupTipOffset; // Where marker should be on screen
    const screenCenterY = mapHeight / 2;
    return screenCenterY - targetMarkerY; // Offset to move map center down (marker up)
  },
} as const;

// Type helper for zoom level keys
export type ZoomLevel = keyof typeof MAP_CONFIG.zoom;

// Helper to get zoom level with optional override
export function getZoomLevel(level: ZoomLevel, override?: number): number {
  return override ?? MAP_CONFIG.zoom[level];
}

// Helper to get animation duration
export function getAnimationDuration(type: keyof typeof MAP_CONFIG.animation): number {
  return MAP_CONFIG.animation[type];
}

// Helper to get positioning value
export function getPositioning(key: keyof typeof MAP_CONFIG.positioning): number {
  return MAP_CONFIG.positioning[key];
}
