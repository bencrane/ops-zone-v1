"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Plus,
  MoreHorizontal,
  Play,
  Pause,
  Users,
  Mail,
  Eye,
  MessageSquare,
  ChevronRight,
  ArrowUpRight,
} from "lucide-react";
import { Campaign, Lead, STATUS_LABELS } from "@/types";
import { getCampaigns, getLeadsForCampaign } from "@/lib/data";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { PageContainer, PageHeader, PageContent } from "@/components/layout";

const STATUS_CONFIG: Record<string, { label: string; class: string }> = {
  active: { label: "Active", class: "border-emerald-400/30 text-emerald-400 bg-emerald-400/5" },
  paused: { label: "Paused", class: "border-yellow-400/30 text-yellow-400 bg-yellow-400/5" },
  draft: { label: "Draft", class: "border-zinc-400/30 text-zinc-400 bg-zinc-400/5" },
  completed: { label: "Completed", class: "border-blue-400/30 text-blue-400 bg-blue-400/5" },
};

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [campaignLeads, setCampaignLeads] = useState<Lead[]>([]);
  const [leadsDialogOpen, setLeadsDialogOpen] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const data = await getCampaigns();
      setCampaigns(data);
      setLoading(false);
    }
    fetchData();
  }, []);

  const handleViewLeads = async (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    const leads = await getLeadsForCampaign(campaign.id);
    setCampaignLeads(leads);
    setLeadsDialogOpen(true);
  };

  // Stats
  const activeCampaigns = campaigns.filter((c) => c.status === "active").length;
  const totalEnrolled = campaigns.reduce((sum, c) => sum + c.stats.enrolled, 0);
  const totalSent = campaigns.reduce((sum, c) => sum + c.stats.sent, 0);
  const totalReplies = campaigns.reduce((sum, c) => sum + c.stats.replied, 0);

  return (
    <PageContainer>
      <PageHeader
        title="View Campaign Metrics"
        subtitle="Manage your outreach sequences and track performance."
        actions={
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Campaign
          </Button>
        }
      >
        {/* Stats row */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <Play className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{activeCampaigns}</p>
                  <p className="text-xs text-zinc-400">Active Campaigns</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{totalEnrolled}</p>
                  <p className="text-xs text-zinc-400">Total Enrolled</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-white/5 flex items-center justify-center">
                  <Mail className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{totalSent.toLocaleString()}</p>
                  <p className="text-xs text-zinc-400">Emails Sent</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{totalReplies}</p>
                  <p className="text-xs text-zinc-400">Total Replies</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageHeader>

      <PageContent>
        {/* Campaigns list */}
        <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <p className="text-muted-foreground">Loading campaigns...</p>
          </div>
        ) : (
          campaigns.map((campaign, index) => (
            <Card
              key={campaign.id}
              className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  {/* Left: Campaign info */}
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold">{campaign.name}</h3>
                      <Badge
                        variant="outline"
                        className={cn("text-xs", STATUS_CONFIG[campaign.status].class)}
                      >
                        {STATUS_CONFIG[campaign.status].label}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {campaign.description}
                    </p>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        <span>{campaign.sequence_count} emails in sequence</span>
                      </div>
                      <div className="text-muted-foreground">
                        Subject: <span className="text-foreground">{campaign.subject_line_preview}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Stats & actions */}
                  <div className="flex items-center gap-8">
                    {/* Stats */}
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-xl font-bold">{campaign.stats.enrolled}</p>
                        <p className="text-xs text-muted-foreground">Enrolled</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xl font-bold">{campaign.stats.sent}</p>
                        <p className="text-xs text-muted-foreground">Sent</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xl font-bold">
                          {campaign.stats.sent > 0
                            ? ((campaign.stats.opened / campaign.stats.sent) * 100).toFixed(0)
                            : 0}%
                        </p>
                        <p className="text-xs text-muted-foreground">Open Rate</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xl font-bold">
                          {campaign.stats.sent > 0
                            ? ((campaign.stats.replied / campaign.stats.sent) * 100).toFixed(1)
                            : 0}%
                        </p>
                        <p className="text-xs text-muted-foreground">Reply Rate</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewLeads(campaign)}
                        className="gap-1"
                      >
                        <Users className="h-4 w-4" />
                        Leads
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          {campaign.status === "active" ? (
                            <DropdownMenuItem>
                              <Pause className="mr-2 h-4 w-4" />
                              Pause Campaign
                            </DropdownMenuItem>
                          ) : campaign.status === "paused" || campaign.status === "draft" ? (
                            <DropdownMenuItem>
                              <Play className="mr-2 h-4 w-4" />
                              Start Campaign
                            </DropdownMenuItem>
                          ) : null}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            Delete Campaign
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Leads Dialog */}
      <Dialog open={leadsDialogOpen} onOpenChange={setLeadsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Leads in {selectedCampaign?.name}
            </DialogTitle>
            <DialogDescription>
              {campaignLeads.length} leads enrolled in this campaign
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[400px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contact</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Emails Sent</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaignLeads.map((lead) => {
                  const enrollment = lead.campaigns.find(
                    (c) => c.campaign_id === selectedCampaign?.id
                  );
                  return (
                    <TableRow key={lead.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-white/10 text-xs">
                              {lead.first_name[0]}
                              {lead.last_name[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {lead.first_name} {lead.last_name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {lead.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">{lead.company}</p>
                        <p className="text-xs text-muted-foreground">
                          {lead.position}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {STATUS_LABELS[lead.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {enrollment?.emails_sent || 0} / {selectedCampaign?.sequence_count || 0}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </ScrollArea>
          <div className="flex justify-between items-center pt-4 border-t">
            <Link href="/leads">
              <Button variant="outline" size="sm" className="gap-1">
                View All Leads
                <ArrowUpRight className="h-3 w-3" />
              </Button>
            </Link>
            <Button variant="outline" onClick={() => setLeadsDialogOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      </PageContent>
    </PageContainer>
  );
}
