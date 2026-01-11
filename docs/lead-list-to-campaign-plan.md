# Lead List → Campaign Integration Plan

## Overview

This document outlines the architecture and implementation plan for adding leads from a Lead List to an EmailBison campaign.

---

## Current State

### What Exists

| System | Data Stored |
|--------|-------------|
| **HQ Database** | Canonical person data (name, company, title, LinkedIn) — NO email yet |
| **outbound-db** | Lead Lists + membership (`lead_list_members` stores `hq_person_id` references) |
| **EmailBison** | Campaigns, email sending, requires `email` to create leads |

### The Gap

- Lead Lists store `hq_person_id` (HQ database UUIDs)
- EmailBison requires `email` to create leads
- HQ currently doesn't have email field exposed

---

## Required HQ Changes

### 1. Email Storage

Add email table/column to HQ database:

```sql
-- Option: Separate email table
CREATE TABLE emails (
  person_id UUID PRIMARY KEY,  -- references person
  email TEXT NOT NULL,
  source TEXT,                 -- 'enrichment', 'manual', 'apollo', etc.
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 2. New View

```sql
CREATE VIEW vw_people_with_email AS
SELECT 
  p.*,
  e.email  -- NULL if not enriched
FROM people p
LEFT JOIN emails e ON p.id = e.person_id;
```

### 3. New API Endpoint

```
GET /api/people/enriched
```

**Query Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `ids` | string | No | Comma-separated UUIDs to fetch specific people |
| `limit` | integer | No | Results per page (1-100, default 20) |
| `offset` | integer | No | Pagination offset |
| *(existing filters)* | | | name, title, company, etc. |

**Response Shape:**

```typescript
interface PersonWithEmail {
  id: string;
  linkedin_url: string | null;
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  job_title: string | null;
  company_name: string | null;
  company_domain: string | null;
  // ... other existing fields
  email: string | null;  // NEW - null if not enriched
}
```

---

## Add-to-Campaign Flow

### User Action
User clicks "Add to Campaign" on a Lead List in the UI.

### System Flow

```
1. Get hq_person_ids from lead_list_members WHERE lead_list_id = X

2. Call HQ API:
   GET /api/people/enriched?ids=uuid1,uuid2,uuid3

3. Filter response:
   - Keep only people where email IS NOT NULL

4. For each person with email:
   POST to EmailBison /api/leads
   {
     first_name: person.first_name,
     last_name: person.last_name,
     email: person.email,
     company: person.company_name,
     title: person.job_title
   }
   → Returns emailbison_lead_id

5. Attach all leads to campaign:
   POST /api/campaigns/{campaign_id}/leads/attach-leads
   { lead_ids: [all collected emailbison_lead_ids] }

6. Return result to UI:
   "Added 5 of 7 leads to campaign (2 missing email)"
```

---

## Architecture Diagram

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   outbound-db   │     │   HQ Database   │     │   EmailBison    │
│                 │     │                 │     │                 │
│  lead_lists     │     │  people         │     │  campaigns      │
│  lead_list_     │────▶│  emails         │────▶│  leads          │
│  members        │     │  vw_people_     │     │                 │
│  (hq_person_id) │     │  with_email     │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
       │                        │                       │
       │                        │                       │
       ▼                        ▼                       ▼
   "Which leads              "Full person           "Send emails
    are in list"              data + email"          to leads"
```

---

## Key Design Decisions

### Why not store email in outbound-db?

- HQ is the single source of truth for all person data
- Avoids duplication and sync issues
- Enrichment updates in HQ are immediately available
- outbound-db only stores operational data (list membership, not person attributes)

### Why reference-only storage?

- `lead_list_members` stores only `hq_person_id` (not full person data)
- At runtime, always query HQ for fresh data
- If person is enriched after being added to list, the email is available automatically

### What about leads without email?

- They remain in the Lead List (valid)
- They are skipped when adding to campaign (silent filter)
- UI shows: "Added X of Y leads (Z missing email)"
- User can enrich and retry later

---

## Implementation Checklist

### HQ Side (User to build)
- [ ] Create email storage (table or column)
- [ ] Create view with email field (nullable)
- [ ] Create `/api/people/enriched` endpoint with `ids` parameter
- [ ] Ensure endpoint returns email field (null if not present)

### ops-zone Side (To build after HQ ready)
- [ ] Create proxy route: `GET /api/hq/people/enriched`
- [ ] Add "Add to Campaign" button on Lead Lists page
- [ ] Create campaign selection dialog
- [ ] Implement add-to-campaign API route
- [ ] Wire up EmailBison lead creation + campaign attachment
- [ ] Add success/partial success UI feedback

---

## EmailBison API Reference

### Create Lead
```
POST /api/leads
{
  "first_name": "John",      // required
  "last_name": "Doe",        // required
  "email": "john@doe.com",   // required
  "title": "Engineer",       // optional
  "company": "Acme Inc"      // optional
}
```

### Attach Leads to Campaign
```
POST /api/campaigns/{campaign_id}/leads/attach-leads
{
  "lead_ids": [1, 2, 3]  // EmailBison lead IDs
}
```

> Note: Leads sync to active campaigns within 5 minutes.

---

## Status

**Blocked on:** HQ API endpoint with email field and `ids` parameter.

Once HQ endpoint is ready, ops-zone implementation can proceed.

