"use client";

import { useState } from "react";
import { UserPlus, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Campaign, Lead } from "@/types";

interface EnrollDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedLeads: Lead[];
  campaigns: Campaign[];
  onEnroll: (leadIds: string[], campaignId: string) => Promise<void>;
}

export function EnrollDialog({
  open,
  onOpenChange,
  selectedLeads,
  campaigns,
  onEnroll,
}: EnrollDialogProps) {
  const [selectedCampaign, setSelectedCampaign] = useState<string>("");
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [enrolled, setEnrolled] = useState(false);

  // Filter to only active campaigns that accept enrollments
  const availableCampaigns = campaigns.filter(
    (c) => c.status === "active" || c.status === "draft"
  );

  // Check which leads are already in the selected campaign
  const leadsAlreadyEnrolled = selectedCampaign
    ? selectedLeads.filter((lead) =>
        lead.campaigns.some((c) => c.campaign_id === selectedCampaign)
      )
    : [];

  const leadsToEnroll = selectedCampaign
    ? selectedLeads.filter(
        (lead) =>
          !lead.campaigns.some((c) => c.campaign_id === selectedCampaign)
      )
    : selectedLeads;

  const handleEnroll = async () => {
    if (!selectedCampaign || leadsToEnroll.length === 0) return;

    setIsEnrolling(true);
    try {
      await onEnroll(
        leadsToEnroll.map((l) => l.id),
        selectedCampaign
      );
      setEnrolled(true);
      setTimeout(() => {
        onOpenChange(false);
        setEnrolled(false);
        setSelectedCampaign("");
      }, 1500);
    } catch (error) {
      console.error("Failed to enroll leads:", error);
    } finally {
      setIsEnrolling(false);
    }
  };

  const selectedCampaignData = campaigns.find(
    (c) => c.id === selectedCampaign
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Enroll Leads in Campaign
          </DialogTitle>
          <DialogDescription>
            Add {selectedLeads.length} selected lead
            {selectedLeads.length !== 1 ? "s" : ""} to a campaign.
          </DialogDescription>
        </DialogHeader>

        {enrolled ? (
          <div className="py-8 flex flex-col items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center">
              <Check className="h-6 w-6 text-black" />
            </div>
            <p className="text-lg font-medium">
              {leadsToEnroll.length} lead{leadsToEnroll.length !== 1 ? "s" : ""}{" "}
              enrolled
            </p>
            <p className="text-sm text-muted-foreground">
              Added to {selectedCampaignData?.name}
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-4 py-4">
              {/* Campaign selector */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Campaign</label>
                <Select
                  value={selectedCampaign}
                  onValueChange={setSelectedCampaign}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose a campaign..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCampaigns.map((campaign) => (
                      <SelectItem key={campaign.id} value={campaign.id}>
                        <div className="flex items-center gap-2">
                          <span>{campaign.name}</span>
                          <Badge
                            variant="outline"
                            className={
                              campaign.status === "active"
                                ? "border-white/20 text-white"
                                : "border-muted-foreground/20"
                            }
                          >
                            {campaign.status}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Campaign info */}
              {selectedCampaignData && (
                <div className="rounded-lg border p-4 space-y-3">
                  <div>
                    <p className="font-medium">{selectedCampaignData.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedCampaignData.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-muted-foreground">
                      {selectedCampaignData.sequence_count} emails in sequence
                    </span>
                    <span className="text-muted-foreground">
                      {selectedCampaignData.stats.enrolled} currently enrolled
                    </span>
                  </div>
                </div>
              )}

              {/* Warning for already enrolled leads */}
              {leadsAlreadyEnrolled.length > 0 && (
                <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-3 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-yellow-500">
                      {leadsAlreadyEnrolled.length} lead
                      {leadsAlreadyEnrolled.length !== 1 ? "s" : ""} already
                      enrolled
                    </p>
                    <p className="text-muted-foreground">
                      {leadsAlreadyEnrolled
                        .slice(0, 3)
                        .map((l) => `${l.first_name} ${l.last_name}`)
                        .join(", ")}
                      {leadsAlreadyEnrolled.length > 3 &&
                        ` and ${leadsAlreadyEnrolled.length - 3} more`}
                    </p>
                  </div>
                </div>
              )}

              {/* Summary */}
              <div className="text-sm text-muted-foreground">
                {leadsToEnroll.length > 0 ? (
                  <p>
                    <span className="text-foreground font-medium">
                      {leadsToEnroll.length}
                    </span>{" "}
                    lead{leadsToEnroll.length !== 1 ? "s" : ""} will be enrolled
                  </p>
                ) : selectedCampaign ? (
                  <p>All selected leads are already in this campaign</p>
                ) : null}
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isEnrolling}
              >
                Cancel
              </Button>
              <Button
                onClick={handleEnroll}
                disabled={!selectedCampaign || leadsToEnroll.length === 0 || isEnrolling}
              >
                {isEnrolling ? (
                  "Enrolling..."
                ) : (
                  <>
                    Enroll {leadsToEnroll.length} Lead
                    {leadsToEnroll.length !== 1 ? "s" : ""}
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

