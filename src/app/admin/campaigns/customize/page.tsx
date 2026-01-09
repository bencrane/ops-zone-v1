"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PageContainer, PageHeader, PageContent } from "@/components/layout";
import {
  getCampaigns,
  getSenderAccounts,
  updateCampaignConfig,
  type CampaignConfigUpdate,
} from "@/lib/data";
import {
  Campaign,
  SenderAccount,
  SendingSchedule,
  TIMEZONE_OPTIONS,
  DAY_OPTIONS,
} from "@/types";
import { cn } from "@/lib/utils";

const STATUS_CONFIG: Record<string, { label: string; class: string }> = {
  active: { label: "Active", class: "border-emerald-400/30 text-emerald-400 bg-emerald-400/5" },
  paused: { label: "Paused", class: "border-yellow-400/30 text-yellow-400 bg-yellow-400/5" },
  draft: { label: "Draft", class: "border-zinc-400/30 text-zinc-400 bg-zinc-400/5" },
  completed: { label: "Completed", class: "border-blue-400/30 text-blue-400 bg-blue-400/5" },
};

type FormState = "idle" | "submitting" | "success" | "error";

export default function CustomizeCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [senderAccounts, setSenderAccounts] = useState<SenderAccount[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [formState, setFormState] = useState<FormState>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  // Form state
  const [name, setName] = useState("");
  const [dailySendLimit, setDailySendLimit] = useState<number | "">("");
  const [timezone, setTimezone] = useState("");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [startHour, setStartHour] = useState<number>(9);
  const [endHour, setEndHour] = useState<number>(17);
  const [selectedSenderIds, setSelectedSenderIds] = useState<string[]>([]);

  useEffect(() => {
    async function fetchData() {
      const [campaignsData, sendersData] = await Promise.all([
        getCampaigns(),
        getSenderAccounts(),
      ]);
      setCampaigns(campaignsData);
      setSenderAccounts(sendersData);
      setLoading(false);
    }
    fetchData();
  }, []);

  const selectedCampaign = campaigns.find((c) => c.id === selectedCampaignId);

  // Load campaign data into form when selection changes
  useEffect(() => {
    if (selectedCampaign) {
      setName(selectedCampaign.name);
      setDailySendLimit(selectedCampaign.daily_send_limit ?? "");
      setTimezone(selectedCampaign.timezone ?? "");
      setSelectedDays(selectedCampaign.sending_schedule?.days ?? []);
      setStartHour(selectedCampaign.sending_schedule?.start_hour ?? 9);
      setEndHour(selectedCampaign.sending_schedule?.end_hour ?? 17);
      setSelectedSenderIds(selectedCampaign.sender_account_ids ?? []);
      setFormState("idle");
      setErrorMessage("");
    }
  }, [selectedCampaign]);

  const handleSelectCampaign = (campaignId: string) => {
    setSelectedCampaignId(campaignId);
  };

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const toggleSender = (senderId: string) => {
    setSelectedSenderIds((prev) =>
      prev.includes(senderId)
        ? prev.filter((id) => id !== senderId)
        : [...prev, senderId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCampaignId || !name.trim()) {
      setErrorMessage("Campaign name is required.");
      setFormState("error");
      return;
    }

    setFormState("submitting");
    setErrorMessage("");

    try {
      const config: CampaignConfigUpdate = {
        name: name.trim(),
        daily_send_limit: dailySendLimit === "" ? undefined : Number(dailySendLimit),
        timezone: timezone || undefined,
        sender_account_ids: selectedSenderIds,
      };

      // Only include schedule if days are selected
      if (selectedDays.length > 0) {
        config.sending_schedule = {
          days: selectedDays as SendingSchedule["days"],
          start_hour: startHour,
          end_hour: endHour,
        };
      }

      const updated = await updateCampaignConfig(selectedCampaignId, config);

      // Update local state
      setCampaigns((prev) =>
        prev.map((c) => (c.id === updated.id ? updated : c))
      );

      setFormState("success");
      setTimeout(() => setFormState("idle"), 2000);
    } catch (err) {
      setFormState("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to update campaign."
      );
    }
  };

  const hourOptions = Array.from({ length: 24 }, (_, i) => i);

  return (
    <PageContainer>
      <PageHeader
        title="Configure Campaign"
        subtitle="Configure send limits, schedules, and sender accounts."
        actions={
          <Link href="/admin">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Admin
            </Button>
          </Link>
        }
      />
      <PageContent>
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Campaign List */}
            <Card className="bg-zinc-900 border-zinc-800 lg:col-span-1">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-zinc-400">
                  Select Campaign
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[500px]">
                  <div className="space-y-1 p-4 pt-0">
                    {campaigns.map((campaign) => (
                      <button
                        key={campaign.id}
                        onClick={() => handleSelectCampaign(campaign.id)}
                        className={cn(
                          "w-full text-left px-3 py-3 rounded-md transition-colors",
                          selectedCampaignId === campaign.id
                            ? "bg-zinc-800 border border-zinc-700"
                            : "hover:bg-zinc-800/50 border border-transparent"
                        )}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-medium text-white truncate">
                            {campaign.name}
                          </span>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[10px] shrink-0",
                              STATUS_CONFIG[campaign.status].class
                            )}
                          >
                            {STATUS_CONFIG[campaign.status].label}
                          </Badge>
                        </div>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Right: Configuration Form */}
            <Card className="bg-zinc-900 border-zinc-800 lg:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-zinc-400">
                  {selectedCampaign
                    ? "Campaign Configuration"
                    : "Select a campaign to configure"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedCampaign ? (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Campaign Name */}
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-zinc-300">
                        Campaign Name
                      </Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={formState === "submitting"}
                        className="bg-zinc-800 border-zinc-700 text-white"
                      />
                    </div>

                    {/* Daily Send Limit */}
                    <div className="space-y-2">
                      <Label htmlFor="dailyLimit" className="text-zinc-300">
                        Daily Send Limit
                      </Label>
                      <Input
                        id="dailyLimit"
                        type="number"
                        min={0}
                        placeholder="No limit"
                        value={dailySendLimit}
                        onChange={(e) =>
                          setDailySendLimit(
                            e.target.value === "" ? "" : Number(e.target.value)
                          )
                        }
                        disabled={formState === "submitting"}
                        className="bg-zinc-800 border-zinc-700 text-white w-32"
                      />
                      <p className="text-xs text-zinc-500">
                        Maximum emails sent per day for this campaign.
                      </p>
                    </div>

                    {/* Sending Schedule */}
                    <div className="space-y-3">
                      <Label className="text-zinc-300">Sending Schedule</Label>
                      <div className="flex flex-wrap gap-2">
                        {DAY_OPTIONS.map((day) => (
                          <button
                            key={day.value}
                            type="button"
                            onClick={() => toggleDay(day.value)}
                            disabled={formState === "submitting"}
                            className={cn(
                              "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                              selectedDays.includes(day.value)
                                ? "bg-white text-black"
                                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                            )}
                          >
                            {day.label}
                          </button>
                        ))}
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <Label className="text-xs text-zinc-400">From</Label>
                          <Select
                            value={String(startHour)}
                            onValueChange={(v) => setStartHour(Number(v))}
                            disabled={formState === "submitting"}
                          >
                            <SelectTrigger className="w-20 bg-zinc-800 border-zinc-700 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {hourOptions.map((h) => (
                                <SelectItem key={h} value={String(h)}>
                                  {h.toString().padStart(2, "0")}:00
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center gap-2">
                          <Label className="text-xs text-zinc-400">To</Label>
                          <Select
                            value={String(endHour)}
                            onValueChange={(v) => setEndHour(Number(v))}
                            disabled={formState === "submitting"}
                          >
                            <SelectTrigger className="w-20 bg-zinc-800 border-zinc-700 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {hourOptions.map((h) => (
                                <SelectItem key={h} value={String(h)}>
                                  {h.toString().padStart(2, "0")}:00
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {/* Timezone */}
                    <div className="space-y-2">
                      <Label className="text-zinc-300">Timezone</Label>
                      <Select
                        value={timezone}
                        onValueChange={setTimezone}
                        disabled={formState === "submitting"}
                      >
                        <SelectTrigger className="w-64 bg-zinc-800 border-zinc-700 text-white">
                          <SelectValue placeholder="Select timezone" />
                        </SelectTrigger>
                        <SelectContent>
                          {TIMEZONE_OPTIONS.map((tz) => (
                            <SelectItem key={tz.value} value={tz.value}>
                              {tz.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Sender Accounts */}
                    <div className="space-y-3">
                      <Label className="text-zinc-300">Sender Accounts</Label>
                      <div className="space-y-2">
                        {senderAccounts.map((sender) => (
                          <label
                            key={sender.id}
                            className={cn(
                              "flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors",
                              selectedSenderIds.includes(sender.id)
                                ? "bg-zinc-800"
                                : "hover:bg-zinc-800/50",
                              !sender.is_active && "opacity-50"
                            )}
                          >
                            <Checkbox
                              checked={selectedSenderIds.includes(sender.id)}
                              onCheckedChange={() => toggleSender(sender.id)}
                              disabled={
                                formState === "submitting" || !sender.is_active
                              }
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-white">
                                  {sender.name}
                                </span>
                                {!sender.is_active && (
                                  <Badge
                                    variant="outline"
                                    className="text-[10px] border-zinc-600 text-zinc-500"
                                  >
                                    Inactive
                                  </Badge>
                                )}
                              </div>
                              <span className="text-xs text-zinc-500">
                                {sender.email} · {sender.daily_limit}/day
                              </span>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Status Messages */}
                    {formState === "error" && errorMessage && (
                      <div className="flex items-center gap-2 rounded-md bg-red-500/10 border border-red-500/20 px-4 py-3">
                        <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
                        <p className="text-sm text-red-400">{errorMessage}</p>
                      </div>
                    )}

                    {formState === "success" && (
                      <div className="flex items-center gap-2 rounded-md bg-emerald-500/10 border border-emerald-500/20 px-4 py-3">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                        <p className="text-sm text-emerald-400">
                          Configuration saved successfully.
                        </p>
                      </div>
                    )}

                    {/* Submit */}
                    <div className="pt-2">
                      <Button
                        type="submit"
                        disabled={formState === "submitting"}
                        className="bg-white text-black hover:bg-zinc-200"
                      >
                        {formState === "submitting" ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          "Save Configuration"
                        )}
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="flex items-center justify-center h-64 text-zinc-500">
                    Select a campaign from the list to configure.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </PageContent>
    </PageContainer>
  );
}

