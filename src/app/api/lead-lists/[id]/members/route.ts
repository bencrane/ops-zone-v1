import { NextRequest, NextResponse } from "next/server";
import { addLeadsToList, removeLeadsFromList, getListMemberIds } from "@/lib/supabase/outbound-client";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/lead-lists/[id]/members
 * Returns all HQ person IDs in the list
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const memberIds = await getListMemberIds(id);

    return NextResponse.json({ data: memberIds });
  } catch (error) {
    console.error("GET /api/lead-lists/[id]/members error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch list members" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/lead-lists/[id]/members
 * Adds leads to the list
 * Body: { hq_person_ids: string[] }
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { hq_person_ids } = body;

    if (!Array.isArray(hq_person_ids) || hq_person_ids.length === 0) {
      return NextResponse.json(
        { error: "hq_person_ids must be a non-empty array of strings" },
        { status: 400 }
      );
    }

    // Validate all IDs are strings
    const invalidIds = hq_person_ids.filter((id) => typeof id !== "string");
    if (invalidIds.length > 0) {
      return NextResponse.json(
        { error: "All hq_person_ids must be strings" },
        { status: 400 }
      );
    }

    const result = await addLeadsToList(id, hq_person_ids);

    return NextResponse.json({
      data: {
        added: result.added,
        duplicates: result.duplicates,
        total_requested: hq_person_ids.length,
      },
    });
  } catch (error) {
    console.error("POST /api/lead-lists/[id]/members error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to add leads to list" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/lead-lists/[id]/members
 * Removes leads from the list
 * Body: { hq_person_ids: string[] }
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { hq_person_ids } = body;

    if (!Array.isArray(hq_person_ids) || hq_person_ids.length === 0) {
      return NextResponse.json(
        { error: "hq_person_ids must be a non-empty array of strings" },
        { status: 400 }
      );
    }

    const removed = await removeLeadsFromList(id, hq_person_ids);

    return NextResponse.json({
      data: {
        removed,
        total_requested: hq_person_ids.length,
      },
    });
  } catch (error) {
    console.error("DELETE /api/lead-lists/[id]/members error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to remove leads from list" },
      { status: 500 }
    );
  }
}

