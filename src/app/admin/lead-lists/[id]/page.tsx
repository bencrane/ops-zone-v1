"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Users,
  ArrowLeft,
  UserPlus,
  Download,
  AlertCircle,
  Search,
  X,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Lead, LeadList, Campaign, STATUS_LABELS } from "@/types";
import {
  getLeadList,
  getLeadsInList,
  getCampaigns,
  enrollLeadsInCampaign,
} from "@/lib/data";
import { cn } from "@/lib/utils";
import { EnrollDialog } from "@/components/leads/enroll-dialog";

function LeadListDetailContent() {
  const router = useRouter();
  const params = useParams();
  const listId = params.id as string;

  const [leadList, setLeadList] = useState<LeadList | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [listData, leadsData, campaignsData] = await Promise.all([
          getLeadList(listId),
          getLeadsInList(listId),
          getCampaigns(),
        ]);

        if (!listData) {
          setError("Lead list not found.");
          return;
        }
        setLeadList(listData);
        setLeads(leadsData);
        setCampaigns(campaignsData);
      } catch (err) {
        console.error("Failed to fetch lead list data:", err);
        setError("Failed to load lead list. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [listId]);

  // Filter leads by search
  const filteredLeads = leads.filter((lead) => {
    if (!searchValue) return true;
    const search = searchValue.toLowerCase();
    return (
      lead.first_name.toLowerCase().includes(search) ||
      lead.last_name.toLowerCase().includes(search) ||
      lead.email.toLowerCase().includes(search) ||
      lead.company.toLowerCase().includes(search) ||
      lead.position.toLowerCase().includes(search)
    );
  });

  const allLeadsSelected =
    filteredLeads.length > 0 && selectedLeadIds.length === filteredLeads.length;
  const someLeadsSelected =
    selectedLeadIds.length > 0 && selectedLeadIds.length < filteredLeads.length;

  const toggleAllLeads = () => {
    if (allLeadsSelected) {
      setSelectedLeadIds([]);
    } else {
      setSelectedLeadIds(filteredLeads.map((l) => l.id));
    }
  };

  const toggleOneLead = (id: string) => {
    if (selectedLeadIds.includes(id)) {
      setSelectedLeadIds(selectedLeadIds.filter((i) => i !== id));
    } else {
      setSelectedLeadIds([...selectedLeadIds, id]);
    }
  };

  const handleEnrollLeads = async (leadIds: string[], campaignId: string) => {
    await enrollLeadsInCampaign(leadIds, campaignId);
    // Re-fetch leads to update their campaign status
    const updatedLeads = await getLeadsInList(listId);
    setLeads(updatedLeads);
    setSelectedLeadIds([]);
  };

  if (loading) {
    return (
      <div className="h-screen bg-black flex flex-col">
        <div className="h-[64px] px-6 flex items-center border-b border-zinc-800">
          <div className="text-zinc-400">Loading...</div>
        </div>
      </div>
    );
  }

  if (error || !leadList) {
    return (
      <div className="h-screen bg-black flex flex-col">
        <div className="h-[64px] px-6 flex items-center justify-between border-b border-zinc-800">
          <h1 className="text-lg font-semibold text-white">Error</h1>
          <Link href="/admin/lead-lists">
            <Button variant="outline" className="gap-2 border-zinc-700 text-zinc-300 hover:bg-zinc-800">
              <ArrowLeft className="h-4 w-4" />
              Back to Lead Lists
            </Button>
          </Link>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
          <p className="text-lg font-medium text-white mb-2">
            {error || "Lead list not found"}
          </p>
          <Button onClick={() => router.push("/admin/lead-lists")} className="mt-4">
            View All Lead Lists
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-black flex flex-col overflow-hidden">
      {/* Header Row */}
      <div className="h-[64px] px-6 flex items-center justify-between border-b border-zinc-800 shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold text-white">{leadList.name}</h1>
          <Badge variant="secondary" className="bg-zinc-800 text-zinc-300 text-xs">
            {leads.length} lead{leads.length !== 1 ? "s" : ""}
          </Badge>
          
          {/* Search toggle */}
          {searchOpen ? (
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <Input
                  type="search"
                  placeholder="Search leads..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="pl-9 w-64 h-8 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500 text-sm"
                  autoFocus
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setSearchOpen(false);
                  setSearchValue("");
                }}
                className="h-8 w-8 text-zinc-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchOpen(true)}
              className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-800"
            >
              <Search className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          {selectedLeadIds.length > 0 && (
            <Button
              className="gap-2 bg-white text-black hover:bg-zinc-200 h-8 text-sm"
              onClick={() => setEnrollDialogOpen(true)}
            >
              <UserPlus className="h-3.5 w-3.5" />
              Enroll {selectedLeadIds.length} Lead{selectedLeadIds.length !== 1 ? "s" : ""}
            </Button>
          )}
          <Button variant="outline" className="gap-2 border-zinc-700 text-zinc-300 hover:bg-zinc-800 h-8 text-sm">
            <Download className="h-3.5 w-3.5" />
            Export
          </Button>
          <Link href="/admin/lead-lists">
            <Button variant="outline" className="gap-2 border-zinc-700 text-zinc-300 hover:bg-zinc-800 h-8 text-sm">
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Lead Lists
            </Button>
          </Link>
        </div>
      </div>

      {/* Spacer Row - matches Access Leads empty row */}
      <div className="h-[64px] px-6 flex items-center border-b border-zinc-800 shrink-0">
        {leadList.description && (
          <p className="text-sm text-zinc-400">{leadList.description}</p>
        )}
        {selectedLeadIds.length > 0 && (
          <div className="flex items-center gap-2 ml-auto">
            <Badge variant="secondary" className="bg-zinc-800 text-white text-xs">
              {selectedLeadIds.length} selected
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedLeadIds([])}
              className="h-6 px-2 text-xs text-zinc-400 hover:text-white"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto px-6">
        {filteredLeads.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="h-12 w-12 rounded-full bg-zinc-800 flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-zinc-500" />
            </div>
            <h3 className="text-lg font-medium text-white mb-1">
              {searchValue ? "No matching leads" : "No leads in this list"}
            </h3>
            <p className="text-zinc-400 text-sm mb-4">
              {searchValue ? (
                "Try a different search term."
              ) : (
                <>
                  Add leads from the{" "}
                  <Link href="/admin/access-leads" className="text-white underline">
                    Access Leads
                  </Link>{" "}
                  page.
                </>
              )}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader className="sticky top-0 bg-zinc-900/95 backdrop-blur z-10">
              <TableRow className="h-[48px] hover:bg-transparent border-b border-zinc-800">
                <TableHead className="w-[40px]">
                  <Checkbox
                    checked={allLeadsSelected ? true : someLeadsSelected ? "indeterminate" : false}
                    onCheckedChange={toggleAllLeads}
                  />
                </TableHead>
                <TableHead className="w-[40px]"></TableHead>
                <TableHead className="text-zinc-400 text-xs font-medium">Contact</TableHead>
                <TableHead className="text-zinc-400 text-xs font-medium">Company</TableHead>
                <TableHead className="text-zinc-400 text-xs font-medium">Status</TableHead>
                <TableHead className="text-zinc-400 text-xs font-medium">Tags</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeads.map((lead) => (
                <TableRow
                  key={lead.id}
                  className={cn(
                    "border-b border-zinc-800/50 hover:bg-zinc-900/50 transition-colors",
                    selectedLeadIds.includes(lead.id) && "bg-zinc-900"
                  )}
                >
                  <TableCell className="py-3">
                    <Checkbox
                      checked={selectedLeadIds.includes(lead.id)}
                      onCheckedChange={() => toggleOneLead(lead.id)}
                    />
                  </TableCell>
                  <TableCell className="py-3">
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="bg-zinc-800 text-zinc-300 text-[10px]">
                        {lead.first_name[0]}
                        {lead.last_name[0]}
                      </AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="py-3">
                    <span className="font-medium text-white text-sm">
                      {lead.first_name} {lead.last_name}
                    </span>
                    <p className="text-xs text-zinc-400">{lead.email}</p>
                  </TableCell>
                  <TableCell className="py-3">
                    <span className="font-medium text-white text-sm">{lead.company}</span>
                    <p className="text-xs text-zinc-400">{lead.position}</p>
                  </TableCell>
                  <TableCell className="py-3">
                    <Badge variant="outline" className="text-xs border-zinc-700 text-zinc-400">
                      {STATUS_LABELS[lead.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="flex items-center gap-1 flex-wrap">
                      {lead.tags.slice(0, 2).map((tag) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className="text-[10px] border-zinc-700 text-zinc-400 px-1.5 py-0"
                        >
                          {tag}
                        </Badge>
                      ))}
                      {lead.tags.length > 2 && (
                        <span className="text-[10px] text-zinc-500">
                          +{lead.tags.length - 2}
                        </span>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <EnrollDialog
        open={enrollDialogOpen}
        onOpenChange={setEnrollDialogOpen}
        selectedLeads={leads.filter((lead) => selectedLeadIds.includes(lead.id))}
        campaigns={campaigns}
        onEnroll={handleEnrollLeads}
      />
    </div>
  );
}

export default function LeadListDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen bg-black flex items-center justify-center text-zinc-400">
          Loading...
        </div>
      }
    >
      <LeadListDetailContent />
    </Suspense>
  );
}

