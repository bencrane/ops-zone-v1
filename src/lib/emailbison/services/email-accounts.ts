/**
 * Email Accounts Service
 *
 * CRUD operations for sender email accounts.
 */

import { getClient } from '../client';
import type { ApiResponse, EmailAccount, Campaign, CreateEmailAccountRequest } from '../types';

/**
 * List all email accounts in the current workspace.
 */
export async function listEmailAccounts(): Promise<EmailAccount[]> {
  const client = getClient();
  const response = await client.get<ApiResponse<EmailAccount[]>>('/api/sender-emails');
  return response.data;
}

/**
 * Get details for a specific email account.
 */
export async function getEmailAccount(emailAccountId: number | string): Promise<EmailAccount> {
  const client = getClient();
  const response = await client.get<ApiResponse<EmailAccount>>(`/api/sender-emails/${emailAccountId}`);
  return response.data;
}

/**
 * Get campaigns that use a specific email account.
 */
export async function getEmailAccountCampaigns(emailAccountId: number | string): Promise<Campaign[]> {
  const client = getClient();
  const response = await client.get<ApiResponse<Campaign[]>>(`/api/sender-emails/${emailAccountId}/campaigns`);
  return response.data;
}

/**
 * Create a new IMAP/SMTP email account.
 */
export async function createEmailAccount(data: CreateEmailAccountRequest): Promise<EmailAccount> {
  const client = getClient();
  const response = await client.post<ApiResponse<EmailAccount>>('/api/sender-emails/imap-smtp', data);
  return response.data;
}

