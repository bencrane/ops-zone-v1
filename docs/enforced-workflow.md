# Enforced Development Workflow

**Status:** MANDATORY  
**Effective:** January 2026

---

## Before ANY Stage

```
1. THINK    → sequential-thinking (break down the stage)
2. RESEARCH → exa/get_code_context_exa (validate approach)
3. LOOKUP   → context7/shadcn/tailwind (specific docs)
4. IMPLEMENT
5. VERIFY   → nextjs_index/nextjs_call (runtime check)
```

---

## Tool Usage by Master Inbox Stage

| Stage | Sequential Thinking | Exa | Context7 | Shadcn | Taskmaster |
|-------|:------------------:|:---:|:--------:|:------:|:----------:|
| 1. Types & Services | ✓ | ✓ | - | - | ✓ |
| 2. API Routes | ✓ | ✓ | Next.js | - | ✓ |
| 3. Inbox List | ✓ | ✓ | React | ✓ | ✓ |
| 4. Detail View | ✓ | ✓ | - | ✓ | ✓ |
| 5. Status Actions | ✓ | ✓ | - | ✓ | ✓ |
| 6. Reply Composer | ✓ | ✓ | ✓ | ✓ | ✓ |
| 7. Advanced | ✓ | ✓ | - | - | ✓ |
| 8. Polish | ✓ | - | - | - | ✓ |

---

## Specific Triggers

| Situation | Tool to Use |
|-----------|-------------|
| "How should I structure this?" | `sequential-thinking` |
| "What's the best pattern for X?" | `exa/get_code_context_exa` |
| "How does Next.js handle X?" | `context7` → Next.js docs |
| "Need a table/modal/sheet component" | `shadcn` search → view → examples |
| "Is my implementation working?" | `nextjs_index` → `nextjs_call` |
| "Track progress across stages" | `taskmaster` |

---

## Anti-Patterns I Will NOT Do

- ❌ Implement without sequential-thinking first
- ❌ Guess at patterns without exa research
- ❌ Build custom components without checking shadcn
- ❌ Skip runtime verification
- ❌ Exceed 3 calls per tool per question

---

## Enforcement

**No exceptions. No shortcuts.**

Every non-trivial task follows this protocol. Failure to follow results in:
- Haphazard, inconsistent implementations
- Outdated patterns
- Wasted time debugging preventable issues

