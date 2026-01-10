# URL-Based Workspace Migration Plan

**Date:** January 10, 2026 (Updated)  
**Status:** Ready to Implement  
**Domain:** admin.ops.zone  
**Priority:** High — Foundation for Master Inbox

---

## Summary

Migrate from context-based workspace state (`refreshKey` pattern) to URL-based workspaces where the workspace ID is embedded in the URL path. This eliminates stale data bugs and enables multi-tab workflows.

---

## Target URL Structure

```
admin.ops.zone/
├── /                           → Black landing page (public)
├── /login                      → Auth (public)
├── /admin                      → Workspace selector / redirect
│
└── /workspace/[id]/            → Workspace-scoped routes
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

---

## Current State vs Target State

| Current | Target |
|---------|--------|
| `/admin/campaigns-hub` | `/workspace/[id]/campaigns` |
| `/admin/email-accounts` | `/workspace/[id]/email-accounts` |
| `/admin/email-accounts/settings` | `/workspace/[id]/email-accounts/settings` |
| `/admin/campaigns/customize` | `/workspace/[id]/campaigns/[campaignId]/configure` |
| `/admin/campaigns/messages` | `/workspace/[id]/campaigns/[campaignId]/messages` |
| `/admin/campaigns/assign-emails` | `/workspace/[id]/campaigns/[campaignId]/assign-emails` |
| `/admin/access-leads` | `/workspace/[id]/access-leads` |
| `/(dashboard)/page.tsx` | `/workspace/[id]/page.tsx` |
| `/admin/page.tsx` | `/admin` (workspace selector) |

---

## New File Structure

```
src/app/
├── (public)/                       # Unauthenticated routes
│   ├── page.tsx                    # Black landing
│   └── login/page.tsx              # Login form
│
├── admin/
│   └── page.tsx                    # Workspace selector (redirects to /workspace/[id])
│
├── workspace/
│   └── [workspaceId]/
│       ├── layout.tsx              # KEY: Syncs EmailBison session
│       ├── page.tsx                # Workspace dashboard
│       ├── campaigns/
│       │   ├── page.tsx            # Campaign list
│       │   ├── create/page.tsx
│       │   └── [campaignId]/
│       │       ├── configure/page.tsx
│       │       ├── messages/page.tsx
│       │       └── assign-emails/page.tsx
│       ├── email-accounts/
│       │   ├── page.tsx            # Email account list
│       │   └── settings/page.tsx
│       ├── inbox/
│       │   └── page.tsx            # Master Inbox
│       ├── leads/
│       │   └── page.tsx
│       └── access-leads/
│           └── page.tsx
│
├── api/                            # API routes (unchanged)
└── layout.tsx                      # Root layout
```

---

## Implementation Phases

### Phase 1: Create Workspace Layout (Foundation)

**File:** `src/app/workspace/[workspaceId]/layout.tsx`

```tsx
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

async function syncWorkspace(workspaceId: number) {
  // Call server-side to ensure EmailBison session matches
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/emailbison/workspaces/switch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ workspaceId }),
    cache: 'no-store',
  });
  return res.ok;
}

export default async function WorkspaceLayout({
  params,
  children,
}: {
  params: Promise<{ workspaceId: string }>;
  children: React.ReactNode;
}) {
  const { workspaceId } = await params;
  const id = parseInt(workspaceId, 10);
  
  if (isNaN(id)) {
    redirect('/admin');
  }
  
  // Sync EmailBison session to this workspace
  await syncWorkspace(id);
  
  return (
    <Suspense fallback={<WorkspaceLoading />}>
      <WorkspaceShell workspaceId={id}>
        {children}
      </WorkspaceShell>
    </Suspense>
  );
}

function WorkspaceLoading() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-zinc-500">Loading workspace...</div>
    </div>
  );
}
```

**Key point:** The layout syncs EmailBison BEFORE rendering children. Pages don't need to know about workspace switching.

---

### Phase 2: Create Workspace Selector (Entry Point)

**File:** `src/app/admin/page.tsx` (modify existing)

```tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface Workspace {
  id: number;
  name: string;
}

export default function AdminPage() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  useEffect(() => {
    async function loadWorkspaces() {
      const res = await fetch('/api/emailbison/workspaces');
      const data = await res.json();
      setWorkspaces(data.data || []);
      setLoading(false);
      
      // Auto-redirect if only one workspace
      if (data.data?.length === 1) {
        router.push(`/workspace/${data.data[0].id}`);
      }
    }
    loadWorkspaces();
  }, [router]);
  
  function handleSelect(id: number) {
    router.push(`/workspace/${id}`);
  }
  
  if (loading) return <LoadingState />;
  
  return (
    <div className="min-h-screen bg-black p-8">
      <h1 className="text-2xl font-bold text-white mb-6">Select Workspace</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {workspaces.map((ws) => (
          <Card 
            key={ws.id}
            className="cursor-pointer hover:border-zinc-600 transition-colors"
            onClick={() => handleSelect(ws.id)}
          >
            <CardHeader>
              <CardTitle>{ws.name}</CardTitle>
              <CardDescription>Workspace #{ws.id}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

---

### Phase 3: Move Dashboard to Workspace Route

**From:** `src/app/(dashboard)/page.tsx`  
**To:** `src/app/workspace/[workspaceId]/page.tsx`

The dashboard component stays mostly the same, just remove any `useWorkspace()` / `refreshKey` dependencies.

---

### Phase 4: Move Existing Pages

For each page, the migration is:

1. Move file to new location under `/workspace/[workspaceId]/`
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

// AFTER: src/app/workspace/[workspaceId]/campaigns/page.tsx
useEffect(() => {
  fetchCampaigns();
}, []); // No refreshKey needed - URL change = remount
```

---

### Phase 5: Update Navigation Components

All internal links must include workspace ID:

```tsx
// BEFORE
<Link href="/admin/campaigns-hub">Campaigns</Link>

// AFTER (in workspace context)
<Link href={`/workspace/${workspaceId}/campaigns`}>Campaigns</Link>
```

Create a helper hook:

```tsx
// src/hooks/use-workspace-nav.ts
import { useParams } from 'next/navigation';

export function useWorkspaceNav() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  
  return {
    workspaceId,
    href: (path: string) => `/workspace/${workspaceId}${path}`,
  };
}

// Usage
const { href } = useWorkspaceNav();
<Link href={href('/campaigns')}>Campaigns</Link>
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
  const workspaceId = params.workspaceId as string;
  const basePath = `/workspace/${workspaceId}`;
  
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

---

### Phase 7: Workspace Switcher (In-App)

Add switcher to workspace layout header:

```tsx
'use client';

import { useRouter, useParams, usePathname } from 'next/navigation';

export function WorkspaceSwitcher({ workspaces, currentId }) {
  const router = useRouter();
  const pathname = usePathname();
  
  function handleSwitch(newId: number) {
    // Replace workspace ID in current path
    const newPath = pathname.replace(
      /\/workspace\/\d+/,
      `/workspace/${newId}`
    );
    router.push(newPath);
  }
  
  return (
    <select value={currentId} onChange={(e) => handleSwitch(Number(e.target.value))}>
      {workspaces.map(ws => (
        <option key={ws.id} value={ws.id}>{ws.name}</option>
      ))}
    </select>
  );
}
```

**Key:** Switching workspace navigates to NEW URL, preserving the current page path.

---

### Phase 8: Clean Up

1. Delete `src/contexts/workspace-context.tsx` (or keep minimal version for workspace info only)
2. Delete `src/components/workspace-indicator.tsx`
3. Remove `WorkspaceProvider` from root layout
4. Update/delete legacy docs

---

## Migration Checklist

### Phase 1: Foundation
- [ ] Create `src/app/workspace/[workspaceId]/layout.tsx`
- [ ] Implement workspace sync in layout
- [ ] Test layout renders children after sync

### Phase 2: Entry Point
- [ ] Update `src/app/admin/page.tsx` as workspace selector
- [ ] Auto-redirect if single workspace
- [ ] Test selection navigates correctly

### Phase 3: Dashboard
- [ ] Create `src/app/workspace/[workspaceId]/page.tsx`
- [ ] Copy dashboard logic (remove refreshKey)
- [ ] Test dashboard loads for workspace

### Phase 4: Page Migration
- [ ] `/campaigns` (campaigns-hub)
- [ ] `/campaigns/[id]/configure` (customize)
- [ ] `/campaigns/[id]/messages`
- [ ] `/campaigns/[id]/assign-emails`
- [ ] `/email-accounts`
- [ ] `/email-accounts/settings`
- [ ] `/access-leads`
- [ ] `/leads`

### Phase 5: Navigation
- [ ] Create `useWorkspaceNav()` hook
- [ ] Update all internal links
- [ ] Create `WorkspaceNav` component

### Phase 6: Workspace Switcher
- [ ] Add switcher to workspace layout
- [ ] Test switching preserves current page

### Phase 7: Clean Up
- [ ] Remove WorkspaceContext
- [ ] Remove refreshKey pattern
- [ ] Delete legacy components
- [ ] Update docs

---

## Benefits After Migration

| Aspect | Before | After |
|--------|--------|-------|
| Stale data bugs | Possible (forget refreshKey) | Impossible |
| Multi-tab workflows | Confusing | Clean |
| Bookmarkable workspaces | No | Yes |
| Shareable links | No | Yes |
| Debugging | "What workspace?" | Look at URL |
| Code complexity | useWorkspace everywhere | Layout handles it |

---

## Notes

- **Auth is already implemented** — login page and middleware protect all routes except `/` and `/login`
- **Domain is set** — admin.ops.zone
- **No API changes needed** — same EmailBison API endpoints
- **Master Inbox depends on this** — complete before inbox implementation

---

*This replaces the deprecated `workspace-context-plan.md` and consolidates the migration strategy from `workspace-architecture-decision.md`.*

