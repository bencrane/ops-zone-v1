"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Save,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useWorkspaceNav } from "@/hooks/use-workspace-nav";
import type { Campaign } from "@/lib/emailbison/types";

const STATUS_CONFIG: Record<string, { label: string; class: string }> = {
  active: { label: "Active", class: "border-emerald-400/30 text-emerald-400 bg-emerald-400/5" },
  paused: { label: "Paused", class: "border-yellow-400/30 text-yellow-400 bg-yellow-400/5" },
  draft: { label: "Draft", class: "border-zinc-400/30 text-zinc-400 bg-zinc-400/5" },
  completed: { label: "Completed", class: "border-blue-400/30 text-blue-400 bg-blue-400/5" },
  launching: { label: "Launching", class: "border-blue-400/30 text-blue-400 bg-blue-400/5" },
  queued: { label: "Queued", class: "border-blue-400/30 text-blue-400 bg-blue-400/5" },
};

const TIMEZONES = [
  { value: "America/New_York", label: "Eastern (ET)" },
  { value: "America/Chicago", label: "Central (CT)" },
  { value: "America/Denver", label: "Mountain (MT)" },
  { value: "America/Los_Angeles", label: "Pacific (PT)" },
  { value: "America/Phoenix", label: "Arizona (AZ)" },
  { value: "Europe/London", label: "London (GMT)" },
  { value: "Europe/Paris", label: "Paris (CET)" },
  { value: "Asia/Tokyo", label: "Tokyo (JST)" },
  { value: "Australia/Sydney", label: "Sydney (AEST)" },
];

const DAYS = [
  { key: "monday", label: "Mon" },
  { key: "tuesday", label: "Tue" },
  { key: "wednesday", label: "Wed" },
  { key: "thursday", label: "Thu" },
  { key: "friday", label: "Fri" },
  { key: "saturday", label: "Sat" },
  { key: "sunday", label: "Sun" },
] as const;

type SaveState = "idle" | "saving" | "saved" | "error";

interface EditingSettings {
  name: string;
  max_emails_per_day: number;
  max_new_leads_per_day: number;
  plain_text: boolean;
  open_tracking: boolean;
  can_unsubscribe: boolean;
  unsubscribe_text: string;
}

interface Schedule {
  id?: number;
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;
  start_time: string;
  end_time: string;
  timezone: string;
}

const DEFAULT_SCHEDULE: Schedule = {
  monday: true,
  tuesday: true,
  wednesday: true,
  thursday: true,
  friday: true,
  saturday: false,
  sunday: false,
  start_time: "09:00",
  end_time: "17:00",
  timezone: "America/New_York",
};

function to24Hour(time: string): string {
  if (!time) return "09:00";
  let cleanTime = time.replace(/:\d{2}$/, "");
  if (/^\d{2}:\d{2}$/.test(cleanTime)) return cleanTime;
  const match = cleanTime.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) {
    const simpleMatch = time.match(/(\d{1,2}):(\d{2})/);
    if (simpleMatch) {
      const h = simpleMatch[1].padStart(2, "0");
      return `${h}:${simpleMatch[2]}`;
    }
    return "09:00";
  }
  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const period = match[3].toUpperCase();
  if (period === "PM" && hours !== 12) hours += 12;
  else if (period === "AM" && hours === 12) hours = 0;
  return `${hours.toString().padStart(2, "0")}:${minutes}`;
}

function formatTimeForApi(time: string): string {
  if (!time) return "09:00";
  const match = time.match(/^(\d{2}:\d{2})/);
  return match ? match[1] : time;
}

export default function ConfigureCampaignPage() {
  const { href } = useWorkspaceNav();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [editingSettings, setEditingSettings] = useState<EditingSettings | null>(null);
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [originalSchedule, setOriginalSchedule] = useState<Schedule | null>(null);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [hasExistingSchedule, setHasExistingSchedule] = useState(false);

  useEffect(() => {
    async function fetchCampaigns() {
      setLoading(true);
      setSelectedCampaignId(null);
      setEditingSettings(null);
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
    }
    fetchCampaigns();
  }, []);

  const selectedCampaign = campaigns.find((c) => c.id === selectedCampaignId);

  useEffect(() => {
    if (!selectedCampaignId) {
      setSchedule(null);
      setOriginalSchedule(null);
      setHasExistingSchedule(false);
      return;
    }

    async function fetchSchedule() {
      setScheduleLoading(true);
      try {
        const res = await fetch(`/api/emailbison/campaigns/${selectedCampaignId}/schedule`);
        const data = await res.json();
        if (data.data?.id) {
          const s: Schedule = {
            id: data.data.id,
            monday: data.data.monday,
            tuesday: data.data.tuesday,
            wednesday: data.data.wednesday,
            thursday: data.data.thursday,
            friday: data.data.friday,
            saturday: data.data.saturday,
            sunday: data.data.sunday,
            start_time: to24Hour(data.data.start_time),
            end_time: to24Hour(data.data.end_time),
            timezone: data.data.timezone,
          };
          setSchedule(s);
          setOriginalSchedule(s);
          setHasExistingSchedule(true);
        } else {
          setSchedule({ ...DEFAULT_SCHEDULE });
          setOriginalSchedule(null);
          setHasExistingSchedule(false);
        }
      } catch {
        setSchedule({ ...DEFAULT_SCHEDULE });
        setOriginalSchedule(null);
        setHasExistingSchedule(false);
      } finally {
        setScheduleLoading(false);
      }
    }
    fetchSchedule();
  }, [selectedCampaignId]);

  useEffect(() => {
    if (selectedCampaign) {
      setEditingSettings({
        name: selectedCampaign.name,
        max_emails_per_day: selectedCampaign.max_emails_per_day,
        max_new_leads_per_day: selectedCampaign.max_new_leads_per_day,
        plain_text: selectedCampaign.plain_text,
        open_tracking: selectedCampaign.open_tracking,
        can_unsubscribe: selectedCampaign.can_unsubscribe,
        unsubscribe_text: selectedCampaign.unsubscribe_text,
      });
      setSaveState("idle");
      setError(null);
    } else {
      setEditingSettings(null);
    }
  }, [selectedCampaign]);

  const handleSelectCampaign = (campaignId: number) => setSelectedCampaignId(campaignId);

  const handleFieldChange = (field: keyof EditingSettings, value: string | number | boolean) => {
    if (!editingSettings) return;
    setEditingSettings((prev) => prev ? { ...prev, [field]: value } : null);
  };

  const handleScheduleChange = (field: keyof Schedule, value: string | boolean) => {
    if (!schedule) return;
    setSchedule((prev) => prev ? { ...prev, [field]: value } : null);
  };

  const hasSettingsChanges = () => {
    if (!selectedCampaign || !editingSettings) return false;
    return (
      editingSettings.name !== selectedCampaign.name ||
      editingSettings.max_emails_per_day !== selectedCampaign.max_emails_per_day ||
      editingSettings.max_new_leads_per_day !== selectedCampaign.max_new_leads_per_day ||
      editingSettings.plain_text !== selectedCampaign.plain_text ||
      editingSettings.open_tracking !== selectedCampaign.open_tracking ||
      editingSettings.can_unsubscribe !== selectedCampaign.can_unsubscribe ||
      editingSettings.unsubscribe_text !== selectedCampaign.unsubscribe_text
    );
  };

  const hasScheduleChanges = () => {
    if (!schedule) return false;
    if (!hasExistingSchedule) return true;
    if (!originalSchedule) return true;
    return (
      schedule.monday !== originalSchedule.monday ||
      schedule.tuesday !== originalSchedule.tuesday ||
      schedule.wednesday !== originalSchedule.wednesday ||
      schedule.thursday !== originalSchedule.thursday ||
      schedule.friday !== originalSchedule.friday ||
      schedule.saturday !== originalSchedule.saturday ||
      schedule.sunday !== originalSchedule.sunday ||
      schedule.start_time !== originalSchedule.start_time ||
      schedule.end_time !== originalSchedule.end_time ||
      schedule.timezone !== originalSchedule.timezone
    );
  };

  const hasChanges = () => hasSettingsChanges() || hasScheduleChanges();

  const handleSave = async () => {
    if (!selectedCampaignId || !editingSettings) return;
    setSaveState("saving");
    setError(null);

    try {
      if (hasSettingsChanges()) {
        const res = await fetch(`/api/emailbison/campaigns/${selectedCampaignId}/settings`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editingSettings),
        });
        const result = await res.json();
        if (!res.ok || result.error) throw new Error(result.error || "Failed to save settings");
        setCampaigns((prev) => prev.map((c) => c.id === selectedCampaignId ? { ...c, ...result.data } : c));
      }

      if (hasScheduleChanges() && schedule) {
        const schedulePayload = {
          monday: schedule.monday,
          tuesday: schedule.tuesday,
          wednesday: schedule.wednesday,
          thursday: schedule.thursday,
          friday: schedule.friday,
          saturday: schedule.saturday,
          sunday: schedule.sunday,
          start_time: formatTimeForApi(schedule.start_time),
          end_time: formatTimeForApi(schedule.end_time),
          timezone: schedule.timezone,
          save_as_template: false,
        };
        const res = await fetch(`/api/emailbison/campaigns/${selectedCampaignId}/schedule`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(schedulePayload),
        });
        const result = await res.json();
        if (!res.ok || (result.data?.success === false)) {
          throw new Error(result.data?.message || result.error || "Failed to save schedule");
        }
        if (result.data?.id) {
          const updatedSchedule = { ...schedule, id: result.data.id };
          setSchedule(updatedSchedule);
          setOriginalSchedule(updatedSchedule);
          setHasExistingSchedule(true);
        }
      }

      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 2000);
    } catch (err) {
      setSaveState("error");
      setError(err instanceof Error ? err.message : "Failed to save");
    }
  };

  const getStatusConfig = (status: string) => {
    const key = status.toLowerCase();
    return STATUS_CONFIG[key] || { label: status, class: "border-zinc-400/30 text-zinc-400 bg-zinc-400/5" };
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-6xl mx-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Configure Campaign</h1>
            <p className="text-zinc-400 mt-1">Configure send limits, schedule, tracking, and campaign settings.</p>
          </div>
          <Link href={href("/campaigns")}>
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Campaigns
            </Button>
          </Link>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-md bg-red-500/10 border border-red-500/20 px-4 py-3 mb-6">
            <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {saveState === "saved" && (
          <div className="flex items-center gap-2 rounded-md bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 mb-6">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <p className="text-sm text-emerald-400">Settings saved successfully.</p>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="bg-zinc-900 border-zinc-800 lg:col-span-1">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-zinc-400">Select Campaign</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[600px]">
                  <div className="space-y-1 p-4 pt-0">
                    {campaigns.length === 0 ? (
                      <p className="text-sm text-zinc-500 py-4 text-center">No campaigns found</p>
                    ) : (
                      campaigns.map((campaign) => {
                        const statusConfig = getStatusConfig(campaign.status);
                        return (
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
                              <span className="text-sm font-medium text-white truncate">{campaign.name}</span>
                              <Badge variant="outline" className={cn("text-[10px] shrink-0", statusConfig.class)}>
                                {statusConfig.label}
                              </Badge>
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900 border-zinc-800 lg:col-span-2">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-zinc-400">
                    {selectedCampaign ? "Campaign Configuration" : "Select a campaign to configure"}
                  </CardTitle>
                  {selectedCampaign && hasChanges() && (
                    <Badge variant="outline" className="text-[10px] border-amber-400/30 text-amber-400 bg-amber-400/5">
                      Unsaved Changes
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {selectedCampaign && editingSettings ? (
                  <ScrollArea className="h-[550px] pr-4">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-zinc-300">Campaign Name</Label>
                        <Input
                          id="name"
                          value={editingSettings.name}
                          onChange={(e) => handleFieldChange("name", e.target.value)}
                          className="bg-zinc-800 border-zinc-700 text-white"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-zinc-300">Status</Label>
                        <div>
                          <Badge variant="outline" className={cn("text-xs", getStatusConfig(selectedCampaign.status).class)}>
                            {getStatusConfig(selectedCampaign.status).label}
                          </Badge>
                          <p className="text-xs text-zinc-500 mt-1">Use Campaign Management to change status</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="max_emails" className="text-zinc-300">Max Emails/Day</Label>
                          <Input
                            id="max_emails"
                            type="number"
                            min={1}
                            value={editingSettings.max_emails_per_day}
                            onChange={(e) => handleFieldChange("max_emails_per_day", Number(e.target.value))}
                            className="bg-zinc-800 border-zinc-700 text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="max_leads" className="text-zinc-300">Max New Leads/Day</Label>
                          <Input
                            id="max_leads"
                            type="number"
                            min={1}
                            value={editingSettings.max_new_leads_per_day}
                            onChange={(e) => handleFieldChange("max_new_leads_per_day", Number(e.target.value))}
                            className="bg-zinc-800 border-zinc-700 text-white"
                          />
                        </div>
                      </div>

                      <div className="space-y-4 pt-4 border-t border-zinc-800">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-zinc-400" />
                          <Label className="text-zinc-300 text-base">Sending Schedule</Label>
                          {!hasExistingSchedule && (
                            <Badge variant="outline" className="text-[10px] border-amber-400/30 text-amber-400 bg-amber-400/5">
                              Not Set
                            </Badge>
                          )}
                        </div>
                        
                        {scheduleLoading ? (
                          <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-5 w-5 animate-spin text-zinc-500" />
                          </div>
                        ) : schedule ? (
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label className="text-zinc-400 text-xs">Active Days</Label>
                              <div className="flex flex-wrap gap-2">
                                {DAYS.map(({ key, label }) => (
                                  <label
                                    key={key}
                                    className={cn(
                                      "flex items-center gap-2 px-3 py-2 rounded-md border cursor-pointer transition-colors",
                                      schedule[key as keyof Schedule]
                                        ? "bg-white/5 border-white/20 text-white"
                                        : "bg-zinc-800/50 border-zinc-700 text-zinc-500"
                                    )}
                                  >
                                    <Checkbox
                                      checked={schedule[key as keyof Schedule] as boolean}
                                      onCheckedChange={(checked) => handleScheduleChange(key as keyof Schedule, !!checked)}
                                      className="hidden"
                                    />
                                    <span className="text-sm">{label}</span>
                                  </label>
                                ))}
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="start_time" className="text-zinc-400 text-xs">Start Time</Label>
                                <Input
                                  id="start_time"
                                  type="time"
                                  value={schedule.start_time}
                                  onChange={(e) => handleScheduleChange("start_time", e.target.value)}
                                  className="bg-zinc-800 border-zinc-700 text-white"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="end_time" className="text-zinc-400 text-xs">End Time</Label>
                                <Input
                                  id="end_time"
                                  type="time"
                                  value={schedule.end_time}
                                  onChange={(e) => handleScheduleChange("end_time", e.target.value)}
                                  className="bg-zinc-800 border-zinc-700 text-white"
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label className="text-zinc-400 text-xs">Timezone</Label>
                              <Select value={schedule.timezone} onValueChange={(value) => handleScheduleChange("timezone", value)}>
                                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-800 border-zinc-700">
                                  {TIMEZONES.map((tz) => (
                                    <SelectItem key={tz.value} value={tz.value} className="text-white">
                                      {tz.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        ) : null}
                      </div>

                      <div className="space-y-4 pt-4 border-t border-zinc-800">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-zinc-300">Plain Text Emails</Label>
                            <p className="text-xs text-zinc-500">Send emails without HTML formatting</p>
                          </div>
                          <Switch
                            checked={editingSettings.plain_text}
                            onCheckedChange={(checked) => handleFieldChange("plain_text", checked)}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-zinc-300">Open Tracking</Label>
                            <p className="text-xs text-zinc-500">Track when recipients open emails</p>
                          </div>
                          <Switch
                            checked={editingSettings.open_tracking}
                            onCheckedChange={(checked) => handleFieldChange("open_tracking", checked)}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-zinc-300">Unsubscribe Link</Label>
                            <p className="text-xs text-zinc-500">Allow recipients to unsubscribe</p>
                          </div>
                          <Switch
                            checked={editingSettings.can_unsubscribe}
                            onCheckedChange={(checked) => handleFieldChange("can_unsubscribe", checked)}
                          />
                        </div>
                      </div>

                      {editingSettings.can_unsubscribe && (
                        <div className="space-y-2">
                          <Label htmlFor="unsubscribe_text" className="text-zinc-300">Unsubscribe Text</Label>
                          <Input
                            id="unsubscribe_text"
                            value={editingSettings.unsubscribe_text}
                            onChange={(e) => handleFieldChange("unsubscribe_text", e.target.value)}
                            placeholder="Click here to unsubscribe"
                            className="bg-zinc-800 border-zinc-700 text-white"
                          />
                        </div>
                      )}

                      <div className="flex justify-end pt-4 pb-2">
                        <Button
                          onClick={handleSave}
                          disabled={!hasChanges() || saveState === "saving"}
                          className="bg-white text-black hover:bg-zinc-200"
                        >
                          {saveState === "saving" ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4 mr-2" />
                              Save Settings
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="flex items-center justify-center h-64 text-zinc-500">
                    Select a campaign from the list to view its configuration.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

