"use client"

import {
  LeafletProvider,
  createLeafletContext,
  type LeafletContextInterface,
} from "@react-leaflet/core"
import { Map as LeafletMap } from "leaflet"
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react"
import type { MapContainerProps } from "react-leaflet"

type LeafletContainerElement = HTMLDivElement & { _leaflet_id?: number }

export const SafeMapContainer = forwardRef<LeafletMap, MapContainerProps>(
  function SafeMapContainer(
    {
      bounds,
      boundsOptions,
      center,
      children,
      className,
      id,
      placeholder,
      style,
      whenReady,
      zoom,
      ...options
    },
    forwardedRef
  ) {
    const containerRef = useRef<LeafletContainerElement | null>(null)
    const mapRef = useRef<LeafletMap | null>(null)
    const [context, setContext] = useState<LeafletContextInterface | null>(null)
    const [frozenProps] = useState(() => ({ className, id, style }))
    const [initialConfig] = useState(() => ({
      bounds,
      boundsOptions,
      center,
      options,
      whenReady,
      zoom,
    }))

    useImperativeHandle(forwardedRef, () => mapRef.current!, [])

    useEffect(() => {
      const node = containerRef.current
      if (!node || mapRef.current) {
        return
      }

      // Leaflet stamps the DOM node. If React reuses that node during navigation,
      // clear the stale stamp before creating the next map instance.
      if (node._leaflet_id != null) {
        delete node._leaflet_id
        node.innerHTML = ""
      }

      const map = new LeafletMap(node, initialConfig.options)
      mapRef.current = map

      if (initialConfig.center != null && initialConfig.zoom != null) {
        map.setView(initialConfig.center, initialConfig.zoom)
      } else if (initialConfig.bounds != null) {
        map.fitBounds(initialConfig.bounds, initialConfig.boundsOptions)
      }

      if (initialConfig.whenReady != null) {
        map.whenReady(initialConfig.whenReady)
      }

      setContext(createLeafletContext(map))

      return () => {
        map.remove()
        mapRef.current = null

        if (node._leaflet_id != null) {
          delete node._leaflet_id
        }
        node.innerHTML = ""
      }
    }, [initialConfig])

    const contents = context ? (
      <LeafletProvider value={context}>{children}</LeafletProvider>
    ) : (
      placeholder ?? null
    )

    return (
      <div {...frozenProps} ref={containerRef}>
        {contents}
      </div>
    )
  }
)

SafeMapContainer.displayName = "SafeMapContainer"
