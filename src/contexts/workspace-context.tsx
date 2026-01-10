"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";

// =============================================================================
// TYPES
// =============================================================================

interface Workspace {
  id: number;
  name: string;
  personal_team?: boolean;
  main?: boolean;
}

interface WorkspaceContextValue {
  /** Current active workspace */
  currentWorkspace: Workspace | null;

  /** All available workspaces for the user */
  workspaces: Workspace[];

  /** True during initial load */
  isLoading: boolean;

  /** True while switching workspaces */
  isSwitching: boolean;

  /** Increments on workspace switch - use as dependency to refetch data */
  refreshKey: number;

  /** Error message if something went wrong */
  error: string | null;

  /** Switch to a different workspace */
  switchWorkspace: (workspaceId: number) => Promise<void>;

  /** Refresh the list of available workspaces */
  refreshWorkspaces: () => Promise<void>;
}

// =============================================================================
// CONTEXT
// =============================================================================

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

// =============================================================================
// PROVIDER
// =============================================================================

interface WorkspaceProviderProps {
  children: ReactNode;
}

export function WorkspaceProvider({ children }: WorkspaceProviderProps) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSwitching, setIsSwitching] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Fetch workspaces on mount
  const fetchWorkspaces = useCallback(async () => {
    try {
      const response = await fetch("/api/emailbison/workspaces");
      const result = await response.json();

      if (!response.ok || result.error) {
        throw new Error(result.error || "Failed to fetch workspaces");
      }

      const workspaceList: Workspace[] = result.data || [];
      setWorkspaces(workspaceList);
      return workspaceList;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch workspaces";
      setError(message);
      return [];
    }
  }, []);

  // Fetch current account to determine active workspace
  const fetchCurrentWorkspace = useCallback(async (workspaceList: Workspace[]) => {
    try {
      const response = await fetch("/api/emailbison/account");
      const result = await response.json();

      if (!response.ok || result.error) {
        // If we can't get account, default to first workspace
        if (workspaceList.length > 0) {
          setCurrentWorkspace(workspaceList[0]);
        }
        return;
      }

      // The account response includes current_team_id
      const currentTeamId = result.data?.current_team_id;
      if (currentTeamId) {
        const current = workspaceList.find((w) => w.id === currentTeamId);
        if (current) {
          setCurrentWorkspace(current);
          return;
        }
      }

      // Fallback: use the main workspace or first in list
      const mainWorkspace = workspaceList.find((w) => w.main);
      setCurrentWorkspace(mainWorkspace || workspaceList[0] || null);
    } catch {
      // Fallback to first workspace
      if (workspaceList.length > 0) {
        setCurrentWorkspace(workspaceList[0]);
      }
    }
  }, []);

  // Initialize on mount
  useEffect(() => {
    async function init() {
      setIsLoading(true);
      setError(null);
      
      const workspaceList = await fetchWorkspaces();
      await fetchCurrentWorkspace(workspaceList);
      
      setIsLoading(false);
    }

    init();
  }, [fetchWorkspaces, fetchCurrentWorkspace]);

  // Switch workspace
  const switchWorkspace = useCallback(async (workspaceId: number) => {
    const targetWorkspace = workspaces.find((w) => w.id === workspaceId);
    if (!targetWorkspace) {
      setError("Workspace not found");
      return;
    }

    // Don't switch to same workspace
    if (currentWorkspace?.id === workspaceId) {
      return;
    }

    const previousWorkspace = currentWorkspace;
    setIsSwitching(true);
    setError(null);

    // Optimistic update
    setCurrentWorkspace(targetWorkspace);

    try {
      const response = await fetch("/api/emailbison/workspaces/switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId }),
      });

      const result = await response.json();

      if (!response.ok || result.error) {
        throw new Error(result.error || "Failed to switch workspace");
      }

      // Increment refresh key to trigger data refetch in consuming components
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      // Revert on failure
      setCurrentWorkspace(previousWorkspace);
      const message = err instanceof Error ? err.message : "Failed to switch workspace";
      setError(message);
    } finally {
      setIsSwitching(false);
    }
  }, [workspaces, currentWorkspace]);

  // Refresh workspaces list
  const refreshWorkspaces = useCallback(async () => {
    const workspaceList = await fetchWorkspaces();
    await fetchCurrentWorkspace(workspaceList);
  }, [fetchWorkspaces, fetchCurrentWorkspace]);

  const value: WorkspaceContextValue = {
    currentWorkspace,
    workspaces,
    isLoading,
    isSwitching,
    refreshKey,
    error,
    switchWorkspace,
    refreshWorkspaces,
  };

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}

// =============================================================================
// HOOK
// =============================================================================

export function useWorkspace(): WorkspaceContextValue {
  const context = useContext(WorkspaceContext);

  if (!context) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }

  return context;
}

// =============================================================================
// EXPORTS
// =============================================================================

export type { Workspace, WorkspaceContextValue };

