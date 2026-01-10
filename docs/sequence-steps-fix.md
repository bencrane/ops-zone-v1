# Sequence Steps Fix Documentation

**Date:** January 10, 2026  
**Status:** ✅ RESOLVED

---

## Summary

Fixed the campaign sequence steps functionality. Adding and deleting steps now works correctly.

---

## Root Cause Analysis

### Problem 1: Adding Steps (422 Error)

**Original Approach:** Used `PUT /api/campaigns/v1.1/sequence-steps/{sequenceId}` to add new steps by sending all steps (existing + new) in a single request.

**Why It Failed:** The PUT endpoint requires an `id` field for EVERY step in the `sequence_steps` array. New steps don't have IDs yet, so the API rejected the request:

```json
{
  "message": "The sequence_steps.1.id field is required.",
  "errors": {
    "sequence_steps.1.id": ["The sequence_steps.1.id field is required."]
  }
}
```

**Discovery:** The `POST /api/campaigns/v1.1/{campaignId}/sequence-steps` endpoint **APPENDS** new steps to an existing sequence (it doesn't replace). This was not obvious from the documentation.

### Problem 2: Deleting Steps (400 Error)

**Why It Failed:** EmailBison enforces a business rule that a sequence must have at least one step. Attempting to delete the only/last step returns:

```json
{
  "success": false,
  "message": "Woops, you need at least one sequence step"
}
```

---

## EmailBison API Behavior (Discovered)

| Action | Endpoint | Method | Behavior |
|--------|----------|--------|----------|
| **Create sequence** | `/api/campaigns/v1.1/{campaignId}/sequence-steps` | POST | Creates sequence with initial steps |
| **Add steps** | `/api/campaigns/v1.1/{campaignId}/sequence-steps` | POST | **APPENDS** steps to existing sequence |
| **Update steps** | `/api/campaigns/v1.1/sequence-steps/{sequenceId}` | PUT | Updates existing steps (all must have `id`) |
| **Delete step** | `/api/campaigns/sequence-steps/{stepId}` | DELETE | Removes step (fails if last step) |

**Key Insight:** POST is idempotent for creating a sequence but **additive** for steps. Calling POST on an existing sequence doesn't replace it—it appends the new steps.

---

## The Fix

### 1. Adding Steps

Changed from PUT to POST when adding a new step:

```typescript
// OLD (broken) - Tried to use PUT with all steps
const res = await fetch(`/api/emailbison/sequence-steps/${sequenceData.sequence_id}`, {
  method: "PUT",
  body: JSON.stringify({
    title: "Campaign Sequence",
    sequence_steps: [...existingSteps, newStepWithoutId], // ❌ New step has no ID
  }),
});

// NEW (working) - POST appends the new step
const res = await fetch(`/api/emailbison/campaigns/${campaignId}/sequence-steps`, {
  method: "POST",
  body: JSON.stringify({
    title: "Campaign Sequence",
    sequence_steps: [newStep], // ✅ Only send the new step
  }),
});
```

### 2. Deleting Steps

Added client-side validation to prevent attempting to delete the last step:

```typescript
const handleDeleteExistingStep = async (stepId: number) => {
  const apiSteps = sequenceData?.sequence_steps || [];
  
  // Prevent deletion of last step
  if (apiSteps.length <= 1) {
    setErrorMessage("Cannot delete the only step. A sequence must have at least one step.");
    return;
  }
  
  // Proceed with DELETE request...
};
```

Also added:
- `isLastStep` prop to `StepEditor` component
- Disabled state on delete button when it's the last step
- Tooltip explaining why deletion is disabled

---

## Files Modified

| File | Changes |
|------|---------|
| `src/app/admin/campaigns/messages/page.tsx` | Fixed `handleSaveNewStep` to use POST; Added last-step protection to `handleDeleteExistingStep`; Added `isLastStep` prop to StepEditor |

---

## Testing Verification

| Test Case | Result |
|-----------|--------|
| Add first step to empty campaign | ✅ Works |
| Add second step to existing sequence | ✅ Works (POST appends) |
| Add third step | ✅ Works |
| Delete step (when multiple exist) | ✅ Works |
| Delete last step | ✅ Blocked with friendly error |
| Update existing step | ✅ Works (PUT with IDs) |

---

## Lessons Learned

1. **Don't assume REST conventions** - POST creating a new resource vs. appending to existing is API-specific behavior
2. **Test API endpoints directly** - Using curl/Postman to test raw API behavior before debugging frontend code saves time
3. **Read error messages carefully** - The 422 error clearly said "id field is required" which pointed to the solution
4. **Business rules aren't always documented** - The "at least one step" rule wasn't in the OpenAPI spec but was enforced server-side

---

## API Request Examples

### Add a Step (POST - Appends)

```bash
curl -X POST "https://app.outboundsolutions.com/api/campaigns/v1.1/{campaignId}/sequence-steps" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Campaign Sequence",
    "sequence_steps": [
      {
        "email_subject": "New step subject",
        "email_body": "New step body",
        "wait_in_days": 3,
        "order": 3,
        "thread_reply": true
      }
    ]
  }'
```

### Update Existing Steps (PUT - Requires IDs)

```bash
curl -X PUT "https://app.outboundsolutions.com/api/campaigns/v1.1/sequence-steps/{sequenceId}" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Campaign Sequence",
    "sequence_steps": [
      {
        "id": 1,
        "email_subject": "Updated subject",
        "email_body": "Updated body",
        "wait_in_days": 1,
        "order": 1,
        "thread_reply": false,
        "variant": false
      }
    ]
  }'
```

### Delete a Step

```bash
curl -X DELETE "https://app.outboundsolutions.com/api/campaigns/sequence-steps/{stepId}" \
  -H "Authorization: Bearer {token}"
```

---

## Related Files

- `docs/sequence-steps-postmortem.md` - Original investigation notes (now resolved)
- `src/lib/emailbison/services/campaigns.ts` - Service layer (unchanged)
- `src/app/api/emailbison/sequence-steps/` - API routes (unchanged)

