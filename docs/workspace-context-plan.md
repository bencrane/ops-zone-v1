# WorkspaceContext Implementation Plan

> ⚠️ **SUPERSEDED** — This document describes the context-based approach which has been replaced by URL-based workspaces. See `workspace-url-migration.md` for the current plan.

**Status:** ~~In Progress~~ DEPRECATED  
**Estimated Time:** 30 minutes  
**Priority:** Foundation (blocks Master Inbox)

---

## Purpose

Create a React Context that tracks the current EmailBison workspace and ensures all API calls operate in the correct workspace context. When a user switches workspaces, all dependent data should refresh automatically.

---

## Problem Statement

EmailBison uses server-side session state tied to the API key. When `switchWorkspace()` is called, the server remembers the new workspace for subsequent API calls. However:

1. Our frontend doesn't know which workspace it's "in"
2. UI shows stale data from previous workspace after switch
3. No loading indicator during workspace operations
4. Race conditions possible if requests in-flight during switch

---

## Solution

A WorkspaceContext provider that:

1. **Tracks** current workspace ID and name
2. **Fetches** available workspaces on mount
3. **Provides** `switchWorkspace()` that calls API and triggers refresh
4. **Exposes** `refreshKey` that increments on switch (for data refetch)
5. **Shows** loading states during operations

---

## Implementation Stages

### Stage 1: Create Context & Provider
- File: `src/contexts/workspace-context.tsx`
- Types, createContext, default values
- Provider component with useState
- Custom `useWorkspace()` hook

### Stage 2: Wire Up API Calls
- Fetch workspaces on mount via existing route
- Determine current workspace from account
- Implement switchWorkspace with optimistic update

### Stage 3: Add to App Layout
- Wrap app in WorkspaceProvider
- High in component tree (above all EmailBison consumers)

### Stage 4: Create UI Component
- `WorkspaceIndicator` showing current workspace
- Dropdown to switch workspaces
- Subtle, non-distracting design

### Stage 5: Test & Verify
- Switch workspaces
- Confirm API calls use new workspace
- Verify data refresh

---

## Type Definitions

```typescript
interface Workspace {
  id: number;
  name: string;
}

interface WorkspaceContextValue {
  // Data
  currentWorkspace: Workspace | null;
  workspaces: Workspace[];
  
  // Loading states
  isLoading: boolean;
  isSwitching: boolean;
  
  // Refresh mechanism
  refreshKey: number;
  
  // Actions
  switchWorkspace: (workspaceId: number) => Promise<void>;
  refreshWorkspaces: () => Promise<void>;
}
```

---

## File Structure

```
src/
├── contexts/
│   └── workspace-context.tsx    # NEW: Context, provider, hook
├── components/
│   └── workspace-indicator.tsx  # NEW: UI component
└── app/
    └── layout.tsx               # MODIFY: Add provider
```

---

## API Routes Used

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/emailbison/workspaces` | GET | List available workspaces |
| `/api/emailbison/workspaces/switch` | POST | Switch to workspace |
| `/api/emailbison/account` | GET | Get current account (includes workspace) |

---

## Edge Cases

1. **Initial load** - Show loading state until workspace determined
2. **Switch fails** - Revert to previous, show error toast
3. **No workspaces** - Edge case, handle gracefully
4. **Concurrent switches** - Debounce or queue

---

## Success Criteria

- [ ] Can see current workspace in UI
- [ ] Can switch via dropdown
- [ ] All data refreshes after switch
- [ ] Loading states visible during operations
- [ ] No stale data displayed

