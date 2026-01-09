"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageContainerProps {
  /** Page content */
  children: ReactNode;
  /** Additional classes */
  className?: string;
  /** 
   * Use full height layout (for pages with tables that should fill screen)
   * When true, uses h-screen with flex-col layout
   */
  fullHeight?: boolean;
}

/**
 * PageContainer
 * 
 * Root container for page content.
 * Provides consistent background and height behavior.
 * 
 * Usage:
 *   // Standard scrollable page
 *   <PageContainer>
 *     <PageHeader ... />
 *     <PageContent>...</PageContent>
 *   </PageContainer>
 * 
 *   // Full-height page (tables fill remaining space)
 *   <PageContainer fullHeight>
 *     <PageHeader ... />
 *     <PageContent fullHeight>...</PageContent>
 *   </PageContainer>
 */
export function PageContainer({
  children,
  className,
  fullHeight = false,
}: PageContainerProps) {
  return (
    <div
      className={cn(
        "bg-black",
        fullHeight ? "h-screen flex flex-col overflow-hidden" : "min-h-screen",
        className
      )}
    >
      {children}
    </div>
  );
}

