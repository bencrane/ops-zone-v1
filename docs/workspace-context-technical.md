# WorkspaceContext: Technical Deep Dive

> ⚠️ **HISTORICAL REFERENCE** — This documents the context-based approach which is being replaced by URL-based workspaces. Retained for reference during migration. See `workspace-url-migration.md` for the current approach.

## How It Works Under the Hood

### The Core Problem

EmailBison uses **server-side session state** tied to your API key. When you make API calls, the server knows which workspace to scope the response to based on an internal session variable — not something you pass on every request.

This means:
1. You call `POST /api/workspaces/v1.1/switch-workspace` with a `team_id`
2. EmailBison's server updates its internal state: "API key X is now in workspace Y"
3. All subsequent API calls using that key automatically operate in workspace Y
4. **No workspace ID is passed on individual API calls**

### The Client-Side Challenge

Our frontend doesn't know what workspace the server thinks we're in. Without client-side tracking:
- UI shows stale data from previous workspace after switch
- No loading indicators during workspace operations
- No way to trigger data refresh when workspace changes
- Race conditions if requests in-flight during switch

### The Solution: WorkspaceContext

```
┌─────────────────────────────────────────────────────────────┐
│                    WorkspaceProvider                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  State:                                              │   │
│  │  - currentWorkspace: { id, name }                   │   │
│  │  - workspaces: [...]                                │   │
│  │  - isLoading / isSwitching                          │   │
│  │  - refreshKey: number (increments on switch)        │   │
│  │  - error: string | null                             │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Actions:                                            │   │
│  │  - switchWorkspace(id) → calls API, updates state   │   │
│  │  - refreshWorkspaces() → re-fetches list            │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Children get access via useWorkspace() hook                │
└─────────────────────────────────────────────────────────────┘
```

---

## Initialization Flow

```
┌──────────────┐     ┌─────────────────────┐     ┌──────────────────┐
│  App Loads   │────▶│  WorkspaceProvider  │────▶│  Fetch Workspaces│
│              │     │     Mounts          │     │  GET /workspaces │
└──────────────┘     └─────────────────────┘     └────────┬─────────┘
                                                          │
                     ┌─────────────────────┐              │
                     │  Fetch Account      │◀─────────────┘
                     │  GET /account       │
                     └──────────┬──────────┘
                                │
                     ┌──────────▼──────────┐
                     │  Extract            │
                     │  current_team_id    │
                     └──────────┬──────────┘
                                │
                     ┌──────────▼──────────┐
                     │  Set                │
                     │  currentWorkspace   │
                     │  isLoading = false  │
                     └─────────────────────┘
```

---

## Workspace Switch Flow

```
User clicks "Test Client" in dropdown
            │
            ▼
┌───────────────────────────────────────┐
│  switchWorkspace(2) called            │
│  - isSwitching = true                 │
│  - Optimistically set currentWorkspace│
└───────────────────┬───────────────────┘
                    │
                    ▼
┌───────────────────────────────────────┐
│  POST /api/emailbison/workspaces/switch│
│  body: { workspaceId: 2 }             │
└───────────────────┬───────────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
        ▼                       ▼
   ┌─────────┐            ┌─────────┐
   │ Success │            │ Failure │
   └────┬────┘            └────┬────┘
        │                      │
        ▼                      ▼
┌───────────────┐      ┌───────────────┐
│ refreshKey++  │      │ Revert to     │
│ isSwitching   │      │ previous      │
│ = false       │      │ workspace     │
└───────────────┘      │ Set error     │
                       └───────────────┘
```

---

## The refreshKey Mechanism

This is the critical piece that makes workspace switching actually work in the UI.

### The Problem Without refreshKey

```tsx
// Campaign list component
useEffect(() => {
  fetchCampaigns();
}, []); // Only runs ONCE on mount

// User switches workspace...
// fetchCampaigns() never runs again
// UI shows campaigns from OLD workspace
```

### The Solution With refreshKey

```tsx
const { refreshKey } = useWorkspace();

useEffect(() => {
  fetchCampaigns();
}, [refreshKey]); // Runs on mount AND every workspace switch

// User switches workspace...
// refreshKey: 0 → 1
// useEffect detects change, runs fetchCampaigns()
// UI shows campaigns from NEW workspace
```

### How refreshKey Works

```
Initial State:
  refreshKey = 0

User switches to "Test Client":
  1. switchWorkspace(2) called
  2. API call succeeds
  3. setRefreshKey(prev => prev + 1)
  4. refreshKey = 1

Any component with:
  useEffect(() => { fetch() }, [refreshKey])
  
...will re-run its fetch because refreshKey changed (0 → 1)

User switches back to "Benjamin's Team":
  1. switchWorkspace(1) called
  2. API call succeeds
  3. setRefreshKey(prev => prev + 1)
  4. refreshKey = 2

Same components re-fetch again (1 → 2)
```

---

## File Structure

```
src/
├── contexts/
│   └── workspace-context.tsx    # Provider, hook, types
├── components/
│   └── workspace-indicator.tsx  # UI dropdown component
└── app/
    └── layout.tsx               # Provider wraps entire app
```

---

## API Endpoints Used

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/emailbison/workspaces` | GET | List all available workspaces |
| `/api/emailbison/account` | GET | Get current account (includes current_team_id) |
| `/api/emailbison/workspaces/switch` | POST | Switch server-side workspace session |

---

## Usage Examples

### Basic: Show Current Workspace

```tsx
import { useWorkspace } from "@/contexts/workspace-context";

function Header() {
  const { currentWorkspace, isLoading } = useWorkspace();
  
  if (isLoading) return <Spinner />;
  return <span>{currentWorkspace?.name}</span>;
}
```

### Data Fetching: Auto-Refresh on Switch

```tsx
import { useWorkspace } from "@/contexts/workspace-context";

function CampaignList() {
  const { refreshKey } = useWorkspace();
  const [campaigns, setCampaigns] = useState([]);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/emailbison/campaigns");
      const data = await res.json();
      setCampaigns(data.data || []);
    }
    load();
  }, [refreshKey]); // ← Critical: re-fetches when workspace changes

  return <ul>{campaigns.map(c => <li>{c.name}</li>)}</ul>;
}
```

### Workspace Switcher

```tsx
import { useWorkspace } from "@/contexts/workspace-context";

function WorkspaceSwitcher() {
  const { workspaces, currentWorkspace, switchWorkspace, isSwitching } = useWorkspace();

  return (
    <select
      value={currentWorkspace?.id}
      onChange={(e) => switchWorkspace(Number(e.target.value))}
      disabled={isSwitching}
    >
      {workspaces.map(w => (
        <option key={w.id} value={w.id}>{w.name}</option>
      ))}
    </select>
  );
}
```

---

## Edge Cases Handled

| Scenario | Handling |
|----------|----------|
| Initial load | Show loading state until workspace determined |
| Switch fails | Revert to previous workspace, show error |
| Same workspace selected | No-op, don't call API |
| No workspaces | Show "No workspace" message |
| API returns no current_team_id | Fall back to first workspace in list |

---

## Important Notes

1. **Server-side is source of truth**: Our client state mirrors what we believe the server state is, but the server is authoritative.

2. **refreshKey must be used**: Any component that fetches workspace-scoped data MUST include `refreshKey` in its useEffect dependencies, or data will be stale after switch.

3. **Optimistic updates**: We update UI immediately for responsiveness, but revert if API fails.

4. **Single API key**: We use one API key for all requests. The server tracks which workspace that key is "in".

---

## Pages Using refreshKey

The following pages have been updated to use `refreshKey` for automatic data refresh on workspace switch:

| Page | File | Data Fetched |
|------|------|--------------|
| Configure Campaign | `campaigns/customize/page.tsx` | Campaigns, schedule |
| Email Account Settings | `email-accounts/settings/page.tsx` | Email accounts |
| Assign Email Accounts | `campaigns/assign-emails/page.tsx` | Campaigns, email accounts |
| View Email Accounts | `email-accounts/view/page.tsx` | Email accounts |
| Campaign Messages | `campaigns/messages/page.tsx` | Campaigns, sequence steps |
| Campaign Management | `emailbison/campaigns/page.tsx` | Campaigns |

Each of these pages:
1. Imports `useWorkspace` hook
2. Extracts `refreshKey` from the hook
3. Includes `refreshKey` in useEffect dependency array
4. Clears selection/editing state when workspace changes

