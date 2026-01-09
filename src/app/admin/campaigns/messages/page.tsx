"use client";

import { useState, useEffect } from "react";
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
  Copy,
  Mail,
  Reply,
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
import {
  getCampaigns,
  getSequenceSteps,
  createSequenceStep,
  updateSequenceStep,
  deleteSequenceStep,
} from "@/lib/data";
import {
  Campaign,
  SequenceStep,
  SequenceStepVariant,
  DYNAMIC_VARIABLES,
} from "@/types";
import { cn } from "@/lib/utils";

const STATUS_CONFIG: Record<string, { label: string; class: string }> = {
  active: { label: "Active", class: "border-emerald-400/30 text-emerald-400 bg-emerald-400/5" },
  paused: { label: "Paused", class: "border-yellow-400/30 text-yellow-400 bg-yellow-400/5" },
  draft: { label: "Draft", class: "border-zinc-400/30 text-zinc-400 bg-zinc-400/5" },
  completed: { label: "Completed", class: "border-blue-400/30 text-blue-400 bg-blue-400/5" },
};

type SaveState = "idle" | "saving" | "saved" | "error";

interface StepEditorProps {
  step: SequenceStep;
  isExpanded: boolean;
  onToggle: () => void;
  onUpdate: (data: Partial<SequenceStep>) => Promise<void>;
  onDelete: () => Promise<void>;
  isFirst: boolean;
  saveState: SaveState;
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
  step,
  isExpanded,
  onToggle,
  onUpdate,
  onDelete,
  isFirst,
  saveState,
}: StepEditorProps) {
  const [subject, setSubject] = useState(step.subject);
  const [body, setBody] = useState(step.body);
  const [waitDays, setWaitDays] = useState(step.wait_days);
  const [isReply, setIsReply] = useState(step.is_reply);
  const [variants, setVariants] = useState<SequenceStepVariant[]>(step.variants);
  const [showVariants, setShowVariants] = useState(variants.length > 0);
  const [deleting, setDeleting] = useState(false);

  // Sync local state when step changes
  useEffect(() => {
    setSubject(step.subject);
    setBody(step.body);
    setWaitDays(step.wait_days);
    setIsReply(step.is_reply);
    setVariants(step.variants);
    setShowVariants(step.variants.length > 0);
  }, [step]);

  const handleSave = async () => {
    await onUpdate({
      subject,
      body,
      wait_days: waitDays,
      is_reply: isReply,
      variants,
    });
  };

  const handleDelete = async () => {
    if (!confirm("Delete this sequence step?")) return;
    setDeleting(true);
    await onDelete();
  };

  const insertVariable = (variable: string, target: "subject" | "body" | "variant-subject" | "variant-body", variantIndex?: number) => {
    if (target === "subject") {
      setSubject((prev) => prev + variable);
    } else if (target === "body") {
      setBody((prev) => prev + variable);
    } else if (target === "variant-subject" && variantIndex !== undefined) {
      setVariants((prev) =>
        prev.map((v, i) =>
          i === variantIndex ? { ...v, subject: v.subject + variable } : v
        )
      );
    } else if (target === "variant-body" && variantIndex !== undefined) {
      setVariants((prev) =>
        prev.map((v, i) =>
          i === variantIndex ? { ...v, body: v.body + variable } : v
        )
      );
    }
  };

  const addVariant = () => {
    const newVariant: SequenceStepVariant = {
      id: `var_${Math.random().toString(36).substr(2, 9)}`,
      name: `Variant ${String.fromCharCode(66 + variants.length)}`, // B, C, D...
      subject: subject,
      body: body,
    };
    setVariants([...variants, newVariant]);
    setShowVariants(true);
  };

  const removeVariant = (index: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const updateVariant = (index: number, field: "name" | "subject" | "body", value: string) => {
    setVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, [field]: value } : v))
    );
  };

  const hasChanges =
    subject !== step.subject ||
    body !== step.body ||
    waitDays !== step.wait_days ||
    isReply !== step.is_reply ||
    JSON.stringify(variants) !== JSON.stringify(step.variants);

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader
        className="cursor-pointer hover:bg-zinc-800/50 transition-colors py-3"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-sm font-medium text-white">
              {step.step_number}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-white truncate max-w-md">
                  {subject || "(No subject)"}
                </span>
                {isReply ? (
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
                {variants.length > 0 && (
                  <Badge variant="outline" className="text-[10px] border-purple-400/30 text-purple-400 bg-purple-400/5">
                    {variants.length + 1} variants
                  </Badge>
                )}
              </div>
              <span className="text-xs text-zinc-500">
                {isFirst ? "Sends immediately" : `Wait ${waitDays} day${waitDays !== 1 ? "s" : ""} after previous step`}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {hasChanges && (
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
                  value={waitDays}
                  onChange={(e) => setWaitDays(Number(e.target.value))}
                  className="w-16 h-8 bg-zinc-800 border-zinc-700 text-white text-sm"
                />
                <span className="text-xs text-zinc-400">days after previous step</span>
              </div>
            </div>
          )}

          {/* Reply Toggle */}
          <div className="flex items-center gap-2">
            <Checkbox
              id={`reply-${step.id}`}
              checked={isReply}
              onCheckedChange={(checked) => setIsReply(checked === true)}
            />
            <Label htmlFor={`reply-${step.id}`} className="text-sm text-zinc-300 cursor-pointer">
              Send as thread reply (same conversation)
            </Label>
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-zinc-300 text-sm">Subject</Label>
              <VariableInserter onInsert={(v) => insertVariable(v, "subject")} />
            </div>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject..."
              className="bg-zinc-800 border-zinc-700 text-white"
            />
          </div>

          {/* Body */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-zinc-300 text-sm">Body</Label>
              <VariableInserter onInsert={(v) => insertVariable(v, "body")} />
            </div>
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Email body..."
              className="bg-zinc-800 border-zinc-700 text-white min-h-[150px] font-mono text-sm"
            />
          </div>

          {/* Variants Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-zinc-300 text-sm">A/B Variants</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addVariant}
                className="h-7 text-xs bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Variant
              </Button>
            </div>

            {variants.length > 0 && (
              <div className="space-y-4 pl-4 border-l-2 border-zinc-800">
                {variants.map((variant, index) => (
                  <div key={variant.id} className="space-y-3 p-3 bg-zinc-800/50 rounded-md">
                    <div className="flex items-center justify-between">
                      <Input
                        value={variant.name}
                        onChange={(e) => updateVariant(index, "name", e.target.value)}
                        className="w-32 h-7 bg-zinc-800 border-zinc-700 text-white text-xs"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeVariant(index)}
                        className="h-7 w-7 p-0 text-zinc-400 hover:text-red-400"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-zinc-400 text-xs">Subject</Label>
                        <VariableInserter
                          onInsert={(v) => insertVariable(v, "variant-subject", index)}
                        />
                      </div>
                      <Input
                        value={variant.subject}
                        onChange={(e) => updateVariant(index, "subject", e.target.value)}
                        className="bg-zinc-800 border-zinc-700 text-white text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-zinc-400 text-xs">Body</Label>
                        <VariableInserter
                          onInsert={(v) => insertVariable(v, "variant-body", index)}
                        />
                      </div>
                      <Textarea
                        value={variant.body}
                        onChange={(e) => updateVariant(index, "body", e.target.value)}
                        className="bg-zinc-800 border-zinc-700 text-white min-h-[100px] font-mono text-xs"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={deleting}
              className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
            >
              {deleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-1" />
              )}
              Delete Step
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={!hasChanges || saveState === "saving"}
              className="bg-white text-black hover:bg-zinc-200"
            >
              {saveState === "saving" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

export default function CampaignMessagesPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [steps, setSteps] = useState<SequenceStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [stepsLoading, setStepsLoading] = useState(false);
  const [expandedStepId, setExpandedStepId] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [creatingStep, setCreatingStep] = useState(false);

  useEffect(() => {
    async function fetchCampaigns() {
      const data = await getCampaigns();
      setCampaigns(data);
      setLoading(false);
    }
    fetchCampaigns();
  }, []);

  useEffect(() => {
    async function fetchSteps() {
      if (!selectedCampaignId) {
        setSteps([]);
        return;
      }
      setStepsLoading(true);
      const data = await getSequenceSteps(selectedCampaignId);
      setSteps(data);
      setStepsLoading(false);
      // Auto-expand first step if exists
      if (data.length > 0 && !expandedStepId) {
        setExpandedStepId(data[0].id);
      }
    }
    fetchSteps();
  }, [selectedCampaignId]);

  const handleSelectCampaign = (campaignId: string) => {
    setSelectedCampaignId(campaignId);
    setExpandedStepId(null);
    setErrorMessage("");
  };

  const handleUpdateStep = async (stepId: string, data: Partial<SequenceStep>) => {
    setSaveState("saving");
    setErrorMessage("");
    try {
      const updated = await updateSequenceStep(stepId, data);
      setSteps((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 2000);
    } catch (err) {
      setSaveState("error");
      setErrorMessage(err instanceof Error ? err.message : "Failed to save changes.");
    }
  };

  const handleDeleteStep = async (stepId: string) => {
    try {
      await deleteSequenceStep(stepId);
      setSteps((prev) => {
        const filtered = prev.filter((s) => s.id !== stepId);
        // Renumber steps
        return filtered.map((s, i) => ({ ...s, step_number: i + 1 }));
      });
      if (expandedStepId === stepId) {
        setExpandedStepId(null);
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to delete step.");
    }
  };

  const handleCreateStep = async () => {
    if (!selectedCampaignId) return;
    setCreatingStep(true);
    try {
      const newStep = await createSequenceStep(selectedCampaignId, {
        subject: "",
        body: "",
        wait_days: steps.length === 0 ? 0 : 3,
        is_reply: steps.length > 0,
      });
      setSteps((prev) => [...prev, newStep]);
      setExpandedStepId(newStep.id);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to create step.");
    } finally {
      setCreatingStep(false);
    }
  };

  const selectedCampaign = campaigns.find((c) => c.id === selectedCampaignId);

  return (
    <PageContainer>
      <PageHeader
        title="Customize Campaign Messages"
        subtitle="Edit email sequences, subjects, and message content."
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
                        <span className="text-xs text-zinc-500">
                          {campaign.sequence_count} step{campaign.sequence_count !== 1 ? "s" : ""}
                        </span>
                      </button>
                    ))}
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
                        {steps.length} step{steps.length !== 1 ? "s" : ""} in sequence
                      </p>
                    </div>
                    <Button
                      onClick={handleCreateStep}
                      disabled={creatingStep}
                      className="bg-white text-black hover:bg-zinc-200"
                    >
                      {creatingStep ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-1" />
                      ) : (
                        <Plus className="h-4 w-4 mr-1" />
                      )}
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
                  ) : steps.length === 0 ? (
                    <Card className="bg-zinc-900 border-zinc-800">
                      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                        <Mail className="h-10 w-10 text-zinc-600 mb-3" />
                        <p className="text-zinc-400 mb-4">
                          No sequence steps yet. Add your first email.
                        </p>
                        <Button
                          onClick={handleCreateStep}
                          disabled={creatingStep}
                          className="bg-white text-black hover:bg-zinc-200"
                        >
                          {creatingStep ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-1" />
                          ) : (
                            <Plus className="h-4 w-4 mr-1" />
                          )}
                          Add First Step
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-3">
                      {steps.map((step, index) => (
                        <StepEditor
                          key={step.id}
                          step={step}
                          isExpanded={expandedStepId === step.id}
                          onToggle={() =>
                            setExpandedStepId(
                              expandedStepId === step.id ? null : step.id
                            )
                          }
                          onUpdate={(data) => handleUpdateStep(step.id, data)}
                          onDelete={() => handleDeleteStep(step.id)}
                          isFirst={index === 0}
                          saveState={saveState}
                        />
                      ))}
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

