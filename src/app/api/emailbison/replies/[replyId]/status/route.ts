import { NextRequest, NextResponse } from 'next/server';
import {
  markAsInterested,
  markAsNotInterested,
  markAsReadOrUnread,
  markAsAutomatedOrNot,
} from '@/lib/emailbison/services';

interface RouteParams {
  params: Promise<{ replyId: string }>;
}

type StatusAction = 'interested' | 'not_interested' | 'read' | 'unread' | 'automated' | 'not_automated';

interface StatusUpdateRequest {
  action: StatusAction;
}

/**
 * PATCH /api/emailbison/replies/[replyId]/status
 * Update reply status (interested, read, automated flags)
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { replyId } = await params;
    const { action }: StatusUpdateRequest = await request.json();
    
    let reply;
    
    switch (action) {
      case 'interested':
        reply = await markAsInterested(replyId);
        break;
      case 'not_interested':
        reply = await markAsNotInterested(replyId);
        break;
      case 'read':
        reply = await markAsReadOrUnread(replyId, true);
        break;
      case 'unread':
        reply = await markAsReadOrUnread(replyId, false);
        break;
      case 'automated':
        reply = await markAsAutomatedOrNot(replyId, true);
        break;
      case 'not_automated':
        reply = await markAsAutomatedOrNot(replyId, false);
        break;
      default:
        return NextResponse.json(
          { error: `Invalid action: ${action}` },
          { status: 400 }
        );
    }
    
    return NextResponse.json({ data: reply });
  } catch (error) {
    console.error('[PATCH /api/emailbison/replies/[replyId]/status] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update status' },
      { status: 500 }
    );
  }
}

