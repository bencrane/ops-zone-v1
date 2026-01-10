# URL-Based Workspace Migration Plan

**Date:** January 10, 2026 (Updated)  
**Status:** Ready to Implement  
**Domain:** ops.zone (root domain)  
**Priority:** High — Foundation for Master Inbox

---

## Summary

Migrate from context-based workspace state (`refreshKey` pattern) to URL-based workspaces where the **workspace name/slug** is embedded in the URL path. This eliminates stale data bugs, enables multi-tab workflows, and creates human-readable URLs.

---

## Target URL Structure

```
ops.zone/
├── /                           → Black landing page (public)
├── /login                      → Auth (public)
├── /select                     → Workspace selector (if multiple)
│
└── /[workspace]/               → Workspace-scoped routes (e.g., /hq/)
    ├── /                       → Dashboard (Command Center)
    ├── /campaigns/             → Campaign management
    ├── /campaigns/create
    ├── /campaigns/[campaignId]/configure
    ├── /campaigns/[campaignId]/messages
    ├── /campaigns/[campaignId]/assign-emails
    ├── /email-accounts/        → Email account list
    ├── /email-accounts/settings
    ├── /inbox/                 → Master Inbox
    ├── /leads/                 → Lead management
    └── /access-leads/          → Lead sourcing
```

**Example URLs:**
```
ops.zone/hq/inbox              ← Your "hq" workspace inbox
ops.zone/hq/campaigns          ← Your campaigns
ops.zone/acme/inbox            ← Another workspace (future client)
```

---

## Current State vs Target State

| Current | Target |
|---------|--------|
| `/admin/campaigns-hub` | `/hq/campaigns` |
| `/admin/email-accounts` | `/hq/email-accounts` |
| `/admin/email-accounts/settings` | `/hq/email-accounts/settings` |
| `/admin/campaigns/customize` | `/hq/campaigns/[campaignId]/configure` |
| `/admin/campaigns/messages` | `/hq/campaigns/[campaignId]/messages` |
| `/admin/campaigns/assign-emails` | `/hq/campaigns/[campaignId]/assign-emails` |
| `/admin/access-leads` | `/hq/access-leads` |
| `/(dashboard)/page.tsx` | `/hq/` (workspace dashboard) |
| `/admin/page.tsx` | `/select` (workspace selector) |

---

## New File Structure

```
src/app/
├── page.tsx                        # Black landing (public)
├── login/page.tsx                  # Login form (public)
├── select/page.tsx                 # Workspace selector (redirects to /[workspace])
│
├── [workspace]/                    # Dynamic: /hq, /acme, etc.
│   ├── layout.tsx                  # KEY: Resolves slug → ID, syncs EmailBison
│   ├── page.tsx                    # Workspace dashboard
│   ├── campaigns/
│   │   ├── page.tsx                # Campaign list
│   │   ├── create/page.tsx
│   │   └── [campaignId]/
│   │       ├── configure/page.tsx
│   │       ├── messages/page.tsx
│   │       └── assign-emails/page.tsx
│   ├── email-accounts/
│   │   ├── page.tsx                # Email account list
│   │   └── settings/page.tsx
│   ├── inbox/
│   │   └── page.tsx                # Master Inbox
│   ├── leads/
│   │   └── page.tsx
│   └── access-leads/
│       └── page.tsx
│
├── api/                            # API routes (unchanged)
└── layout.tsx                      # Root layout
```

**Note:** The `[workspace]` folder uses the workspace name as the slug (e.g., "hq", "acme"). The layout resolves this to the numeric EmailBison workspace ID.

---

## Implementation Phases

### Phase 1: Create Workspace Layout (Foundation)

**File:** `src/app/[workspace]/layout.tsx`

```tsx
import { redirect, notFound } from 'next/navigation';
import { cookies } from 'next/headers';

interface Workspace {
  id: number;
  name: string;
}

// Fetch all workspaces and find by slug
async function resolveWorkspace(slug: string): Promise<Workspace | null> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/emailbison/workspaces`, {
    headers: { Cookie: (await cookies()).toString() },
    cache: 'no-store',
  });
  
  if (!res.ok) return null;
  
  const data = await res.json();
  const workspaces: Workspace[] = data.data || [];
  
  // Match by name (case-insensitive, normalize to slug)
  return workspaces.find(w => 
    w.name.toLowerCase().replace(/[^a-z0-9]/g, '-') === slug.toLowerCase() ||
    w.name.toLowerCase() === slug.toLowerCase()
  ) || null;
}

async function syncWorkspace(workspaceId: number) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/emailbison/workspaces/switch`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      Cookie: (await cookies()).toString(),
    },
    body: JSON.stringify({ workspaceId }),
    cache: 'no-store',
  });
  return res.ok;
}

export default async function WorkspaceLayout({
  params,
  children,
}: {
  params: Promise<{ workspace: string }>;
  children: React.ReactNode;
}) {
  const { workspace: slug } = await params;
  
  // Reserved routes that aren't workspaces
  const reserved = ['login', 'select', 'api', '_next'];
  if (reserved.includes(slug)) {
    return children; // Let Next.js handle these routes
  }
  
  // Resolve slug to workspace
  const workspace = await resolveWorkspace(slug);
  
  if (!workspace) {
    notFound(); // Shows 404 if workspace doesn't exist
  }
  
  // Sync EmailBison session to this workspace
  await syncWorkspace(workspace.id);
  
  return (
    <WorkspaceShell workspace={workspace}>
      {children}
    </WorkspaceShell>
  );
}

// Provides workspace context to children
function WorkspaceShell({ 
  workspace, 
  children 
}: { 
  workspace: Workspace;
  children: React.ReactNode;
}) {
  return (
    <div data-workspace-id={workspace.id} data-workspace-name={workspace.name}>
      {children}
    </div>
  );
}
```

**Key points:**
1. Slug (e.g., "hq") is resolved to workspace ID via API lookup
2. EmailBison session synced BEFORE rendering children
3. Reserved routes (`login`, `select`, etc.) bypass workspace logic
4. 404 if workspace slug doesn't match any workspace name

---

### Phase 2: Create Workspace Selector (Entry Point)

**File:** `src/app/select/page.tsx` (new)

```tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface Workspace {
  id: number;
  name: string;
}

function toSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
}

export default function SelectWorkspacePage() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  useEffect(() => {
    async function loadWorkspaces() {
      const res = await fetch('/api/emailbison/workspaces');
      const data = await res.json();
      const list = data.data || [];
      setWorkspaces(list);
      setLoading(false);
      
      // Auto-redirect if only one workspace
      if (list.length === 1) {
        router.push(`/${toSlug(list[0].name)}`);
      }
    }
    loadWorkspaces();
  }, [router]);
  
  function handleSelect(ws: Workspace) {
    router.push(`/${toSlug(ws.name)}`);
  }
  
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-zinc-500">Loading workspaces...</div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-black p-8">
      <h1 className="text-2xl font-bold text-white mb-6">Select Workspace</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {workspaces.map((ws) => (
          <Card 
            key={ws.id}
            className="cursor-pointer hover:border-zinc-600 transition-colors bg-zinc-900 border-zinc-800"
            onClick={() => handleSelect(ws)}
          >
            <CardHeader>
              <CardTitle className="text-white">{ws.name}</CardTitle>
              <CardDescription className="text-zinc-400">/{toSlug(ws.name)}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

**Key point:** Navigates to `/{slug}` (e.g., `/hq`) not `/workspace/123`.

---

### Phase 3: Move Dashboard to Workspace Route

**From:** `src/app/(dashboard)/page.tsx`  
**To:** `src/app/[workspace]/page.tsx`

The dashboard component stays mostly the same, just remove any `useWorkspace()` / `refreshKey` dependencies.

**Note:** This becomes the page at `ops.zone/hq/` — the workspace home.

---

### Phase 4: Move Existing Pages

For each page, the migration is:

1. Move file to new location under `/[workspace]/`
2. Remove `useWorkspace()` hook usage
3. Remove `refreshKey` from useEffect dependencies
4. Data fetching just works (layout already synced workspace)

**Example migration:**

```tsx
// BEFORE: src/app/admin/campaigns-hub/page.tsx
const { refreshKey } = useWorkspace();
useEffect(() => {
  fetchCampaigns();
}, [refreshKey]);

// AFTER: src/app/[workspace]/campaigns/page.tsx
useEffect(() => {
  fetchCampaigns();
}, []); // No refreshKey needed - URL change = remount
```

**Pages to migrate:**
- `campaigns/page.tsx` → `/hq/campaigns`
- `email-accounts/page.tsx` → `/hq/email-accounts`
- `email-accounts/settings/page.tsx` → `/hq/email-accounts/settings`
- `access-leads/page.tsx` → `/hq/access-leads`
- `inbox/page.tsx` → `/hq/inbox` (Master Inbox - new)

---

### Phase 5: Update Navigation Components

All internal links must include workspace slug:

```tsx
// BEFORE
<Link href="/admin/campaigns-hub">Campaigns</Link>

// AFTER (in workspace context)
<Link href={`/${workspace}/campaigns`}>Campaigns</Link>
```

Create a helper hook:

```tsx
// src/hooks/use-workspace-nav.ts
import { useParams } from 'next/navigation';

export function useWorkspaceNav() {
  const params = useParams();
  const workspace = params.workspace as string; // e.g., "hq"
  
  return {
    workspace,
    href: (path: string) => `/${workspace}${path}`,
  };
}

// Usage
const { href } = useWorkspaceNav();
<Link href={href('/campaigns')}>Campaigns</Link>
// Results in: /hq/campaigns
```

---

### Phase 6: Update Sidebar Navigation

Create workspace-aware navigation component:

```tsx
// src/components/workspace-nav.tsx
'use client';

import { useParams, usePathname } from 'next/navigation';
import Link from 'next/link';

const navItems = [
  { label: 'Dashboard', path: '' },
  { label: 'Campaigns', path: '/campaigns' },
  { label: 'Email Accounts', path: '/email-accounts' },
  { label: 'Inbox', path: '/inbox' },
  { label: 'Leads', path: '/leads' },
  { label: 'Source Leads', path: '/access-leads' },
];

export function WorkspaceNav() {
  const params = useParams();
  const pathname = usePathname();
  const workspace = params.workspace as string; // e.g., "hq"
  const basePath = `/${workspace}`;
  
  return (
    <nav>
      {navItems.map((item) => {
        const href = `${basePath}${item.path}`;
        const isActive = pathname === href || pathname.startsWith(`${href}/`);
        
        return (
          <Link 
            key={item.path} 
            href={href}
            className={isActive ? 'text-white' : 'text-zinc-400'}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
```

**Example navigation for workspace "hq":**
- Dashboard → `/hq`
- Campaigns → `/hq/campaigns`
- Inbox → `/hq/inbox`

---

### Phase 7: Workspace Switcher (In-App)

Add switcher to workspace layout header:

```tsx
'use client';

import { useRouter, useParams, usePathname } from 'next/navigation';

interface Workspace {
  id: number;
  name: string;
}

function toSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
}

export function WorkspaceSwitcher({ workspaces }: { workspaces: Workspace[] }) {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const currentSlug = params.workspace as string;
  
  function handleSwitch(newSlug: string) {
    // Replace workspace slug in current path
    // /hq/campaigns → /acme/campaigns
    const pathParts = pathname.split('/');
    pathParts[1] = newSlug; // Replace the workspace segment
    router.push(pathParts.join('/'));
  }
  
  return (
    <select 
      value={currentSlug} 
      onChange={(e) => handleSwitch(e.target.value)}
      className="bg-zinc-800 text-white border-zinc-700 rounded px-2 py-1"
    >
      {workspaces.map(ws => (
        <option key={ws.id} value={toSlug(ws.name)}>{ws.name}</option>
      ))}
    </select>
  );
}
```

**Key:** Switching workspace navigates to NEW URL (e.g., `/hq/campaigns` → `/acme/campaigns`), preserving the current page path.

---

### Phase 8: Clean Up

1. Delete `src/contexts/workspace-context.tsx` (or keep minimal version for workspace info only)
2. Delete `src/components/workspace-indicator.tsx`
3. Remove `WorkspaceProvider` from root layout
4. Update/delete legacy docs

---

## Migration Checklist

### Phase 1: Foundation
- [ ] Create `src/app/[workspace]/layout.tsx`
- [ ] Implement slug → ID resolution
- [ ] Implement workspace sync in layout
- [ ] Handle reserved routes (login, select, api)
- [ ] Test layout renders children after sync

### Phase 2: Entry Point
- [ ] Create `src/app/select/page.tsx` (workspace selector)
- [ ] Auto-redirect if single workspace
- [ ] Test selection navigates to `/hq`

### Phase 3: Dashboard
- [ ] Create `src/app/[workspace]/page.tsx`
- [ ] Copy dashboard logic (remove refreshKey)
- [ ] Test dashboard loads at `/hq`

### Phase 4: Page Migration
- [ ] `/[workspace]/campaigns` (campaigns-hub)
- [ ] `/[workspace]/campaigns/[id]/configure` (customize)
- [ ] `/[workspace]/campaigns/[id]/messages`
- [ ] `/[workspace]/campaigns/[id]/assign-emails`
- [ ] `/[workspace]/email-accounts`
- [ ] `/[workspace]/email-accounts/settings`
- [ ] `/[workspace]/access-leads`
- [ ] `/[workspace]/leads`
- [ ] `/[workspace]/inbox` (Master Inbox - new)

### Phase 5: Navigation
- [ ] Create `useWorkspaceNav()` hook
- [ ] Update all internal links to use slug
- [ ] Create `WorkspaceNav` component

### Phase 6: Workspace Switcher
- [ ] Add switcher to workspace layout
- [ ] Test switching preserves current page (`/hq/inbox` → `/acme/inbox`)

### Phase 7: DNS & Domain
- [ ] Add `ops.zone` to Vercel project
- [ ] Configure DNS for ops.zone → Vercel
- [ ] Update middleware for new routes
- [ ] Test auth flow with new URLs

### Phase 8: Clean Up
- [ ] Remove WorkspaceContext (or simplify)
- [ ] Remove refreshKey pattern
- [ ] Delete legacy `/admin/*` routes
- [ ] Update docs

---

## Benefits After Migration

| Aspect | Before | After |
|--------|--------|-------|
| Stale data bugs | Possible (forget refreshKey) | Impossible |
| Multi-tab workflows | Confusing | Clean |
| Bookmarkable workspaces | No | Yes (`ops.zone/hq/inbox`) |
| Shareable links | No | Yes |
| URL readability | N/A | Human-readable (`/hq/campaigns`) |
| Debugging | "What workspace?" | Look at URL |
| Code complexity | useWorkspace everywhere | Layout handles it |

---

## Notes

- **Auth is already implemented** — login page and middleware protect all routes except `/` and `/login`
- **Domain:** Moving from `admin.ops.zone` to `ops.zone` (root domain)
- **Workspace as slug:** URLs use workspace name (e.g., "hq") not numeric ID
- **No API changes needed** — same EmailBison API endpoints
- **Master Inbox depends on this** — complete before inbox implementation
- **Single workspace auto-redirect:** If user has only one workspace, `/select` redirects directly to it

---

## DNS Setup Required

Before going live with `ops.zone`:

1. Point `ops.zone` A record to Vercel: `76.76.21.21`
2. Or CNAME: `ops.zone` → `cname.vercel-dns.com`
3. Add `ops.zone` as domain in Vercel project settings
4. Can keep `admin.ops.zone` as alias during transition

---

*This replaces the deprecated `workspace-context-plan.md` and consolidates the migration strategy from `workspace-architecture-decision.md`.*

