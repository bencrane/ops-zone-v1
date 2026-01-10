import { NextResponse } from "next/server";
import {
  deleteSequenceStep,
  isEmailBisonError,
} from "@/lib/emailbison";

/**
 * DELETE /api/emailbison/sequence-steps/step/[stepId]
 * Deletes a specific sequence step by its ID
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ stepId: string }> }
) {
  try {
    const { stepId } = await params;
    console.log("[sequence-step DELETE] stepId:", stepId);
    const data = await deleteSequenceStep(stepId);
    return NextResponse.json({ data });
  } catch (error) {
    console.log("[sequence-step DELETE] error:", error);
    if (isEmailBisonError(error)) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode || 500 }
      );
    }
    return NextResponse.json(
      { error: "Failed to delete sequence step" },
      { status: 500 }
    );
  }
}

