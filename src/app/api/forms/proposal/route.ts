/**
 * Forms API - Proposal Submission Route
 *
 * Proxies POST requests to the Modal Forms API for proposal submissions.
 * POST /api/forms/proposal
 */

import { NextRequest, NextResponse } from 'next/server';

const FORMS_API_URL = 'https://bencrane--forms-api-api.modal.run/proposal';

interface ProposalPayload {
  booking_id: string;
  proposal_type: 'standard' | 'custom' | 'enterprise';
  monthly_value: number;
  payment_type: 'one_time' | 'monthly' | 'quarterly' | 'annual';
  scope_summary: string;
  special_terms?: string | null;
}

export async function POST(request: NextRequest) {
  try {
    const body: ProposalPayload = await request.json();

    // Validate required fields
    if (!body.booking_id || !body.proposal_type || !body.monthly_value || !body.payment_type || !body.scope_summary) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Missing required fields: booking_id, proposal_type, monthly_value, payment_type, scope_summary' } },
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
        { error: { code: 'FORMS_API_ERROR', message: 'Failed to submit proposal', details: errorText } },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('[API /forms/proposal] Error:', error);

    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to submit proposal' } },
      { status: 500 }
    );
  }
}

