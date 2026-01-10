/**
 * Campaigns Service
 *
 * CRUD operations for campaigns.
 */

import { getClient } from '../client';
import type {
  ApiResponse,
  Campaign,
  ListCampaignsRequest,
  CreateCampaignRequest,
  UpdateCampaignSettingsRequest,
  SequenceStepsResponse,
  Sequence,
  CreateSequenceStepsRequest,
  UpdateSequenceStepsRequest,
  EmailAccount,
  CampaignSchedule,
  SuccessResponse,
} from '../types';

/**
 * List all campaigns in the current workspace.
 * Supports optional filtering by search, status, and tags.
 */
export async function listCampaigns(filters?: ListCampaignsRequest): Promise<Campaign[]> {
  const client = getClient();
  
  // Build query params from filters
  const params: Record<string, string | number | boolean | undefined> = {};
  if (filters?.search) params.search = filters.search;
  if (filters?.status) params.status = filters.status;
  // tag_ids would need to be serialized appropriately if used
  
  const response = await client.get<ApiResponse<Campaign[]>>('/api/campaigns', { params });
  return response.data;
}

/**
 * Get details for a specific campaign.
 */
export async function getCampaign(campaignId: number | string): Promise<Campaign> {
  const client = getClient();
  const response = await client.get<ApiResponse<Campaign>>(`/api/campaigns/${campaignId}`);
  return response.data;
}

/**
 * Get the sequence steps for a campaign.
 */
export async function getCampaignSequenceSteps(campaignId: number | string): Promise<SequenceStepsResponse> {
  const client = getClient();
  const response = await client.get<ApiResponse<SequenceStepsResponse>>(
    `/api/campaigns/${campaignId}/sequence-steps`
  );
  return response.data;
}

/**
 * Get email accounts assigned to a campaign.
 */
export async function getCampaignEmailAccounts(campaignId: number | string): Promise<EmailAccount[]> {
  const client = getClient();
  const response = await client.get<ApiResponse<EmailAccount[]>>(
    `/api/campaigns/${campaignId}/sender-emails`
  );
  return response.data;
}

/**
 * Get the sending schedule for a campaign.
 */
export async function getCampaignSchedule(campaignId: number | string): Promise<CampaignSchedule> {
  const client = getClient();
  const response = await client.get<ApiResponse<CampaignSchedule>>(
    `/api/campaigns/${campaignId}/sending-schedule`
  );
  return response.data;
}

// =============================================================================
// MUTATIONS
// =============================================================================

/**
 * Create a new campaign.
 */
export async function createCampaign(data: CreateCampaignRequest): Promise<Campaign> {
  const client = getClient();
  const response = await client.post<ApiResponse<Campaign>>('/api/campaigns', data);
  return response.data;
}

/**
 * Pause a campaign.
 */
export async function pauseCampaign(campaignId: number | string): Promise<Campaign> {
  const client = getClient();
  const response = await client.patch<ApiResponse<Campaign>>(
    `/api/campaigns/${campaignId}/pause`
  );
  return response.data;
}

/**
 * Resume a paused campaign.
 */
export async function resumeCampaign(campaignId: number | string): Promise<Campaign> {
  const client = getClient();
  const response = await client.patch<ApiResponse<Campaign>>(
    `/api/campaigns/${campaignId}/resume`
  );
  return response.data;
}

/**
 * Delete a campaign.
 * Note: Deletion is queued and processed in the background.
 */
export async function deleteCampaign(campaignId: number | string): Promise<SuccessResponse> {
  const client = getClient();
  const response = await client.delete<ApiResponse<SuccessResponse>>(
    `/api/campaigns/${campaignId}`
  );
  return response.data;
}

/**
 * Attach sender email accounts to a campaign.
 */
export async function attachSenderEmails(
  campaignId: number | string,
  senderEmailIds: number[]
): Promise<void> {
  const client = getClient();
  await client.post(`/api/campaigns/${campaignId}/attach-sender-emails`, {
    sender_email_ids: senderEmailIds,
  });
}

/**
 * Remove sender email accounts from a campaign.
 */
export async function removeSenderEmails(
  campaignId: number | string,
  senderEmailIds: number[]
): Promise<void> {
  const client = getClient();
  await client.delete(`/api/campaigns/${campaignId}/remove-sender-emails`, {
    data: { sender_email_ids: senderEmailIds },
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * Update campaign settings.
 */
export async function updateCampaignSettings(
  campaignId: number | string,
  settings: UpdateCampaignSettingsRequest
): Promise<Campaign> {
  const client = getClient();
  const response = await client.patch<ApiResponse<Campaign>>(
    `/api/campaigns/${campaignId}/update`,
    settings
  );
  return response.data;
}

// =============================================================================
// SEQUENCE STEPS
// =============================================================================

/**
 * Get sequence steps for a campaign (v1.1 API).
 * Returns sequence_id and array of steps.
 */
export async function getSequenceSteps(
  campaignId: number | string
): Promise<SequenceStepsResponse> {
  const client = getClient();
  const response = await client.get<ApiResponse<SequenceStepsResponse>>(
    `/api/campaigns/v1.1/${campaignId}/sequence-steps`
  );
  return response.data;
}

/**
 * Create sequence steps for a campaign (v1.1 API).
 * This creates the initial sequence from scratch.
 */
export async function createSequenceSteps(
  campaignId: number | string,
  data: CreateSequenceStepsRequest
): Promise<Sequence> {
  const client = getClient();
  const response = await client.post<ApiResponse<Sequence>>(
    `/api/campaigns/v1.1/${campaignId}/sequence-steps`,
    data
  );
  return response.data;
}

/**
 * Update sequence steps (v1.1 API).
 * Updates existing steps - each step must include its id.
 */
export async function updateSequenceSteps(
  sequenceId: number | string,
  data: UpdateSequenceStepsRequest
): Promise<Sequence> {
  const client = getClient();
  const response = await client.put<ApiResponse<Sequence>>(
    `/api/campaigns/v1.1/sequence-steps/${sequenceId}`,
    data
  );
  return response.data;
}

/**
 * Delete a specific sequence step.
 */
export async function deleteSequenceStep(
  sequenceStepId: number | string
): Promise<SuccessResponse> {
  const client = getClient();
  const response = await client.delete<ApiResponse<SuccessResponse>>(
    `/api/campaigns/sequence-steps/${sequenceStepId}`
  );
  return response.data;
}

/**
 * Send a test email for a sequence step.
 */
export async function sendTestEmail(
  sequenceStepId: number | string,
  senderEmailId: number,
  leadId?: number
): Promise<SuccessResponse> {
  const client = getClient();
  const response = await client.post<ApiResponse<SuccessResponse>>(
    `/api/campaigns/sequence-steps/${sequenceStepId}/test-email`,
    {
      sender_email_id: senderEmailId,
      ...(leadId && { lead_id: leadId }),
    }
  );
  return response.data;
}

