import mixpanel from 'mixpanel-browser';

// Initialize Mixpanel with your project token
// Replace YOUR_TOKEN with your actual Mixpanel token
mixpanel.init('e6df9ca97b553d8a7954cda47f2f6516', { debug: process.env.NODE_ENV !== 'production' });

// Helper functions for tracking
export const MixpanelTracker = {
  track: (eventName: string, properties?: Record<string, any>) => {
    mixpanel.track(eventName, properties);
  },
  
  identify: (userId: string) => {
    mixpanel.identify(userId);
  },
  
  setProfile: (properties: Record<string, any>) => {
    mixpanel.people.set(properties);
  },
  
  pageView: (pageName: string) => {
    mixpanel.track('Page View', { page: pageName });
  }
};

export default MixpanelTracker;