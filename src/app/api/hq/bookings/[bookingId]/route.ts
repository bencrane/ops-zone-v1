/**
 * HQ Booking Detail API Route
 *
 * Proxies requests to the Modal Deals API booking endpoint.
 * GET /api/hq/bookings/[bookingId]
 */

import { NextRequest, NextResponse } from 'next/server';

const DEALS_API_URL = 'https://bencrane--deals-api-api.modal.run';

interface RouteParams {
  params: Promise<{ bookingId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { bookingId } = await params;

    const res = await fetch(`${DEALS_API_URL}/bookings/${bookingId}`, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!res.ok) {
      if (res.status === 404) {
        return NextResponse.json(
          { error: { code: 'NOT_FOUND', message: 'Booking not found' } },
          { status: 404 }
        );
      }
      throw new Error(`Deals API error: ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('[API /hq/bookings] Error:', error);

    return NextResponse.json(
      { error: { code: 'BOOKING_ERROR', message: 'Failed to fetch booking data' } },
      { status: 500 }
    );
  }
}

