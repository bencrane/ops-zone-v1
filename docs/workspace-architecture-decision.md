# Workspace Architecture Decision

**Date:** January 10, 2026  
**Status:** Decision Made — URL-Based Approach Selected  
**Next Action:** See `workspace-url-migration.md` for implementation plan

> ℹ️ This document captures the decision rationale. For implementation details, see `workspace-url-migration.md`.

---

## Executive Summary

We evaluated two approaches for handling workspace state in the application:

1. **Context + refreshKey** (currently implemented)
2. **URL-based workspaces** (recommended migration target)

**Decision:** Migrate to URL-based workspaces because it eliminates an entire class of bugs by making them structurally impossible.

---

## Background

### What is a Workspace?

In EmailBison, a workspace is an isolated container for:
- Campaigns
- Email accounts (sender emails)
- Leads
- Master inbox / replies
- Custom variables
- Tags

Each workspace is completely isolated. Data from Workspace A never appears in Workspace B.

### The Business Context

Workspaces map to business contexts:
- Different clients (if managing campaigns for others)
- Different business lines or brands (personal use)
- Different product offerings

Example:
```
Workspace "Acme Corp"     → Client A's campaigns, leads, inbox
Workspace "Startup Inc"   → Client B's campaigns, leads, inbox
Workspace "My SaaS"       → Personal business campaigns
```

### How EmailBison Handles Workspaces

EmailBison maintains **server-side session state** tied to your API key:

1. You call `POST /api/workspaces/v1.1/switch-workspace` with a `team_id`
2. EmailBison's server updates: "API key X is now operating in workspace Y"
3. All subsequent API calls using that key return data from workspace Y
4. **No workspace ID is passed on individual API calls** — the server "remembers"

This is important: we don't control which workspace data comes from per-request. We control it via the session state.

---

## Approach 1: Context + refreshKey (Current)

### How It Works

```
┌─────────────────────────────────────────────────────────┐
│                    WorkspaceProvider                    │
│  - currentWorkspace: { id, name }                       │
│  - workspaces: [...]                                    │
│  - switchWorkspace(id): calls API, increments refreshKey│
│  - refreshKey: number (0 → 1 → 2 → ...)                │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                    CampaignsPage                        │
│  const { refreshKey } = useWorkspace();                 │
│  useEffect(() => {                                      │
│    fetchCampaigns();                                    │
│  }, [refreshKey]);  ← Must remember this!               │
└─────────────────────────────────────────────────────────┘
```

When workspace changes:
1. User clicks different workspace in dropdown
2. `switchWorkspace()` calls EmailBison API
3. `refreshKey` increments (0 → 1)
4. Any useEffect with `refreshKey` in dependencies re-runs
5. Data is refetched from new workspace

### The Problem

**Every page that fetches workspace-scoped data must manually include `refreshKey` in its useEffect dependencies.**

If a developer forgets:
```tsx
// BUG: Missing refreshKey
useEffect(() => {
  fetchCampaigns();
}, []); // ← Only runs once on mount!
```

This code:
- ✅ Works on initial load
- ✅ Passes basic testing
- ❌ Shows stale data after workspace switch
- ❌ Silent failure — no error, just wrong data

This is a **latent bug pattern** — it appears to work but fails in real usage.

### Mitigation Attempts

We implemented:
- Documentation explaining the pattern
- Updated 6 pages with `refreshKey`
- Plan to create custom hooks (`useCampaigns`, etc.)

But fundamentally: **the architecture allows the bug to exist**. We're relying on developer discipline, not structural enforcement.

---

## Approach 2: URL-Based Workspaces (Recommended)

### How It Works

Workspace ID is part of the URL:

```
/workspace/123/campaigns
/workspace/123/email-accounts
/workspace/123/master-inbox
/workspace/456/campaigns      ← Different workspace
```

**File structure:**
```
src/app/
├── workspace/
│   └── [workspaceId]/              ← Dynamic route segment
│       ├── layout.tsx              ← Syncs EmailBison session
│       ├── campaigns/
│       │   └── page.tsx            ← ONE file, all workspaces
│       ├── email-accounts/
│       │   └── page.tsx
│       ├── master-inbox/
│       │   └── page.tsx
│       └── access-leads/
│           └── page.tsx
├── settings/                       ← Global (no workspace)
│   └── page.tsx
└── help/
    └── page.tsx
```

**Key insight:** There is NO code duplication. `[workspaceId]` is a dynamic parameter, not a folder-per-workspace.

```
/workspace/123/campaigns → renders workspace/[workspaceId]/campaigns/page.tsx
/workspace/456/campaigns → renders THE SAME file with different param
```

### The Layout Gateway

```tsx
// workspace/[workspaceId]/layout.tsx
export default function WorkspaceLayout({ params, children }) {
  const { workspaceId } = params;
  const [synced, setSynced] = useState(false);
  
  useEffect(() => {
    async function ensureWorkspace() {
      await switchWorkspaceIfNeeded(Number(workspaceId));
      setSynced(true);
    }
    ensureWorkspace();
  }, [workspaceId]);
  
  if (!synced) return <Loading />;
  return children;
}
```

The layout:
1. Extracts `workspaceId` from URL
2. Ensures EmailBison session matches (calls switch-workspace if needed)
3. Only renders children after sync is complete

**Pages don't need to know about workspace switching.** They just fetch data — the layout guarantees they're in the right workspace.

### Why refreshKey Becomes Unnecessary

When workspace changes:
```
User clicks "Workspace 456" 
  → Navigate to /workspace/456/campaigns
  → URL changes
  → React re-renders/re-mounts the page
  → Layout syncs EmailBison to 456
  → Page fetches campaigns (now from 456)
```

**URL change = page re-render = fresh data fetch.**

There's no `refreshKey` to forget because the framework handles it.

---

## Comparison

| Aspect | Context + refreshKey | URL-Based |
|--------|---------------------|-----------|
| **Forgetting to refresh** | Easy — must add to every useEffect | **Impossible** — URL change = re-render |
| **Stale data after switch** | Silent bug if refreshKey missing | **Cannot happen** |
| **Bookmarkable** | No — workspace is hidden state | **Yes** — URL includes workspace |
| **Shareable links** | No — recipient gets their workspace | **Yes** — link is workspace-specific |
| **Browser back/forward** | Doesn't affect workspace | **Works naturally** |
| **Multi-tab workflow** | Confusing — all tabs share context | **Clean** — each tab is a URL |
| **Debugging** | "What workspace am I in?" | **Obvious from URL** |
| **Code complexity** | useWorkspace + refreshKey everywhere | Layout handles sync once |
| **Migration effort** | Already done | Route restructuring needed |

---

## Multi-Client / Multi-Business Use Case

URL-based workspaces naturally support managing multiple contexts:

```
Tab 1: /workspace/123/master-inbox   ← Client A's replies
Tab 2: /workspace/456/campaigns      ← Client B's campaigns  
Tab 3: /workspace/789/email-accounts ← Your personal business
```

Each tab is independent. No confusion about which workspace you're operating in.

**Bookmarks become client shortcuts:**
- "Acme Inbox" → /workspace/123/master-inbox
- "Startup Campaigns" → /workspace/456/campaigns

---

## What About Global Pages?

Pages that don't belong to a specific workspace live outside the `/workspace/[id]/` tree:

```
/workspace/[id]/campaigns    ← Workspace-scoped
/workspace/[id]/master-inbox ← Workspace-scoped

/settings                    ← Global (user settings)
/help                        ← Global
/admin                       ← Could be either
```

No need for a `/global` prefix — root-level pages are implicitly global.

---

## What About Cross-Workspace Views?

**Question:** Can I see a unified inbox across all my workspaces?

**Answer:** Possible but requires extra work.

EmailBison's model is one-workspace-at-a-time. To aggregate:
1. Switch to WS1, fetch, store
2. Switch to WS2, fetch, store
3. Combine and display

This would require a backend caching layer — not trivial, but not blocked by URL-based architecture.

**Recommendation:** Build single-workspace features first. Cross-workspace aggregation is a future enhancement if needed.

---

## Migration Plan (High-Level)

### Phase 1: Create New Route Structure

```
src/app/
├── workspace/
│   └── [workspaceId]/
│       ├── layout.tsx           ← NEW: workspace sync
│       ├── page.tsx             ← Workspace home/redirect
│       ├── campaigns/
│       ├── email-accounts/
│       ├── master-inbox/
│       └── access-leads/
```

### Phase 2: Implement Workspace Layout

- Extract workspaceId from params
- Check if EmailBison session matches
- Call switch-workspace if needed
- Show loading state during sync
- Render children after sync

### Phase 3: Move Existing Pages

- Move page files into `/workspace/[workspaceId]/` tree
- Remove `useWorkspace()` and `refreshKey` from pages
- Simplify to plain data fetching

### Phase 4: Handle Entry Points

- Root `/` redirects to `/workspace/[defaultId]/...`
- Default workspace from:
  - Last used (localStorage)
  - First in list
  - Account's current team_id

### Phase 5: Update Navigation

- All internal links include workspace ID
- Workspace switcher navigates to new URL instead of calling switchWorkspace()

### Phase 6: Clean Up

- Remove WorkspaceContext (or simplify to just provide workspace info, no refresh logic)
- Remove refreshKey pattern from codebase
- Update documentation

---

## Decision Rationale

We chose URL-based workspaces because:

1. **Eliminates bugs structurally** — Can't forget refreshKey if there is no refreshKey
2. **Web-native pattern** — URLs are meant to capture application state
3. **Better UX** — Bookmarks, sharing, back button all work
4. **Simpler pages** — No workspace boilerplate, just fetch data
5. **Multi-client ready** — Tabs can show different workspaces simultaneously
6. **Aligns with Master Inbox criticality** — Workspace isolation is explicit, reducing risk of cross-client errors

The migration requires route restructuring, but the result is a more robust, maintainable architecture.

---

## Files to Reference

- `docs/workspace-context-technical.md` — How current approach works (for reference during migration)
- `docs/workspace-context-plan.md` — Original implementation plan (historical)
- `src/contexts/workspace-context.tsx` — Current context implementation (to be simplified/removed)
- `src/components/workspace-indicator.tsx` — Current UI (will change to navigation-based)

---

## Next Steps

1. Review this document
2. Decide on timeline for migration
3. Create detailed implementation tasks
4. Execute Phase 1-6
5. Verify all workspace-scoped features work
6. Remove legacy code

---

*This document captures the architectural discussion and decision from January 10, 2026.*

