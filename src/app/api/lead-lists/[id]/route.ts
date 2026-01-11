import { NextRequest, NextResponse } from "next/server";
import { getLeadList, deleteLeadList, updateLeadList } from "@/lib/supabase/outbound-client";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/lead-lists/[id]
 * Returns a single lead list with member count
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const list = await getLeadList(id);

    if (!list) {
      return NextResponse.json(
        { error: "Lead list not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: list });
  } catch (error) {
    console.error("GET /api/lead-lists/[id] error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch lead list" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/lead-lists/[id]
 * Updates a lead list
 * Body: { name?, description? }
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description } = body;

    if (!name && description === undefined) {
      return NextResponse.json(
        { error: "At least one field (name or description) must be provided" },
        { status: 400 }
      );
    }

    const updates: { name?: string; description?: string } = {};
    if (name) updates.name = name.trim();
    if (description !== undefined) updates.description = description?.trim() || "";

    const list = await updateLeadList(id, updates);

    return NextResponse.json({ data: list });
  } catch (error) {
    console.error("PATCH /api/lead-lists/[id] error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update lead list" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/lead-lists/[id]
 * Deletes a lead list (cascade deletes all members)
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    await deleteLeadList(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/lead-lists/[id] error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete lead list" },
      { status: 500 }
    );
  }
}

