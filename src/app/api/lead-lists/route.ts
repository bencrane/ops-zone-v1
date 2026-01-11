import { NextRequest, NextResponse } from "next/server";
import { getLeadLists, createLeadList } from "@/lib/supabase/outbound-client";

/**
 * GET /api/lead-lists?workspace_id=xxx
 * Returns all lead lists for a workspace
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspace_id");

    if (!workspaceId) {
      return NextResponse.json(
        { error: "workspace_id query parameter is required" },
        { status: 400 }
      );
    }

    const lists = await getLeadLists(workspaceId);

    return NextResponse.json({ data: lists });
  } catch (error) {
    console.error("GET /api/lead-lists error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch lead lists" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/lead-lists
 * Creates a new lead list
 * Body: { workspace_id, name, description? }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { workspace_id, name, description } = body;

    if (!workspace_id) {
      return NextResponse.json(
        { error: "workspace_id is required" },
        { status: 400 }
      );
    }

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "name is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    const list = await createLeadList(workspace_id, name.trim(), description?.trim());

    return NextResponse.json({ data: list }, { status: 201 });
  } catch (error) {
    console.error("POST /api/lead-lists error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create lead list" },
      { status: 500 }
    );
  }
}

