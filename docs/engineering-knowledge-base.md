# Engineering Knowledge Base

**Created:** January 9, 2026  
**Purpose:** Consolidated learnings, insights, and principles from all project documentation.

---

## Table of Contents

1. [Project Identity](#project-identity)
2. [Architecture Principles](#architecture-principles)
3. [EmailBison API Deep Knowledge](#emailbison-api-deep-knowledge)
4. [Implementation Patterns](#implementation-patterns)
5. [Error Handling Strategy](#error-handling-strategy)
6. [Known Issues & Failure Modes](#known-issues--failure-modes)
7. [Development Workflow](#development-workflow)
8. [Design System Rules](#design-system-rules)
9. [MCP Tool Usage Protocol](#mcp-tool-usage-protocol)
10. [Anti-Patterns to Avoid](#anti-patterns-to-avoid)

---

## Project Identity

### What This Is
A cold email campaign management application that serves as a frontend for the **EmailBison API**. It provides UI for managing campaigns, sender email accounts, leads, and email sequences.

### Tech Stack
- **Framework:** Next.js 16.1.1 (App Router)
- **React:** 19
- **Language:** TypeScript (strict)
- **Styling:** Tailwind CSS
- **Components:** shadcn/ui
- **External API:** EmailBison (`https://app.outboundsolutions.com`)

### Core Constraint
**EmailBison is the single source of truth.** No local database. No caching state that should live in EmailBison. The frontend is a thin UI layer over EmailBison's API.

### API Key Type
The project uses a `super-admin` API key. This key:
- Provides access to all workspaces
- Follows the user's active workspace (changes when user switches workspace)
- Has elevated permissions compared to `api-user` keys

---

## Architecture Principles

### 1. Separation of Concerns (4-Layer Stack)

```
┌─────────────────────────────────────────────────────────────┐
│                     UI COMPONENTS                            │
│              (React - render UI, handle input)               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      API ROUTES                              │
│         (Next.js route handlers - proxy to services)         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    SERVICE LAYER                             │
│       (Pure functions - one per API endpoint, no React)      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     HTTP CLIENT                              │
│       (Auth, retries, timeouts, error normalization)         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    EMAILBISON API                            │
└─────────────────────────────────────────────────────────────┘
```

### 2. Single Source of Truth
- **One place** for API types (`src/lib/emailbison/types.ts`)
- **One place** for each API operation (service functions)
- **One way** to handle errors (typed error classes)
- Duplication is a bug

### 3. Fail-Safe by Default
Every API call assumes the network is hostile:
- 30-second timeout
- 3 retry attempts with exponential backoff
- Graceful degradation built into the foundation

### 4. UI Independence
The API layer has **zero knowledge** of React or Next.js. It's pure TypeScript. Benefits:
- Components can move without touching API code
- API logic testable in isolation
- Could swap UI frameworks without rewriting integration

### 5. Contract-First Development
Types derived from OpenAPI specification. The API contract is truth, not assumptions.

---

## EmailBison API Deep Knowledge

### Authentication
- **Method:** Bearer token in `Authorization` header
- **Format:** `Authorization: Bearer YOUR_API_KEY`
- **Key types:**
  - `api-user`: Scoped to one workspace, simpler
  - `super-admin`: Impersonates user, follows active workspace

### Request/Response Patterns

#### Standard Response Wrapper
```typescript
interface ApiResponse<T> {
  data: T;
}
```

#### Paginated Response
```typescript
interface PaginatedResponse<T> {
  data: T[];
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;  // Default: 15
    total: number;
  };
  links?: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
}
```

### Parameter Types

| Type | Usage | Example |
|------|-------|---------|
| **Path** | Part of URL | `/api/campaigns/{campaign_id}` → `/api/campaigns/27` |
| **Query** | Appended to URL | `/api/leads?page=2&status=active` |
| **Body** | JSON in request body | `{ "name": "My Campaign" }` |

#### Array Query Parameters
```
/api/replies?tag_ids[]=1&tag_ids[]=2&tag_ids[]=3
```

#### File Uploads
- Use `multipart/form-data`
- Do NOT manually set `Content-Type` header (auto-set by browser/fetch)

### Workspace Scoping Rules
- All records are workspace-specific
- Same lead can exist in multiple workspaces (different IDs)
- **Exception:** Sender emails can only exist in ONE workspace at a time

### Campaign Statuses
API returns capitalized strings:
```
Draft | Launching | Active | Stopped | Completed | Paused | Failed | Queued | Archived | Pending deletion | Deleted
```

Filter requests use lowercase:
```
draft | launching | active | stopped | completed | paused | failed | queued | archived | pending deletion | deleted
```

### Key Endpoints Reference

| Domain | Endpoint | Method | Purpose |
|--------|----------|--------|---------|
| **Campaigns** | `/api/campaigns` | GET | List all |
| | `/api/campaigns` | POST | Create |
| | `/api/campaigns/{id}` | GET | Get single |
| | `/api/campaigns/{id}` | DELETE | Delete |
| | `/api/campaigns/{id}/pause` | PATCH | Pause |
| | `/api/campaigns/{id}/resume` | PATCH | Resume |
| | `/api/campaigns/{id}/update` | PATCH | Update settings |
| **Sequence Steps** | `/api/campaigns/v1.1/{id}/sequence-steps` | GET | Get steps |
| | `/api/campaigns/v1.1/{id}/sequence-steps` | POST | Create steps |
| | `/api/campaigns/v1.1/sequence-steps/{sequenceId}` | PUT | Update steps |
| | `/api/campaigns/sequence-steps/{stepId}` | DELETE | Delete step |
| **Leads** | `/api/leads` | POST | Create single |
| | `/api/leads/{id}` | PUT | Update |
| | `/api/leads/bulk/csv` | POST | Bulk upload |
| | `/api/campaigns/{id}/leads/attach-lead-list` | POST | Add list to campaign |
| | `/api/campaigns/{id}/leads/attach-leads` | POST | Add leads by ID |
| **Email Accounts** | `/api/sender-emails` | GET | List all |
| | `/api/campaigns/{id}/attach-sender-emails` | POST | Assign to campaign |
| | `/api/campaigns/{id}/remove-sender-emails` | DELETE | Remove from campaign |
| **Tags** | `/api/tags` | POST | Create |
| | `/api/tags/attach-to-leads` | POST | Attach |
| | `/api/tags/attach-to-leads` | DELETE | Remove |
| **Workspaces** | `/api/workspaces` | GET | List all |
| | `/api/workspaces/v1.1/switch-workspace` | POST | Switch active |
| **Master Inbox** | `/api/leads/{id}/replies` | GET | Get replies |
| | `/api/replies/{id}/reply` | POST | Send reply |

---

## Implementation Patterns

### Adding a New API Feature

1. **Add types** to `src/lib/emailbison/types.ts`
2. **Add service function** to `src/lib/emailbison/services/{domain}.ts`
3. **Export** from `src/lib/emailbison/services/index.ts`
4. **Export** from `src/lib/emailbison/index.ts`
5. **Create API route** in `src/app/api/emailbison/`
6. **Build UI** calling API route (not service directly)

### Service Function Pattern
```typescript
export async function doSomething(param: string): Promise<ResultType> {
  const client = getClient();
  const response = await client.post<ApiResponse<ResultType>>(
    `/api/endpoint/${param}`,
    { body: 'data' }
  );
  return response.data;
}
```

### API Route Pattern
```typescript
// src/app/api/emailbison/feature/route.ts
import { NextResponse } from 'next/server';
import { serviceFn } from '@/lib/emailbison';
import { isEmailBisonError } from '@/lib/emailbison';

export async function GET() {
  try {
    const data = await serviceFn();
    return NextResponse.json({ data });
  } catch (error) {
    if (isEmailBisonError(error)) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode || 500 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

## Error Handling Strategy

### Error Hierarchy
```
EmailBisonError (base)
├── NetworkError        // DNS, connection refused
├── TimeoutError        // Exceeded 30s
├── AuthenticationError // 401
├── ForbiddenError      // 403
├── NotFoundError       // 404
├── ValidationError     // 400, 422
├── RateLimitError      // 429
└── ServerError         // 5xx
```

### Error Flow
1. **Client layer:** Catches HTTP errors → normalizes to typed errors
2. **Service layer:** Throws errors (never swallows)
3. **API route:** Catches → returns appropriate HTTP status
4. **UI:** Displays error based on type

### Retryable Errors
Only these are retried (up to 3 times with exponential backoff):
- `NetworkError`
- `TimeoutError`
- `RateLimitError`
- `ServerError`

Non-retryable (fail immediately):
- `AuthenticationError`
- `ForbiddenError`
- `NotFoundError`
- `ValidationError`

---

## Known Issues & Failure Modes

### CRITICAL: Sequence Steps API Broken

| Action | Result |
|--------|--------|
| Create first step | ✅ Works (POST) |
| Add subsequent steps | ❌ 422 Error (PUT) |
| Delete any step | ❌ 400 Error (DELETE) |

**Hypotheses:**
1. PUT may not support adding new steps (only updating existing)
2. Field name mismatch: `variant_from_step_id` vs `variant_from_step`
3. Missing required fields: `email_subject_variables: []`
4. Business rule: Cannot delete the only/last step

**Resolution requires:** Direct API testing via curl/Postman, or EmailBison support contact.

**Do not spend more engineering time until root cause confirmed.**

### Workspace Warning
Next.js shows lockfile warning due to parent directory having `package-lock.json`. Cosmetic only - does not affect functionality.

---

## Development Workflow

### Before Making Changes
1. Read relevant documentation
2. Check post-mortems for known failures
3. Use Sequential Thinking for complex decisions
4. Use Context7 to verify library/framework usage

### Testing Protocol
1. Implement feature
2. Test in UI at `localhost:3002`
3. **Verify in EmailBison dashboard** (critical!)
4. Both must work before proceeding

### Environment Variables
```
EMAILBISON_API_KEY=<super-admin key>  # Required
EMAILBISON_BASE_URL=https://app.outboundsolutions.com  # Optional, has default
```

---

## Design System Rules

### Spacing Scale (ONLY these values)
- 4px (`p-1`, `gap-1`)
- 8px (`p-2`, `gap-2`)
- 12px (`p-3`, `gap-3`)
- 16px (`p-4`, `gap-4`)
- 24px (`p-6`, `gap-6`)
- 32px (`p-8`, `gap-8`)

### Typography Scale
- **14px:** Primary text (names, titles)
- **12px:** Secondary text (emails, metadata)
- **11px:** Tertiary/labels
- **10px:** Avoid or use sparingly

### Verification Checklist (Before Committing UI Changes)
- [ ] Horizontal alignment with elements above/below
- [ ] Consistent spacing scale (no arbitrary values)
- [ ] Consistent typography scale
- [ ] Visual parity across similar components
- [ ] Full-page context, not just edited component
- [ ] Both table variants (People/Companies) if applicable
- [ ] Collapsed/expanded sidebar states

### Anti-Patterns
- Ad-hoc font sizes (`text-[10px]`, `text-[11px]` without reason)
- Arbitrary padding (`py-2` in one place, `py-3` in another)
- Component-level thinking without system-level verification

---

## MCP Tool Usage Protocol

### TIER 1: MANDATORY (Every Non-Trivial Task)

| Tool | Purpose |
|------|---------|
| `mcp_sequential-thinking_sequentialthinking` | Break down complex problems |
| `mcp_exa_get_code_context_exa` | Find current best practices |

### TIER 2: DOCUMENTATION (As Needed)

| Tool | Purpose |
|------|---------|
| `mcp_context7_resolve-library-id` + `query-docs` | Library documentation |
| `mcp_next-devtools_nextjs_docs` | Next.js APIs |
| `mcp_shadcn_*` | UI component discovery |
| `mcp_tailwind_*` | CSS utilities |

### TIER 3: COMPONENT CREATION

1. **First:** Search shadcn registry
2. **Then:** View component + examples
3. **Fallback:** Use 21st Magic to generate

### Standard Workflow
```
1. THINK    → sequential-thinking (break down problem)
2. RESEARCH → exa (get best practices)
3. LOOKUP   → shadcn/next-devtools/tailwind (specific docs)
4. IMPLEMENT → with design tokens
5. VERIFY   → test in browser
```

### Constraints
- Max 3 calls per tool per question
- Use `get_code_context_exa` for code, not `web_search_exa`
- Always read Context7 results before implementing

---

## Anti-Patterns to Avoid

### Architecture
- ❌ API calls directly in components
- ❌ Importing from `@/lib/emailbison` in UI (use API routes)
- ❌ Swallowing errors in service layer
- ❌ Local state that should be in EmailBison

### API Integration
- ❌ Guessing API behavior without checking docs
- ❌ Ignoring error response bodies (they contain field errors)
- ❌ Retrying non-retryable errors (auth, validation)
- ❌ Hardcoding workspace IDs

### UI Development
- ❌ Optimizing components in isolation
- ❌ Reactive fixes without holistic review
- ❌ Arbitrary spacing/font values
- ❌ Skipping full-page verification

### Tool Usage
- ❌ Guessing library APIs (use Context7)
- ❌ Skipping Sequential Thinking for complex problems
- ❌ Over-calling tools (max 3 per question)
- ❌ Using web search for code patterns

---

## Quick Reference: File Locations

| Purpose | Path |
|---------|------|
| HTTP Client | `src/lib/emailbison/client.ts` |
| Error Classes | `src/lib/emailbison/errors.ts` |
| API Types | `src/lib/emailbison/types.ts` |
| Service Functions | `src/lib/emailbison/services/` |
| Public API | `src/lib/emailbison/index.ts` |
| API Routes | `src/app/api/emailbison/` |
| UI Pages | `src/app/admin/` |
| Design Tokens | `src/lib/design-tokens.ts` |
| UI Components | `src/components/ui/` |

---

## Implementation Status

### Completed ✅
- Account service
- Workspaces (list, get, switch)
- Email Accounts (list, get, campaigns)
- Campaigns (full CRUD, pause/resume, settings)
- Sender Email assignment
- Sequence Steps (partial - see issues)

### Not Started 🔲
- Leads (CRUD, bulk upload, campaign assignment)
- Tags (CRUD, attach/remove)
- Master Inbox (replies, respond)
- Custom Variables
- Warmup
- Blacklists
- Webhooks

### Priority Order
1. **Leads** - Core functionality, unblocks main workflow
2. **Tags** - Simple CRUD, useful for organization
3. **Master Inbox** - Reply management
4. **Rest** - As needed

---

## Principles Summary

1. **EmailBison is truth** — Never cache what belongs in EmailBison
2. **Layers are sacred** — UI → API Route → Service → Client → EmailBison
3. **Fail loudly** — Typed errors, never swallow
4. **Verify twice** — UI works AND EmailBison shows correct data
5. **System over component** — Every change reviewed in full-page context
6. **Research before code** — Sequential Thinking + Exa before implementing
7. **No shortcuts** — Production quality, always

