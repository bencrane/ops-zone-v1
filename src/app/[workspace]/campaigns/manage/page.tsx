"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  RefreshCw,
  Loader2,
  Pause,
  Play,
  Trash2,
  Megaphone,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { useWorkspaceNav } from "@/hooks/use-workspace-nav";

interface Campaign {
  id: number;
  uuid: string;
  name: string;
  type: string;
  status: string;
  emails_sent: number;
  opened: number;
  replied: number;
  bounced: number;
  total_leads: number;
  created_at: string;
}

type ActionType = "pause" | "resume" | "delete" | "launch";

export default function CampaignManagementPage() {
  const { href } = useWorkspaceNav();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<{ id: number; action: ActionType } | null>(null);

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/emailbison/campaigns");
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        const activeCampaigns = (data.data || []).filter((c: Campaign) => {
          const status = c.status.toLowerCase();
          return status !== "pending deletion" && status !== "deleted";
        });
        setCampaigns(activeCampaigns);
      }
    } catch {
      setError("Failed to load campaigns");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const handleAction = async (campaignId: number, action: ActionType) => {
    if (actionLoading) return;

    if (action === "delete") {
      const confirmed = window.confirm("Are you sure you want to delete this campaign? This action cannot be undone.");
      if (!confirmed) return;
    }

    setActionLoading({ id: campaignId, action });
    setError(null);

    try {
      let res: Response;
      if (action === "delete") {
        res = await fetch(`/api/emailbison/campaigns/${campaignId}`, { method: "DELETE" });
      } else if (action === "launch") {
        res = await fetch(`/api/emailbison/campaigns/${campaignId}/resume`, { method: "POST" });
      } else {
        res = await fetch(`/api/emailbison/campaigns/${campaignId}/${action}`, { method: "POST" });
      }

      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        await fetchCampaigns();
      }
    } catch {
      setError(`Failed to ${action} campaign`);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s === "active") return "text-emerald-400 bg-emerald-500/20";
    if (s === "paused") return "text-amber-400 bg-amber-500/20";
    if (s === "draft") return "text-zinc-400 bg-zinc-500/20";
    if (s === "completed") return "text-blue-400 bg-blue-500/20";
    return "text-zinc-400 bg-zinc-500/20";
  };

  const canPause = (status: string) => {
    const s = status.toLowerCase();
    return s === "active" || s === "launching";
  };

  const canResume = (status: string) => status.toLowerCase() === "paused";
  const canLaunch = (status: string) => status.toLowerCase() === "draft";

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-6xl mx-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Campaign Management</h1>
            <p className="text-zinc-400 mt-1">View, pause, resume, and delete campaigns</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={fetchCampaigns} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Link href={href("/campaigns")}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
          </div>
        </div>

        {error && (
          <div className="text-red-400 text-sm p-4 rounded-lg bg-red-500/10 border border-red-500/20 mb-6 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        {loading && campaigns.length === 0 && (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
          </div>
        )}

        {!loading && campaigns.length === 0 && !error && (
          <div className="text-center py-12">
            <Megaphone className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
            <p className="text-sm text-zinc-500">No campaigns found in this workspace</p>
          </div>
        )}

        {campaigns.length > 0 && (
          <div className="space-y-3">
            {campaigns.map((campaign) => {
              const isActionLoading = actionLoading?.id === campaign.id;
              const currentAction = actionLoading?.action;

              return (
                <Card key={campaign.id} className="bg-zinc-900 border-zinc-800">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="p-2 rounded-lg bg-zinc-800">
                          <Megaphone className="h-5 w-5 text-zinc-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-3">
                            <p className="text-white font-medium truncate">{campaign.name}</p>
                            <span className={`text-xs px-2 py-0.5 rounded ${getStatusColor(campaign.status)}`}>
                              {campaign.status}
                            </span>
                          </div>
                          <div className="text-xs text-zinc-500 flex items-center gap-4 mt-1">
                            <span>{campaign.total_leads} leads</span>
                            <span>{campaign.emails_sent} sent</span>
                            <span>{campaign.opened} opened</span>
                            <span>{campaign.replied} replied</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        {canLaunch(campaign.status) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAction(campaign.id, "launch")}
                            disabled={isActionLoading}
                            className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                          >
                            {isActionLoading && currentAction === "launch" ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <Play className="h-4 w-4 mr-1" />
                                Launch
                              </>
                            )}
                          </Button>
                        )}
                        {canPause(campaign.status) && (
                          <Button variant="outline" size="sm" onClick={() => handleAction(campaign.id, "pause")} disabled={isActionLoading}>
                            {isActionLoading && currentAction === "pause" ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Pause className="h-4 w-4 mr-1" />Pause</>}
                          </Button>
                        )}
                        {canResume(campaign.status) && (
                          <Button variant="outline" size="sm" onClick={() => handleAction(campaign.id, "resume")} disabled={isActionLoading}>
                            {isActionLoading && currentAction === "resume" ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Play className="h-4 w-4 mr-1" />Resume</>}
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          onClick={() => handleAction(campaign.id, "delete")}
                          disabled={isActionLoading}
                        >
                          {isActionLoading && currentAction === "delete" ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Trash2 className="h-4 w-4 mr-1" />Delete</>}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

