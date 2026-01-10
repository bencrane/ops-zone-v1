import { NextRequest, NextResponse } from 'next/server';
import { forwardReply } from '@/lib/emailbison/services';
import type { ForwardReplyRequest } from '@/lib/emailbison/types';

interface RouteParams {
  params: Promise<{ replyId: string }>;
}

/**
 * POST /api/emailbison/replies/[replyId]/forward
 * Forward an email to new recipients
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { replyId } = await params;
    const body: ForwardReplyRequest = await request.json();
    const reply = await forwardReply(replyId, body);
    return NextResponse.json({ data: reply });
  } catch (error) {
    console.error('[POST /api/emailbison/replies/[replyId]/forward] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to forward email' },
      { status: 500 }
    );
  }
}

