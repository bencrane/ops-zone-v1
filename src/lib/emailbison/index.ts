/**
 * EmailBison API Client
 *
 * Public API for the EmailBison integration.
 *
 * Usage:
 *   import { getAccount, listCampaigns } from '@/lib/emailbison';
 *   const user = await getAccount();
 *   const campaigns = await listCampaigns();
 */

// Client
export {
  createClient,
  getClient,
  resetClient,
  type ClientConfig,
  type RequestOptions,
  type EmailBisonClient,
} from './client';

// Errors
export {
  EmailBisonError,
  NetworkError,
  TimeoutError,
  AuthenticationError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
  RateLimitError,
  ServerError,
  httpErrorFromResponse,
  isEmailBisonError,
  isRetryableError,
  type ErrorCode,
} from './errors';

// Services
export {
  // Account
  getAccount,
  // Workspaces
  listWorkspaces,
  getWorkspace,
  switchWorkspace,
  // Email Accounts
  listEmailAccounts,
  getEmailAccount,
  getEmailAccountCampaigns,
  createEmailAccount,
  // Campaigns
  listCampaigns,
  getCampaign,
  getCampaignSequenceSteps,
  getCampaignEmailAccounts,
  getCampaignSchedule,
  createCampaign,
  pauseCampaign,
  resumeCampaign,
  deleteCampaign,
  attachSenderEmails,
  removeSenderEmails,
  updateCampaignSettings,
  // Sequence Steps (v1.1 API)
  getSequenceSteps,
  createSequenceSteps,
  updateSequenceSteps,
  deleteSequenceStep,
  sendTestEmail,
} from './services';

// Types - re-export all API types
export type {
  // Common
  ApiResponse,
  PaginatedResponse,
  Tag,

  // Account
  Team,
  User,

  // Campaigns
  Campaign,
  CampaignStatus,
  CampaignStatusFilter,
  CampaignType,
  CreateCampaignRequest,
  ListCampaignsRequest,
  UpdateCampaignSettingsRequest,

  // Schedule
  CampaignSchedule,
  UpdateCampaignScheduleRequest,
  DayOfWeek,
  TimezoneOption,
  SendingSchedule,
  CreateSendingScheduleRequest,

  // Sequences
  Sequence,
  SequenceStep,
  SequenceStepsResponse,
  CreateSequenceStepsRequest,
  CreateSequenceStepInput,
  UpdateSequenceStepsRequest,
  UpdateSequenceStepInput,

  // Email Accounts
  EmailAccount,
  EmailAccountStatus,
  EmailAccountType,
  CreateEmailAccountRequest,
  UpdateEmailAccountRequest,
  TestImapConnectionRequest,
  TestSmtpConnectionRequest,
  AssignEmailAccountsRequest,

  // Warmup
  WarmupSettings,
  WarmupStats,
  EnableWarmupRequest,

  // Blacklists
  BlacklistedEmail,
  BlacklistedDomain,
  AddToBlacklistRequest,

  // Webhooks
  Webhook,
  WebhookEvent,
  CreateWebhookRequest,

  // Replies
  Reply,
  ReplyStatus,
  ListRepliesRequest,
  SendReplyRequest,

  // Workspaces
  Workspace,
  WorkspaceStats,
  CreateWorkspaceRequest,
  InviteTeamMemberRequest,

  // Tags
  CustomTag,
  CreateTagRequest,
  UpdateTagRequest,

  // Generic
  SuccessResponse,
} from './types';

