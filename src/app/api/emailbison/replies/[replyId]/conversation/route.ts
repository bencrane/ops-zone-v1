import { NextRequest, NextResponse } from 'next/server';
import { getConversationThread } from '@/lib/emailbison/services';

interface RouteParams {
  params: Promise<{ replyId: string }>;
}

/**
 * GET /api/emailbison/replies/[replyId]/conversation
 * Get the full conversation thread for a reply
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { replyId } = await params;
    const messages = await getConversationThread(replyId);
    return NextResponse.json({ data: { messages } });
  } catch (error) {
    console.error('[GET /api/emailbison/replies/[replyId]/conversation] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch conversation' },
      { status: 500 }
    );
  }
}

