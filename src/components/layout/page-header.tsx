"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  /** Page title */
  title: string;
  /** Optional subtitle/description */
  subtitle?: string;
  /** Action buttons (right side) */
  actions?: ReactNode;
  /** Additional content below title (e.g., stats cards) */
  children?: ReactNode;
  /** Additional classes for the container */
  className?: string;
}

/**
 * PageHeader
 * 
 * Consistent header component for all pages.
 * Enforces spacing, typography, and layout from design tokens.
 * 
 * Usage:
 *   <PageHeader 
 *     title="Campaigns" 
 *     subtitle="Manage your outreach sequences"
 *     actions={<Button>New Campaign</Button>}
 *   >
 *     <StatsCards />
 *   </PageHeader>
 */
export function PageHeader({
  title,
  subtitle,
  actions,
  children,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("border-b border-zinc-800 bg-black", className)}>
      <div className="px-6 py-6">
        {/* Title row */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-zinc-400">{subtitle}</p>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-3 shrink-0">
              {actions}
            </div>
          )}
        </div>
        
        {/* Optional children (stats, filters, etc.) */}
        {children && (
          <div className="mt-6">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}

