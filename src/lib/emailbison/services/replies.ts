/**
 * Replies Service (Master Inbox)
 *
 * Operations for managing email replies and conversations.
 */

import { getClient } from '../client';
import type {
  ApiResponse,
  PaginatedResponse,
  Reply,
  ListRepliesRequest,
  SendReplyRequest,
  ComposeNewEmailRequest,
  ForwardReplyRequest,
  ConversationThread,
  AttachScheduledEmailRequest,
  PushToFollowupCampaignRequest,
  SuccessResponse,
} from '../types';

/**
 * List all replies in the current workspace.
 * Supports filtering by folder, status, campaign, sender, etc.
 */
export async function listReplies(filters?: ListRepliesRequest): Promise<PaginatedResponse<Reply>> {
  const client = getClient();
  
  const params: Record<string, string | number | boolean | undefined> = {};
  if (filters?.page) params.page = filters.page;
  if (filters?.per_page) params.per_page = filters.per_page;
  if (filters?.search) params.search = filters.search;
  if (filters?.status) params.status = filters.status;
  if (filters?.folder) params.folder = filters.folder;
  if (filters?.read !== undefined) params.read = filters.read;
  if (filters?.campaign_id) params.campaign_id = filters.campaign_id;
  if (filters?.sender_email_id) params.sender_email_id = filters.sender_email_id;
  if (filters?.lead_id) params.lead_id = filters.lead_id;
  // tag_ids would need array serialization if used
  
  const response = await client.get<PaginatedResponse<Reply>>('/api/replies', { params });
  return response;
}

/**
 * Get a single reply by ID.
 */
export async function getReply(replyId: number | string): Promise<Reply> {
  const client = getClient();
  const response = await client.get<ApiResponse<Reply>>(`/api/replies/${replyId}`);
  return response.data;
}

/**
 * Delete a reply.
 */
export async function deleteReply(replyId: number | string): Promise<SuccessResponse> {
  const client = getClient();
  const response = await client.delete<ApiResponse<SuccessResponse>>(`/api/replies/${replyId}`);
  return response.data;
}

/**
 * Get the full conversation thread for a reply.
 */
export async function getConversationThread(replyId: number | string): Promise<Reply[]> {
  const client = getClient();
  const response = await client.get<ApiResponse<ConversationThread>>(`/api/replies/${replyId}/conversation-thread`);
  return response.data.messages;
}

/**
 * Send a reply to an existing email thread.
 */
export async function sendReply(replyId: number | string, payload: SendReplyRequest): Promise<Reply> {
  const client = getClient();
  const response = await client.post<ApiResponse<Reply>>(`/api/replies/${replyId}/reply`, payload);
  return response.data;
}

/**
 * Compose and send a new email (not a reply to existing thread).
 */
export async function composeNewEmail(payload: ComposeNewEmailRequest): Promise<Reply> {
  const client = getClient();
  const response = await client.post<ApiResponse<Reply>>('/api/replies/new', payload);
  return response.data;
}

/**
 * Forward an email to new recipients.
 */
export async function forwardReply(replyId: number | string, payload: ForwardReplyRequest): Promise<Reply> {
  const client = getClient();
  const response = await client.post<ApiResponse<Reply>>(`/api/replies/${replyId}/forward`, payload);
  return response.data;
}

/**
 * Mark a reply as interested (the lead is interested).
 */
export async function markAsInterested(replyId: number | string): Promise<Reply> {
  const client = getClient();
  const response = await client.patch<ApiResponse<Reply>>(`/api/replies/${replyId}/mark-as-interested`);
  return response.data;
}

/**
 * Mark a reply as not interested.
 */
export async function markAsNotInterested(replyId: number | string): Promise<Reply> {
  const client = getClient();
  const response = await client.patch<ApiResponse<Reply>>(`/api/replies/${replyId}/mark-as-not-interested`);
  return response.data;
}

/**
 * Toggle read/unread status for a reply.
 */
export async function markAsReadOrUnread(replyId: number | string, read: boolean): Promise<Reply> {
  const client = getClient();
  const response = await client.patch<ApiResponse<Reply>>(`/api/replies/${replyId}/mark-as-read-or-unread`, { read });
  return response.data;
}

/**
 * Toggle automated reply flag.
 */
export async function markAsAutomatedOrNot(replyId: number | string, automated: boolean): Promise<Reply> {
  const client = getClient();
  const response = await client.patch<ApiResponse<Reply>>(`/api/replies/${replyId}/mark-as-automated-or-not-automated`, { automated_reply: automated });
  return response.data;
}

/**
 * Unsubscribe the contact from future emails.
 */
export async function unsubscribeContact(replyId: number | string): Promise<SuccessResponse> {
  const client = getClient();
  const response = await client.patch<ApiResponse<SuccessResponse>>(`/api/replies/${replyId}/unsubscribe`);
  return response.data;
}

/**
 * Attach a scheduled email to an untracked reply.
 * Used to link replies that couldn't be automatically matched to a campaign.
 */
export async function attachScheduledEmail(
  replyId: number | string,
  payload: AttachScheduledEmailRequest
): Promise<Reply> {
  const client = getClient();
  const response = await client.post<ApiResponse<Reply>>(
    `/api/replies/${replyId}/attach-scheduled-email-to-reply`,
    payload
  );
  return response.data;
}

/**
 * Push a reply's lead to a followup campaign.
 */
export async function pushToFollowupCampaign(
  replyId: number | string,
  payload: PushToFollowupCampaignRequest
): Promise<SuccessResponse> {
  const client = getClient();
  const response = await client.post<ApiResponse<SuccessResponse>>(
    `/api/replies/${replyId}/followup-campaign/push`,
    payload
  );
  return response.data;
}

/**
 * Get all replies for a specific lead.
 */
export async function getRepliesForLead(leadId: number | string): Promise<Reply[]> {
  const client = getClient();
  const response = await client.get<ApiResponse<Reply[]>>(`/api/leads/${leadId}/replies`);
  return response.data;
}

