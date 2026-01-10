import { notFound } from 'next/navigation';
import { listWorkspaces, switchWorkspace } from '@/lib/emailbison';
import type { Workspace } from '@/lib/emailbison';
import { WorkspaceHeader } from '@/components/workspace-header';

// Convert workspace name to URL-friendly slug
function toSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// Reserved routes that should not be treated as workspace slugs
const RESERVED_ROUTES = ['login', 'select', 'api', '_next', 'admin', 'hq'];

interface WorkspaceLayoutProps {
  params: Promise<{ workspace: string }>;
  children: React.ReactNode;
}

export default async function WorkspaceLayout({
  params,
  children,
}: WorkspaceLayoutProps) {
  const { workspace: slug } = await params;
  
  // Skip processing for reserved routes
  if (RESERVED_ROUTES.includes(slug.toLowerCase())) {
    return <>{children}</>;
  }
  
  // Fetch all workspaces
  let workspaces: Workspace[];
  try {
    workspaces = await listWorkspaces();
  } catch (error) {
    console.error('Failed to fetch workspaces:', error);
    notFound();
  }
  
  // Find workspace by slug (match against name converted to slug)
  const workspace = workspaces.find(w => {
    const wsSlug = toSlug(w.name);
    return wsSlug === slug.toLowerCase() || w.name.toLowerCase() === slug.toLowerCase();
  });
  
  if (!workspace) {
    notFound();
  }
  
  // Sync EmailBison session to this workspace
  try {
    await switchWorkspace(workspace.id);
  } catch (error) {
    console.error('Failed to switch workspace:', error);
    // Continue anyway - the session might already be correct
  }
  
  return (
    <WorkspaceShell workspace={workspace} allWorkspaces={workspaces}>
      {children}
    </WorkspaceShell>
  );
}

// Provides workspace context to children via data attributes and header
function WorkspaceShell({ 
  workspace,
  allWorkspaces,
  children,
}: { 
  workspace: Workspace;
  allWorkspaces: Workspace[];
  children: React.ReactNode;
}) {
  return (
    <div 
      className="min-h-screen bg-black"
      data-workspace-id={workspace.id} 
      data-workspace-name={workspace.name}
      data-workspace-slug={toSlug(workspace.name)}
    >
      {/* Workspace data for client components */}
      <script
        id="workspace-data"
        type="application/json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            current: workspace,
            all: allWorkspaces,
          }),
        }}
      />
      
      {/* Header with workspace switcher */}
      <WorkspaceHeader />
      
      {/* Page content */}
      <main>
        {children}
      </main>
    </div>
  );
}

