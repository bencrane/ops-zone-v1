import { NextRequest, NextResponse } from "next/server";
import { listCampaigns, createCampaign, isEmailBisonError } from "@/lib/emailbison";

export async function GET() {
  try {
    const data = await listCampaigns();
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.name || typeof body.name !== "string") {
      return NextResponse.json(
        { error: "Campaign name is required" },
        { status: 400 }
      );
    }

    const data = await createCampaign({
      name: body.name,
      type: body.type || "outbound",
    });
    
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

