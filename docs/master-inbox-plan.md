# Master Inbox Implementation Plan

## Overview

The Master Inbox is a unified inbox view across all sender email accounts in a workspace. It allows users to view, filter, manage, and respond to replies from cold email campaigns.

---

## API Endpoints (from OpenAPI Spec)

### Core Reply Operations
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/replies` | GET | List all replies (paginated, filterable) |
| `/api/replies/{id}` | GET | Get single reply details |
| `/api/replies/{reply_id}` | DELETE | Delete a reply |
| `/api/replies/{reply_id}/conversation-thread` | GET | Get full conversation thread |

### Reply Actions
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/replies/{reply_id}/reply` | POST | Reply to existing email |
| `/api/replies/new` | POST | Compose new email thread |
| `/api/replies/{reply_id}/forward` | POST | Forward an email |

### Status Management
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/replies/{reply_id}/mark-as-interested` | PATCH | Mark lead as interested |
| `/api/replies/{reply_id}/mark-as-not-interested` | PATCH | Mark lead as not interested |
| `/api/replies/{reply_id}/mark-as-read-or-unread` | PATCH | Toggle read/unread status |
| `/api/replies/{reply_id}/mark-as-automated-or-not-automated` | PATCH | Toggle automated reply flag |

### Lead Management
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/replies/{reply_id}/unsubscribe` | PATCH | Unsubscribe contact from emails |
| `/api/replies/{reply_id}/attach-scheduled-email-to-reply` | POST | Attach scheduled email to untracked reply |
| `/api/replies/{reply_id}/followup-campaign/push` | POST | Push reply to followup campaign |

### Lead-Specific Queries
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/leads/{lead_id}/replies` | GET | Get all replies for a lead |
| `/api/leads/{lead_id_or_email}/sent-emails` | GET | Get sent campaign emails for a lead |
| `/api/scheduled-emails/{lead_id_or_email}` | GET | Get scheduled emails for a lead |

---

## Reply Object Shape

```typescript
interface Reply {
  id: number;
  uuid: string;
  folder: "Inbox" | "Sent" | "Spam" | "Bounced";
  subject: string;
  read: boolean;
  interested: boolean;
  automated_reply: boolean;
  html_body: string;
  text_body: string;
  raw_body: string | null;
  headers: any | null;
  date_received: string; // ISO timestamp
  type: "Tracked Reply" | "Untracked Reply";
  tracked_reply: boolean;
  scheduled_email_id: number | null;
  campaign_id: number | null;
  lead_id: number | null;
  sender_email_id: number;
  raw_message_id: string;
  from_name: string;
  from_email_address: string;
  primary_to_email_address: string;
  to: Array<{ name: string; address: string }>;
  cc: Array<{ name: string; address: string }> | null;
  bcc: Array<{ name: string; address: string }> | null;
  parent_id: number | null;
  attachments: Array<{
    id: number;
    uuid: string;
    reply_id: number;
    file_name: string;
    download_url: string;
    created_at: string;
    updated_at: string;
  }>;
  created_at: string;
  updated_at: string;
}
```

---

## Filter Capabilities

| Filter | Type | Values |
|--------|------|--------|
| `search` | string | Free text search |
| `status` | string | `interested`, `automated_reply`, `not_automated_reply` |
| `folder` | string | `inbox`, `sent`, `spam`, `bounced`, `all` |
| `read` | boolean | `true`, `false` |
| `campaign_id` | integer | Campaign ID |
| `sender_email_id` | integer | Sender email account ID |
| `lead_id` | integer | Lead ID |
| `tag_ids` | array | Array of tag IDs |

---

## Implementation Stages

### Stage 1: Foundation (Types & Services)
**Goal:** Build the service layer that talks to EmailBison API.

**Tasks:**
1. **Update Reply types** in `src/lib/emailbison/types.ts`
   - Replace existing basic `Reply` interface with full API shape
   - Add `ListRepliesRequest` with all filter parameters
   - Add `SendReplyRequest`, `ForwardReplyRequest`
   - Add `ConversationThread` type
   - Add `ReplyAttachment` type

2. **Create replies service** in `src/lib/emailbison/services/replies.ts`
   - `listReplies(params)` - GET /api/replies
   - `getReply(id)` - GET /api/replies/{id}
   - `deleteReply(id)` - DELETE /api/replies/{reply_id}
   - `getConversationThread(replyId)` - GET /api/replies/{reply_id}/conversation-thread
   - `sendReply(replyId, payload)` - POST /api/replies/{reply_id}/reply
   - `composeNewEmail(payload)` - POST /api/replies/new
   - `forwardReply(replyId, payload)` - POST /api/replies/{reply_id}/forward
   - `markAsInterested(replyId)` - PATCH
   - `markAsNotInterested(replyId)` - PATCH
   - `markAsReadOrUnread(replyId, read)` - PATCH
   - `markAsAutomatedOrNot(replyId, automated)` - PATCH
   - `unsubscribeContact(replyId)` - PATCH
   - `attachScheduledEmail(replyId, scheduledEmailId)` - POST
   - `pushToFollowupCampaign(replyId, campaignId)` - POST

3. **Export from index** - Update `src/lib/emailbison/index.ts`

**Deliverable:** Service layer complete, can call all reply endpoints programmatically.

---

### Stage 2: API Routes
**Goal:** Create Next.js API routes that proxy to EmailBison.

**Tasks:**
1. **Create `/api/emailbison/replies/route.ts`**
   - GET: List replies with query params
   - POST: Compose new email

2. **Create `/api/emailbison/replies/[replyId]/route.ts`**
   - GET: Get single reply
   - DELETE: Delete reply

3. **Create `/api/emailbison/replies/[replyId]/conversation/route.ts`**
   - GET: Get conversation thread

4. **Create `/api/emailbison/replies/[replyId]/reply/route.ts`**
   - POST: Send reply

5. **Create `/api/emailbison/replies/[replyId]/forward/route.ts`**
   - POST: Forward email

6. **Create `/api/emailbison/replies/[replyId]/status/route.ts`**
   - PATCH: Update status (interested, read, automated)

7. **Create `/api/emailbison/replies/[replyId]/unsubscribe/route.ts`**
   - PATCH: Unsubscribe contact

**Deliverable:** All reply operations available via internal API routes.

---

### Stage 3: Inbox List View (Read-Only)
**Goal:** Display inbox with filtering, no actions yet.

**Tasks:**
1. **Create page** at `/admin/inbox/page.tsx`
   - Page header with title "Master Inbox"
   - Filter sidebar (left)
   - Reply list (center)

2. **Build FilterSidebar component**
   - Folder selector (Inbox/Sent/Spam/Bounced/All)
   - Status filter (Interested/Automated/Not Automated)
   - Read/Unread toggle
   - Campaign dropdown
   - Sender Email dropdown
   - Search input

3. **Build ReplyListItem component**
   - From name/email
   - Subject line
   - Preview snippet (truncated text_body)
   - Date received
   - Status indicators (unread dot, interested star, automated badge)
   - Tracked vs Untracked indicator

4. **Implement pagination**
   - Load more / infinite scroll

**UI Layout:**
```
┌─────────────────────────────────────────────────────────┐
│  Master Inbox                              [Compose]    │
├────────────┬────────────────────────────────────────────┤
│ Filters    │ ┌────────────────────────────────────────┐ │
│            │ │ ★ John Doe <john@...>          2h ago │ │
│ Folder     │ │ Re: Partnership Opportunity           │ │
│ ○ Inbox    │ │ Thanks for reaching out, I'd love...  │ │
│ ○ Sent     │ └────────────────────────────────────────┘ │
│ ○ All      │ ┌────────────────────────────────────────┐ │
│            │ │ • Jane Smith <jane@...>        5h ago │ │
│ Status     │ │ Out of office                         │ │
│ □ Interested│ │ I will be out of the office until... │ │
│ □ Automated│ └────────────────────────────────────────┘ │
│            │                                            │
│ Campaign   │                                            │
│ [Select ▼] │                                            │
│            │                                            │
│ Search     │                                            │
│ [________] │                                            │
└────────────┴────────────────────────────────────────────┘
```

**Deliverable:** Can view and filter inbox, but no interactions yet.

---

### Stage 4: Reply Detail View
**Goal:** View full email content and conversation thread.

**Tasks:**
1. **Create detail view** (could be modal, slide-over, or separate page)
   - Full email content (HTML rendered safely)
   - Conversation thread (older + newer messages)
   - Lead info panel (if tracked)
   - Campaign info (if from campaign)

2. **Build ConversationThread component**
   - Chronological list of messages
   - Visual distinction between sent/received
   - Expand/collapse for long threads

3. **Implement click-to-view**
   - Click reply in list → opens detail view
   - Auto-mark as read when opened

**UI Layout:**
```
┌─────────────────────────────────────────────────────────┐
│  ← Back to Inbox                                        │
├─────────────────────────────────────────────────────────┤
│ From: John Doe <john@acme.com>                          │
│ To: team@outboundsolutions.com                          │
│ Subject: Re: Partnership Opportunity                    │
│ Date: Jan 9, 2026 at 2:34 PM                           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Hi Ben,                                                │
│                                                         │
│  Thanks for reaching out! I'd love to learn more        │
│  about what you're offering. Can we schedule a call     │
│  next week?                                             │
│                                                         │
│  Best,                                                  │
│  John                                                   │
│                                                         │
├─────────────────────────────────────────────────────────┤
│ ▼ Previous Messages (2)                                 │
│   ┌─────────────────────────────────────────────────┐   │
│   │ You wrote on Jan 8:                             │   │
│   │ Hi John, I noticed you're scaling...            │   │
│   └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

**Deliverable:** Can view full email content and thread history.

---

### Stage 5: Status Actions
**Goal:** Allow marking replies with status flags.

**Tasks:**
1. **Add action buttons to detail view**
   - Mark as Interested / Not Interested
   - Mark as Read / Unread
   - Mark as Automated / Not Automated
   - Delete reply

2. **Add quick actions to list item**
   - Star icon for interested toggle
   - Read/unread toggle on hover

3. **Implement optimistic updates**
   - Update UI immediately, revert on error

**Deliverable:** Can manage reply status from UI.

---

### Stage 6: Reply Composer
**Goal:** Send replies from within the inbox.

**Tasks:**
1. **Build ReplyComposer component**
   - Rich text editor (or plain text toggle)
   - To/CC/BCC fields (pre-filled from original)
   - Subject line (pre-filled with Re:)
   - Sender email selector
   - "Include previous message" toggle
   - Send button

2. **Implement reply flow**
   - Click "Reply" → opens composer
   - Pre-populate fields from conversation context
   - Submit → POST to API
   - Success → refresh thread, show confirmation

3. **Add compose new email**
   - "Compose" button in header
   - Empty composer for new thread

**UI Layout:**
```
┌─────────────────────────────────────────────────────────┐
│ Reply to: john@acme.com                          [Send] │
├─────────────────────────────────────────────────────────┤
│ From: [team@outboundsolutions.com ▼]                    │
│ To:   john@acme.com                                     │
│ CC:   [                                            ]    │
│ Subject: Re: Partnership Opportunity                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Hi John,                                                │
│                                                         │
│ Great to hear from you! How about Tuesday at 2pm EST?   │
│                                                         │
│ Best,                                                   │
│ Ben                                                     │
│                                                         │
├─────────────────────────────────────────────────────────┤
│ [x] Include previous message                            │
│ [ ] Plain text mode                                     │
└─────────────────────────────────────────────────────────┘
```

**Deliverable:** Can send replies and compose new emails.

---

### Stage 7: Advanced Features
**Goal:** Handle edge cases and power-user features.

**Tasks:**
1. **Untracked Reply Handling**
   - "Attach Contact" button for untracked replies
   - Search for scheduled email to attach
   - Link reply to lead/campaign

2. **Forward Emails**
   - Forward button with recipient selection
   - Include attachments option

3. **Followup Campaign Push**
   - "Add to Followup Campaign" action
   - Campaign selector
   - Confirmation before pushing

4. **Unsubscribe Contact**
   - "Unsubscribe" action with confirmation
   - Visual indicator for unsubscribed leads

5. **Attachment Handling**
   - Display attachments in detail view
   - Download links
   - Attachment upload in composer (if needed)

**Deliverable:** Full-featured inbox with all edge cases handled.

---

### Stage 8: Polish & Integration
**Goal:** Refine UX and integrate with rest of app.

**Tasks:**
1. **Real-time updates**
   - Poll for new replies (or WebSocket if available)
   - Badge count for unread

2. **Keyboard shortcuts**
   - j/k for navigation
   - r for reply
   - e for archive/delete
   - i for mark interested

3. **Admin nav integration**
   - Add "Inbox" to sidebar navigation
   - Unread count badge

4. **Lead context panel**
   - When viewing tracked reply, show lead info
   - Quick link to lead profile
   - Campaign association

5. **Performance optimization**
   - Virtualized list for large inboxes
   - Prefetch conversation on hover

**Deliverable:** Production-ready Master Inbox.

---

## File Structure

```
src/
├── lib/emailbison/
│   ├── types.ts                    # Updated with Reply types
│   └── services/
│       ├── replies.ts              # NEW: Reply service functions
│       └── index.ts                # Export replies
├── app/
│   ├── api/emailbison/
│   │   └── replies/
│   │       ├── route.ts            # GET list, POST compose
│   │       └── [replyId]/
│   │           ├── route.ts        # GET single, DELETE
│   │           ├── conversation/route.ts
│   │           ├── reply/route.ts
│   │           ├── forward/route.ts
│   │           ├── status/route.ts
│   │           └── unsubscribe/route.ts
│   └── admin/
│       └── inbox/
│           └── page.tsx            # Main inbox page
└── components/
    └── inbox/
        ├── filter-sidebar.tsx      # Filter controls
        ├── reply-list.tsx          # List container
        ├── reply-list-item.tsx     # Individual row
        ├── reply-detail.tsx        # Full email view
        ├── conversation-thread.tsx # Thread display
        └── reply-composer.tsx      # Email composer
```

---

## Estimated Effort

| Stage | Description | Effort |
|-------|-------------|--------|
| 1 | Foundation (Types & Services) | 2-3 hours |
| 2 | API Routes | 1-2 hours |
| 3 | Inbox List View | 3-4 hours |
| 4 | Reply Detail View | 2-3 hours |
| 5 | Status Actions | 1-2 hours |
| 6 | Reply Composer | 3-4 hours |
| 7 | Advanced Features | 3-4 hours |
| 8 | Polish & Integration | 2-3 hours |

**Total Estimated: 17-25 hours**

---

## Dependencies

- Existing EmailBison client infrastructure ✅
- Campaign list endpoint (for filter dropdown) ✅
- Email account list endpoint (for sender dropdown) ✅
- Rich text editor component (TipTap, Slate, or similar) - May need to add

---

## Risk Areas

1. **HTML Email Rendering** - Need to sanitize HTML to prevent XSS while preserving formatting
2. **Large Inboxes** - Pagination and virtualization critical for performance
3. **Attachment Uploads** - May require multipart/form-data handling
4. **Real-time Updates** - No WebSocket mentioned in API; will need polling strategy

---

## Success Criteria

- [ ] Can view all replies across sender accounts
- [ ] Can filter by folder, status, campaign, sender
- [ ] Can read full email content and conversation thread
- [ ] Can mark replies as interested/read/automated
- [ ] Can send replies that appear in EmailBison
- [ ] Can compose new emails
- [ ] Can handle untracked replies
- [ ] UI is responsive and performant

