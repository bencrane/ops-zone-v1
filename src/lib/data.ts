import { Campaign, Lead, DashboardStats, LeadFilters, LeadList, SenderAccount, SendingSchedule, SequenceStep, SequenceStepVariant } from "@/types";

// Mock Sender Accounts
export const senderAccounts: SenderAccount[] = [
  {
    id: "sender_001",
    email: "outreach@company.com",
    name: "Company Outreach",
    provider: "google",
    daily_limit: 200,
    is_active: true,
  },
  {
    id: "sender_002",
    email: "sales@company.com",
    name: "Sales Team",
    provider: "google",
    daily_limit: 150,
    is_active: true,
  },
  {
    id: "sender_003",
    email: "partnerships@company.com",
    name: "Partnerships",
    provider: "microsoft",
    daily_limit: 100,
    is_active: true,
  },
  {
    id: "sender_004",
    email: "founders@company.com",
    name: "Founder Outreach",
    provider: "google",
    daily_limit: 50,
    is_active: false,
  },
];

// Mock Campaigns
export const campaigns: Campaign[] = [
  {
    id: "camp_001",
    name: "SaaS Founders - Q1 Outreach",
    status: "active",
    description: "Targeting SaaS founders for dev tool partnerships",
    subject_line_preview: "Question about {{company}}'s dev workflow",
    sequence_count: 4,
    stats: { enrolled: 145, sent: 1240, opened: 450, replied: 28, bounced: 12 },
    daily_send_limit: 100,
    sending_schedule: { days: ["mon", "tue", "wed", "thu", "fri"], start_hour: 9, end_hour: 17 },
    timezone: "America/New_York",
    sender_account_ids: ["sender_001", "sender_002"],
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-20T14:30:00Z",
  },
  {
    id: "camp_002",
    name: "Agency Partnership",
    status: "active",
    description: "Marketing agencies for white-label partnerships",
    subject_line_preview: "Partnership opportunity for {{company}}",
    sequence_count: 3,
    stats: { enrolled: 89, sent: 800, opened: 312, replied: 15, bounced: 8 },
    daily_send_limit: 75,
    sending_schedule: { days: ["mon", "tue", "wed", "thu", "fri"], start_hour: 10, end_hour: 16 },
    timezone: "America/Los_Angeles",
    sender_account_ids: ["sender_003"],
    created_at: "2024-02-01T14:30:00Z",
    updated_at: "2024-02-10T09:00:00Z",
  },
  {
    id: "camp_003",
    name: "E-commerce CEOs",
    status: "paused",
    description: "E-commerce founders scaling past $1M ARR",
    subject_line_preview: "Scaling {{company}}'s ad spend",
    sequence_count: 5,
    stats: { enrolled: 67, sent: 420, opened: 189, replied: 8, bounced: 5 },
    daily_send_limit: 50,
    timezone: "America/Chicago",
    sender_account_ids: ["sender_001"],
    created_at: "2024-02-10T09:15:00Z",
    updated_at: "2024-02-15T11:00:00Z",
  },
  {
    id: "camp_004",
    name: "Fintech Series A+",
    status: "draft",
    description: "Series A+ fintech companies for infrastructure deals",
    subject_line_preview: "Re: {{company}} infrastructure",
    sequence_count: 4,
    stats: { enrolled: 0, sent: 0, opened: 0, replied: 0, bounced: 0 },
    created_at: "2024-02-20T08:00:00Z",
    updated_at: "2024-02-20T08:00:00Z",
  },
  {
    id: "camp_005",
    name: "Healthcare Tech Decision Makers",
    status: "active",
    description: "CTOs and VPs at healthcare tech companies",
    subject_line_preview: "Compliance automation for {{company}}",
    sequence_count: 3,
    stats: { enrolled: 52, sent: 312, opened: 156, replied: 12, bounced: 3 },
    daily_send_limit: 80,
    sending_schedule: { days: ["tue", "wed", "thu"], start_hour: 8, end_hour: 14 },
    timezone: "America/New_York",
    sender_account_ids: ["sender_002"],
    created_at: "2024-02-25T10:00:00Z",
    updated_at: "2024-03-01T14:00:00Z",
  },
];

// Mock Leads - Expanded dataset
export const leads: Lead[] = [
  {
    id: "lead_001",
    first_name: "Sarah",
    last_name: "Connor",
    email: "sarah@skynet.io",
    company: "Skynet Systems",
    position: "CTO",
    industry: "saas",
    company_size: "51-200",
    linkedin_url: "https://linkedin.com/in/sarahconnor",
    status: "replied",
    tags: ["decision-maker", "technical", "hot-lead"],
    campaigns: [
      {
        campaign_id: "camp_001",
        campaign_name: "SaaS Founders - Q1 Outreach",
        enrolled_at: "2024-01-16T10:00:00Z",
        status: "completed",
        emails_sent: 4,
        last_email_at: "2024-01-25T09:00:00Z",
      },
    ],
    notes: "Interested in demo. Follow up next week.",
    added_at: "2024-01-16T10:00:00Z",
    last_contacted_at: "2024-01-25T09:00:00Z",
  },
  {
    id: "lead_002",
    first_name: "John",
    last_name: "Reese",
    email: "john.reese@acme.com",
    company: "Acme Corp",
    position: "CEO",
    industry: "saas",
    company_size: "11-50",
    status: "opened",
    tags: ["founder", "decision-maker"],
    campaigns: [
      {
        campaign_id: "camp_001",
        campaign_name: "SaaS Founders - Q1 Outreach",
        enrolled_at: "2024-01-17T11:00:00Z",
        status: "active",
        emails_sent: 2,
        last_email_at: "2024-01-22T10:00:00Z",
      },
    ],
    added_at: "2024-01-17T11:00:00Z",
    last_contacted_at: "2024-01-22T10:00:00Z",
  },
  {
    id: "lead_003",
    first_name: "Jane",
    last_name: "Smith",
    email: "jane@creativepulse.co",
    company: "Creative Pulse",
    position: "VP Marketing",
    industry: "agency",
    company_size: "11-50",
    linkedin_url: "https://linkedin.com/in/janesmith",
    status: "contacted",
    tags: ["marketing", "agency-lead"],
    campaigns: [
      {
        campaign_id: "camp_002",
        campaign_name: "Agency Partnership",
        enrolled_at: "2024-02-02T09:00:00Z",
        status: "active",
        emails_sent: 1,
        last_email_at: "2024-02-02T09:00:00Z",
      },
    ],
    added_at: "2024-02-02T09:00:00Z",
    last_contacted_at: "2024-02-02T09:00:00Z",
  },
  {
    id: "lead_004",
    first_name: "Mike",
    last_name: "Ross",
    email: "mike@pearsonlegal.com",
    company: "Pearson Legal Tech",
    position: "Head of Operations",
    industry: "saas",
    company_size: "51-200",
    status: "bounced",
    tags: ["operations"],
    campaigns: [
      {
        campaign_id: "camp_001",
        campaign_name: "SaaS Founders - Q1 Outreach",
        enrolled_at: "2024-01-18T15:00:00Z",
        status: "removed",
        emails_sent: 1,
        last_email_at: "2024-01-18T15:00:00Z",
      },
    ],
    added_at: "2024-01-18T15:00:00Z",
    last_contacted_at: "2024-01-18T15:00:00Z",
  },
  {
    id: "lead_005",
    first_name: "Bruce",
    last_name: "Wayne",
    email: "bruce@wayne.enterprises",
    company: "Wayne Enterprises",
    position: "Owner",
    industry: "manufacturing",
    company_size: "1000+",
    linkedin_url: "https://linkedin.com/in/brucewayne",
    website: "https://wayne.enterprises",
    status: "new",
    tags: ["enterprise", "high-value", "decision-maker"],
    campaigns: [],
    added_at: "2024-02-12T08:00:00Z",
  },
  {
    id: "lead_006",
    first_name: "Diana",
    last_name: "Prince",
    email: "diana@themyscira.io",
    company: "Themyscira Tech",
    position: "Founder & CEO",
    industry: "ecommerce",
    company_size: "11-50",
    linkedin_url: "https://linkedin.com/in/dianaprince",
    status: "enrolled",
    tags: ["founder", "ecommerce", "decision-maker"],
    campaigns: [
      {
        campaign_id: "camp_003",
        campaign_name: "E-commerce CEOs",
        enrolled_at: "2024-02-15T10:00:00Z",
        status: "paused",
        emails_sent: 2,
        last_email_at: "2024-02-20T09:00:00Z",
      },
    ],
    added_at: "2024-02-10T14:00:00Z",
    last_contacted_at: "2024-02-20T09:00:00Z",
  },
  {
    id: "lead_007",
    first_name: "Clark",
    last_name: "Kent",
    email: "clark@dailyplanet.news",
    company: "Daily Planet Media",
    position: "Director of Technology",
    industry: "other",
    company_size: "201-500",
    status: "new",
    tags: ["media", "technical"],
    campaigns: [],
    added_at: "2024-02-18T11:00:00Z",
  },
  {
    id: "lead_008",
    first_name: "Tony",
    last_name: "Stark",
    email: "tony@stark.industries",
    company: "Stark Industries",
    position: "CEO",
    industry: "manufacturing",
    company_size: "1000+",
    linkedin_url: "https://linkedin.com/in/tonystark",
    website: "https://stark.industries",
    status: "replied",
    tags: ["enterprise", "high-value", "technical", "decision-maker"],
    campaigns: [
      {
        campaign_id: "camp_001",
        campaign_name: "SaaS Founders - Q1 Outreach",
        enrolled_at: "2024-01-20T09:00:00Z",
        status: "completed",
        emails_sent: 3,
        last_email_at: "2024-01-28T14:00:00Z",
      },
    ],
    notes: "Scheduled call for next Tuesday",
    added_at: "2024-01-19T16:00:00Z",
    last_contacted_at: "2024-01-28T14:00:00Z",
  },
  {
    id: "lead_009",
    first_name: "Natasha",
    last_name: "Romanoff",
    email: "natasha@shield.security",
    company: "Shield Security",
    position: "VP Sales",
    industry: "saas",
    company_size: "51-200",
    status: "contacted",
    tags: ["sales", "security"],
    campaigns: [
      {
        campaign_id: "camp_001",
        campaign_name: "SaaS Founders - Q1 Outreach",
        enrolled_at: "2024-01-21T10:00:00Z",
        status: "active",
        emails_sent: 3,
        last_email_at: "2024-02-01T09:00:00Z",
      },
    ],
    added_at: "2024-01-20T09:00:00Z",
    last_contacted_at: "2024-02-01T09:00:00Z",
  },
  {
    id: "lead_010",
    first_name: "Peter",
    last_name: "Parker",
    email: "peter@webtech.dev",
    company: "WebTech Solutions",
    position: "CTO",
    industry: "saas",
    company_size: "1-10",
    linkedin_url: "https://linkedin.com/in/peterparker",
    status: "new",
    tags: ["startup", "technical", "founder"],
    campaigns: [],
    added_at: "2024-02-22T13:00:00Z",
  },
  {
    id: "lead_011",
    first_name: "Steve",
    last_name: "Rogers",
    email: "steve@liberty.health",
    company: "Liberty Health",
    position: "Chief Medical Officer",
    industry: "healthcare",
    company_size: "201-500",
    status: "enrolled",
    tags: ["healthcare", "decision-maker", "c-level"],
    campaigns: [
      {
        campaign_id: "camp_005",
        campaign_name: "Healthcare Tech Decision Makers",
        enrolled_at: "2024-02-26T10:00:00Z",
        status: "active",
        emails_sent: 2,
        last_email_at: "2024-03-01T09:00:00Z",
      },
    ],
    added_at: "2024-02-25T08:00:00Z",
    last_contacted_at: "2024-03-01T09:00:00Z",
  },
  {
    id: "lead_012",
    first_name: "Wanda",
    last_name: "Maximoff",
    email: "wanda@scarlet.consulting",
    company: "Scarlet Consulting",
    position: "Managing Partner",
    industry: "consulting",
    company_size: "11-50",
    linkedin_url: "https://linkedin.com/in/wandamaximoff",
    status: "new",
    tags: ["consulting", "partner", "decision-maker"],
    campaigns: [],
    added_at: "2024-02-28T15:00:00Z",
  },
  {
    id: "lead_013",
    first_name: "T'Challa",
    last_name: "Udaku",
    email: "tchalla@wakanda.tech",
    company: "Wakanda Tech",
    position: "CEO",
    industry: "fintech",
    company_size: "51-200",
    linkedin_url: "https://linkedin.com/in/tchalla",
    website: "https://wakanda.tech",
    status: "new",
    tags: ["fintech", "founder", "decision-maker", "high-value"],
    campaigns: [],
    notes: "Strong Series B candidate",
    added_at: "2024-03-01T10:00:00Z",
  },
  {
    id: "lead_014",
    first_name: "Stephen",
    last_name: "Strange",
    email: "stephen@sanctum.health",
    company: "Sanctum Healthcare",
    position: "Chief Innovation Officer",
    industry: "healthcare",
    company_size: "501-1000",
    status: "opened",
    tags: ["healthcare", "innovation", "c-level"],
    campaigns: [
      {
        campaign_id: "camp_005",
        campaign_name: "Healthcare Tech Decision Makers",
        enrolled_at: "2024-02-27T11:00:00Z",
        status: "active",
        emails_sent: 2,
        last_email_at: "2024-03-02T10:00:00Z",
      },
    ],
    added_at: "2024-02-26T14:00:00Z",
    last_contacted_at: "2024-03-02T10:00:00Z",
  },
  {
    id: "lead_015",
    first_name: "Carol",
    last_name: "Danvers",
    email: "carol@photon.agency",
    company: "Photon Agency",
    position: "Founder",
    industry: "agency",
    company_size: "11-50",
    linkedin_url: "https://linkedin.com/in/caroldanvers",
    status: "replied",
    tags: ["agency", "founder", "decision-maker"],
    campaigns: [
      {
        campaign_id: "camp_002",
        campaign_name: "Agency Partnership",
        enrolled_at: "2024-02-05T09:00:00Z",
        status: "completed",
        emails_sent: 3,
        last_email_at: "2024-02-15T10:00:00Z",
      },
    ],
    notes: "Interested in white-label. Send pricing.",
    added_at: "2024-02-04T11:00:00Z",
    last_contacted_at: "2024-02-15T10:00:00Z",
  },
  {
    id: "lead_016",
    first_name: "Scott",
    last_name: "Lang",
    email: "scott@quantum.ecom",
    company: "Quantum Commerce",
    position: "Head of Growth",
    industry: "ecommerce",
    company_size: "11-50",
    status: "contacted",
    tags: ["ecommerce", "growth"],
    campaigns: [
      {
        campaign_id: "camp_003",
        campaign_name: "E-commerce CEOs",
        enrolled_at: "2024-02-16T14:00:00Z",
        status: "paused",
        emails_sent: 1,
        last_email_at: "2024-02-16T14:00:00Z",
      },
    ],
    added_at: "2024-02-15T16:00:00Z",
    last_contacted_at: "2024-02-16T14:00:00Z",
  },
  {
    id: "lead_017",
    first_name: "Hope",
    last_name: "Van Dyne",
    email: "hope@pym.tech",
    company: "Pym Technologies",
    position: "CEO",
    industry: "saas",
    company_size: "51-200",
    linkedin_url: "https://linkedin.com/in/hopevandyne",
    status: "new",
    tags: ["founder", "technical", "decision-maker"],
    campaigns: [],
    added_at: "2024-03-02T09:00:00Z",
  },
  {
    id: "lead_018",
    first_name: "Sam",
    last_name: "Wilson",
    email: "sam@falcon.finance",
    company: "Falcon Finance",
    position: "CFO",
    industry: "fintech",
    company_size: "11-50",
    status: "new",
    tags: ["fintech", "finance", "c-level"],
    campaigns: [],
    added_at: "2024-03-03T10:00:00Z",
  },
  {
    id: "lead_019",
    first_name: "Pepper",
    last_name: "Potts",
    email: "pepper@stark.industries",
    company: "Stark Industries",
    position: "COO",
    industry: "manufacturing",
    company_size: "1000+",
    linkedin_url: "https://linkedin.com/in/pepperpotts",
    status: "enrolled",
    tags: ["enterprise", "operations", "c-level"],
    campaigns: [
      {
        campaign_id: "camp_001",
        campaign_name: "SaaS Founders - Q1 Outreach",
        enrolled_at: "2024-01-22T11:00:00Z",
        status: "active",
        emails_sent: 3,
        last_email_at: "2024-02-05T10:00:00Z",
      },
    ],
    added_at: "2024-01-21T14:00:00Z",
    last_contacted_at: "2024-02-05T10:00:00Z",
  },
  {
    id: "lead_020",
    first_name: "James",
    last_name: "Rhodes",
    email: "james@warmachine.defense",
    company: "War Machine Defense",
    position: "President",
    industry: "consulting",
    company_size: "51-200",
    status: "new",
    tags: ["consulting", "defense", "decision-maker"],
    campaigns: [],
    added_at: "2024-03-04T08:00:00Z",
  },
];

// All unique tags from leads
export function getAllTags(): string[] {
  const tagSet = new Set<string>();
  leads.forEach((lead) => lead.tags.forEach((tag) => tagSet.add(tag)));
  return Array.from(tagSet).sort();
}

// Data fetching functions
export async function getDashboardStats(): Promise<DashboardStats> {
  return {
    total_campaigns: campaigns.length,
    active_campaigns: campaigns.filter((c) => c.status === "active").length,
    total_leads: leads.length,
    enrolled_leads: leads.filter((l) => l.campaigns.length > 0).length,
    emails_sent_today: 142,
    emails_sent_week: 892,
    avg_open_rate: 38.5,
    avg_reply_rate: 4.2,
  };
}

export async function getCampaigns(): Promise<Campaign[]> {
  return campaigns;
}

export async function getCampaign(id: string): Promise<Campaign | undefined> {
  return campaigns.find((c) => c.id === id);
}

export async function getLeads(filters?: LeadFilters): Promise<Lead[]> {
  let filtered = [...leads];

  if (filters) {
    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(
        (lead) =>
          lead.first_name.toLowerCase().includes(search) ||
          lead.last_name.toLowerCase().includes(search) ||
          lead.email.toLowerCase().includes(search) ||
          lead.company.toLowerCase().includes(search) ||
          lead.position.toLowerCase().includes(search)
      );
    }

    if (filters.status && filters.status !== "all") {
      filtered = filtered.filter((lead) => lead.status === filters.status);
    }

    if (filters.industry && filters.industry !== "all") {
      filtered = filtered.filter((lead) => lead.industry === filters.industry);
    }

    if (filters.company_size && filters.company_size !== "all") {
      filtered = filtered.filter(
        (lead) => lead.company_size === filters.company_size
      );
    }

    if (filters.campaign_id) {
      if (filters.campaign_id === "none") {
        filtered = filtered.filter((lead) => lead.campaigns.length === 0);
      } else if (filters.campaign_id !== "all") {
        filtered = filtered.filter((lead) =>
          lead.campaigns.some((c) => c.campaign_id === filters.campaign_id)
        );
      }
    }

    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter((lead) =>
        filters.tags.some((tag) => lead.tags.includes(tag))
      );
    }
  }

  return filtered;
}

export async function getLeadsForCampaign(campaignId: string): Promise<Lead[]> {
  return leads.filter((lead) =>
    lead.campaigns.some((c) => c.campaign_id === campaignId)
  );
}

export async function getLeadsNotInCampaign(
  campaignId: string
): Promise<Lead[]> {
  return leads.filter(
    (lead) => !lead.campaigns.some((c) => c.campaign_id === campaignId)
  );
}

export async function addLead(
  lead: Omit<Lead, "id" | "added_at" | "campaigns">
): Promise<Lead> {
  const newLead: Lead = {
    ...lead,
    id: `lead_${Math.random().toString(36).substr(2, 9)}`,
    campaigns: [],
    added_at: new Date().toISOString(),
  };
  leads.push(newLead);
  return newLead;
}

export async function enrollLeadsInCampaign(
  leadIds: string[],
  campaignId: string
): Promise<void> {
  const campaign = campaigns.find((c) => c.id === campaignId);
  if (!campaign) return;

  leadIds.forEach((leadId) => {
    const lead = leads.find((l) => l.id === leadId);
    if (lead && !lead.campaigns.some((c) => c.campaign_id === campaignId)) {
      lead.campaigns.push({
        campaign_id: campaignId,
        campaign_name: campaign.name,
        enrolled_at: new Date().toISOString(),
        status: "active",
        emails_sent: 0,
      });
      if (lead.status === "new") {
        lead.status = "enrolled";
      }
      campaign.stats.enrolled++;
    }
  });
}

export async function removeLeadFromCampaign(
  leadId: string,
  campaignId: string
): Promise<void> {
  const lead = leads.find((l) => l.id === leadId);
  const campaign = campaigns.find((c) => c.id === campaignId);
  if (lead && campaign) {
    const enrollment = lead.campaigns.find((c) => c.campaign_id === campaignId);
    if (enrollment) {
      enrollment.status = "removed";
      campaign.stats.enrolled--;
    }
  }
}

// Lead Lists - now stored in Supabase outbound-db, not in memory
export const leadLists: LeadList[] = [];

export async function getLeadLists(): Promise<LeadList[]> {
  await new Promise((resolve) => setTimeout(resolve, 100));
  return [...leadLists];
}

export async function getLeadList(listId: string): Promise<LeadList | undefined> {
  await new Promise((resolve) => setTimeout(resolve, 100));
  return leadLists.find((l) => l.id === listId);
}

export async function getLeadsInList(listId: string): Promise<Lead[]> {
  await new Promise((resolve) => setTimeout(resolve, 100));
  const list = leadLists.find((l) => l.id === listId);
  if (!list) return [];
  return leads.filter((lead) => list.lead_ids.includes(lead.id));
}

export async function createLeadList(
  name: string,
  description?: string
): Promise<LeadList> {
  const newList: LeadList = {
    id: `list_${Math.random().toString(36).substr(2, 9)}`,
    name,
    description,
    lead_ids: [],
    lead_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  leadLists.push(newList);
  return newList;
}

export async function addLeadsToList(
  leadIds: string[],
  listId: string
): Promise<void> {
  const list = leadLists.find((l) => l.id === listId);
  if (list) {
    // Add only leads that aren't already in the list
    const newIds = leadIds.filter((id) => !list.lead_ids.includes(id));
    list.lead_ids.push(...newIds);
    list.lead_count = list.lead_ids.length;
    list.updated_at = new Date().toISOString();
  }
}

export async function removeLeadsFromList(
  leadIds: string[],
  listId: string
): Promise<void> {
  const list = leadLists.find((l) => l.id === listId);
  if (list) {
    list.lead_ids = list.lead_ids.filter((id) => !leadIds.includes(id));
    list.lead_count = list.lead_ids.length;
    list.updated_at = new Date().toISOString();
  }
}

export async function createCampaign(data: {
  name: string;
  description?: string;
}): Promise<Campaign> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const newCampaign: Campaign = {
    id: `camp_${Math.random().toString(36).substr(2, 9)}`,
    name: data.name,
    status: "draft",
    description: data.description || "",
    subject_line_preview: "",
    sequence_count: 0,
    stats: { enrolled: 0, sent: 0, opened: 0, replied: 0, bounced: 0 },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  campaigns.push(newCampaign);
  return newCampaign;
}

// Sender Account functions
export async function getSenderAccounts(): Promise<SenderAccount[]> {
  await new Promise((resolve) => setTimeout(resolve, 100));
  return [...senderAccounts];
}

export async function getActiveSenderAccounts(): Promise<SenderAccount[]> {
  await new Promise((resolve) => setTimeout(resolve, 100));
  return senderAccounts.filter((s) => s.is_active);
}

// Campaign configuration update
export interface CampaignConfigUpdate {
  name?: string;
  daily_send_limit?: number;
  sending_schedule?: SendingSchedule;
  timezone?: string;
  sender_account_ids?: string[];
}

export async function updateCampaignConfig(
  campaignId: string,
  config: CampaignConfigUpdate
): Promise<Campaign> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const campaign = campaigns.find((c) => c.id === campaignId);
  if (!campaign) {
    throw new Error("Campaign not found");
  }

  // Update fields
  if (config.name !== undefined) campaign.name = config.name;
  if (config.daily_send_limit !== undefined) campaign.daily_send_limit = config.daily_send_limit;
  if (config.sending_schedule !== undefined) campaign.sending_schedule = config.sending_schedule;
  if (config.timezone !== undefined) campaign.timezone = config.timezone;
  if (config.sender_account_ids !== undefined) campaign.sender_account_ids = config.sender_account_ids;

  campaign.updated_at = new Date().toISOString();

  return { ...campaign };
}

// =============================================================================
// SEQUENCE STEPS
// =============================================================================

export const sequenceSteps: SequenceStep[] = [
  // Campaign 1: SaaS Founders - Q1 Outreach (4 steps)
  {
    id: "step_001",
    campaign_id: "camp_001",
    step_number: 1,
    subject: "Question about {COMPANY_NAME}'s dev workflow",
    body: `Hi {FIRST_NAME},

I noticed {COMPANY_NAME} is doing interesting work in the SaaS space. I'm curious how your team handles developer tooling and workflow automation.

We've helped companies like yours streamline their dev processes by 40%. Would you be open to a quick chat about what's working (and what's not) for your team?

Best,
[Sender Name]`,
    wait_days: 0,
    is_reply: false,
    variants: [],
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-15T10:00:00Z",
  },
  {
    id: "step_002",
    campaign_id: "camp_001",
    step_number: 2,
    subject: "Re: Question about {COMPANY_NAME}'s dev workflow",
    body: `{FIRST_NAME},

Just wanted to bump this up in your inbox. I know {POSITION}s are busy, but I think this could be valuable for {COMPANY_NAME}.

Quick question: what's the biggest bottleneck in your current dev workflow?

[Sender Name]`,
    wait_days: 3,
    is_reply: true,
    variants: [
      {
        id: "var_001",
        name: "Variant B - Shorter",
        subject: "Re: Question about {COMPANY_NAME}'s dev workflow",
        body: `{FIRST_NAME}, following up on my previous note. Would love to hear about your dev workflow challenges at {COMPANY_NAME}. Worth a quick call?`,
      },
    ],
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-15T10:00:00Z",
  },
  {
    id: "step_003",
    campaign_id: "camp_001",
    step_number: 3,
    subject: "Re: Question about {COMPANY_NAME}'s dev workflow",
    body: `Hi {FIRST_NAME},

I'll keep this short - I've been researching {COMPANY_NAME} and have some specific ideas that might help your team.

Would 15 minutes next week work for a quick call?

[Sender Name]`,
    wait_days: 4,
    is_reply: true,
    variants: [],
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-15T10:00:00Z",
  },
  {
    id: "step_004",
    campaign_id: "camp_001",
    step_number: 4,
    subject: "Closing the loop",
    body: `{FIRST_NAME},

I've reached out a few times without hearing back, so I'll assume the timing isn't right.

If things change at {COMPANY_NAME}, feel free to reach out. I'd be happy to help.

Best,
[Sender Name]`,
    wait_days: 5,
    is_reply: false,
    variants: [],
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-15T10:00:00Z",
  },

  // Campaign 2: Agency Partnership (3 steps)
  {
    id: "step_005",
    campaign_id: "camp_002",
    step_number: 1,
    subject: "Partnership opportunity for {COMPANY_NAME}",
    body: `Hi {FIRST_NAME},

I came across {COMPANY_NAME} and was impressed by your agency's work. We're looking for select partners to white-label our platform.

This could be a new revenue stream for your team without building anything from scratch. Interested in learning more?

Best,
[Sender Name]`,
    wait_days: 0,
    is_reply: false,
    variants: [],
    created_at: "2024-02-01T14:30:00Z",
    updated_at: "2024-02-01T14:30:00Z",
  },
  {
    id: "step_006",
    campaign_id: "camp_002",
    step_number: 2,
    subject: "Re: Partnership opportunity for {COMPANY_NAME}",
    body: `{FIRST_NAME},

Quick follow-up on my partnership note. A few agencies have already signed on and are seeing great results.

Would you have 20 minutes this week to explore if this makes sense for {COMPANY_NAME}?

[Sender Name]`,
    wait_days: 4,
    is_reply: true,
    variants: [],
    created_at: "2024-02-01T14:30:00Z",
    updated_at: "2024-02-01T14:30:00Z",
  },
  {
    id: "step_007",
    campaign_id: "camp_002",
    step_number: 3,
    subject: "Last note on partnership",
    body: `{FIRST_NAME},

I'll assume the timing isn't right for {COMPANY_NAME}. If that changes, the door is always open.

Wishing you continued success!

[Sender Name]`,
    wait_days: 5,
    is_reply: false,
    variants: [],
    created_at: "2024-02-01T14:30:00Z",
    updated_at: "2024-02-01T14:30:00Z",
  },

  // Campaign 5: Healthcare Tech (3 steps)
  {
    id: "step_008",
    campaign_id: "camp_005",
    step_number: 1,
    subject: "Compliance automation for {COMPANY_NAME}",
    body: `Hi {FIRST_NAME},

Healthcare compliance is complex. We've helped organizations like {COMPANY_NAME} automate their compliance workflows, reducing manual work by 60%.

As {POSITION}, I imagine this is on your radar. Would you be open to seeing how we've helped similar teams?

Best,
[Sender Name]`,
    wait_days: 0,
    is_reply: false,
    variants: [],
    created_at: "2024-02-25T10:00:00Z",
    updated_at: "2024-02-25T10:00:00Z",
  },
  {
    id: "step_009",
    campaign_id: "camp_005",
    step_number: 2,
    subject: "Re: Compliance automation for {COMPANY_NAME}",
    body: `{FIRST_NAME},

Following up on compliance automation. Given the regulatory landscape in healthcare, I thought this might be timely for {COMPANY_NAME}.

Quick question: what's your current approach to compliance tracking?

[Sender Name]`,
    wait_days: 4,
    is_reply: true,
    variants: [],
    created_at: "2024-02-25T10:00:00Z",
    updated_at: "2024-02-25T10:00:00Z",
  },
  {
    id: "step_010",
    campaign_id: "camp_005",
    step_number: 3,
    subject: "Final follow-up",
    body: `{FIRST_NAME},

Last note from me. If compliance automation becomes a priority at {COMPANY_NAME}, I'd be happy to reconnect.

Best of luck!
[Sender Name]`,
    wait_days: 5,
    is_reply: false,
    variants: [],
    created_at: "2024-02-25T10:00:00Z",
    updated_at: "2024-02-25T10:00:00Z",
  },
];

// Sequence Step functions
export async function getSequenceSteps(campaignId: string): Promise<SequenceStep[]> {
  await new Promise((resolve) => setTimeout(resolve, 100));
  return sequenceSteps
    .filter((s) => s.campaign_id === campaignId)
    .sort((a, b) => a.step_number - b.step_number);
}

export async function createSequenceStep(
  campaignId: string,
  data: {
    subject: string;
    body: string;
    wait_days: number;
    is_reply: boolean;
  }
): Promise<SequenceStep> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const existingSteps = sequenceSteps.filter((s) => s.campaign_id === campaignId);
  const nextStepNumber = existingSteps.length > 0 
    ? Math.max(...existingSteps.map((s) => s.step_number)) + 1 
    : 1;

  const newStep: SequenceStep = {
    id: `step_${Math.random().toString(36).substr(2, 9)}`,
    campaign_id: campaignId,
    step_number: nextStepNumber,
    subject: data.subject,
    body: data.body,
    wait_days: data.wait_days,
    is_reply: data.is_reply,
    variants: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  sequenceSteps.push(newStep);

  // Update campaign sequence count
  const campaign = campaigns.find((c) => c.id === campaignId);
  if (campaign) {
    campaign.sequence_count = existingSteps.length + 1;
    campaign.updated_at = new Date().toISOString();
  }

  return newStep;
}

export async function updateSequenceStep(
  stepId: string,
  data: {
    subject?: string;
    body?: string;
    wait_days?: number;
    is_reply?: boolean;
    variants?: SequenceStepVariant[];
  }
): Promise<SequenceStep> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const step = sequenceSteps.find((s) => s.id === stepId);
  if (!step) {
    throw new Error("Sequence step not found");
  }

  if (data.subject !== undefined) step.subject = data.subject;
  if (data.body !== undefined) step.body = data.body;
  if (data.wait_days !== undefined) step.wait_days = data.wait_days;
  if (data.is_reply !== undefined) step.is_reply = data.is_reply;
  if (data.variants !== undefined) step.variants = data.variants;

  step.updated_at = new Date().toISOString();

  return { ...step };
}

export async function deleteSequenceStep(stepId: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const stepIndex = sequenceSteps.findIndex((s) => s.id === stepId);
  if (stepIndex === -1) {
    throw new Error("Sequence step not found");
  }

  const step = sequenceSteps[stepIndex];
  const campaignId = step.campaign_id;

  // Remove the step
  sequenceSteps.splice(stepIndex, 1);

  // Reorder remaining steps
  const remainingSteps = sequenceSteps
    .filter((s) => s.campaign_id === campaignId)
    .sort((a, b) => a.step_number - b.step_number);

  remainingSteps.forEach((s, index) => {
    s.step_number = index + 1;
  });

  // Update campaign sequence count
  const campaign = campaigns.find((c) => c.id === campaignId);
  if (campaign) {
    campaign.sequence_count = remainingSteps.length;
    campaign.updated_at = new Date().toISOString();
  }
}

export async function reorderSequenceSteps(
  campaignId: string,
  stepIds: string[]
): Promise<SequenceStep[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  stepIds.forEach((stepId, index) => {
    const step = sequenceSteps.find((s) => s.id === stepId && s.campaign_id === campaignId);
    if (step) {
      step.step_number = index + 1;
      step.updated_at = new Date().toISOString();
    }
  });

  return getSequenceSteps(campaignId);
}
