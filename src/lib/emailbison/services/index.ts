/**
 * EmailBison Services
 *
 * Re-exports all service functions organized by domain.
 */

// Account
export { getAccount } from './account';

// Workspaces
export { listWorkspaces, getWorkspace, switchWorkspace } from './workspaces';

// Email Accounts
export {
  listEmailAccounts,
  getEmailAccount,
  getEmailAccountCampaigns,
  createEmailAccount,
} from './email-accounts';

// Campaigns
export {
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
} from './campaigns';

