# AI Onboarding Document

**Last Updated:** January 9, 2026

This document provides everything an AI assistant needs to understand and work on this project effectively. Read this document first, then follow the linked references as needed.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Critical Context](#critical-context)
3. [Architecture & Design](#architecture--design)
4. [EmailBison API Integration](#emailbison-api-integration)
5. [Known Issues & Post-Mortems](#known-issues--post-mortems)
6. [MCP Tools Usage](#mcp-tools-usage)
7. [Codebase Structure](#codebase-structure)
8. [Development Guidelines](#development-guidelines)

---

## Project Overview

This is a **cold email campaign management application** built with Next.js. It integrates with the **EmailBison API** to manage email campaigns, sender accounts, leads, and sequences.

**Tech Stack:**
- Next.js 16.1.1 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui components
- EmailBison API (external service)

**Development Server:** `http://localhost:3002`

---

## Critical Context

### The User's Requirements

1. **EmailBison API is the single source of truth** - All data must come from and go to EmailBison. No local storage of state that should live in EmailBison.

2. **Decoupled architecture** - The API layer must be separate from UI components. Components should be portable.

3. **Production quality** - No quick fixes. Build resiliently. High polish on both code and product level.

4. **Methodical development** - Verify each feature works in both the UI AND EmailBison before proceeding.

5. **No database access** - The AI does not have access to any database. Do not attempt to use Supabase or any database MCP.

### API Key Type

The EmailBison API key is a **super-admin** type key, providing access to all workspaces and elevated permissions.

### Base URL

EmailBison API base: `https://app.outboundsolutions.com`

---

## Architecture & Design

### Read First: Architecture Document

📄 **[docs/api-architecture.md](./api-architecture.md)**

This document explains:
- Design principles (separation of concerns, single source of truth)
- Layer responsibilities (HTTP client, services, API routes, UI)
- Type strategy
- Error handling approach
- Why this architecture was chosen over alternatives

### Read Second: Design System

📄 **[docs/design-postmortem.md](./design-postmortem.md)**

Critical for UI work:
- Design tokens and spacing system
- Typography standards
- Layout patterns
- Component styling guidelines

---

## EmailBison API Integration

### OpenAPI Specification

📄 **[emailbison-openapi.json](../emailbison-openapi.json)**

The complete OpenAPI 3.0.3 specification. This is a large file (~19,000 lines). Use grep or targeted reads rather than reading the whole file.

### API Documentation (Human-Readable)

The following documentation was copied from EmailBison's official docs:

#### Getting Started
- 📄 **[docs/emailbison-api/01 Get Started/00 Introduction.md](./emailbison-api/01%20Get%20Started/00%20Introduction.md)**
- 📁 **[docs/emailbison-api/01 Get Started/01 Quickstart/](./emailbison-api/01%20Get%20Started/01%20Quickstart/)**
  - Making API Requests
  - Notes and Terminology
  - Authentication
  - Pagination

#### Core Features
- 📁 **[docs/emailbison-api/02 Documentation/01 Leads/](./emailbison-api/02%20Documentation/01%20Leads/)** - Lead management
- 📁 **[docs/emailbison-api/02 Documentation/02 Email Accounts (Sender Emails)/](./emailbison-api/02%20Documentation/02%20Email%20Accounts%20(Sender%20Emails)/)** - Sender email accounts
- 📁 **[docs/emailbison-api/02 Documentation/03 Campaigns/](./emailbison-api/02%20Documentation/03%20Campaigns/)** - Campaign creation and management
- 📁 **[docs/emailbison-api/02 Documentation/04 Tags/](./emailbison-api/02%20Documentation/04%20Tags/)** - Tagging system
- 📁 **[docs/emailbison-api/02 Documentation/05 Master Inbox/](./emailbison-api/02%20Documentation/05%20Master%20Inbox/)** - Unified inbox for replies
- 📁 **[docs/emailbison-api/02 Documentation/06 Workspaces/](./emailbison-api/02%20Documentation/06%20Workspaces/)** - Multi-workspace management
- 📁 **[docs/emailbison-api/02 Documentation/07 Webhooks/](./emailbison-api/02%20Documentation/07%20Webhooks/)** - Webhook integration
- 📁 **[docs/emailbison-api/02 Documentation/08 Walkthroughs/](./emailbison-api/02%20Documentation/08%20Walkthroughs/)** - Step-by-step guides

### Integration Status

📄 **[docs/emailbison-integration-status.md](./emailbison-integration-status.md)**

Tracks what's been implemented, tested, and verified.

### Code Locations

| Purpose | Location |
|---------|----------|
| HTTP Client | `src/lib/emailbison/client.ts` |
| Error Classes | `src/lib/emailbison/errors.ts` |
| TypeScript Types | `src/lib/emailbison/types.ts` |
| Service Functions | `src/lib/emailbison/services/` |
| API Routes | `src/app/api/emailbison/` |
| Main Export | `src/lib/emailbison/index.ts` |

---

## Known Issues & Post-Mortems

### CRITICAL: Sequence Steps Broken

📄 **[docs/sequence-steps-postmortem.md](./sequence-steps-postmortem.md)**

**Status:** The campaign sequence steps (messages) feature is NOT working properly.

- ✅ Creating first step works
- ❌ Adding subsequent steps fails (422 error)
- ❌ Deleting steps fails (400 error)

**Root cause:** Unknown. Requires direct API testing or EmailBison support contact.

**Before working on sequence steps, read this post-mortem completely.**

---

## MCP Tools Usage

### Comprehensive Guide

📄 **[docs/mcp-tools-guide.md](./mcp-tools-guide.md)**

Covers all available MCP tools and when/how to use them.

### Quick Reference

| Tool | Use For |
|------|---------|
| **Context7** | Library/framework documentation lookup |
| **Sequential Thinking** | Complex problem decomposition |
| **Exa Code Context** | Finding code patterns and examples |
| **Taskmaster** | Multi-step task tracking |
| **Shadcn** | UI component lookup and installation |

### MCP Usage Plan (Original)

📄 **[docs/mcp-usage-plan.md](./mcp-usage-plan.md)**

The user's original plan for how MCP tools should be utilized in this project.

---

## Codebase Structure

```
src/
├── app/
│   ├── (dashboard)/          # Main dashboard routes
│   ├── admin/                 # Admin panel pages
│   │   ├── campaigns/         # Campaign management UI
│   │   │   ├── create/        # Create campaign
│   │   │   ├── customize/     # Campaign settings
│   │   │   └── messages/      # Sequence steps (BROKEN)
│   │   ├── emailbison/        # EmailBison admin pages
│   │   └── workspace/         # Workspace selection
│   └── api/
│       └── emailbison/        # API routes (proxy to EmailBison)
│           ├── account/
│           ├── campaigns/
│           ├── email-accounts/
│           ├── sequence-steps/
│           └── workspaces/
├── components/
│   ├── layout/                # Page layout components
│   └── ui/                    # shadcn/ui components
├── lib/
│   ├── emailbison/            # EmailBison API client
│   │   ├── client.ts          # HTTP client with auth, retries
│   │   ├── errors.ts          # Error classes
│   │   ├── services/          # Service functions by domain
│   │   └── types.ts           # TypeScript types
│   └── design-tokens.ts       # Design system tokens
└── types/
    └── index.ts               # Internal UI types
```

---

## Development Guidelines

### Before Making Changes

1. **Read relevant documentation first** - Don't guess API behavior
2. **Check post-mortems** - Don't repeat known failures
3. **Use sequential thinking** for complex decisions
4. **Use Context7** to verify library/framework usage

### API Integration Pattern

1. Service function in `src/lib/emailbison/services/`
2. Export from `src/lib/emailbison/index.ts`
3. API route in `src/app/api/emailbison/`
4. UI component calls API route (not service directly)

### Testing Workflow

1. Implement feature
2. Test in UI
3. Verify in EmailBison dashboard
4. Both must work before proceeding

### Error Handling

- Use typed error classes from `src/lib/emailbison/errors.ts`
- Log errors with full context
- Return appropriate HTTP status codes
- Show user-friendly error messages in UI

### Environment Variables

```
EMAILBISON_API_KEY=<super-admin key>
EMAILBISON_BASE_URL=https://app.outboundsolutions.com (optional, has default)
```

---

## Files to Read (Priority Order)

### Before ANY Work

1. 📄 This document (you're here)
2. 📄 [docs/api-architecture.md](./api-architecture.md)
3. 📄 [docs/design-postmortem.md](./design-postmortem.md)

### Before API Work

4. 📄 [docs/emailbison-integration-status.md](./emailbison-integration-status.md)
5. 📄 [docs/sequence-steps-postmortem.md](./sequence-steps-postmortem.md)
6. 📄 Relevant section of [docs/emailbison-api/](./emailbison-api/)

### Before Using MCP Tools

7. 📄 [docs/mcp-tools-guide.md](./mcp-tools-guide.md)
8. 📄 [docs/mcp-usage-plan.md](./mcp-usage-plan.md)

### Code Reference

9. 📄 [src/lib/emailbison/types.ts](../src/lib/emailbison/types.ts) - All API types
10. 📄 [src/lib/emailbison/client.ts](../src/lib/emailbison/client.ts) - HTTP client
11. 📄 [src/lib/emailbison/services/](../src/lib/emailbison/services/) - Service functions

---

## Summary

This project integrates with EmailBison to manage cold email campaigns. The architecture prioritizes:
- EmailBison as single source of truth
- Decoupled, portable components
- Production-quality code
- Methodical, verified development

**Current blocker:** Sequence steps (campaign messages) are broken. See post-mortem before attempting fixes.

**Use MCP tools:** Context7 for docs, Sequential Thinking for complex problems, Exa for code patterns.

