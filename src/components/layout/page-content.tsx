"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageContentProps {
  /** Page content */
  children: ReactNode;
  /** Additional classes */
  className?: string;
  /** Use full height (for table-based pages) */
  fullHeight?: boolean;
}

/**
 * PageContent
 * 
 * Consistent content container for all pages.
 * Enforces spacing from design tokens.
 * 
 * Usage:
 *   <PageContent>
 *     <YourContent />
 *   </PageContent>
 * 
 *   // For table pages that need to fill available height:
 *   <PageContent fullHeight>
 *     <Table />
 *   </PageContent>
 */
export function PageContent({
  children,
  className,
  fullHeight = false,
}: PageContentProps) {
  return (
    <div
      className={cn(
        "px-6 py-6",
        fullHeight && "flex-1 overflow-auto",
        className
      )}
    >
      {children}
    </div>
  );
}

