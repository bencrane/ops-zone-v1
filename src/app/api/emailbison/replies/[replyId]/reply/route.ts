import { NextRequest, NextResponse } from 'next/server';
import { sendReply } from '@/lib/emailbison/services';
import type { SendReplyRequest } from '@/lib/emailbison/types';

interface RouteParams {
  params: Promise<{ replyId: string }>;
}

/**
 * POST /api/emailbison/replies/[replyId]/reply
 * Send a reply to an existing email thread
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { replyId } = await params;
    const body: SendReplyRequest = await request.json();
    const reply = await sendReply(replyId, body);
    return NextResponse.json({ data: reply });
  } catch (error) {
    console.error('[POST /api/emailbison/replies/[replyId]/reply] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send reply' },
      { status: 500 }
    );
  }
}

