import { NextResponse } from "next/server";
import {
  updateCampaignSettings,
  isEmailBisonError,
} from "@/lib/emailbison";

/**
 * PATCH /api/emailbison/campaigns/[campaignId]/settings
 * Updates campaign settings
 * Body: { name?, max_emails_per_day?, max_new_leads_per_day?, plain_text?, open_tracking?, can_unsubscribe?, unsubscribe_text? }
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ campaignId: string }> }
) {
  try {
    const { campaignId } = await params;
    const body = await request.json();
    const data = await updateCampaignSettings(campaignId, body);
    return NextResponse.json({ data });
  } catch (error) {
    if (isEmailBisonError(error)) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode || 500 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update campaign settings" },
      { status: 500 }
    );
  }
}

