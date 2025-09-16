import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // VAPID (Voluntary Application Server Identification) public key for push notifications
    const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;

    if (!vapidPublicKey) {
      return NextResponse.json(
        { error: 'Push notifications not configured' },
        { status: 503 }
      );
    }

    return NextResponse.json({
      vapid_public_key: vapidPublicKey
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get VAPID key' },
      { status: 500 }
    );
  }
}