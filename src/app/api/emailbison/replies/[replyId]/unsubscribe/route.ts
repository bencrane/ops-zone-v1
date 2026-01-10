import { NextRequest, NextResponse } from 'next/server';
import { unsubscribeContact } from '@/lib/emailbison/services';

interface RouteParams {
  params: Promise<{ replyId: string }>;
}

/**
 * PATCH /api/emailbison/replies/[replyId]/unsubscribe
 * Unsubscribe the contact from future emails
 */
export async function PATCH(_request: NextRequest, { params }: RouteParams) {
  try {
    const { replyId } = await params;
    const result = await unsubscribeContact(replyId);
    return NextResponse.json({ data: result });
  } catch (error) {
    console.error('[PATCH /api/emailbison/replies/[replyId]/unsubscribe] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to unsubscribe contact' },
      { status: 500 }
    );
  }
}

