"use client";

import { useWorkspace } from "@/contexts/workspace-context";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface WorkspaceIndicatorProps {
  /** Display mode: 'badge' shows just the name, 'dropdown' allows switching */
  mode?: "badge" | "dropdown";
  /** Additional classes */
  className?: string;
}

/**
 * WorkspaceIndicator
 *
 * Displays the current workspace and optionally allows switching.
 * Use mode="badge" for a simple indicator, mode="dropdown" for full switcher.
 */
export function WorkspaceIndicator({
  mode = "dropdown",
  className,
}: WorkspaceIndicatorProps) {
  const {
    currentWorkspace,
    workspaces,
    isLoading,
    isSwitching,
    error,
    switchWorkspace,
  } = useWorkspace();

  // Loading state
  if (isLoading) {
    return (
      <div className={cn("flex items-center gap-2 text-xs text-zinc-500", className)}>
        <Loader2 className="h-3 w-3 animate-spin" />
        <span>Loading...</span>
      </div>
    );
  }

  // No workspace
  if (!currentWorkspace) {
    return (
      <div className={cn("flex items-center gap-2 text-xs text-zinc-500", className)}>
        <Building2 className="h-3 w-3" />
        <span>No workspace</span>
      </div>
    );
  }

  // Badge mode - just show current workspace name
  if (mode === "badge") {
    return (
      <div
        className={cn(
          "flex items-center gap-1.5 text-xs text-zinc-400",
          isSwitching && "opacity-50",
          className
        )}
      >
        <Building2 className="h-3 w-3" />
        <span>{currentWorkspace.name}</span>
        {isSwitching && <Loader2 className="h-3 w-3 animate-spin ml-1" />}
      </div>
    );
  }

  // Dropdown mode - full switcher
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Building2 className="h-3.5 w-3.5 text-zinc-500" />
      <Select
        value={currentWorkspace.id.toString()}
        onValueChange={(value) => switchWorkspace(Number(value))}
        disabled={isSwitching || workspaces.length <= 1}
      >
        <SelectTrigger
          className={cn(
            "h-7 w-auto min-w-[120px] max-w-[200px] text-xs bg-transparent border-zinc-800 hover:bg-zinc-800/50",
            isSwitching && "opacity-50"
          )}
        >
          <SelectValue />
          {isSwitching && <Loader2 className="h-3 w-3 animate-spin ml-1" />}
        </SelectTrigger>
        <SelectContent className="bg-zinc-900 border-zinc-800">
          {workspaces.map((workspace) => (
            <SelectItem
              key={workspace.id}
              value={workspace.id.toString()}
              className="text-xs"
            >
              {workspace.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && (
        <span className="text-xs text-red-400">{error}</span>
      )}
    </div>
  );
}

/**
 * WorkspaceBadge
 *
 * Compact display of current workspace, no switching capability.
 * Use in headers, breadcrumbs, or anywhere space is limited.
 */
export function WorkspaceBadge({ className }: { className?: string }) {
  return <WorkspaceIndicator mode="badge" className={className} />;
}

