// Enhanced Service Worker Notification Handler
// Handles push notifications with event-specific icons and actions

self.addEventListener('push', event => {
  const options = {
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    vibrate: [200, 100, 200],
    requireInteraction: false,
    actions: [
      { action: 'view', title: 'View', icon: '/images/view-icon.png' },
      { action: 'dismiss', title: 'Dismiss', icon: '/images/dismiss-icon.png' }
    ]
  };

  if (event.data) {
    try {
      const data = event.data.json();
      
      // Event-specific icons (fallback to default if not found)
      const eventIcons = {
        'elite_pulse_generated': '/icons/elite-pulse.png',
        'opportunity_added': '/icons/opportunity.png',
        'crown_vault_update': '/icons/crown-vault.png',
        'social_event_added': '/icons/social-event.png',
        'market_alert': '/icons/market-alert.png',
        'regulatory_update': '/icons/regulatory.png',
        'system_notification': '/icons/system.png'
      };
      
      // Use event-specific icon if available
      if (data.event_type && eventIcons[data.event_type]) {
        options.icon = eventIcons[data.event_type];
      }
      
      // Set notification body
      options.body = data.content || data.body || 'You have a new notification';
      
      // Set additional options from data
      if (data.priority === 'urgent') {
        options.requireInteraction = true;
        options.vibrate = [300, 200, 300, 200, 300];
      } else if (data.priority === 'high') {
        options.requireInteraction = true;
      }
      
      // Add notification data for click handling
      options.data = {
        notificationId: data.id,
        eventType: data.event_type,
        priority: data.priority,
        clickUrl: data.actionUrl || data.data?.actionUrl || '/'
      };
      
      // Handle Crown Vault specific notifications
      if (data.event_type === 'crown_vault_update' && data.data) {
        const { update_type, details } = data.data;
        switch (update_type) {
          case 'Asset Added':
            options.body = `New asset "${details?.asset_name || 'Unnamed'}" added to your Crown Vault`;
            break;
          case 'Heir Added':
            options.body = `${details?.heir_name || 'New heir'} added as heir`;
            break;
          case 'Asset Updated':
            options.body = `Asset "${details?.asset_name || 'Asset'}" updated`;
            break;
          default:
            options.body = data.summary || 'Your Crown Vault has been updated';
        }
      }
      
      // Handle opportunity notifications with rich data
      if (data.event_type === 'opportunity_added' && data.data) {
        if (data.data.opportunity_title) {
          options.body = data.data.opportunity_summary || 
            `New opportunity: ${data.data.opportunity_title}`;
        }
        if (data.data.minimum_investment) {
          options.body += ` (Min: $${data.data.minimum_investment.toLocaleString()})`;
        }
      }
      
      // Handle social event notifications
      if (data.event_type === 'social_event_added' && data.data) {
        if (data.data.event_name && data.data.location) {
          options.body = `${data.data.event_name} - ${data.data.location}`;
          if (data.data.venue) {
            options.body += ` at ${data.data.venue}`;
          }
        }
      }
      
      // Handle Elite Pulse notifications
      if (data.event_type === 'elite_pulse_generated' && data.data?.analysis) {
        const confidence = data.data.confidence_score;
        if (confidence) {
          options.body = `New intelligence available (${Math.round(confidence * 100)}% confidence)`;
        }
      }
      
      const title = data.title || getNotificationTitle(data.event_type);
      
      event.waitUntil(
        self.registration.showNotification(title, options)
      );
    } catch (error) {
      // Error:('Error processing push notification:', error);
      // Fallback notification
      event.waitUntil(
        self.registration.showNotification('HNWI Chronicles', {
          body: event.data?.text() || 'You have a new notification',
          icon: '/icon-192x192.png',
          badge: '/badge-72x72.png'
        })
      );
    }
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  // Get the URL to open
  const urlToOpen = event.notification.data?.clickUrl || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(windowClients => {
        // Check if there's already a window/tab open with our app
        for (const client of windowClients) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            // Navigate to the notification URL
            client.navigate(urlToOpen);
            return client.focus();
          }
        }
        
        // If no window/tab is open, open a new one
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Handle notification close
self.addEventListener('notificationclose', event => {
  // Track notification dismissal if needed
  // Log:('Notification closed:', event.notification.data);
});

// Helper function to get title based on event type
function getNotificationTitle(eventType) {
  const titles = {
    'elite_pulse_generated': '🏛️ Elite Pulse Intelligence',
    'opportunity_added': '💎 New Investment Opportunity',
    'crown_vault_update': '👑 Crown Vault Update',
    'social_event_added': '🎭 New Social Event',
    'market_alert': '📈 Market Alert',
    'regulatory_update': '📋 Regulatory Update',
    'system_notification': '🔔 System Notification'
  };
  
  return titles[eventType] || 'HNWI Chronicles';
}