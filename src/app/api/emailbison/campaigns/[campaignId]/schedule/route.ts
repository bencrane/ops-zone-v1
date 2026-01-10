import { NextRequest, NextResponse } from "next/server";
import { getClient, isEmailBisonError } from "@/lib/emailbison";

// GET /api/emailbison/campaigns/[campaignId]/schedule
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ campaignId: string }> }
) {
  try {
    const { campaignId } = await params;
    const client = getClient();
    const response = await client.get(`/api/campaigns/${campaignId}/schedule`);
    return NextResponse.json(response);
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

// POST /api/emailbison/campaigns/[campaignId]/schedule
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ campaignId: string }> }
) {
  try {
    const { campaignId } = await params;
    const body = await request.json();
    const client = getClient();
    const response = await client.post(`/api/campaigns/${campaignId}/schedule`, body);
    return NextResponse.json(response);
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

