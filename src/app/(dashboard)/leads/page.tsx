"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, FileUp, UserPlus, X, Users } from "lucide-react";
import { LeadFilters } from "@/components/leads/lead-filters";
import { LeadTable } from "@/components/leads/lead-table";
import { EnrollDialog } from "@/components/leads/enroll-dialog";
import { PageContainer, PageHeader, PageContent } from "@/components/layout";
import {
  Lead,
  Campaign,
  LeadFilters as LeadFiltersType,
} from "@/types";
import {
  getLeads,
  getCampaigns,
  getAllTags,
  enrollLeadsInCampaign,
} from "@/lib/data";

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState<LeadFiltersType>({
    search: "",
    status: "all",
    industry: "all",
    company_size: "all",
    campaign_id: "all",
    tags: [],
  });

  // Fetch data
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const [leadsData, campaignsData] = await Promise.all([
        getLeads(),
        getCampaigns(),
      ]);
      setLeads(leadsData);
      setCampaigns(campaignsData);
      setAllTags(getAllTags());
      setLoading(false);
    }
    fetchData();
  }, []);

  // Filter leads client-side for instant feedback
  const filteredLeads = useMemo(() => {
    let result = [...leads];

    if (filters.search) {
      const search = filters.search.toLowerCase();
      result = result.filter(
        (lead) =>
          lead.first_name.toLowerCase().includes(search) ||
          lead.last_name.toLowerCase().includes(search) ||
          lead.email.toLowerCase().includes(search) ||
          lead.company.toLowerCase().includes(search) ||
          lead.position.toLowerCase().includes(search)
      );
    }

    if (filters.status !== "all") {
      result = result.filter((lead) => lead.status === filters.status);
    }

    if (filters.industry !== "all") {
      result = result.filter((lead) => lead.industry === filters.industry);
    }

    if (filters.company_size !== "all") {
      result = result.filter((lead) => lead.company_size === filters.company_size);
    }

    if (filters.campaign_id === "none") {
      result = result.filter((lead) => lead.campaigns.length === 0);
    } else if (filters.campaign_id !== "all") {
      result = result.filter((lead) =>
        lead.campaigns.some((c) => c.campaign_id === filters.campaign_id)
      );
    }

    if (filters.tags.length > 0) {
      result = result.filter((lead) =>
        filters.tags.some((tag) => lead.tags.includes(tag))
      );
    }

    return result;
  }, [leads, filters]);

  const selectedLeads = useMemo(
    () => leads.filter((l) => selectedIds.includes(l.id)),
    [leads, selectedIds]
  );

  const handleEnroll = async (leadIds: string[], campaignId: string) => {
    await enrollLeadsInCampaign(leadIds, campaignId);
    // Refresh data
    const [leadsData, campaignsData] = await Promise.all([
      getLeads(),
      getCampaigns(),
    ]);
    setLeads(leadsData);
    setCampaigns(campaignsData);
    setSelectedIds([]);
  };

  // Stats
  const totalLeads = leads.length;
  const enrolledLeads = leads.filter((l) => l.campaigns.length > 0).length;
  const newLeads = leads.filter((l) => l.status === "new").length;

  return (
    <PageContainer>
      <PageHeader
        title="Eligible Leads"
        subtitle="Manage your prospect database and enroll leads into campaigns."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2 border-zinc-700 text-zinc-300 hover:bg-zinc-800">
              <FileUp className="h-4 w-4" />
              Import CSV
            </Button>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Lead
            </Button>
          </div>
        }
      >
        {/* Quick stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-white/5 flex items-center justify-center">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{totalLeads}</p>
                <p className="text-xs text-zinc-400">Total Leads</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <UserPlus className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{enrolledLeads}</p>
                <p className="text-xs text-zinc-400">Enrolled</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-white/5 flex items-center justify-center">
                <Users className="h-5 w-5 text-white/70" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{newLeads}</p>
                <p className="text-xs text-zinc-400">New (not enrolled)</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {leads.filter((l) => l.status === "replied").length}
                </p>
                <p className="text-xs text-zinc-400">Replied</p>
              </div>
            </div>
          </div>
        </div>
      </PageHeader>

      <PageContent>
        <div className="space-y-6">
          {/* Filters */}
          <LeadFilters
            filters={filters}
            onFiltersChange={setFilters}
            campaigns={campaigns}
            allTags={allTags}
          />

          {/* Selection bar */}
          {selectedIds.length > 0 && (
            <div className="flex items-center justify-between rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3">
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="text-sm bg-zinc-800 text-white">
                  {selectedIds.length} selected
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedIds([])}
                  className="h-7 text-xs text-zinc-400 hover:text-white"
                >
                  <X className="mr-1 h-3 w-3" />
                  Clear
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEnrollDialogOpen(true)}
                  className="gap-2 border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                >
                  <UserPlus className="h-4 w-4" />
                  Enroll in Campaign
                </Button>
              </div>
            </div>
          )}

          {/* Results count */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-zinc-400">
              Showing {filteredLeads.length} of {totalLeads} leads
            </p>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-zinc-400">Loading leads...</div>
            </div>
          ) : (
            <LeadTable
              leads={filteredLeads}
              selectedIds={selectedIds}
              onSelectionChange={setSelectedIds}
            />
          )}
        </div>

        {/* Enroll Dialog */}
        <EnrollDialog
          open={enrollDialogOpen}
          onOpenChange={setEnrollDialogOpen}
          selectedLeads={selectedLeads}
          campaigns={campaigns}
          onEnroll={handleEnroll}
        />
      </PageContent>
    </PageContainer>
  );
}
