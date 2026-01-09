# Design Post-Mortem: Access Leads UI

## Date: January 9, 2026

---

## Summary

This document is a self-assessment of the UI implementation work done on the Cold Email Command Center, specifically the Access Leads page and related components. The user identified systemic design issues that reflect a lack of rigor in visual alignment, spacing consistency, and overall design discipline.

---

## Issues Identified

### 1. Vertical Alignment Failures

**Problem:** The table checkbox column does not align with the search bar or the People/Companies tab toggle above it. Each "section" of the page starts at a different horizontal position.

**Root Cause:** I built each section independently without establishing a consistent left-edge alignment or grid system. The table has no left padding, the search bar has container padding, and the tabs have their own padding—none of which coordinate.

**Impact:** The UI looks amateurish and creates unnecessary cognitive load as the user's eye has to re-orient at each vertical section.

---

### 2. Row Height Inconsistency Between Tabs

**Problem:** People table rows are visibly taller than Companies table rows because People rows contain two lines of text (name + email, company + position) while Companies rows contain one line.

**Root Cause:** I didn't design for consistent row heights across both table variants. I used the same `py-2` padding but didn't account for content height differences.

**Impact:** Switching between People and Companies tabs creates visual jarring—a "jumping" effect that signals inconsistency and erodes user trust.

---

### 3. Inconsistent Typography Scale

**Problem:** Font sizes vary haphazardly: `text-[10px]`, `text-[11px]`, `text-xs`, `text-sm`. There's no clear typographic hierarchy.

**Root Cause:** I made ad-hoc font size decisions per-element rather than establishing a type scale upfront (e.g., 12px for labels, 14px for body, 11px for meta/secondary).

**Impact:** The interface lacks visual rhythm and hierarchy. Users can't intuitively understand what's primary vs. secondary information.

---

### 4. Inconsistent Spacing System

**Problem:** Padding and margins vary without logic: `py-2`, `py-3`, `px-4`, `px-6`, `gap-1`, `gap-2`, `gap-3`. No consistent spacing scale.

**Root Cause:** I applied spacing reactively ("this looks too tight, add more") rather than using a defined scale (4px, 8px, 12px, 16px, 24px).

**Impact:** The layout feels "off" even if users can't articulate why. Elements don't breathe consistently.

---

### 5. Component-Level Thinking vs. System-Level Thinking

**Problem:** I optimized individual components (sidebar, table, header) in isolation without verifying they work together as a cohesive layout.

**Root Cause:** When asked to build or fix something, I focused narrowly on that component without stepping back to see the full page. I didn't maintain a mental model of the overall layout grid.

**Impact:** Components don't compose well. Fixing one thing often breaks another (e.g., making rows taller in one table without considering the other).

---

### 6. Reactive Rather Than Proactive Design

**Problem:** I made changes in response to specific feedback without anticipating related issues. Example: When asked to fix row height, I changed padding without considering whether that would affect visual density or alignment.

**Root Cause:** I wasn't thinking holistically. I treated each request as isolated rather than part of a unified design system.

**Impact:** Whack-a-mole fixes that introduce new problems.

---

## Corrective Actions Required

1. **Establish a layout grid** — Define consistent left/right margins for the main content area. All elements (tabs, search, table) should align to this grid.

2. **Define a spacing scale** — Use only: 4px, 8px, 12px, 16px, 24px, 32px. No arbitrary values like `py-2` in one place and `py-3` in another without reason.

3. **Define a type scale** — Establish 3-4 font sizes with clear purposes:
   - 14px: Primary text (names, titles)
   - 12px: Secondary text (emails, metadata)
   - 11px: Tertiary/labels
   - 10px: Avoid or use sparingly

4. **Normalize table row heights** — Both People and Companies tables should have identical row heights. Use a fixed height (e.g., `h-16`) rather than relying on content to determine height.

5. **Review all changes in context** — Before committing any change, visually verify it against adjacent elements and alternate states (e.g., both tabs, collapsed/expanded sidebar).

6. **Design tokens** — Consider establishing CSS variables or constants for spacing, colors, and typography to enforce consistency.

---

## Accountability

These issues are the result of implementing without sufficient design rigor. The user's feedback is valid: the UI looks "haphazard" because it was built haphazardly—one piece at a time without a unifying system.

Going forward, any UI changes should be verified against:
- [ ] Horizontal alignment with elements above/below
- [ ] Consistent spacing scale
- [ ] Consistent typography scale
- [ ] Visual parity across similar components (e.g., both table variants)
- [ ] Full-page context, not just the component being edited

---

## Status

**Awaiting user authorization before implementing fixes.**

