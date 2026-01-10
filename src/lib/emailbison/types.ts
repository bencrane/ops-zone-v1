/**
 * EmailBison API Types
 *
 * These types are derived from the EmailBison OpenAPI specification.
 * They represent the exact shape of API requests and responses.
 *
 * IMPORTANT: These are API types, NOT internal application types.
 * Transform between these and your internal types at the hook/service boundary.
 */

// =============================================================================
// COMMON TYPES
// =============================================================================

/** Standard API response wrapper */
export interface ApiResponse<T> {
  data: T;
}

/** Standard paginated response */
export interface PaginatedResponse<T> {
  data: T[];
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  links?: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
}

/** Tag attached to campaigns, email accounts, etc. */
export interface Tag {
  id: number;
  name: string;
  default: boolean;
}

// =============================================================================
// ACCOUNT / USER
// =============================================================================

export interface Team {
  id: number;
  name: string;
  personal_team: boolean;
  main: boolean;
  parent_id: number | null;
  total_monthly_email_verification_credits: number;
  remaining_monthly_email_verification_credits: number;
  remaining_email_verification_credits: number;
  total_email_verification_credits: number;
  sender_email_limit: number;
  warmup_limit: number;
  warmup_filter_phrase: string | null;
  has_access_to_warmup: boolean;
  has_access_to_healthcheck: boolean;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  team: Team;
  profile_photo_path: string | null;
  profile_photo_url: string;
  created_at: string;
  updated_at: string;
}

// =============================================================================
// CAMPAIGNS
// =============================================================================

/**
 * Campaign status values from API.
 * Note: API returns capitalized strings (e.g., "Active", "Paused")
 */
export type CampaignStatus =
  | 'Draft'
  | 'Launching'
  | 'Active'
  | 'Stopped'
  | 'Completed'
  | 'Paused'
  | 'Failed'
  | 'Queued'
  | 'Archived'
  | 'Pending deletion'
  | 'Deleted';

/** Lowercase version used in filter requests */
export type CampaignStatusFilter =
  | 'draft'
  | 'launching'
  | 'active'
  | 'stopped'
  | 'completed'
  | 'paused'
  | 'failed'
  | 'queued'
  | 'archived'
  | 'pending deletion'
  | 'deleted';

export type CampaignType = 'outbound' | 'reply_followup';

export interface Campaign {
  id: number;
  uuid: string;
  name: string;
  type: CampaignType;
  status: CampaignStatus;
  /** Percentage complete (only present for launching campaigns) */
  completion_percentage?: number;
  emails_sent: number;
  opened: number;
  unique_opens: number;
  replied: number;
  unique_replies: number;
  bounced: number;
  unsubscribed: number;
  interested: number;
  total_leads_contacted: number;
  total_leads: number;
  max_emails_per_day: number;
  max_new_leads_per_day: number;
  plain_text: boolean;
  open_tracking: boolean;
  can_unsubscribe: boolean;
  unsubscribe_text: string;
  created_at: string;
  updated_at: string;
  tags: Tag[];
}

/** Request to create a campaign */
export interface CreateCampaignRequest {
  name: string;
  type?: CampaignType;
}

/** Request to list campaigns with optional filters */
export interface ListCampaignsRequest {
  search?: string | null;
  status?: CampaignStatusFilter | null;
  tag_ids?: number[];
}

/** Request to update campaign settings */
export interface UpdateCampaignSettingsRequest {
  name?: string;
  max_emails_per_day?: number;
  max_new_leads_per_day?: number;
  open_tracking?: boolean;
  plain_text?: boolean;
  can_unsubscribe?: boolean;
  unsubscribe_text?: string;
}

// =============================================================================
// CAMPAIGN SCHEDULE
// =============================================================================

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface CampaignSchedule {
  id: number;
  name: string;
  timezone: string;
  days: DayOfWeek[];
  start_time: string; // HH:MM format
  end_time: string;   // HH:MM format
}

export interface UpdateCampaignScheduleRequest {
  name?: string;
  timezone?: string;
  days?: DayOfWeek[];
  start_time?: string;
  end_time?: string;
}

export interface TimezoneOption {
  value: string;
  label: string;
}

// =============================================================================
// SEQUENCE STEPS
// =============================================================================

export interface SequenceStep {
  id: number;
  email_subject: string;
  order: number;
  email_body: string;
  wait_in_days: number;
  variant: boolean;
  variant_from_step_id: number | null;
  attachments: unknown[] | null;
  thread_reply: boolean;
}

export interface Sequence {
  id: number;
  type: string;
  title: string;
  sequence_steps: SequenceStep[];
}

export interface SequenceStepsResponse {
  sequence_id: number;
  sequence_steps: SequenceStep[];
}

/** Request to create sequence steps (v1.1 API) */
export interface CreateSequenceStepsRequest {
  title: string;
  sequence_steps: CreateSequenceStepInput[];
}

export interface CreateSequenceStepInput {
  email_subject: string;
  email_subject_variables?: string[];
  order?: number;
  email_body: string;
  wait_in_days: number;
  variant?: boolean;
  /** Order number of step in current request to be variant of */
  variant_from_step?: number;
  /** ID of existing step to be variant of */
  variant_from_step_id?: number;
  attachments?: unknown;
  thread_reply?: boolean;
}

/** Request to update sequence steps (v1.1 API) */
export interface UpdateSequenceStepsRequest {
  title?: string;
  sequence_steps: UpdateSequenceStepInput[];
}

/** 
 * For UPDATE, OpenAPI requires: id, email_subject, order, email_body, wait_in_days
 * Note: order is required for updates (unlike creates where it's optional)
 */
export interface UpdateSequenceStepInput {
  id: number;
  email_subject: string;
  email_body: string;
  wait_in_days: number;
  order: number; // Required for updates
  email_subject_variables?: string[];
  variant?: boolean;
  variant_from_step_id?: number;
  attachments?: unknown;
  thread_reply?: boolean;
}

// =============================================================================
// EMAIL ACCOUNTS (SENDER EMAILS)
// =============================================================================

export type EmailAccountStatus = 'Connected' | 'Disconnected' | 'Error' | 'Pending';
export type EmailAccountType = 'Inbox' | 'SMTP';

export interface EmailAccount {
  id: number;
  name: string;
  email: string;
  email_signature: string;
  imap_server: string;
  imap_port: number;
  smtp_server: string;
  smtp_port: number;
  daily_limit: number;
  type: EmailAccountType;
  status: EmailAccountStatus;
  emails_sent_count: number;
  total_replied_count: number;
  total_opened_count: number;
  unsubscribed_count: number;
  bounced_count: number;
  unique_replied_count: number;
  unique_opened_count: number;
  total_leads_contacted_count: number;
  interested_leads_count: number;
  created_at: string;
  updated_at: string;
  tags: Tag[];
}

/** Request to create an IMAP/SMTP email account */
export interface CreateEmailAccountRequest {
  name: string;
  email: string;
  password: string;
  imap_server: string;
  imap_port: number;
  smtp_server: string;
  smtp_port: number;
  daily_limit?: number;
  email_signature?: string;
}

/** Request to update an email account */
export interface UpdateEmailAccountRequest {
  name?: string;
  daily_limit?: number;
  email_signature?: string;
  imap_server?: string;
  imap_port?: number;
  imap_username?: string;
  imap_password?: string;
  smtp_server?: string;
  smtp_port?: number;
  smtp_username?: string;
  smtp_password?: string;
}

/** Request to test IMAP connection */
export interface TestImapConnectionRequest {
  imap_server: string;
  imap_port: number;
  imap_username: string;
  imap_password: string;
}

/** Request to test SMTP connection */
export interface TestSmtpConnectionRequest {
  smtp_server: string;
  smtp_port: number;
  smtp_username: string;
  smtp_password: string;
}

// =============================================================================
// SENDING SCHEDULES
// =============================================================================

export interface SendingSchedule {
  id: number;
  name: string;
  timezone: string;
  days: DayOfWeek[];
  start_time: string;
  end_time: string;
  is_default: boolean;
}

export interface CreateSendingScheduleRequest {
  name: string;
  timezone: string;
  days: DayOfWeek[];
  start_time: string;
  end_time: string;
}

// =============================================================================
// CAMPAIGN - EMAIL ACCOUNT ASSIGNMENT
// =============================================================================

/** Request to assign email accounts to a campaign */
export interface AssignEmailAccountsRequest {
  sender_email_ids: number[];
}

// =============================================================================
// WARMUP
// =============================================================================

export interface WarmupSettings {
  enabled: boolean;
  daily_limit: number;
  reply_rate: number;
  increase_per_day: number;
}

export interface EnableWarmupRequest {
  daily_limit?: number;
  reply_rate?: number;
  increase_per_day?: number;
}

export interface WarmupStats {
  emails_sent: number;
  emails_received: number;
  reply_rate: number;
  current_daily_limit: number;
}

// =============================================================================
// BLACKLISTS
// =============================================================================

export interface BlacklistedEmail {
  id: number;
  email: string;
  created_at: string;
}

export interface BlacklistedDomain {
  id: number;
  domain: string;
  created_at: string;
}

export interface AddToBlacklistRequest {
  emails?: string[];
  domains?: string[];
}

// =============================================================================
// WEBHOOKS
// =============================================================================

export type WebhookEvent =
  | 'email_sent'
  | 'email_opened'
  | 'email_replied'
  | 'email_bounced'
  | 'email_unsubscribed'
  | 'lead_interested'
  | 'campaign_completed';

export interface Webhook {
  id: number;
  url: string;
  events: WebhookEvent[];
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateWebhookRequest {
  url: string;
  events: WebhookEvent[];
}

// =============================================================================
// REPLIES
// =============================================================================

export type ReplyStatus = 'unread' | 'read' | 'replied' | 'archived';

export interface Reply {
  id: number;
  campaign_id: number;
  lead_id: number;
  email_account_id: number;
  subject: string;
  body: string;
  from_email: string;
  from_name: string;
  status: ReplyStatus;
  received_at: string;
  created_at: string;
  updated_at: string;
}

export interface ListRepliesRequest {
  campaign_id?: number;
  status?: ReplyStatus;
  page?: number;
  per_page?: number;
}

export interface SendReplyRequest {
  body: string;
  subject?: string;
}

// =============================================================================
// WORKSPACES
// =============================================================================

export interface Workspace {
  id: number;
  name: string;
  personal_team: boolean;
  main: boolean;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceStats {
  total_campaigns: number;
  active_campaigns: number;
  total_leads: number;
  emails_sent_today: number;
  emails_sent_this_week: number;
  emails_sent_this_month: number;
}

export interface CreateWorkspaceRequest {
  name: string;
}

export interface InviteTeamMemberRequest {
  email: string;
  role: 'admin' | 'member';
}

// =============================================================================
// CUSTOM TAGS
// =============================================================================

export interface CustomTag {
  id: number;
  name: string;
  color: string;
  default: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateTagRequest {
  name: string;
  color?: string;
}

export interface UpdateTagRequest {
  name?: string;
  color?: string;
}

// =============================================================================
// GENERIC SUCCESS RESPONSE
// =============================================================================

export interface SuccessResponse {
  success: boolean;
  message: string;
}

