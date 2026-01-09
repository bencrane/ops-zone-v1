export type CampaignStatus = "active" | "paused" | "draft" | "completed";
export type LeadStatus = "new" | "enrolled" | "contacted" | "opened" | "replied" | "bounced" | "unsubscribed";

export interface SendingSchedule {
  days: ("mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun")[];
  start_hour: number; // 0-23
  end_hour: number;   // 0-23
}

export interface SenderAccount {
  id: string;
  email: string;
  name: string;
  provider: "google" | "microsoft" | "smtp";
  daily_limit: number;
  is_active: boolean;
}

export interface Campaign {
  id: string;
  name: string;
  status: CampaignStatus;
  description: string;
  subject_line_preview: string;
  sequence_count: number;
  stats: {
    enrolled: number;
    sent: number;
    opened: number;
    replied: number;
    bounced: number;
  };
  // Configuration fields
  daily_send_limit?: number;
  sending_schedule?: SendingSchedule;
  timezone?: string;
  sender_account_ids?: string[];
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  company: string;
  position: string;
  industry: Industry;
  company_size: CompanySize;
  linkedin_url?: string;
  website?: string;
  status: LeadStatus;
  tags: string[];
  campaigns: CampaignEnrollment[];
  notes?: string;
  added_at: string;
  last_contacted_at?: string;
}

export interface CampaignEnrollment {
  campaign_id: string;
  campaign_name: string;
  enrolled_at: string;
  status: "active" | "completed" | "paused" | "removed";
  emails_sent: number;
  last_email_at?: string;
}

export type Industry =
  | "saas"
  | "ecommerce"
  | "fintech"
  | "healthcare"
  | "agency"
  | "consulting"
  | "manufacturing"
  | "real_estate"
  | "education"
  | "other";

export type CompanySize =
  | "1-10"
  | "11-50"
  | "51-200"
  | "201-500"
  | "501-1000"
  | "1000+";

export interface DashboardStats {
  total_campaigns: number;
  active_campaigns: number;
  total_leads: number;
  enrolled_leads: number;
  emails_sent_today: number;
  emails_sent_week: number;
  avg_open_rate: number;
  avg_reply_rate: number;
}

export interface LeadFilters {
  search: string;
  status: LeadStatus | "all";
  industry: Industry | "all";
  company_size: CompanySize | "all";
  campaign_id: string | "all" | "none";
  tags: string[];
}

export const INDUSTRY_LABELS: Record<Industry, string> = {
  saas: "SaaS",
  ecommerce: "E-commerce",
  fintech: "Fintech",
  healthcare: "Healthcare",
  agency: "Agency",
  consulting: "Consulting",
  manufacturing: "Manufacturing",
  real_estate: "Real Estate",
  education: "Education",
  other: "Other",
};

export const COMPANY_SIZE_LABELS: Record<CompanySize, string> = {
  "1-10": "1-10 employees",
  "11-50": "11-50 employees",
  "51-200": "51-200 employees",
  "201-500": "201-500 employees",
  "501-1000": "501-1000 employees",
  "1000+": "1000+ employees",
};

export const STATUS_LABELS: Record<LeadStatus, string> = {
  new: "New",
  enrolled: "Enrolled",
  contacted: "Contacted",
  opened: "Opened",
  replied: "Replied",
  bounced: "Bounced",
  unsubscribed: "Unsubscribed",
};

export interface LeadList {
  id: string;
  name: string;
  description?: string;
  lead_ids: string[];
  lead_count: number;
  created_at: string;
  updated_at: string;
}

export const TIMEZONE_OPTIONS = [
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/Denver", label: "Mountain Time (MT)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "America/Phoenix", label: "Arizona (MST)" },
  { value: "UTC", label: "UTC" },
  { value: "Europe/London", label: "London (GMT/BST)" },
  { value: "Europe/Paris", label: "Central European (CET)" },
] as const;

export const DAY_OPTIONS = [
  { value: "mon", label: "Mon" },
  { value: "tue", label: "Tue" },
  { value: "wed", label: "Wed" },
  { value: "thu", label: "Thu" },
  { value: "fri", label: "Fri" },
  { value: "sat", label: "Sat" },
  { value: "sun", label: "Sun" },
] as const;

// Sequence / Message Types
export interface SequenceStepVariant {
  id: string;
  name: string; // e.g., "Variant A", "Variant B"
  subject: string;
  body: string;
}

export interface SequenceStep {
  id: string;
  campaign_id: string;
  step_number: number;
  subject: string;
  body: string;
  wait_days: number; // Days to wait after previous step (0 for first step)
  is_reply: boolean; // true = thread reply, false = new email
  variants: SequenceStepVariant[];
  created_at: string;
  updated_at: string;
}

export const DYNAMIC_VARIABLES = [
  { value: "{FIRST_NAME}", label: "First Name", description: "Lead's first name" },
  { value: "{LAST_NAME}", label: "Last Name", description: "Lead's last name" },
  { value: "{FULL_NAME}", label: "Full Name", description: "Lead's full name" },
  { value: "{EMAIL}", label: "Email", description: "Lead's email address" },
  { value: "{COMPANY_NAME}", label: "Company Name", description: "Lead's company" },
  { value: "{POSITION}", label: "Position", description: "Lead's job title" },
  { value: "{INDUSTRY}", label: "Industry", description: "Company industry" },
] as const;
