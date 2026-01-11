import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_OUTBOUND_URL;
const supabaseAnonKey = process.env.SUPABASE_OUTBOUND_ANON_KEY;

if (!supabaseUrl) {
  throw new Error("Missing environment variable: SUPABASE_OUTBOUND_URL");
}

if (!supabaseAnonKey) {
  throw new Error("Missing environment variable: SUPABASE_OUTBOUND_ANON_KEY");
}

/**
 * Supabase client for the outbound-db database.
 * Used for application-specific data: Lead Lists, workspace preferences, etc.
 * 
 * NOT for canonical lead data - that comes from the HQ API.
 */
export const outboundDb = createClient(supabaseUrl, supabaseAnonKey);

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export interface LeadList {
  id: string;
  workspace_id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface LeadListMember {
  id: string;
  lead_list_id: string;
  hq_person_id: string;
  added_at: string;
}

export interface LeadListWithCount extends LeadList {
  member_count: number;
}

// =============================================================================
// LEAD LIST FUNCTIONS
// =============================================================================

/**
 * Get all lead lists for a workspace
 */
export async function getLeadLists(workspaceId: string): Promise<LeadListWithCount[]> {
  const { data: lists, error } = await outboundDb
    .from("lead_lists")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch lead lists: ${error.message}`);
  }

  // Get member counts for each list
  const listsWithCounts: LeadListWithCount[] = await Promise.all(
    (lists || []).map(async (list) => {
      const { count, error: countError } = await outboundDb
        .from("lead_list_members")
        .select("*", { count: "exact", head: true })
        .eq("lead_list_id", list.id);

      if (countError) {
        console.error(`Failed to get count for list ${list.id}:`, countError);
      }

      return {
        ...list,
        member_count: count ?? 0,
      };
    })
  );

  return listsWithCounts;
}

/**
 * Get a single lead list by ID
 */
export async function getLeadList(listId: string): Promise<LeadListWithCount | null> {
  const { data: list, error } = await outboundDb
    .from("lead_lists")
    .select("*")
    .eq("id", listId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null; // Not found
    }
    throw new Error(`Failed to fetch lead list: ${error.message}`);
  }

  const { count } = await outboundDb
    .from("lead_list_members")
    .select("*", { count: "exact", head: true })
    .eq("lead_list_id", listId);

  return {
    ...list,
    member_count: count ?? 0,
  };
}

/**
 * Create a new lead list
 */
export async function createLeadList(
  workspaceId: string,
  name: string,
  description?: string
): Promise<LeadList> {
  const { data, error } = await outboundDb
    .from("lead_lists")
    .insert({
      workspace_id: workspaceId,
      name,
      description: description || null,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create lead list: ${error.message}`);
  }

  return data;
}

/**
 * Delete a lead list (cascade deletes members)
 */
export async function deleteLeadList(listId: string): Promise<void> {
  const { error } = await outboundDb
    .from("lead_lists")
    .delete()
    .eq("id", listId);

  if (error) {
    throw new Error(`Failed to delete lead list: ${error.message}`);
  }
}

/**
 * Update a lead list
 */
export async function updateLeadList(
  listId: string,
  updates: { name?: string; description?: string }
): Promise<LeadList> {
  const { data, error } = await outboundDb
    .from("lead_lists")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", listId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update lead list: ${error.message}`);
  }

  return data;
}

// =============================================================================
// LEAD LIST MEMBER FUNCTIONS
// =============================================================================

/**
 * Add leads to a list (by HQ person IDs)
 */
export async function addLeadsToList(
  listId: string,
  hqPersonIds: string[]
): Promise<{ added: number; duplicates: number }> {
  if (hqPersonIds.length === 0) {
    return { added: 0, duplicates: 0 };
  }

  // Insert with ON CONFLICT DO NOTHING to handle duplicates gracefully
  const { data, error } = await outboundDb
    .from("lead_list_members")
    .upsert(
      hqPersonIds.map((hqPersonId) => ({
        lead_list_id: listId,
        hq_person_id: hqPersonId,
      })),
      { onConflict: "lead_list_id,hq_person_id", ignoreDuplicates: true }
    )
    .select();

  if (error) {
    throw new Error(`Failed to add leads to list: ${error.message}`);
  }

  const added = data?.length ?? 0;
  const duplicates = hqPersonIds.length - added;

  // Update the list's updated_at timestamp
  await outboundDb
    .from("lead_lists")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", listId);

  return { added, duplicates };
}

/**
 * Remove leads from a list
 */
export async function removeLeadsFromList(
  listId: string,
  hqPersonIds: string[]
): Promise<number> {
  if (hqPersonIds.length === 0) {
    return 0;
  }

  const { data, error } = await outboundDb
    .from("lead_list_members")
    .delete()
    .eq("lead_list_id", listId)
    .in("hq_person_id", hqPersonIds)
    .select();

  if (error) {
    throw new Error(`Failed to remove leads from list: ${error.message}`);
  }

  // Update the list's updated_at timestamp
  await outboundDb
    .from("lead_lists")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", listId);

  return data?.length ?? 0;
}

/**
 * Get all HQ person IDs in a list
 */
export async function getListMemberIds(listId: string): Promise<string[]> {
  const { data, error } = await outboundDb
    .from("lead_list_members")
    .select("hq_person_id")
    .eq("lead_list_id", listId);

  if (error) {
    throw new Error(`Failed to fetch list members: ${error.message}`);
  }

  return (data || []).map((m) => m.hq_person_id);
}

/**
 * Check which lists a person belongs to
 */
export async function getListsForPerson(
  workspaceId: string,
  hqPersonId: string
): Promise<LeadList[]> {
  const { data, error } = await outboundDb
    .from("lead_list_members")
    .select("lead_list_id, lead_lists(*)")
    .eq("hq_person_id", hqPersonId);

  if (error) {
    throw new Error(`Failed to fetch lists for person: ${error.message}`);
  }

  // Filter by workspace and extract the list objects
  return (data || [])
    .map((m) => m.lead_lists as unknown as LeadList)
    .filter((list) => list && list.workspace_id === workspaceId);
}

