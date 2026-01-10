import { NextRequest, NextResponse } from "next/server";
import { attachSenderEmails, removeSenderEmails } from "@/lib/emailbison";
import { isEmailBisonError } from "@/lib/emailbison";

// POST - Attach sender emails to campaign
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ campaignId: string }> }
) {
  try {
    const { campaignId } = await params;
    const body = await request.json();
    const { sender_email_ids } = body;

    if (!sender_email_ids || !Array.isArray(sender_email_ids)) {
      return NextResponse.json(
        { error: "sender_email_ids array is required" },
        { status: 400 }
      );
    }

    await attachSenderEmails(campaignId, sender_email_ids);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (isEmailBisonError(error)) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode || 500 }
      );
    }
    return NextResponse.json(
      { error: "Unknown error occurred" },
      { status: 500 }
    );
  }
}

// DELETE - Remove sender emails from campaign
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ campaignId: string }> }
) {
  try {
    const { campaignId } = await params;
    const body = await request.json();
    const { sender_email_ids } = body;

    if (!sender_email_ids || !Array.isArray(sender_email_ids)) {
      return NextResponse.json(
        { error: "sender_email_ids array is required" },
        { status: 400 }
      );
    }

    await removeSenderEmails(campaignId, sender_email_ids);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (isEmailBisonError(error)) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode || 500 }
      );
    }
    return NextResponse.json(
      { error: "Unknown error occurred" },
      { status: 500 }
    );
  }
}

