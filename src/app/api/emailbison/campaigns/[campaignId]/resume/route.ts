import { NextRequest, NextResponse } from "next/server";
import { resumeCampaign, isEmailBisonError } from "@/lib/emailbison";

// PATCH is the correct method per EmailBison API spec
// But we expose POST for easier frontend consumption
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ campaignId: string }> }
) {
  try {
    const { campaignId } = await params;
    const data = await resumeCampaign(campaignId);
    return NextResponse.json({ data });
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

// Also support PATCH for API consistency
export { POST as PATCH };

