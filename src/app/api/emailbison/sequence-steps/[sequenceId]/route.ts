import { NextResponse } from "next/server";
import {
  updateSequenceSteps,
  isEmailBisonError,
} from "@/lib/emailbison";

/**
 * PUT /api/emailbison/sequence-steps/[sequenceId]
 * Updates sequence steps (v1.1 API)
 * Body: { title?: string, sequence_steps: Array<{ id, email_subject, email_body, wait_in_days, order, ... }> }
 * Note: Each step must include its `id` and `order` is required for updates
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ sequenceId: string }> }
) {
  try {
    const { sequenceId } = await params;
    const body = await request.json();
    console.log("[sequence-steps PUT] sequenceId:", sequenceId, "body:", JSON.stringify(body, null, 2));
    const data = await updateSequenceSteps(sequenceId, body);
    return NextResponse.json({ data });
  } catch (error) {
    if (isEmailBisonError(error)) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode || 500 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update sequence steps" },
      { status: 500 }
    );
  }
}

