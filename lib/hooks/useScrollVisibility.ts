"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Hook to detect when an element is visible in the viewport.
 * Replaces identical isVisible + IntersectionObserver boilerplate in 16+ memo components.
 */
export function useScrollVisibility(threshold = 0.15): {
  ref: React.RefObject<HTMLDivElement>;
  isVisible: boolean;
} {
  const ref = useRef<HTMLDivElement>(null!);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isVisible };
}
