# EmailBison API Integration Architecture

> **Status**: Planning  
> **Created**: 2026-01-09  
> **Criticality**: Mission-Critical Infrastructure

---

## Executive Summary

This document defines the architecture for integrating the EmailBison API into our application. The goal is a **resilient, maintainable, and UI-agnostic** integration layer that survives refactors, scales with feature growth, and fails gracefully under adverse conditions.

---

## Problem Statement

We need to connect UI actions to EmailBison API operations. Naive approaches create tight coupling between components and API calls, leading to:

1. **Fragility** — Moving a component breaks API logic
2. **Duplication** — Same API call implemented multiple times
3. **Inconsistent error handling** — Each component handles failures differently
4. **Testing nightmares** — Can't test API logic without rendering components
5. **Type drift** — API contracts change, types get out of sync

---

## Design Principles

### 1. Separation of Concerns
API logic, state management, and UI rendering are **three distinct responsibilities**. They live in separate layers and communicate through well-defined interfaces.

### 2. Single Source of Truth
One place for API types. One place for each API operation. One way to handle errors. Duplication is a bug.

### 3. Fail-Safe by Default
Every API call assumes the network is hostile. Timeouts, retries, and graceful degradation are not afterthoughts—they're built into the foundation.

### 4. Contract-First Development
Types are derived from the OpenAPI specification. The API contract is the source of truth, not our assumptions about it.

### 5. UI Independence
The API layer has **zero knowledge** of React, Next.js, or any UI framework. It's pure TypeScript. This means:
- Components can be moved, renamed, or deleted without touching API code
- API logic can be tested in isolation
- We can swap UI frameworks without rewriting the integration

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        UI COMPONENTS                            │
│         (React components - render UI, handle user input)       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ import { useCampaigns } from '@/hooks/emailbison'
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        REACT HOOKS                              │
│     (State management, loading states, error boundaries)        │
│                                                                 │
│   - useCampaigns()                                              │
│   - useLeads()                                                  │
│   - useEmailAccounts()                                          │
│   - useMutation() wrappers for write operations                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ import { campaigns } from '@/lib/emailbison'
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SERVICE LAYER                              │
│        (Pure functions - one function per API operation)        │
│                                                                 │
│   lib/emailbison/services/                                      │
│   ├── campaigns.ts    → createCampaign, getCampaigns, etc.      │
│   ├── leads.ts        → getLeads, createLead, etc.              │
│   ├── email-accounts.ts                                         │
│   ├── replies.ts                                                │
│   └── workspaces.ts                                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ import { client } from './client'
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       HTTP CLIENT                               │
│    (Base configuration, auth, interceptors, error handling)     │
│                                                                 │
│   - Base URL configuration                                      │
│   - Bearer token injection                                      │
│   - Request/response interceptors                               │
│   - Timeout enforcement                                         │
│   - Retry logic with exponential backoff                        │
│   - Error normalization                                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/HTTPS
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     EMAILBISON API                              │
│                   (External service)                            │
└─────────────────────────────────────────────────────────────────┘
```

---

## Directory Structure

```
src/
├── lib/
│   └── emailbison/
│       ├── client.ts           # HTTP client with auth, retries, timeouts
│       ├── types.ts            # Types derived from OpenAPI spec
│       ├── errors.ts           # Custom error classes
│       ├── index.ts            # Public API (re-exports)
│       └── services/
│           ├── campaigns.ts    # Campaign CRUD + operations
│           ├── leads.ts        # Lead management
│           ├── email-accounts.ts
│           ├── replies.ts
│           ├── webhooks.ts
│           ├── warmup.ts
│           └── workspaces.ts
│
├── hooks/
│   └── emailbison/
│       ├── use-campaigns.ts
│       ├── use-leads.ts
│       ├── use-email-accounts.ts
│       ├── use-mutation.ts     # Generic mutation wrapper
│       └── index.ts
│
└── types/
    └── index.ts                # Internal UI types (separate from API types)
```

---

## Layer Responsibilities

### Layer 1: HTTP Client (`lib/emailbison/client.ts`)

**Responsibility**: Low-level HTTP operations with built-in resilience.

**Features**:
- Configurable base URL (environment-aware)
- Automatic Bearer token injection
- Request timeout enforcement (default: 30s)
- Retry logic with exponential backoff for transient failures (5xx, network errors)
- Response interceptor for error normalization
- Request/response logging in development

**Example**:
```typescript
// client.ts
export interface ClientConfig {
  baseUrl: string;
  apiKey: string;
  timeout?: number;
  retries?: number;
}

export function createClient(config: ClientConfig) {
  // Returns typed request methods: get, post, put, patch, delete
}
```

### Layer 2: Service Functions (`lib/emailbison/services/*.ts`)

**Responsibility**: One function per API endpoint. Pure functions, no side effects, no state.

**Constraints**:
- No React imports
- No global state
- Input: typed parameters
- Output: `Promise<T>` where T is the API response type
- Errors: throw typed errors (never swallow)

**Example**:
```typescript
// services/campaigns.ts
import { client } from '../client';
import type { Campaign, CreateCampaignRequest } from '../types';

export async function getCampaigns(): Promise<Campaign[]> {
  return client.get('/api/campaigns');
}

export async function createCampaign(data: CreateCampaignRequest): Promise<Campaign> {
  return client.post('/api/campaign/create', data);
}

export async function pauseCampaign(campaignId: string): Promise<Campaign> {
  return client.patch(`/api/campaign/${campaignId}/status`, { status: 'paused' });
}
```

### Layer 3: React Hooks (`hooks/emailbison/*.ts`)

**Responsibility**: Bridge between UI and services. Manages loading/error states, caching, optimistic updates.

**Features**:
- Wrap service calls with loading/error state
- Handle cache invalidation
- Provide optimistic update patterns for mutations
- Expose refetch mechanisms

**Example**:
```typescript
// hooks/emailbison/use-campaigns.ts
export function useCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // ... implementation

  return { campaigns, isLoading, error, refetch };
}

export function useCreateCampaign() {
  // Mutation hook with loading state, error handling, success callback
}
```

### Layer 4: UI Components

**Responsibility**: Render UI. Respond to user input. Nothing else.

**Constraints**:
- Import from hooks only (`@/hooks/emailbison`)
- Never import from `@/lib/emailbison` directly
- No API logic in components
- No error handling beyond displaying error states

---

## Type Strategy

### API Types (`lib/emailbison/types.ts`)

These types represent the **exact shape** of API requests and responses. They are derived from the OpenAPI specification and should be updated when the API changes.

```typescript
// Directly from OpenAPI spec
export interface EmailBisonCampaign {
  id: number;
  name: string;
  status: 'active' | 'paused' | 'draft' | 'completed';
  created_at: string;
  // ... exact API fields
}
```

### Internal Types (`types/index.ts`)

These types represent our **application's domain model**. They may differ from API types.

```typescript
// Internal representation
export interface Campaign {
  id: string;  // We convert number → string
  name: string;
  status: CampaignStatus;
  createdAt: Date;  // We convert string → Date
  // ... UI-friendly fields
}
```

### Transformation Layer

Hooks are responsible for transforming API types ↔ internal types:

```typescript
function toCampaign(api: EmailBisonCampaign): Campaign {
  return {
    id: String(api.id),
    name: api.name,
    status: api.status,
    createdAt: new Date(api.created_at),
  };
}
```

---

## Error Handling Strategy

### Error Hierarchy

```typescript
// lib/emailbison/errors.ts

export class EmailBisonError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode?: number,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'EmailBisonError';
  }
}

export class NetworkError extends EmailBisonError {
  constructor(message: string) {
    super(message, 'NETWORK_ERROR');
  }
}

export class AuthenticationError extends EmailBisonError {
  constructor() {
    super('Invalid or expired API key', 'AUTH_ERROR', 401);
  }
}

export class RateLimitError extends EmailBisonError {
  constructor(public readonly retryAfter?: number) {
    super('Rate limit exceeded', 'RATE_LIMIT', 429);
  }
}

export class ValidationError extends EmailBisonError {
  constructor(message: string, public readonly fields?: Record<string, string>) {
    super(message, 'VALIDATION_ERROR', 400);
  }
}
```

### Error Flow

1. **Client layer**: Catches HTTP errors, normalizes to typed errors
2. **Service layer**: Throws errors (no catching)
3. **Hook layer**: Catches errors, sets error state, optionally retries
4. **Component layer**: Displays error UI based on error type

---

## Alternative Approaches Considered (And Rejected)

### ❌ Alternative 1: API Calls Directly in Components

```typescript
// BAD: Tight coupling
function CampaignList() {
  useEffect(() => {
    fetch('/api/campaigns', { headers: { Authorization: `Bearer ${key}` } })
      .then(res => res.json())
      .then(setCampaigns);
  }, []);
}
```

**Why rejected**:
- Every component reimplements auth, error handling, parsing
- Moving the component means moving all the API logic
- Can't test API logic without rendering the component
- Duplicate code across components calling the same endpoint

### ❌ Alternative 2: Single Monolithic API Module

```typescript
// BAD: God object
// lib/api.ts - 3000 lines, handles everything
export const api = {
  campaigns: { ... },
  leads: { ... },
  accounts: { ... },
  // ...
}
```

**Why rejected**:
- Becomes unmaintainable as endpoints grow
- Can't tree-shake unused endpoints
- Single file becomes a merge conflict magnet
- Harder to find specific functionality

### ❌ Alternative 3: Auto-Generated SDK from OpenAPI

Tools like `openapi-generator` or `orval` can auto-generate a full SDK.

**Why rejected**:
- Generated code is often verbose and hard to customize
- Loses control over error handling patterns
- Generated types may not match our internal conventions
- Debugging generated code is painful
- We need **resilience patterns** (retries, timeouts) that generators don't provide well

**Compromise**: We use the OpenAPI spec as a **reference** for types and endpoints, but we write the implementation ourselves.

### ❌ Alternative 4: GraphQL Wrapper

Wrap the REST API in a GraphQL layer to get type safety and query flexibility.

**Why rejected**:
- Adds unnecessary complexity for a well-defined REST API
- Extra infrastructure (GraphQL server)
- Overkill for our use case
- Latency overhead

---

## Implementation Phases

### Phase 1: Foundation
- [ ] Create `lib/emailbison/client.ts` with base configuration
- [ ] Create `lib/emailbison/errors.ts` with error hierarchy
- [ ] Create `lib/emailbison/types.ts` with core types from OpenAPI
- [ ] Create `lib/emailbison/index.ts` with public exports

### Phase 2: Core Services
- [ ] Implement `services/campaigns.ts` (highest priority)
- [ ] Implement `services/leads.ts`
- [ ] Implement `services/email-accounts.ts`

### Phase 3: React Integration
- [ ] Create `hooks/emailbison/use-campaigns.ts`
- [ ] Create `hooks/emailbison/use-leads.ts`
- [ ] Create `hooks/emailbison/use-mutation.ts` (generic mutation pattern)

### Phase 4: Migration
- [ ] Replace mock data calls with real API calls
- [ ] Remove `lib/data.ts` mock data
- [ ] End-to-end testing

### Phase 5: Advanced Features
- [ ] Implement remaining services (webhooks, warmup, etc.)
- [ ] Add request caching layer
- [ ] Add optimistic updates for mutations
- [ ] Add request deduplication

---

## Testing Strategy

### Unit Tests (Service Layer)
- Mock the HTTP client
- Test each service function in isolation
- Verify correct URL, method, and payload for each operation
- Test error handling paths

### Integration Tests (Hook Layer)
- Mock the service layer
- Test state transitions (loading → success, loading → error)
- Test refetch and mutation flows

### E2E Tests (Full Stack)
- Use a test EmailBison workspace
- Verify real API operations work end-to-end
- Run on staging, not production

---

## Security Considerations

1. **API Key Storage**: Never commit API keys. Use environment variables.
2. **Client-Side Exposure**: If API calls are made client-side, the key is exposed. Consider a backend proxy for sensitive operations.
3. **Rate Limiting**: Implement client-side rate limiting to avoid burning through quotas.
4. **Input Validation**: Validate inputs before sending to API to fail fast and reduce unnecessary requests.

---

## Open Questions

1. **Server vs Client API Calls**: Should we proxy all API calls through our Next.js backend to hide the API key from the client?
2. **Caching Strategy**: How aggressively should we cache? What's the TTL?
3. **Offline Support**: Do we need any offline capabilities or queue-and-retry for mutations?

---

## Appendix: EmailBison API Endpoint Categories

Based on the OpenAPI specification:

| Category | Key Endpoints | Priority |
|----------|--------------|----------|
| Campaigns v1.1 | Create, List, Update, Pause, Resume, Delete, Stats | **High** |
| Leads | List, Create, Update, Delete, Add to Campaign | **High** |
| Email Accounts | List, Create, Update, Delete, Connect | **High** |
| Replies | List, Mark Read/Unread, Reply | Medium |
| Webhooks | Create, List, Delete | Medium |
| Warmup | Enable, Disable, Stats | Medium |
| Workspaces | List, Switch, Create, Stats | Low |
| Blacklists | Email/Domain blacklist management | Low |
| Custom Tags | Tag management | Low |

