# Mixpanel Analytics Integration

This document explains how to use the Mixpanel analytics integration in our HNWI Chronicles application.

## Overview

We've integrated Mixpanel analytics to track user behavior across the application. This helps us understand how users interact with our platform, which features are most popular, and where users might be experiencing difficulties.

## Configuration

The Mixpanel integration is configured in `/lib/mixpanel.ts`. You'll need to replace `YOUR_TOKEN` with your actual Mixpanel project token.

```typescript
// lib/mixpanel.ts
import mixpanel from 'mixpanel-browser';

// Initialize Mixpanel with your project token
mixpanel.init('YOUR_TOKEN', { debug: process.env.NODE_ENV !== 'production' });
```

## Built-in Tracking

We've already set up automatic tracking for:

1. **Page Views**: All page navigations are automatically tracked
2. **Authentication Events**: Login, signup, and logout events
3. **User Profiles**: User profile data is automatically synced with Mixpanel

## How to Use in Components

### Using the Analytics Hook

The easiest way to track events is with the `useAnalytics` hook:

```typescript
import useAnalytics from '@/hooks/use-analytics';

function YourComponent() {
  const { track, trackButtonClick, trackFeatureUsage, trackError } = useAnalytics();
  
  const handleButtonClick = () => {
    trackButtonClick('SubmitButton');
    // ...rest of your code
  };
  
  const useFeature = () => {
    trackFeatureUsage('PrivateExchange');
    // ...rest of your code
  };
  
  // For general events
  const doSomething = () => {
    track('Custom Event', { customProperty: 'value' });
    // ...rest of your code
  };
  
  // For tracking errors
  try {
    // ...some code that might throw
  } catch (error) {
    trackError('API Error', error.message);
  }
}
```

### Direct API Usage

For more advanced use cases, you can use the Mixpanel tracker directly:

```typescript
import MixpanelTracker from '@/lib/mixpanel';

// Track a custom event
MixpanelTracker.track('Custom Event', { 
  property1: 'value1',
  property2: 'value2'
});

// Identify a user
MixpanelTracker.identify(userId);

// Set user profile properties
MixpanelTracker.setProfile({
  $name: 'User Name',
  $email: 'user@example.com',
  customProperty: 'value'
});
```

## Best Practices

1. **Be Consistent**: Use the same event names and property structures across the codebase
2. **Use Descriptive Names**: Event names should be clear and descriptive
3. **Include Context**: Add relevant properties to events to provide context
4. **Don't Track PII**: Avoid tracking personally identifiable information (PII) that isn't necessary
5. **Track Important User Actions**: Focus on tracking meaningful user interactions that help understand user behavior

## Common Events to Track

- **Feature Usage**: Track when users interact with key features
- **Button Clicks**: Track important button clicks
- **Form Submissions**: Track when users submit forms
- **Error Occurrences**: Track when errors happen
- **Success Events**: Track when users complete important actions

## Support

If you have questions about the Mixpanel integration or need to add new tracking, please contact the platform team.