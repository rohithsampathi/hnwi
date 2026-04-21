"use client"

import L from "leaflet"

type LeafletContainerElement = HTMLElement & { _leaflet_id?: number }
type LeafletMapPrototype = typeof L.Map.prototype & {
  _initContainer: (id: string | HTMLElement) => void
}

declare global {
  interface Window {
    __hnwiLeafletContainerPatchApplied?: boolean
  }
}

if (typeof window !== "undefined" && !window.__hnwiLeafletContainerPatchApplied) {
  window.__hnwiLeafletContainerPatchApplied = true

  const mapPrototype = L.Map.prototype as LeafletMapPrototype
  const originalInitContainer = mapPrototype._initContainer

  mapPrototype._initContainer = function patchedInitContainer(id: string | HTMLElement) {
    const container = L.DomUtil.get(id) as LeafletContainerElement | null

    // Route transitions and fast refresh can leave the DOM node stamped even after
    // React has conceptually moved on. Clear the stale stamp instead of crashing.
    if (container?._leaflet_id != null) {
      delete container._leaflet_id

      if (container.childElementCount > 0) {
        container.innerHTML = ""
      }
    }

    return originalInitContainer.call(this, id)
  }
}

export {}
