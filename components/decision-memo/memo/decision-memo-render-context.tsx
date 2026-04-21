'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
  type RefObject,
} from 'react';
import { useInView } from 'framer-motion';

interface DecisionMemoRenderContextValue {
  motionEnabled: boolean;
}

const DecisionMemoRenderContext = createContext<DecisionMemoRenderContextValue>({
  motionEnabled: false,
});

export function DecisionMemoRenderProvider({
  children,
  motionEnabled = false,
}: {
  children: ReactNode;
  motionEnabled?: boolean;
}) {
  return (
    <DecisionMemoRenderContext.Provider value={{ motionEnabled }}>
      {children}
    </DecisionMemoRenderContext.Provider>
  );
}

export function useDecisionMemoRenderContext() {
  return useContext(DecisionMemoRenderContext);
}

export function useReportInView<T extends Element>(
  ref: RefObject<T>,
  options?: Parameters<typeof useInView>[1],
) {
  const inView = useInView(ref, options);
  const { motionEnabled } = useDecisionMemoRenderContext();
  return motionEnabled ? inView : true;
}

export function useAnimatedMetric(
  targetValue: number,
  {
    duration = 1200,
    enabled,
  }: {
    duration?: number;
    enabled: boolean;
  },
) {
  const [displayValue, setDisplayValue] = useState(enabled ? 0 : targetValue);

  useEffect(() => {
    if (!enabled) {
      setDisplayValue(targetValue);
      return;
    }

    let startTime: number | null = null;
    let animationFrame = 0;

    const animate = (timestamp: number) => {
      if (startTime === null) {
        startTime = timestamp;
      }

      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 4);
      setDisplayValue(targetValue * easedProgress);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setDisplayValue(targetValue);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [duration, enabled, targetValue]);

  return displayValue;
}
