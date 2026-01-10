# Sequence Steps Implementation Post-Mortem

**Date:** January 9, 2026  
**Status:** ✅ RESOLVED - See [sequence-steps-fix.md](./sequence-steps-fix.md)

---

## Summary

The campaign sequence steps (messages) feature is broken. Creating the first step works, but:
1. **Adding subsequent steps fails** with HTTP 422
2. **Deleting steps fails** with HTTP 400

---

## What Worked

| Action | Endpoint | Result |
|--------|----------|--------|
| Create first step | `POST /api/campaigns/v1.1/{campaignId}/sequence-steps` | ✅ 201 Created |
| Fetch sequence steps | `GET /api/campaigns/v1.1/{campaignId}/sequence-steps` | ✅ 200 OK |
| List campaigns | `GET /api/campaigns` | ✅ 200 OK |

---

## What Failed

### 1. Adding 2nd+ Steps (PUT)

**Endpoint:** `PUT /api/campaigns/v1.1/sequence-steps/{sequence_id}`  
**HTTP Status:** 422 Unprocessable Entity  
**Error Body:** Not captured in initial logs

**What we sent:**
```json
{
  "title": "Campaign Sequence",
  "sequence_steps": [
    {
      "id": 1,
      "email_subject": "testing",
      "email_body": "test",
      "wait_in_days": 1,
      "order": 1,
      "thread_reply": false,
      "variant": false
    },
    {
      "email_subject": "new step subject",
      "email_body": "new step body",
      "wait_in_days": 3,
      "order": 2,
      "thread_reply": true
    }
  ]
}
```

**Suspected Issues:**
- New steps may require different field format (no `id` vs explicit `null`)
- `variant` field handling may be incorrect for new steps
- `wait_in_days` validation unknown
- May need `email_subject_variables` array even if empty

### 2. Deleting Steps (DELETE)

**Endpoint:** `DELETE /api/campaigns/sequence-steps/{sequence_step_id}`  
**HTTP Status:** 400 Bad Request  
**Error Body:** Not captured in initial logs

**What we sent:** Step ID = `1`

**Suspected Issues:**
- Cannot delete the only step in a sequence (business rule)
- Step ID `1` may be invalid or protected
- Endpoint may require different authentication/permissions

---

## API Response Data

GET sequence-steps returned:
```json
{
  "sequence_id": 1,
  "sequence_steps": [
    {
      "id": 1,
      "email_subject": "testing",
      "order": 1,
      "email_body": "test",
      "wait_in_days": 1,
      "variant": false,
      "variant_from_step_id": null,
      "attachments": null,
      "thread_reply": false
    }
  ]
}
```

---

## Code Locations

| File | Purpose |
|------|---------|
| `src/app/admin/campaigns/messages/page.tsx` | UI component |
| `src/lib/emailbison/services/campaigns.ts` | API service functions |
| `src/app/api/emailbison/sequence-steps/[sequenceId]/route.ts` | PUT route |
| `src/app/api/emailbison/sequence-steps/step/[stepId]/route.ts` | DELETE route |
| `src/lib/emailbison/types.ts` | TypeScript types |

---

## OpenAPI Spec Analysis

### PUT v1.1 Request Schema (from OpenAPI)

```json
{
  "title": "John Doe sequence",
  "sequence_steps": [
    {
      "id": 1,
      "email_subject": "EmailBison is awesome!",
      "email_subject_variables": ["{FIRST_NAME}"],
      "order": 1,
      "email_body": "Try it now!",
      "wait_in_days": 1,
      "variant": false,
      "thread_reply": false
    },
    {
      "id": 2,
      "email_subject": "EmailBison is awesome!",
      "order": 2,
      "email_body": "Try it now!",
      "wait_in_days": 1,
      "variant": true,
      "variant_from_step": 1,
      "thread_reply": true
    }
  ]
}
```

**Key observations:**
- OpenAPI example shows ALL steps have an `id` - even when adding new ones
- This contradicts typical REST patterns where new items don't have IDs
- `variant_from_step` (not `variant_from_step_id`) in request

### DELETE Endpoint

`DELETE /api/campaigns/sequence-steps/{sequence_step_id}`

No documented restrictions on when deletion is allowed.

---

## Root Cause Hypotheses

### Hypothesis A: PUT requires IDs for ALL steps
The v1.1 PUT endpoint may not support adding new steps. It may only support updating existing steps. To add steps, you might need to:
1. Use POST to create entirely new sequence (replacing existing)
2. Or use a different endpoint

### Hypothesis B: Field name mismatch
We're sending `variant_from_step_id` but API may expect `variant_from_step` for the request body.

### Hypothesis C: Missing required fields
New steps may require fields we're not sending:
- `email_subject_variables: []`
- Explicit `variant: false`
- Explicit `attachments: null`

### Hypothesis D: DELETE business rule
EmailBison may not allow deleting the last/only step in a sequence.

---

## Recommended Next Steps

1. **Capture full error responses** - Add logging to see exact error messages from EmailBison
2. **Test via curl/Postman** - Bypass our code entirely to isolate API behavior
3. **Contact EmailBison support** - Ask about:
   - How to add steps to existing sequences
   - Whether DELETE has restrictions
4. **Review full OpenAPI spec** - Check for undocumented requirements
5. **Test POST to replace entire sequence** - May be the intended workflow

---

## Files Modified During This Work

- `src/app/admin/campaigns/messages/page.tsx` - Complete rewrite for local state management
- `src/lib/emailbison/services/campaigns.ts` - Added sequence step functions
- `src/lib/emailbison/types.ts` - Added sequence step types
- `src/app/api/emailbison/campaigns/[campaignId]/sequence-steps/route.ts` - GET/POST routes
- `src/app/api/emailbison/sequence-steps/[sequenceId]/route.ts` - PUT route
- `src/app/api/emailbison/sequence-steps/step/[stepId]/route.ts` - DELETE route
- `src/components/ui/switch.tsx` - Created missing component

---

## Conclusion

The sequence steps integration is incomplete. The first step creation works, but the API's behavior for updating sequences (adding/removing steps) is not fully understood. Direct API testing and/or EmailBison documentation review is required before proceeding.

