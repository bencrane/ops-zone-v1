import { NextRequest, NextResponse } from "next/server";
import { switchWorkspace } from "@/lib/emailbison";
import { isEmailBisonError } from "@/lib/emailbison";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { workspaceId } = body;

    if (!workspaceId || typeof workspaceId !== "number") {
      return NextResponse.json(
        { error: "workspaceId is required and must be a number" },
        { status: 400 }
      );
    }

    const data = await switchWorkspace(workspaceId);
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

