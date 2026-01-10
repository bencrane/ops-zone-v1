"use client";

import { useEffect, useState, useCallback } from "react";
import { PageContainer, PageHeader, PageContent } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { typography, colors } from "@/lib/design-tokens";
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
        // Filter out campaigns that are pending deletion or deleted
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

  // Fetch campaigns - re-runs when workspace changes
  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const handleAction = async (campaignId: number, action: ActionType) => {
    if (actionLoading) return;

    // Confirm delete
    if (action === "delete") {
      const confirmed = window.confirm(
        "Are you sure you want to delete this campaign? This action cannot be undone."
      );
      if (!confirmed) return;
    }

    setActionLoading({ id: campaignId, action });
    setError(null);

    try {
      let res: Response;
      if (action === "delete") {
        res = await fetch(`/api/emailbison/campaigns/${campaignId}`, {
          method: "DELETE",
        });
      } else if (action === "launch") {
        // Launch uses the resume endpoint
        res = await fetch(`/api/emailbison/campaigns/${campaignId}/resume`, {
          method: "POST",
        });
      } else {
        res = await fetch(`/api/emailbison/campaigns/${campaignId}/${action}`, {
          method: "POST",
        });
      }

      const data = await res.json();

      if (data.error) {
        setError(data.error);
      } else {
        // Refresh the list
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

  const canResume = (status: string) => {
    return status.toLowerCase() === "paused";
  };

  const canLaunch = (status: string) => {
    return status.toLowerCase() === "draft";
  };

  return (
    <PageContainer>
      <PageHeader
        title="Campaign Management"
        subtitle="View, pause, resume, and delete campaigns"
        actions={
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={fetchCampaigns} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Link href="/admin/campaigns-hub">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Campaigns
              </Button>
            </Link>
          </div>
        }
      />
      <PageContent>
        {error && (
          <div className={`${colors.status.error} ${typography.body} p-4 rounded-lg bg-red-500/10 border border-red-500/20 mb-6 flex items-center gap-2`}>
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
            <p className={typography.body + " text-zinc-500"}>No campaigns found in this workspace</p>
          </div>
        )}

        {campaigns.length > 0 && (
          <div className="space-y-3">
            {campaigns.map((campaign) => {
              const isActionLoading = actionLoading?.id === campaign.id;
              const currentAction = actionLoading?.action;

              return (
                <Card
                  key={campaign.id}
                  className={`${colors.bg.card} ${colors.border.default} border`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      {/* Campaign Info */}
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="p-2 rounded-lg bg-zinc-800">
                          <Megaphone className="h-5 w-5 text-zinc-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-3">
                            <p className={`${typography.cardTitle} text-white truncate`}>
                              {campaign.name}
                            </p>
                            <span
                              className={`text-xs px-2 py-0.5 rounded ${getStatusColor(campaign.status)}`}
                            >
                              {campaign.status}
                            </span>
                          </div>
                          <div className={`${typography.secondary} flex items-center gap-4 mt-1`}>
                            <span>{campaign.total_leads} leads</span>
                            <span>{campaign.emails_sent} sent</span>
                            <span>{campaign.opened} opened</span>
                            <span>{campaign.replied} replied</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
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
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAction(campaign.id, "pause")}
                            disabled={isActionLoading}
                          >
                            {isActionLoading && currentAction === "pause" ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <Pause className="h-4 w-4 mr-1" />
                                Pause
                              </>
                            )}
                          </Button>
                        )}
                        {canResume(campaign.status) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAction(campaign.id, "resume")}
                            disabled={isActionLoading}
                          >
                            {isActionLoading && currentAction === "resume" ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <Play className="h-4 w-4 mr-1" />
                                Resume
                              </>
                            )}
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          onClick={() => handleAction(campaign.id, "delete")}
                          disabled={isActionLoading}
                        >
                          {isActionLoading && currentAction === "delete" ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </PageContent>
    </PageContainer>
  );
}

