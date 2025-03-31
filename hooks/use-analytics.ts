// hooks/use-analytics.ts
"use client";

import { useCallback } from 'react';
import MixpanelTracker from '@/lib/mixpanel';
import { trackEvent } from '@/utils/auth';

export const useAnalytics = () => {
  // Track page view
  const trackPageView = useCallback((pageName: string) => {
    MixpanelTracker.pageView(pageName);
  }, []);

  // Track general event
  const track = useCallback((eventName: string, properties?: Record<string, any>) => {
    trackEvent(eventName, properties);
  }, []);

  // Track button click
  const trackButtonClick = useCallback((buttonName: string, properties?: Record<string, any>) => {
    trackEvent('Button Click', {
      buttonName,
      ...properties
    });
  }, []);

  // Track form submission
  const trackFormSubmit = useCallback((formName: string, properties?: Record<string, any>) => {
    trackEvent('Form Submit', {
      formName,
      ...properties
    });
  }, []);

  // Track feature usage
  const trackFeatureUsage = useCallback((featureName: string, properties?: Record<string, any>) => {
    trackEvent('Feature Usage', {
      featureName,
      ...properties
    });
  }, []);

  // Track error occurrence
  const trackError = useCallback((errorType: string, errorMessage: string, properties?: Record<string, any>) => {
    trackEvent('Error Occurred', {
      errorType,
      errorMessage,
      ...properties
    });
  }, []);

  return {
    trackPageView,
    track,
    trackButtonClick,
    trackFormSubmit,
    trackFeatureUsage,
    trackError
  };
};

export default useAnalytics;