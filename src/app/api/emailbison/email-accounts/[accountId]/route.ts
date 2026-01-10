import { NextRequest, NextResponse } from "next/server";
import { getClient, isEmailBisonError } from "@/lib/emailbison";

// GET /api/emailbison/email-accounts/[accountId]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ accountId: string }> }
) {
  try {
    const { accountId } = await params;
    const client = getClient();
    const response = await client.get(`/api/sender-emails/${accountId}`);
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

// PATCH /api/emailbison/email-accounts/[accountId]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ accountId: string }> }
) {
  try {
    const { accountId } = await params;
    const body = await request.json();
    const client = getClient();
    const response = await client.patch(`/api/sender-emails/${accountId}`, body);
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

// DELETE /api/emailbison/email-accounts/[accountId]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ accountId: string }> }
) {
  try {
    const { accountId } = await params;
    const client = getClient();
    const response = await client.delete(`/api/sender-emails/${accountId}`);
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

