/**
 * Design Tokens
 * 
 * Single source of truth for spacing, typography, and layout values.
 * All components should use these tokens instead of arbitrary values.
 * 
 * Usage:
 *   import { spacing, typography, layout } from "@/lib/design-tokens";
 *   <div className={spacing.page.x}>  // "px-6"
 */

// =============================================================================
// SPACING SCALE
// =============================================================================
// Base unit: 4px
// Scale: 4, 8, 12, 16, 24, 32, 48, 64

export const spacing = {
  // Raw values (for reference)
  scale: {
    0: "0",
    1: "4px",   // 1 = 0.25rem
    2: "8px",   // 2 = 0.5rem
    3: "12px",  // 3 = 0.75rem
    4: "16px",  // 4 = 1rem
    6: "24px",  // 6 = 1.5rem
    8: "32px",  // 8 = 2rem
    12: "48px", // 12 = 3rem
    16: "64px", // 16 = 4rem
  },

  // Page-level spacing
  page: {
    x: "px-6",           // 24px horizontal padding
    y: "py-6",           // 24px vertical padding
    top: "pt-6",         // 24px top padding
    bottom: "pb-6",      // 24px bottom padding
    all: "p-6",          // 24px all sides
  },

  // Section spacing (between major sections)
  section: {
    gap: "gap-8",        // 32px between sections
    marginTop: "mt-8",   // 32px top margin
    marginBottom: "mb-8", // 32px bottom margin
  },

  // Content spacing (within sections)
  content: {
    gap: "gap-4",        // 16px between content items
    gapSm: "gap-2",      // 8px small gap
    gapLg: "gap-6",      // 24px large gap
  },

  // Component internal spacing
  component: {
    padding: "p-4",      // 16px internal padding
    paddingSm: "p-2",    // 8px small padding
    paddingLg: "p-6",    // 24px large padding
  },

  // Table cell padding
  table: {
    cellY: "py-3",       // 12px vertical padding in cells
    cellX: "px-4",       // 16px horizontal padding in cells
    headerY: "py-3",     // 12px vertical padding in headers
  },
} as const;

// =============================================================================
// TYPOGRAPHY SCALE
// =============================================================================

export const typography = {
  // Page titles
  pageTitle: "text-2xl font-bold tracking-tight",  // 24px
  
  // Section titles
  sectionTitle: "text-lg font-semibold",           // 18px
  
  // Card/component titles
  cardTitle: "text-base font-medium",              // 16px
  
  // Body text
  body: "text-sm",                                  // 14px
  
  // Secondary/meta text
  secondary: "text-xs text-zinc-400",              // 12px
  
  // Small labels
  label: "text-xs font-medium text-zinc-400",      // 12px
  
  // Table header
  tableHeader: "text-xs font-medium text-zinc-400 uppercase tracking-wider",
  
  // Stats/numbers
  statLarge: "text-3xl font-bold",                 // 30px
  statMedium: "text-2xl font-bold",                // 24px
  statSmall: "text-lg font-semibold",              // 18px
} as const;

// =============================================================================
// LAYOUT
// =============================================================================

export const layout = {
  // Page header (title + subtitle + actions area)
  pageHeader: {
    container: "border-b border-zinc-800 bg-black",
    inner: "px-6 py-6",
    titleRow: "flex items-start justify-between gap-4",
    titleGroup: "space-y-1",
    actions: "flex items-center gap-3",
  },

  // Page content area
  pageContent: {
    container: "flex-1 overflow-auto",
    inner: "px-6 py-6",
  },

  // Full-height page (like Access Leads with table)
  fullHeightPage: {
    container: "h-screen flex flex-col bg-black overflow-hidden",
    header: "border-b border-zinc-800 bg-black shrink-0",
    content: "flex-1 overflow-auto",
  },

  // Stats grid
  statsGrid: {
    container: "grid gap-4 md:grid-cols-2 lg:grid-cols-4",
  },

  // Cards grid
  cardsGrid: {
    container: "grid gap-6 md:grid-cols-2 lg:grid-cols-3",
  },

  // Two-column layout (main + sidebar)
  twoColumn: {
    container: "grid gap-6 lg:grid-cols-3",
    main: "lg:col-span-2",
    sidebar: "lg:col-span-1",
  },
} as const;

// =============================================================================
// TABLE ROW HEIGHT
// =============================================================================
// All tables should have consistent row heights regardless of content

export const tableRow = {
  // Fixed height for all table rows (ensures consistency)
  height: "h-14",        // 56px - accommodates 2 lines of text comfortably
  
  // Cell padding (use with height for consistent rows)
  cellPadding: "py-3",   // 12px vertical padding
} as const;

// =============================================================================
// COLORS (semantic)
// =============================================================================

export const colors = {
  // Backgrounds
  bg: {
    page: "bg-black",
    card: "bg-zinc-900",
    cardHover: "hover:bg-zinc-800",
    input: "bg-zinc-900",
    muted: "bg-zinc-800",
  },
  
  // Borders
  border: {
    default: "border-zinc-800",
    subtle: "border-zinc-800/50",
    hover: "hover:border-zinc-600",
  },
  
  // Text
  text: {
    primary: "text-white",
    secondary: "text-zinc-400",
    muted: "text-zinc-500",
  },
  
  // Status colors
  status: {
    success: "text-emerald-400",
    warning: "text-amber-400",
    error: "text-red-400",
    info: "text-blue-400",
  },
} as const;

// =============================================================================
// COMPONENT VARIANTS
// =============================================================================

export const components = {
  // Stat card
  statCard: {
    container: `${colors.bg.card} ${colors.border.default} border rounded-lg ${spacing.component.padding}`,
    icon: "h-5 w-5 text-zinc-400",
    value: typography.statMedium,
    label: typography.secondary,
  },

  // Data table
  table: {
    container: "w-full",
    header: "sticky top-0 bg-zinc-900/95 backdrop-blur z-10",
    headerRow: "border-b border-zinc-800",
    headerCell: `${typography.tableHeader} ${tableRow.cellPadding}`,
    row: `border-b ${colors.border.subtle} hover:bg-zinc-900/50 transition-colors ${tableRow.height}`,
    rowSelected: "bg-zinc-900",
    cell: tableRow.cellPadding,
  },
} as const;

