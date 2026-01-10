import { NextRequest, NextResponse } from 'next/server';
import { listReplies, composeNewEmail } from '@/lib/emailbison/services';
import type { ListRepliesRequest, ComposeNewEmailRequest } from '@/lib/emailbison/types';

/**
 * GET /api/emailbison/replies
 * List replies with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const filters: ListRepliesRequest = {};
    
    const page = searchParams.get('page');
    if (page) filters.page = parseInt(page, 10);
    
    const perPage = searchParams.get('per_page');
    if (perPage) filters.per_page = parseInt(perPage, 10);
    
    const search = searchParams.get('search');
    if (search) filters.search = search;
    
    const status = searchParams.get('status') as ListRepliesRequest['status'];
    if (status) filters.status = status;
    
    const folder = searchParams.get('folder') as ListRepliesRequest['folder'];
    if (folder) filters.folder = folder;
    
    const read = searchParams.get('read');
    if (read !== null) filters.read = read === 'true';
    
    const campaignId = searchParams.get('campaign_id');
    if (campaignId) filters.campaign_id = parseInt(campaignId, 10);
    
    const senderEmailId = searchParams.get('sender_email_id');
    if (senderEmailId) filters.sender_email_id = parseInt(senderEmailId, 10);
    
    const leadId = searchParams.get('lead_id');
    if (leadId) filters.lead_id = parseInt(leadId, 10);

    const response = await listReplies(filters);
    return NextResponse.json(response);
  } catch (error) {
    console.error('[GET /api/emailbison/replies] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch replies' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/emailbison/replies
 * Compose and send a new email (not a reply)
 */
export async function POST(request: NextRequest) {
  try {
    const body: ComposeNewEmailRequest = await request.json();
    const reply = await composeNewEmail(body);
    return NextResponse.json({ data: reply });
  } catch (error) {
    console.error('[POST /api/emailbison/replies] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send email' },
      { status: 500 }
    );
  }
}

