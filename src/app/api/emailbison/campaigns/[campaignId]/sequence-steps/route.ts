import { NextResponse } from "next/server";
import {
  getSequenceSteps,
  createSequenceSteps,
  isEmailBisonError,
} from "@/lib/emailbison";

/**
 * GET /api/emailbison/campaigns/[campaignId]/sequence-steps
 * Retrieves sequence steps for a campaign (v1.1 API)
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ campaignId: string }> }
) {
  try {
    const { campaignId } = await params;
    const data = await getSequenceSteps(campaignId);
    console.log("[sequence-steps GET] response:", JSON.stringify(data, null, 2));
    return NextResponse.json({ data });
  } catch (error) {
    if (isEmailBisonError(error)) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode || 500 }
      );
    }
    return NextResponse.json(
      { error: "Failed to get sequence steps" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/emailbison/campaigns/[campaignId]/sequence-steps
 * Creates sequence steps for a campaign (v1.1 API)
 * Body: { title: string, sequence_steps: Array<{ email_subject, email_body, wait_in_days, ... }> }
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ campaignId: string }> }
) {
  try {
    const { campaignId } = await params;
    const body = await request.json();
    console.log("[sequence-steps POST] campaignId:", campaignId, "body:", JSON.stringify(body, null, 2));
    const data = await createSequenceSteps(campaignId, body);
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error("[sequence-steps POST] Error:", error);
    if (isEmailBisonError(error)) {
      return NextResponse.json(
        { error: error.message, code: error.code, details: error.details },
        { status: error.statusCode || 500 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create sequence steps" },
      { status: 500 }
    );
  }
}

