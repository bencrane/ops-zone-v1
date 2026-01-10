# Workspace Pages Migration Plan

## Overview

Migrate functional admin pages to workspace-scoped routes so that all features work from within a workspace context (e.g., `/hq/campaigns/configure`).

**Goal:** When a user is in workspace `/hq`, clicking through cards should lead to fully functional pages—not 404s or placeholders.

**Approach:** Copy functional code from `/admin/*` pages to `/[workspace]/*` equivalents, updating navigation to be workspace-aware.

---

## Current State

| Route | Status |
|-------|--------|
| `/hq` | ✅ Dashboard with cards |
| `/hq/campaigns` | ✅ Hub page with sub-cards |
| `/hq/campaigns/configure` | ❌ 404 |
| `/hq/campaigns/create` | ❌ 404 |
| `/hq/campaigns/assign-emails` | ❌ 404 |
| `/hq/campaigns/messages` | ❌ 404 |
| `/hq/campaigns/manage` | ❌ 404 |
| `/hq/email-accounts` | ✅ Hub page with sub-cards |
| `/hq/email-accounts/view` | ❌ 404 |
| `/hq/email-accounts/settings` | ❌ 404 |
| `/hq/email-accounts/add` | ❌ 404 |

---

## Phase 1: Campaign Pages (Priority: HIGH)

Migrate the 5 campaign-related functional pages.

### Task 1.1: Create Campaign Page
- **Source:** `src/app/admin/campaigns/create/page.tsx`
- **Target:** `src/app/[workspace]/campaigns/create/page.tsx`
- **Changes:**
  - Import `useWorkspaceNav` hook
  - Replace `href="/admin/..."` with `href('/...')` from hook
  - Update back link to `/[workspace]/campaigns`

### Task 1.2: Configure Campaign Page
- **Source:** `src/app/admin/campaigns/customize/page.tsx`
- **Target:** `src/app/[workspace]/campaigns/configure/page.tsx`
- **Changes:**
  - Import `useWorkspaceNav` hook
  - Update all navigation links
  - This is the most complex page (campaign settings + schedule)

### Task 1.3: Assign Emails Page
- **Source:** `src/app/admin/campaigns/assign-emails/page.tsx`
- **Target:** `src/app/[workspace]/campaigns/assign-emails/page.tsx`
- **Changes:**
  - Import `useWorkspaceNav` hook
  - Update navigation links

### Task 1.4: Messages/Sequences Page
- **Source:** `src/app/admin/campaigns/messages/page.tsx`
- **Target:** `src/app/[workspace]/campaigns/messages/page.tsx`
- **Changes:**
  - Import `useWorkspaceNav` hook
  - Update navigation links
  - Complex page with sequence step editing

### Task 1.5: Campaign Management Page
- **Source:** `src/app/admin/emailbison/campaigns/page.tsx`
- **Target:** `src/app/[workspace]/campaigns/manage/page.tsx`
- **Changes:**
  - Import `useWorkspaceNav` hook
  - Update navigation links
  - Handles pause/resume/delete actions

---

## Phase 2: Email Account Pages (Priority: MEDIUM)

Migrate the 3 email account management pages.

### Task 2.1: View Email Accounts Page
- **Source:** `src/app/admin/email-accounts/view/page.tsx`
- **Target:** `src/app/[workspace]/email-accounts/view/page.tsx`
- **Changes:**
  - Import `useWorkspaceNav` hook
  - Update navigation links

### Task 2.2: Email Account Settings Page
- **Source:** `src/app/admin/email-accounts/settings/page.tsx`
- **Target:** `src/app/[workspace]/email-accounts/settings/page.tsx`
- **Changes:**
  - Import `useWorkspaceNav` hook
  - Update navigation links
  - Handles sender name, signature, daily limit editing

### Task 2.3: Add Email Account Page
- **Source:** `src/app/admin/email-accounts/add/page.tsx`
- **Target:** `src/app/[workspace]/email-accounts/add/page.tsx`
- **Changes:**
  - Import `useWorkspaceNav` hook
  - Update navigation links

---

## Phase 3: Hub Link Updates

Ensure hub pages link to correct sub-routes.

### Task 3.1: Update Campaigns Hub
- **File:** `src/app/[workspace]/campaigns/page.tsx`
- **Verify:** All card hrefs use `href()` function correctly

### Task 3.2: Update Email Accounts Hub
- **File:** `src/app/[workspace]/email-accounts/page.tsx`
- **Verify:** All card hrefs use `href()` function correctly

---

## Phase 4: Testing & Verification

### Task 4.1: Campaign Workflow Test
1. Navigate to `/hq/campaigns`
2. Click "Create Campaign" → verify form works
3. Click "Configure Campaign" → verify settings + schedule work
4. Click "Assign Email Accounts" → verify assignment works
5. Click "Customize Messages" → verify sequence editing works
6. Click "Campaign Management" → verify pause/resume/delete works

### Task 4.2: Email Accounts Workflow Test
1. Navigate to `/hq/email-accounts`
2. Click "View Email Accounts" → verify list displays
3. Click "Email Account Settings" → verify editing works
4. Click "Add Email Account" → verify add flow works

### Task 4.3: Workspace Switching Test
1. Complete workflow in `/hq`
2. Switch to different workspace (e.g., `/test-client`)
3. Verify data changes appropriately

---

## Out of Scope (Future Work)

These remain as placeholders for now:

- **Inbox** (`/[workspace]/inbox`) - Master Inbox feature (separate project)
- **Access Leads** (`/[workspace]/access-leads`) - Depends on HQ Data API
- **Lead Lists** (`/[workspace]/lead-lists`) - Depends on Supabase integration
- **Leads** (`/[workspace]/leads`) - Depends on campaign leads API

---

## Implementation Notes

### Migration Pattern

```typescript
// Before (admin page)
import Link from "next/link";
// ...
<Link href="/admin/campaigns-hub">Back</Link>

// After (workspace page)
import Link from "next/link";
import { useWorkspaceNav } from "@/hooks/use-workspace-nav";
// ...
const { href } = useWorkspaceNav();
// ...
<Link href={href("/campaigns")}>Back</Link>
```

### Why This Works

1. The workspace layout (`/[workspace]/layout.tsx`) calls `switchWorkspace(id)` before rendering children
2. This sets the EmailBison API session to the correct workspace
3. All `/api/emailbison/*` calls automatically use this session
4. No changes needed to API routes

### File Structure After Migration

```
src/app/[workspace]/
├── page.tsx                      # Dashboard
├── layout.tsx                    # Workspace layout + header
├── campaigns/
│   ├── page.tsx                  # Hub
│   ├── create/page.tsx           # NEW
│   ├── configure/page.tsx        # NEW
│   ├── assign-emails/page.tsx    # NEW
│   ├── messages/page.tsx         # NEW
│   └── manage/page.tsx           # NEW
├── email-accounts/
│   ├── page.tsx                  # Hub
│   ├── view/page.tsx             # NEW
│   ├── settings/page.tsx         # NEW
│   └── add/page.tsx              # NEW
├── inbox/page.tsx                # Placeholder
├── leads/page.tsx                # Placeholder
├── access-leads/page.tsx         # Placeholder
├── lead-lists/page.tsx           # Placeholder
└── settings/page.tsx             # Placeholder
```

---

## Estimated Effort

| Phase | Pages | Complexity | Estimate |
|-------|-------|------------|----------|
| Phase 1 | 5 | High | ~2 hours |
| Phase 2 | 3 | Medium | ~1 hour |
| Phase 3 | 2 | Low | ~15 min |
| Phase 4 | - | Testing | ~30 min |
| **Total** | **10** | | **~4 hours** |

---

## Success Criteria

- [ ] All campaign cards navigate to functional pages
- [ ] All email account cards navigate to functional pages
- [ ] Back buttons return to correct workspace hub
- [ ] Data loads correctly for selected workspace
- [ ] Mutations (save, create, delete) work correctly
- [ ] Workspace switching maintains correct data isolation

