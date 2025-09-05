import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-utils';

// Mock notification data for development
const MOCK_NOTIFICATIONS = [
  {
    id: '1',
    user_id: '',
    event_type: 'elite_pulse_generated',
    channel: 'in_app',
    priority: 'medium',
    title: 'New Elite Pulse Intelligence Available',
    content: 'Your weekly market intelligence report is ready for review.',
    data: { source: 'elite_pulse', category: 'market_analysis' },
    status: 'delivered',
    created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
  },
  {
    id: '2',
    user_id: '',
    event_type: 'opportunity_added',
    channel: 'in_app',
    priority: 'high',
    title: 'New Investment Opportunity',
    content: 'A premium real estate opportunity matching your criteria has been added.',
    data: { asset_type: 'real_estate', location: 'Manhattan' },
    status: 'delivered',
    created_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
  }
];

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const filter = searchParams.get('filter'); // 'unread', 'read', 'all'

    // Update mock data with current user_id
    const notifications = MOCK_NOTIFICATIONS.map(n => ({
      ...n,
      user_id: user.id
    }));

    // Filter by read status if specified
    let filteredNotifications = notifications;
    if (filter === 'unread') {
      filteredNotifications = notifications.filter(n => n.status === 'delivered');
    } else if (filter === 'read') {
      filteredNotifications = notifications.filter(n => n.status === 'read');
    }

    // Paginate results
    const startIndex = (page - 1) * limit;
    const paginatedNotifications = filteredNotifications.slice(startIndex, startIndex + limit);
    
    const response = {
      notifications: paginatedNotifications,
      total_count: filteredNotifications.length,
      unread_count: notifications.filter(n => n.status === 'delivered').length,
      has_more: startIndex + limit < filteredNotifications.length,
      page,
      limit
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}