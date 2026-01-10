"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Mail,
  Reply,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { PageContainer, PageHeader, PageContent } from "@/components/layout";
import { cn } from "@/lib/utils";
import { useWorkspace } from "@/contexts/workspace-context";
import type {
  Campaign,
  SequenceStep,
  SequenceStepsResponse,
} from "@/lib/emailbison/types";

// Dynamic variables available in EmailBison
const DYNAMIC_VARIABLES = [
  { value: "{FIRST_NAME}", label: "First Name" },
  { value: "{LAST_NAME}", label: "Last Name" },
  { value: "{FULL_NAME}", label: "Full Name" },
  { value: "{EMAIL}", label: "Email" },
  { value: "{COMPANY}", label: "Company" },
  { value: "{TITLE}", label: "Title" },
] as const;

const STATUS_CONFIG: Record<string, { label: string; class: string }> = {
  active: { label: "Active", class: "border-emerald-400/30 text-emerald-400 bg-emerald-400/5" },
  paused: { label: "Paused", class: "border-yellow-400/30 text-yellow-400 bg-yellow-400/5" },
  draft: { label: "Draft", class: "border-zinc-400/30 text-zinc-400 bg-zinc-400/5" },
  completed: { label: "Completed", class: "border-blue-400/30 text-blue-400 bg-blue-400/5" },
  launching: { label: "Launching", class: "border-blue-400/30 text-blue-400 bg-blue-400/5" },
};

type SaveState = "idle" | "saving" | "saved" | "error";

// Local editing state for a step
interface EditingStep {
  email_subject: string;
  email_body: string;
  wait_in_days: number;
  thread_reply: boolean;
  order: number;
  isNew?: boolean; // Track if this is a new unsaved step
}

// Use negative IDs for new unsaved steps to distinguish from API steps
let tempIdCounter = -1;
function getNextTempId() {
  return tempIdCounter--;
}

interface StepEditorProps {
  stepId: number;
  editingState: EditingStep;
  isExpanded: boolean;
  onToggle: () => void;
  onFieldChange: (field: keyof EditingStep, value: string | number | boolean) => void;
  onSave: () => Promise<void>;
  onDelete: () => void;
  onCancel?: () => void;
  isFirst: boolean;
  saveState: SaveState;
  hasChanges: boolean;
  isNew: boolean;
  isLastStep: boolean; // Can't delete the last step in a sequence
}

function VariableInserter({ onInsert }: { onInsert: (variable: string) => void }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 text-xs bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700"
        >
          Insert Variable
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2" align="start">
        <div className="space-y-1">
          {DYNAMIC_VARIABLES.map((v) => (
            <button
              key={v.value}
              type="button"
              onClick={() => onInsert(v.value)}
              className="w-full text-left px-2 py-1.5 rounded text-sm hover:bg-zinc-800 transition-colors"
            >
              <span className="font-mono text-xs text-emerald-400">{v.value}</span>
              <span className="text-zinc-400 ml-2 text-xs">{v.label}</span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function StepEditor({
  stepId,
  editingState,
  isExpanded,
  onToggle,
  onFieldChange,
  onSave,
  onDelete,
  onCancel,
  isFirst,
  saveState,
  hasChanges,
  isNew,
  isLastStep,
}: StepEditorProps) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (isNew) {
      // For new unsaved steps, just remove from local state
      onDelete();
      return;
    }
    if (isLastStep) {
      // Can't delete the last step - this shouldn't happen since button is disabled
      return;
    }
    if (!confirm("Delete this sequence step? This cannot be undone.")) return;
    setDeleting(true);
    onDelete();
    setDeleting(false);
  };

  const insertVariable = (variable: string, target: "subject" | "body") => {
    if (target === "subject") {
      onFieldChange("email_subject", editingState.email_subject + variable);
    } else {
      onFieldChange("email_body", editingState.email_body + variable);
    }
  };

  // For new steps, require subject and body before saving
  const canSave = isNew 
    ? editingState.email_subject.trim() !== "" && editingState.email_body.trim() !== ""
    : hasChanges;

  return (
    <Card className={cn(
      "bg-zinc-900 border-zinc-800",
      isNew && "border-amber-500/30"
    )}>
      <CardHeader
        className="cursor-pointer hover:bg-zinc-800/50 transition-colors py-3"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium text-white",
              isNew ? "bg-amber-500/20 border border-amber-500/30" : "bg-zinc-800"
            )}>
              {editingState.order}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-white truncate max-w-md">
                  {editingState.email_subject || "(No subject)"}
                </span>
                {editingState.thread_reply ? (
                  <Badge variant="outline" className="text-[10px] border-blue-400/30 text-blue-400 bg-blue-400/5">
                    <Reply className="h-3 w-3 mr-1" />
                    Reply
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px] border-zinc-600 text-zinc-400">
                    <Mail className="h-3 w-3 mr-1" />
                    New
                  </Badge>
                )}
                {isNew && (
                  <Badge variant="outline" className="text-[10px] border-amber-400/30 text-amber-400 bg-amber-400/5">
                    Draft
                  </Badge>
                )}
              </div>
              <span className="text-xs text-zinc-500">
                {isFirst ? "Sends immediately" : `Wait ${editingState.wait_in_days} day${editingState.wait_in_days !== 1 ? "s" : ""}`}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isNew && hasChanges && (
              <Badge variant="outline" className="text-[10px] border-amber-400/30 text-amber-400 bg-amber-400/5">
                Unsaved
              </Badge>
            )}
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 text-zinc-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-zinc-400" />
            )}
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0 space-y-4">
          <Separator className="bg-zinc-800" />

          {/* Wait Days (not for first step) */}
          {!isFirst && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Label className="text-zinc-400 text-xs">Wait</Label>
                <Input
                  type="number"
                  min={1}
                  max={30}
                  value={editingState.wait_in_days}
                  onChange={(e) => onFieldChange("wait_in_days", Number(e.target.value))}
                  className="w-16 h-8 bg-zinc-800 border-zinc-700 text-white text-sm"
                />
                <span className="text-xs text-zinc-400">days after previous step</span>
              </div>
            </div>
          )}

          {/* Reply Toggle */}
          <div className="flex items-center gap-2">
            <Checkbox
              id={`reply-${stepId}`}
              checked={editingState.thread_reply}
              onCheckedChange={(checked) => onFieldChange("thread_reply", checked === true)}
            />
            <Label htmlFor={`reply-${stepId}`} className="text-sm text-zinc-300 cursor-pointer">
              Send as thread reply (same conversation)
            </Label>
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-zinc-300 text-sm">
                Subject <span className="text-red-400">*</span>
              </Label>
              <VariableInserter onInsert={(v) => insertVariable(v, "subject")} />
            </div>
            <Input
              value={editingState.email_subject}
              onChange={(e) => onFieldChange("email_subject", e.target.value)}
              placeholder="Email subject..."
              className="bg-zinc-800 border-zinc-700 text-white"
            />
          </div>

          {/* Body */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-zinc-300 text-sm">
                Body <span className="text-red-400">*</span>
              </Label>
              <VariableInserter onInsert={(v) => insertVariable(v, "body")} />
            </div>
            <Textarea
              value={editingState.email_body}
              onChange={(e) => onFieldChange("email_body", e.target.value)}
              placeholder="Email body..."
              className="bg-zinc-800 border-zinc-700 text-white min-h-[150px] font-mono text-sm"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              {isNew && onCancel && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onCancel}
                  className="text-zinc-400 hover:text-zinc-300"
                >
                  Cancel
                </Button>
              )}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={deleting || saveState === "saving" || (!isNew && isLastStep)}
                className="text-red-400 hover:text-red-300 hover:bg-red-400/10 disabled:text-zinc-600 disabled:hover:bg-transparent"
                title={!isNew && isLastStep ? "Cannot delete the only step in a sequence" : undefined}
              >
                {deleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-1" />
                )}
                {isNew ? "Discard" : "Delete Step"}
              </Button>
            </div>
            <Button
              type="button"
              onClick={onSave}
              disabled={!canSave || saveState === "saving"}
              className="bg-white text-black hover:bg-zinc-200"
            >
              {saveState === "saving" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-1" />
                  {isNew ? "Save Step" : "Save Changes"}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

export default function CampaignMessagesPage() {
  const { refreshKey } = useWorkspace();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(null);
  const [sequenceData, setSequenceData] = useState<SequenceStepsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [stepsLoading, setStepsLoading] = useState(false);
  const [expandedStepId, setExpandedStepId] = useState<number | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  // Local editing state for each step (keyed by step id, including temp IDs for new steps)
  const [editingStates, setEditingStates] = useState<Record<number, EditingStep>>({});
  
  // Track new unsaved step IDs (negative numbers)
  const [newStepIds, setNewStepIds] = useState<number[]>([]);

  // Fetch campaigns - re-runs when workspace changes
  useEffect(() => {
    async function fetchCampaigns() {
      setLoading(true);
      setSelectedCampaignId(null);
      setSequenceData(null);
      setEditingStates({});
      setNewStepIds([]);
      try {
        const res = await fetch("/api/emailbison/campaigns");
        const data = await res.json();
        if (data.error) {
          setErrorMessage(data.error);
        } else {
          const activeCampaigns = (data.data || []).filter((c: Campaign) => {
            const status = c.status.toLowerCase();
            return status !== "pending deletion" && status !== "deleted";
          });
          setCampaigns(activeCampaigns);
        }
      } catch {
        setErrorMessage("Failed to load campaigns");
      } finally {
        setLoading(false);
      }
    }
    fetchCampaigns();
  }, [refreshKey]);

  // Initialize editing state from API steps (only used on initial load)
  const initEditingStates = useCallback((steps: SequenceStep[]) => {
    const states: Record<number, EditingStep> = {};
    steps.forEach((step) => {
      states[step.id] = {
        email_subject: step.email_subject,
        email_body: step.email_body,
        wait_in_days: step.wait_in_days,
        thread_reply: step.thread_reply,
        order: step.order,
        isNew: false,
      };
    });
    setEditingStates(states);
    setNewStepIds([]); // Clear any new steps when refreshing from API
  }, []);

  // Update sequence data WITHOUT resetting editing states
  // Only adds new steps to editing state, preserves existing edits
  const updateSequenceDataPreservingEdits = useCallback((newSequenceData: SequenceStepsResponse, savedStepId?: number) => {
    setSequenceData(newSequenceData);
    
    const newSteps = newSequenceData.sequence_steps || [];
    
    setEditingStates((prev) => {
      const updated = { ...prev };
      
      // Add any new steps that don't exist in editing state
      newSteps.forEach((step) => {
        if (!updated[step.id]) {
          updated[step.id] = {
            email_subject: step.email_subject,
            email_body: step.email_body,
            wait_in_days: step.wait_in_days,
            thread_reply: step.thread_reply,
            order: step.order,
            isNew: false,
          };
        } else if (step.id === savedStepId) {
          // Update the step that was just saved to reflect API state
          updated[step.id] = {
            email_subject: step.email_subject,
            email_body: step.email_body,
            wait_in_days: step.wait_in_days,
            thread_reply: step.thread_reply,
            order: step.order,
            isNew: false,
          };
        }
        // Otherwise, preserve existing editing state (don't overwrite user edits)
      });
      
      // Remove steps that no longer exist in API
      const apiStepIds = new Set(newSteps.map(s => s.id));
      for (const id of Object.keys(updated)) {
        const numId = Number(id);
        if (numId > 0 && !apiStepIds.has(numId)) {
          delete updated[numId];
        }
      }
      
      return updated;
    });
  }, []);

  // Fetch sequence steps when campaign selected
  useEffect(() => {
    async function fetchSteps() {
      if (!selectedCampaignId) {
        setSequenceData(null);
        setEditingStates({});
        setNewStepIds([]);
        return;
      }
      setStepsLoading(true);
      setErrorMessage("");
      try {
        const res = await fetch(`/api/emailbison/campaigns/${selectedCampaignId}/sequence-steps`);
        const result = await res.json();
        if (result.error) {
          setErrorMessage(result.error);
          setSequenceData(null);
        } else {
          setSequenceData(result.data);
          initEditingStates(result.data?.sequence_steps || []);
          // Auto-expand first step
          if (result.data?.sequence_steps?.length > 0) {
            setExpandedStepId(result.data.sequence_steps[0].id);
          }
        }
      } catch {
        setErrorMessage("Failed to load sequence steps");
      } finally {
        setStepsLoading(false);
      }
    }
    fetchSteps();
  }, [selectedCampaignId, initEditingStates]);

  const handleSelectCampaign = (campaignId: number) => {
    setSelectedCampaignId(campaignId);
    setExpandedStepId(null);
    setErrorMessage("");
    setSaveState("idle");
    setNewStepIds([]);
  };

  const handleFieldChange = (stepId: number, field: keyof EditingStep, value: string | number | boolean) => {
    setEditingStates((prev) => ({
      ...prev,
      [stepId]: {
        ...prev[stepId],
        [field]: value,
      },
    }));
  };

  const hasChanges = (stepId: number, originalStep?: SequenceStep) => {
    const editing = editingStates[stepId];
    if (!editing || !originalStep) return false;
    return (
      editing.email_subject !== originalStep.email_subject ||
      editing.email_body !== originalStep.email_body ||
      editing.wait_in_days !== originalStep.wait_in_days ||
      editing.thread_reply !== originalStep.thread_reply
    );
  };

  // Add a new local step (no API call yet)
  const handleAddStep = () => {
    const apiSteps = sequenceData?.sequence_steps || [];
    const newOrder = apiSteps.length + newStepIds.length + 1;
    const tempId = getNextTempId();
    
    const newEditingState: EditingStep = {
      email_subject: "",
      email_body: "",
      wait_in_days: newOrder === 1 ? 1 : 3, // API requires wait_in_days >= 1
      thread_reply: newOrder > 1,
      order: newOrder,
      isNew: true,
    };
    
    setEditingStates((prev) => ({
      ...prev,
      [tempId]: newEditingState,
    }));
    setNewStepIds((prev) => [...prev, tempId]);
    setExpandedStepId(tempId);
  };

  // Remove a new unsaved step
  const handleCancelNewStep = (tempId: number) => {
    setNewStepIds((prev) => prev.filter((id) => id !== tempId));
    setEditingStates((prev) => {
      const updated = { ...prev };
      delete updated[tempId];
      return updated;
    });
    if (expandedStepId === tempId) {
      setExpandedStepId(null);
    }
  };

  // Save a new step to the API
  // POST always APPENDS new steps to the sequence (even if sequence exists)
  const handleSaveNewStep = async (tempId: number) => {
    if (!selectedCampaignId) return;
    
    const editing = editingStates[tempId];
    if (!editing || !editing.email_subject.trim() || !editing.email_body.trim()) {
      setErrorMessage("Subject and body are required");
      return;
    }

    setSaveState("saving");
    setErrorMessage("");

    try {
      // POST appends new steps to the sequence (works whether sequence exists or not)
      const res = await fetch(`/api/emailbison/campaigns/${selectedCampaignId}/sequence-steps`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Campaign Sequence",
          sequence_steps: [
            {
              email_subject: editing.email_subject,
              email_body: editing.email_body,
              wait_in_days: Math.max(1, editing.wait_in_days), // API requires >= 1
              order: editing.order,
              thread_reply: editing.thread_reply,
            },
          ],
        }),
      });

      const result = await res.json();
      if (!res.ok || result.error) {
        throw new Error(result.error || "Failed to add step");
      }

      // Re-fetch steps - preserve existing edits, only add the new step
      const refreshRes = await fetch(`/api/emailbison/campaigns/${selectedCampaignId}/sequence-steps`);
      const refreshData = await refreshRes.json();
      if (refreshData.data) {
        // Remove the temp step from editing states
        setEditingStates((prev) => {
          const updated = { ...prev };
          delete updated[tempId];
          return updated;
        });
        setNewStepIds((prev) => prev.filter((id) => id !== tempId));
        
        // Update sequence data and add new step to editing state
        updateSequenceDataPreservingEdits(refreshData.data);
        
        // Expand the newly created step (last one)
        const newSteps = refreshData.data.sequence_steps || [];
        if (newSteps.length > 0) {
          setExpandedStepId(newSteps[newSteps.length - 1].id);
        }
      }

      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 2000);
    } catch (err) {
      setSaveState("error");
      setErrorMessage(err instanceof Error ? err.message : "Failed to save step");
    }
  };

  // Save changes to an existing step
  const handleSaveExistingStep = async (step: SequenceStep) => {
    if (!sequenceData) return;
    const editing = editingStates[step.id];
    if (!editing) return;

    setSaveState("saving");
    setErrorMessage("");

    try {
      const updatedSteps = sequenceData.sequence_steps.map((s) => {
        const editState = editingStates[s.id];
        return {
          id: s.id,
          email_subject: editState?.email_subject ?? s.email_subject,
          email_body: editState?.email_body ?? s.email_body,
          wait_in_days: editState?.wait_in_days ?? s.wait_in_days,
          order: s.order,
          thread_reply: editState?.thread_reply ?? s.thread_reply,
          variant: s.variant,
          ...(s.variant_from_step_id && { variant_from_step_id: s.variant_from_step_id }),
        };
      });

      const res = await fetch(`/api/emailbison/sequence-steps/${sequenceData.sequence_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Campaign Sequence",
          sequence_steps: updatedSteps,
        }),
      });

      const result = await res.json();
      if (!res.ok || result.error) {
        throw new Error(result.error || "Failed to save");
      }

      // Re-fetch - only update the saved step, preserve other edits
      const refreshRes = await fetch(`/api/emailbison/campaigns/${selectedCampaignId}/sequence-steps`);
      const refreshData = await refreshRes.json();
      if (refreshData.data) {
        updateSequenceDataPreservingEdits(refreshData.data, step.id);
      }

      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 2000);
    } catch (err) {
      setSaveState("error");
      setErrorMessage(err instanceof Error ? err.message : "Failed to save changes");
    }
  };

  // Delete an existing step from API
  // Note: EmailBison requires at least one step in a sequence
  const handleDeleteExistingStep = async (stepId: number) => {
    const apiSteps = sequenceData?.sequence_steps || [];
    
    // Check if this is the last step - EmailBison won't allow deletion
    if (apiSteps.length <= 1) {
      setErrorMessage("Cannot delete the only step. A sequence must have at least one step.");
      return;
    }
    
    setSaveState("saving");
    setErrorMessage("");

    try {
      const res = await fetch(`/api/emailbison/sequence-steps/step/${stepId}`, {
        method: "DELETE",
      });

      const result = await res.json();
      if (!res.ok || result.error) {
        throw new Error(result.error || "Failed to delete");
      }

      // Re-fetch steps - preserve edits on remaining steps
      const refreshRes = await fetch(`/api/emailbison/campaigns/${selectedCampaignId}/sequence-steps`);
      const refreshData = await refreshRes.json();
      if (refreshData.data) {
        updateSequenceDataPreservingEdits(refreshData.data);
      }

      if (expandedStepId === stepId) {
        setExpandedStepId(null);
      }
      setSaveState("idle");
    } catch (err) {
      setSaveState("error");
      setErrorMessage(err instanceof Error ? err.message : "Failed to delete step");
    }
  };

  const selectedCampaign = campaigns.find((c) => c.id === selectedCampaignId);
  const apiSteps = sequenceData?.sequence_steps || [];
  const totalSteps = apiSteps.length + newStepIds.length;

  const getStatusConfig = (status: string) => {
    const key = status.toLowerCase();
    return STATUS_CONFIG[key] || { label: status, class: "border-zinc-400/30 text-zinc-400 bg-zinc-400/5" };
  };

  return (
    <PageContainer>
      <PageHeader
        title="Customize Campaign Messages"
        subtitle="Edit email sequences, subjects, and message content."
        actions={
          <Link href="/admin/campaigns-hub">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Campaigns
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
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left: Campaign List */}
            <Card className="bg-zinc-900 border-zinc-800 lg:col-span-1">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-zinc-400">
                  Select Campaign
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[600px]">
                  <div className="space-y-1 p-4 pt-0">
                    {campaigns.length === 0 ? (
                      <p className="text-sm text-zinc-500 py-4 text-center">
                        No campaigns found
                      </p>
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
                              <span className="text-sm font-medium text-white truncate">
                                {campaign.name}
                              </span>
                              <Badge
                                variant="outline"
                                className={cn("text-[10px] shrink-0", statusConfig.class)}
                              >
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

            {/* Right: Sequence Editor */}
            <div className="lg:col-span-3 space-y-4">
              {selectedCampaign ? (
                <>
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-white">
                        {selectedCampaign.name}
                      </h2>
                      <p className="text-sm text-zinc-400">
                        {totalSteps} step{totalSteps !== 1 ? "s" : ""} in sequence
                        {newStepIds.length > 0 && (
                          <span className="text-amber-400 ml-1">
                            ({newStepIds.length} unsaved)
                          </span>
                        )}
                      </p>
                    </div>
                    <Button
                      onClick={handleAddStep}
                      disabled={newStepIds.length > 0} // Only allow one new step at a time
                      className="bg-white text-black hover:bg-zinc-200"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Step
                    </Button>
                  </div>

                  {/* Error Message */}
                  {errorMessage && (
                    <div className="flex items-center gap-2 rounded-md bg-red-500/10 border border-red-500/20 px-4 py-3">
                      <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
                      <p className="text-sm text-red-400">{errorMessage}</p>
                    </div>
                  )}

                  {/* Success Message */}
                  {saveState === "saved" && (
                    <div className="flex items-center gap-2 rounded-md bg-emerald-500/10 border border-emerald-500/20 px-4 py-3">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                      <p className="text-sm text-emerald-400">Changes saved.</p>
                    </div>
                  )}

                  {/* Steps List */}
                  {stepsLoading ? (
                    <div className="flex items-center justify-center h-32">
                      <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
                    </div>
                  ) : totalSteps === 0 ? (
                    <Card className="bg-zinc-900 border-zinc-800">
                      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                        <Mail className="h-10 w-10 text-zinc-600 mb-3" />
                        <p className="text-zinc-400 mb-4">
                          No sequence steps yet. Add your first email.
                        </p>
                        <Button
                          onClick={handleAddStep}
                          className="bg-white text-black hover:bg-zinc-200"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add First Step
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-3">
                      {/* Existing API steps */}
                      {apiSteps.map((step, index) => (
                        <StepEditor
                          key={step.id}
                          stepId={step.id}
                          editingState={editingStates[step.id] || {
                            email_subject: step.email_subject,
                            email_body: step.email_body,
                            wait_in_days: step.wait_in_days,
                            thread_reply: step.thread_reply,
                            order: step.order,
                            isNew: false,
                          }}
                          isExpanded={expandedStepId === step.id}
                          onToggle={() =>
                            setExpandedStepId(
                              expandedStepId === step.id ? null : step.id
                            )
                          }
                          onFieldChange={(field, value) => handleFieldChange(step.id, field, value)}
                          onSave={() => handleSaveExistingStep(step)}
                          onDelete={() => handleDeleteExistingStep(step.id)}
                          isFirst={index === 0}
                          saveState={saveState}
                          hasChanges={hasChanges(step.id, step)}
                          isNew={false}
                          isLastStep={apiSteps.length === 1}
                        />
                      ))}
                      
                      {/* New unsaved steps */}
                      {newStepIds.map((tempId, index) => {
                        const editing = editingStates[tempId];
                        if (!editing) return null;
                        return (
                          <StepEditor
                            key={tempId}
                            stepId={tempId}
                            editingState={editing}
                            isExpanded={expandedStepId === tempId}
                            onToggle={() =>
                              setExpandedStepId(
                                expandedStepId === tempId ? null : tempId
                              )
                            }
                            onFieldChange={(field, value) => handleFieldChange(tempId, field, value)}
                            onSave={() => handleSaveNewStep(tempId)}
                            onDelete={() => handleCancelNewStep(tempId)}
                            onCancel={() => handleCancelNewStep(tempId)}
                            isFirst={apiSteps.length === 0 && index === 0}
                            saveState={saveState}
                            hasChanges={true}
                            isNew={true}
                            isLastStep={false}
                          />
                        );
                      })}
                    </div>
                  )}

                  {/* Dynamic Variables Reference */}
                  <Card className="bg-zinc-900/50 border-zinc-800">
                    <CardHeader className="py-3">
                      <CardTitle className="text-xs font-medium text-zinc-500">
                        Available Variables
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="py-0 pb-3">
                      <div className="flex flex-wrap gap-2">
                        {DYNAMIC_VARIABLES.map((v) => (
                          <code
                            key={v.value}
                            className="text-[10px] px-2 py-1 bg-zinc-800 rounded text-emerald-400"
                          >
                            {v.value}
                          </code>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card className="bg-zinc-900 border-zinc-800">
                  <CardContent className="flex items-center justify-center h-64 text-zinc-500">
                    Select a campaign from the list to edit its message sequence.
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </PageContent>
    </PageContainer>
  );
}
