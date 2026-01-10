"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronDown, Check, Loader2, X, Mail, Megaphone } from "lucide-react";
import { PageContainer, PageHeader, PageContent } from "@/components/layout";

interface Campaign {
  id: number;
  name: string;
  status: string;
  sender_emails?: { id: number; email?: string }[];
}

interface EmailAccount {
  id: number;
  name: string;
  email: string;
  status: string;
}

interface EmailWithAssignment extends EmailAccount {
  assignedCampaigns: Campaign[];
}

interface CampaignWithEmails extends Campaign {
  assignedEmails: EmailAccount[];
}

type ViewMode = "by-email" | "by-campaign";

export default function AssignEmailAccountsPage() {
  const [campaigns, setCampaigns] = useState<CampaignWithEmails[]>([]);
  const [emailAccounts, setEmailAccounts] = useState<EmailAccount[]>([]);
  const [emailsWithAssignments, setEmailsWithAssignments] = useState<EmailWithAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("by-email");
  const [showUnassignedOnly, setShowUnassignedOnly] = useState(false);

  // Fetch data - re-runs when workspace changes
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [campaignsRes, emailsRes] = await Promise.all([
          fetch("/api/emailbison/campaigns"),
          fetch("/api/emailbison/email-accounts"),
        ]);
        
        const campaignsData = await campaignsRes.json();
        const emailsData = await emailsRes.json();

        const emails: EmailAccount[] = emailsData.data || [];
        setEmailAccounts(emails);

        // Fetch each campaign's details to get sender_emails
        const campaignsList: Campaign[] = campaignsData.data || [];
        const campaignsWithEmails = await Promise.all(
          campaignsList.map(async (c) => {
            try {
              const res = await fetch(`/api/emailbison/campaigns/${c.id}`);
              const data = await res.json();
              const senderEmails = data.data?.sender_emails || [];
              // Map sender email IDs to full email objects
              const assignedEmails = senderEmails
                .map((se: { id: number }) => emails.find((e) => e.id === se.id))
                .filter(Boolean) as EmailAccount[];
              return { ...c, sender_emails: senderEmails, assignedEmails };
            } catch {
              return { ...c, sender_emails: [], assignedEmails: [] };
            }
          })
        );
        setCampaigns(campaignsWithEmails);

        // Build email accounts with their assignments
        const emailsWithAssigns: EmailWithAssignment[] = emails.map((email) => {
          const assignedCampaigns = campaignsWithEmails.filter((c) =>
            c.sender_emails?.some((se: { id: number }) => se.id === email.id)
          );
          return { ...email, assignedCampaigns };
        });
        setEmailsWithAssignments(emailsWithAssigns);
      } catch {
        // Silent fail
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleAssign = async (emailId: number, campaignId: number) => {
    setActionLoading(`${emailId}-${campaignId}`);
    try {
      const res = await fetch(`/api/emailbison/campaigns/${campaignId}/sender-emails`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sender_email_ids: [emailId] }),
      });
      
      if (res.ok) {
        // Update emails with assignments
        const campaign = campaigns.find((c) => c.id === campaignId);
        const email = emailAccounts.find((e) => e.id === emailId);
        
        if (campaign) {
          setEmailsWithAssignments((prev) =>
            prev.map((e) =>
              e.id === emailId
                ? { ...e, assignedCampaigns: [...e.assignedCampaigns, campaign] }
                : e
            )
          );
        }
        
        // Update campaigns with emails
        if (email) {
          setCampaigns((prev) =>
            prev.map((c) =>
              c.id === campaignId
                ? { ...c, assignedEmails: [...c.assignedEmails, email] }
                : c
            )
          );
        }
      }
    } catch {
      // Silent fail
    } finally {
      setActionLoading(null);
      setOpenDropdown(null);
    }
  };

  const handleUnassign = async (emailId: number, campaignId: number) => {
    setActionLoading(`${emailId}-${campaignId}-remove`);
    try {
      const res = await fetch(`/api/emailbison/campaigns/${campaignId}/sender-emails`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sender_email_ids: [emailId] }),
      });
      
      if (res.ok) {
        setEmailsWithAssignments((prev) =>
          prev.map((e) =>
            e.id === emailId
              ? { ...e, assignedCampaigns: e.assignedCampaigns.filter((c) => c.id !== campaignId) }
              : e
          )
        );
        
        setCampaigns((prev) =>
          prev.map((c) =>
            c.id === campaignId
              ? { ...c, assignedEmails: c.assignedEmails.filter((e) => e.id !== emailId) }
              : c
          )
        );
      }
    } catch {
      // Silent fail
    } finally {
      setActionLoading(null);
    }
  };

  // Filter logic
  const filteredEmails = showUnassignedOnly
    ? emailsWithAssignments.filter((e) => e.assignedCampaigns.length === 0)
    : emailsWithAssignments;

  const filteredCampaigns = showUnassignedOnly
    ? campaigns.filter((c) => c.assignedEmails.length === 0)
    : campaigns;

  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Assign Email Accounts"
        subtitle={
          viewMode === "by-email"
            ? "See which campaigns each email account is assigned to"
            : "See which email accounts are assigned to each campaign"
        }
        actions={
          <Link
            href="/admin/campaigns-hub"
            className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        }
      />
      <PageContent>
        <div className="max-w-2xl">

          {/* View Toggle */}
          <div className="flex items-center gap-3 mb-6">
            <div className="inline-flex rounded-lg bg-zinc-900 p-1 border border-zinc-800">
              <button
                onClick={() => setViewMode("by-email")}
                className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-md transition-colors ${
                  viewMode === "by-email"
                    ? "bg-zinc-700 text-white"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Mail className="h-3.5 w-3.5" />
                By Email
              </button>
              <button
                onClick={() => setViewMode("by-campaign")}
                className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-md transition-colors ${
                  viewMode === "by-campaign"
                    ? "bg-zinc-700 text-white"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Megaphone className="h-3.5 w-3.5" />
                By Campaign
              </button>
            </div>

            <button
              onClick={() => setShowUnassignedOnly(!showUnassignedOnly)}
              className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                showUnassignedOnly
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                  : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
              }`}
            >
              {showUnassignedOnly ? "Showing unassigned" : "Show unassigned"}
            </button>
          </div>

          {/* By Email View */}
          {viewMode === "by-email" && (
            <>
              {filteredEmails.length === 0 ? (
                <p className="text-zinc-500">
                  {showUnassignedOnly
                    ? "All email accounts are assigned to campaigns"
                    : "No email accounts in this workspace"}
                </p>
              ) : (
                <div className="space-y-3">
                  {filteredEmails.map((email) => (
                    <div
                      key={email.id}
                      className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="text-white font-medium truncate">{email.email}</p>
                          <p className="text-xs text-zinc-500 mt-0.5">{email.status}</p>
                        </div>
                        
                        <div className="relative">
                          <button
                            onClick={() => setOpenDropdown(openDropdown === email.id ? null : email.id)}
                            className="px-3 py-1.5 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded transition-colors flex items-center gap-1"
                          >
                            Add to campaign
                            <ChevronDown className="h-3 w-3" />
                          </button>
                          
                          {openDropdown === email.id && (
                            <div className="absolute right-0 top-full mt-1 w-48 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl z-10 overflow-hidden">
                              {campaigns.filter(
                                (c) => !email.assignedCampaigns.some((ac) => ac.id === c.id)
                              ).length === 0 ? (
                                <p className="px-3 py-2 text-xs text-zinc-500">
                                  Already in all campaigns
                                </p>
                              ) : (
                                campaigns
                                  .filter((c) => !email.assignedCampaigns.some((ac) => ac.id === c.id))
                                  .map((campaign) => (
                                    <button
                                      key={campaign.id}
                                      onClick={() => handleAssign(email.id, campaign.id)}
                                      disabled={actionLoading === `${email.id}-${campaign.id}`}
                                      className="w-full px-3 py-2 text-left text-sm text-white hover:bg-zinc-700 transition-colors flex items-center justify-between"
                                    >
                                      {campaign.name}
                                      {actionLoading === `${email.id}-${campaign.id}` && (
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                      )}
                                    </button>
                                  ))
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {email.assignedCampaigns.length === 0 ? (
                          <span className="text-xs text-amber-500/70 italic">Not assigned to any campaign</span>
                        ) : (
                          email.assignedCampaigns.map((campaign) => (
                            <span
                              key={campaign.id}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs bg-white/5 border border-white/10 text-zinc-300 rounded-full"
                            >
                              <Check className="h-3 w-3 text-emerald-400" />
                              {campaign.name}
                              <button
                                onClick={() => handleUnassign(email.id, campaign.id)}
                                disabled={actionLoading === `${email.id}-${campaign.id}-remove`}
                                className="ml-0.5 hover:text-white transition-colors"
                              >
                                {actionLoading === `${email.id}-${campaign.id}-remove` ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <X className="h-3 w-3" />
                                )}
                              </button>
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* By Campaign View */}
          {viewMode === "by-campaign" && (
            <>
              {filteredCampaigns.length === 0 ? (
                <p className="text-zinc-500">
                  {showUnassignedOnly
                    ? "All campaigns have email accounts assigned"
                    : "No campaigns in this workspace"}
                </p>
              ) : (
                <div className="space-y-3">
                  {filteredCampaigns.map((campaign) => (
                    <div
                      key={campaign.id}
                      className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="text-white font-medium truncate">{campaign.name}</p>
                          <p className="text-xs text-zinc-500 mt-0.5 capitalize">{campaign.status}</p>
                        </div>
                        
                        <div className="relative">
                          <button
                            onClick={() => setOpenDropdown(openDropdown === campaign.id + 10000 ? null : campaign.id + 10000)}
                            className="px-3 py-1.5 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded transition-colors flex items-center gap-1"
                          >
                            Add email account
                            <ChevronDown className="h-3 w-3" />
                          </button>
                          
                          {openDropdown === campaign.id + 10000 && (
                            <div className="absolute right-0 top-full mt-1 w-56 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl z-10 overflow-hidden">
                              {emailAccounts.filter(
                                (e) => !campaign.assignedEmails.some((ae) => ae.id === e.id)
                              ).length === 0 ? (
                                <p className="px-3 py-2 text-xs text-zinc-500">
                                  All emails already assigned
                                </p>
                              ) : (
                                emailAccounts
                                  .filter((e) => !campaign.assignedEmails.some((ae) => ae.id === e.id))
                                  .map((email) => (
                                    <button
                                      key={email.id}
                                      onClick={() => handleAssign(email.id, campaign.id)}
                                      disabled={actionLoading === `${email.id}-${campaign.id}`}
                                      className="w-full px-3 py-2 text-left text-sm text-white hover:bg-zinc-700 transition-colors flex items-center justify-between"
                                    >
                                      <span className="truncate">{email.email}</span>
                                      {actionLoading === `${email.id}-${campaign.id}` && (
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                      )}
                                    </button>
                                  ))
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {campaign.assignedEmails.length === 0 ? (
                          <span className="text-xs text-amber-500/70 italic">No email accounts assigned</span>
                        ) : (
                          campaign.assignedEmails.map((email) => (
                            <span
                              key={email.id}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs bg-white/5 border border-white/10 text-zinc-300 rounded-full"
                            >
                              <Check className="h-3 w-3 text-emerald-400" />
                              {email.email}
                              <button
                                onClick={() => handleUnassign(email.id, campaign.id)}
                                disabled={actionLoading === `${email.id}-${campaign.id}-remove`}
                                className="ml-0.5 hover:text-white transition-colors"
                              >
                                {actionLoading === `${email.id}-${campaign.id}-remove` ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <X className="h-3 w-3" />
                                )}
                              </button>
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </PageContent>
    </PageContainer>
  );
}
