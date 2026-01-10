# Access Leads Page — Fix & Enhancement Plan

## Current State

### What Exists

The Access Leads page (`/admin/access-leads`) is **fully implemented** on the frontend:

- **People tab** — table with columns: Contact, Company, Job Title, Industry, Size
- **Companies tab** — table with columns: Company, Industry, Size, Employees, Country
- **Filter sidebar** — Industries, Company Sizes, Job Titles chip inputs
- **Search** — debounced search input
- **Selection** — multi-select with checkboxes
- **Export button** — (not yet functional)

### Frontend Files

| File | Purpose |
|------|---------|
| `src/app/admin/access-leads/page.tsx` | Main page component |
| `src/components/leads/filter-sidebar.tsx` | Filter UI |
| `src/lib/hq-data/types.ts` | TypeScript types |
| `src/lib/hq-data/client.ts` | HTTP client |
| `src/lib/hq-data/services/people.ts` | getPeople service |
| `src/lib/hq-data/services/companies.ts` | getCompanies service |
| `src/app/api/hq/people/route.ts` | Next.js proxy route |
| `src/app/api/hq/companies/route.ts` | Next.js proxy route |

### The Problem

The backend API (`https://api.revenueinfra.com/api/views/people` and `/api/views/companies`) is **not yet deployed or functional**. When the frontend calls these endpoints, it receives 404/500 errors.

---

## Proposed Course of Action

### Phase 1: Backend API Deployment (External)

**Owner:** Other AI / Backend team  
**Dependency:** Must complete before frontend can be tested with real data

**Tasks:**
1. Deploy HQ Data API to `api.revenueinfra.com`
2. Create database views `api.vw_people` and `api.vw_companies`
3. Implement endpoints per [api-documentation-view.md](./api-documentation-view.md)
4. Verify endpoints return expected response shape

**Verification:**
```bash
# Test people endpoint
curl "https://api.revenueinfra.com/api/views/people?limit=5"

# Test companies endpoint
curl "https://api.revenueinfra.com/api/views/companies?limit=5"
```

---

### Phase 2: Frontend Verification

**Owner:** This codebase  
**Dependency:** Phase 1 complete

**Tasks:**

1. **Verify data loads** — People and Companies tabs show records
2. **Verify search works** — Type in search, results filter
3. **Verify filters work** — Test each filter type:
   - Industry filter (partial match)
   - Size range filter (exact match)
   - Job title filter (partial match, people only)
4. **Verify pagination** — Currently shows 100 results; should paginate

**Current Limitation:** Filter sidebar only sends the **first** selected value for each filter category (API doesn't support multiple values per field).

---

### Phase 3: Feature Completion

These features are stubbed but not functional:

#### 3.1 Export Functionality

**Status:** Button exists, no action  
**Proposal:**

```
Selected leads → Export as CSV
- First Name, Last Name, Email*, Company, Title, LinkedIn URL
- Export companies similarly
```

*Email field is NOT in current data — requires enrichment (see Phase 4)

#### 3.2 Pagination Controls

**Status:** Shows total count, but no page navigation  
**Proposal:**

- Add "Load More" button or
- Add page numbers with prev/next
- Update API calls to pass offset

#### 3.3 Lead Detail View

**Status:** Rows are not clickable  
**Proposal:**

- Click row → slide-out panel or modal
- Show full profile: LinkedIn URL, all company data, etc.

---

### Phase 4: Add to Lead List / Campaign

This is the **primary use case** — take people/companies from Access Leads and add them to EmailBison.

#### 4.1 Add Selected to Lead List

**Workflow:**
1. User selects rows with checkboxes
2. User clicks "Add to Lead List"
3. Modal: Select existing list or create new
4. System creates leads in EmailBison (requires email addresses)

**Blocker:** EmailBison requires `email` field. Current data has:
- LinkedIn URL ✅
- Name ✅
- Company ✅
- Email ❌ (not in HQ Data)

**Dependency:** Email enrichment service (see below)

#### 4.2 Email Enrichment

**Status:** Admin page has placeholder card "Enrich for Emails"  
**Purpose:** Take a person (LinkedIn URL + name + company) → find email

**Options:**
1. **External service** (Clay, Apollo, Hunter, etc.)
2. **Pattern generation** (first.last@domain.com)
3. **Manual entry**

**Proposal:**
- Integrate with enrichment provider via API
- Store enriched emails locally
- Mark records as "enrichable" → "enriched" → "verified"

---

### Phase 5: Enhanced Filtering

Current filters are basic. Enhancements:

#### 5.1 Multi-value Filters

**Problem:** API only accepts one value per filter field  
**Backend Fix:** Update API to accept arrays

```
# Current
?industry=SaaS

# Enhanced
?industry=SaaS,Manufacturing,Healthcare
```

**Frontend Fix:** Already supports multi-select, just needs API update

#### 5.2 Advanced Filters

| Filter | People | Companies | Notes |
|--------|--------|-----------|-------|
| Country | ✅ | ✅ | Add to sidebar |
| Location (city) | ✅ | ✅ | Add to sidebar |
| Employee min/max | — | ✅ | Add range inputs |
| Founded year | — | ✅ | Add range inputs |
| Has LinkedIn | ✅ | ✅ | Boolean toggle |
| Current role only | ✅ | — | Boolean toggle |

#### 5.3 Saved Filters / Views

**Proposal:**
- Save current filter configuration
- Quick-switch between saved views
- Name views: "SaaS CTOs", "Manufacturing 500+", etc.

---

## Priority Order

| Priority | Item | Effort | Impact |
|----------|------|--------|--------|
| P0 | Backend API deployment | External | Unblocks everything |
| P1 | Verify frontend with real data | Low | Confirms integration |
| P2 | Email enrichment integration | Medium | Enables lead creation |
| P3 | Add to Lead List flow | Medium | Core use case |
| P4 | Pagination controls | Low | Better UX |
| P5 | Export to CSV | Low | Convenience |
| P6 | Advanced filters | Medium | Power users |

---

## Technical Notes

### API Proxy Architecture

Frontend → `/api/hq/people` (Next.js route) → `api.revenueinfra.com/api/views/people`

This proxy exists to:
1. Hide external API URL from client
2. Allow future auth injection
3. Enable request/response transformation

### Type Safety

All types are defined in `src/lib/hq-data/types.ts`. Any API changes should update types first.

### Error Handling

Current: Shows generic "Failed to fetch people" message  
Enhancement: Parse API error response and show specific message

---

## Open Questions

1. **Email enrichment provider** — Which service to integrate?
2. **Lead list storage** — Local DB or EmailBison only?
3. **Multi-select filter support** — Backend API change required?
4. **Rate limiting** — Any limits on HQ Data API?

---

## Related Docs

- [api-documentation-view.md](./api-documentation-view.md) — API specification
- [engineering-knowledge-base.md](./engineering-knowledge-base.md) — Architecture overview
- [emailbison-integration-status.md](./emailbison-integration-status.md) — Integration tracking

