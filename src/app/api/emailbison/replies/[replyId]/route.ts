import { NextRequest, NextResponse } from 'next/server';
import { getReply, deleteReply } from '@/lib/emailbison/services';

interface RouteParams {
  params: Promise<{ replyId: string }>;
}

/**
 * GET /api/emailbison/replies/[replyId]
 * Get a single reply by ID
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { replyId } = await params;
    const reply = await getReply(replyId);
    return NextResponse.json({ data: reply });
  } catch (error) {
    console.error('[GET /api/emailbison/replies/[replyId]] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch reply' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/emailbison/replies/[replyId]
 * Delete a reply
 */
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { replyId } = await params;
    const result = await deleteReply(replyId);
    return NextResponse.json({ data: result });
  } catch (error) {
    console.error('[DELETE /api/emailbison/replies/[replyId]] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete reply' },
      { status: 500 }
    );
  }
}

