"use client";

import { useEffect } from "react";

import { PWA_ENABLED } from "@/lib/platform/runtime-flags";

const CLEANUP_MARKER = "hnwi:legacy-sw-cleanup:v1";
const CACHE_NAME_PATTERNS = [
  /^workbox/i,
  /^static$/i,
  /^images$/i,
  /^fonts$/i,
  /^pages$/i,
  /^api$/i,
  /^hnwi/i,
  /^next/i,
];

function shouldDeleteCache(name: string): boolean {
  return CACHE_NAME_PATTERNS.some((pattern) => pattern.test(name));
}

type IdleCallbackWindow = Window & {
  requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
  cancelIdleCallback?: (handle: number) => void;
};

export function LegacyServiceWorkerCleanup() {
  useEffect(() => {
    if (PWA_ENABLED || typeof window === "undefined") {
      return;
    }

    let cancelled = false;
    let timeoutId: number | null = null;
    let idleId: number | null = null;
    const idleWindow = window as IdleCallbackWindow;

    const cleanup = async () => {
      try {
        if (window.sessionStorage.getItem(CLEANUP_MARKER) === "done") {
          return;
        }

        if ("serviceWorker" in navigator) {
          const registrations = await navigator.serviceWorker.getRegistrations();
          await Promise.all(registrations.map((registration) => registration.unregister()));
        }

        if ("caches" in window) {
          const cacheNames = await caches.keys();
          await Promise.all(
            cacheNames
              .filter((cacheName) => shouldDeleteCache(cacheName))
              .map((cacheName) => caches.delete(cacheName)),
          );
        }

        if (!cancelled) {
          window.sessionStorage.setItem(CLEANUP_MARKER, "done");
        }
      } catch {
        if (!cancelled) {
          window.sessionStorage.setItem(CLEANUP_MARKER, "attempted");
        }
      }
    };

    const runCleanupWhenIdle = () => {
      if (!cancelled) {
        void cleanup();
      }
    };

    if (idleWindow.requestIdleCallback) {
      idleId = idleWindow.requestIdleCallback(runCleanupWhenIdle, { timeout: 2000 });
    } else {
      timeoutId = window.setTimeout(runCleanupWhenIdle, 1200);
    }

    return () => {
      cancelled = true;
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
      if (idleId !== null) {
        idleWindow.cancelIdleCallback?.(idleId);
      }
    };
  }, []);

  return null;
}
