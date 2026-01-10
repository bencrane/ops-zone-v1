import { NextResponse } from "next/server";
import { getAccount } from "@/lib/emailbison";
import { isEmailBisonError } from "@/lib/emailbison";

export async function GET() {
  try {
    const data = await getAccount();
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

