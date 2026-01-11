/**
 * HQ Pipeline API Route
 *
 * Proxies requests to the Modal Deals API endpoint.
 * GET /api/hq/pipeline
 */

import { NextRequest, NextResponse } from 'next/server';

const DEALS_API_URL = 'https://bencrane--deals-api-api.modal.run/deals';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    const url = queryString 
      ? `${DEALS_API_URL}?${queryString}` 
      : DEALS_API_URL;

    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`Deals API error: ${res.status}`);
    }

    const data = await res.json();
    
    // Transform to expected shape
    return NextResponse.json({
      data: data.deals || [],
      pagination: {
        total: data.count || data.deals?.length || 0,
        hasMore: false,
      },
    });

  } catch (error) {
    console.error('[API /hq/pipeline] Error:', error);

    return NextResponse.json(
      { error: { code: 'PIPELINE_ERROR', message: 'Failed to fetch pipeline data' } },
      { status: 500 }
    );
  }
}

