/**
 * Workspaces Service
 *
 * Operations for workspaces.
 */

import { getClient } from '../client';
import type { ApiResponse, Team } from '../types';

/**
 * List all workspaces the authenticated user has access to.
 */
export async function listWorkspaces(): Promise<Team[]> {
  const client = getClient();
  const response = await client.get<ApiResponse<Team[]>>('/api/workspaces');
  return response.data;
}

/**
 * Get details for a specific workspace.
 */
export async function getWorkspace(workspaceId: number): Promise<Team> {
  const client = getClient();
  const response = await client.get<ApiResponse<Team>>(`/api/workspaces/${workspaceId}`);
  return response.data;
}

/**
 * Switch to a different workspace.
 * After switching, subsequent API calls will operate within the new workspace.
 */
export async function switchWorkspace(workspaceId: number): Promise<{ name: string }> {
  const client = getClient();
  const response = await client.post<ApiResponse<{ name: string }>>(
    '/api/workspaces/v1.1/switch-workspace',
    { team_id: workspaceId }
  );
  return response.data;
}

