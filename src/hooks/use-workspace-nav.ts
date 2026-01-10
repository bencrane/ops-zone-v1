import { useParams } from 'next/navigation';

/**
 * Hook for workspace-aware navigation.
 * Provides the current workspace slug and a helper to build workspace-scoped URLs.
 */
export function useWorkspaceNav() {
  const params = useParams();
  const workspace = params.workspace as string;
  
  /**
   * Build a workspace-scoped URL.
   * @param path - Path within the workspace (e.g., '/campaigns', '/inbox')
   * @returns Full path (e.g., '/hq/campaigns', '/hq/inbox')
   */
  function href(path: string): string {
    // Ensure path starts with /
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `/${workspace}${normalizedPath}`;
  }
  
  return {
    workspace,
    href,
  };
}

