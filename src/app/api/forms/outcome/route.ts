/**
 * Forms API - Outcome Submission Route
 *
 * Proxies POST requests to the Modal Forms API for meeting outcome submissions.
 * POST /api/forms/outcome
 */

import { NextRequest, NextResponse } from 'next/server';

const FORMS_API_URL = 'https://bencrane--forms-api-api.modal.run/outcome';

interface OutcomePayload {
  booking_id: string;
  outcome: 'attended' | 'no_show' | 'rescheduled';
  next_step: 'send_followup' | 'schedule_another' | 'send_proposal' | 'close_won' | 'close_lost';
  notes?: string | null;
  followup_subject?: string | null;
  followup_message?: string | null;
}

export async function POST(request: NextRequest) {
  try {
    const body: OutcomePayload = await request.json();

    // Validate required fields
    if (!body.booking_id || !body.outcome || !body.next_step) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Missing required fields: booking_id, outcome, next_step' } },
        { status: 400 }
      );
    }

    const res = await fetch(FORMS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('[Forms API] Error:', res.status, errorText);
      
      return NextResponse.json(
        { error: { code: 'FORMS_API_ERROR', message: 'Failed to submit outcome', details: errorText } },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('[API /forms/outcome] Error:', error);

    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to submit outcome' } },
      { status: 500 }
    );
  }
}

