/**
 * Account Service
 *
 * GET operations for the authenticated user's account and current workspace context.
 */

import { getClient } from '../client';
import type { ApiResponse, User } from '../types';

/**
 * Get the current authenticated user's account details.
 * Includes current workspace context.
 */
export async function getAccount(): Promise<User> {
  const client = getClient();
  const response = await client.get<ApiResponse<User>>('/api/users');
  return response.data;
}

