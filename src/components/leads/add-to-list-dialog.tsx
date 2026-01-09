"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Users } from "lucide-react";
import { LeadList } from "@/types";
import { getLeadLists, createLeadList, addLeadsToList } from "@/lib/data";
import { cn } from "@/lib/utils";

interface AddToListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCount: number;
  selectedIds: string[];
  onSuccess?: () => void;
}

export function AddToListDialog({
  open,
  onOpenChange,
  selectedCount,
  selectedIds,
  onSuccess,
}: AddToListDialogProps) {
  const [lists, setLists] = useState<LeadList[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [mode, setMode] = useState<"existing" | "new">("existing");
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [newListName, setNewListName] = useState("");
  const [newListDescription, setNewListDescription] = useState("");

  useEffect(() => {
    if (open) {
      fetchLists();
      // Reset state when dialog opens
      setMode("existing");
      setSelectedListId(null);
      setNewListName("");
      setNewListDescription("");
    }
  }, [open]);

  const fetchLists = async () => {
    setLoading(true);
    const data = await getLeadLists();
    setLists(data);
    setLoading(false);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      if (mode === "new") {
        if (!newListName.trim()) return;
        const newList = await createLeadList(newListName.trim(), newListDescription.trim() || undefined);
        await addLeadsToList(selectedIds, newList.id);
      } else {
        if (!selectedListId) return;
        await addLeadsToList(selectedIds, selectedListId);
      }
      onOpenChange(false);
      onSuccess?.();
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit =
    (mode === "existing" && selectedListId) ||
    (mode === "new" && newListName.trim());

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[380px] bg-zinc-900 border-zinc-800 p-5">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-white text-base">
            Add {selectedCount} lead{selectedCount !== 1 ? "s" : ""} to list
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-3">
          {/* Mode selection - compact tabs */}
          <RadioGroup
            value={mode}
            onValueChange={(v) => setMode(v as "existing" | "new")}
            className="grid grid-cols-2 gap-2"
          >
            <Label
              htmlFor="existing"
              className={cn(
                "flex items-center justify-center gap-2 rounded-md border py-2 px-3 cursor-pointer transition-colors text-sm",
                mode === "existing"
                  ? "border-white bg-white text-black"
                  : "border-zinc-700 text-zinc-400 hover:border-zinc-600"
              )}
            >
              <RadioGroupItem value="existing" id="existing" className="sr-only" />
              <Users className="h-4 w-4" />
              Existing List
            </Label>
            <Label
              htmlFor="new"
              className={cn(
                "flex items-center justify-center gap-2 rounded-md border py-2 px-3 cursor-pointer transition-colors text-sm",
                mode === "new"
                  ? "border-white bg-white text-black"
                  : "border-zinc-700 text-zinc-400 hover:border-zinc-600"
              )}
            >
              <RadioGroupItem value="new" id="new" className="sr-only" />
              <Plus className="h-4 w-4" />
              New List
            </Label>
          </RadioGroup>

          {/* Fixed height content area to prevent modal resizing */}
          <div className="h-[180px]">
            {/* Existing lists */}
            {mode === "existing" && (
              <div className="h-full">
                {loading ? (
                  <div className="flex items-center justify-center h-full text-zinc-500 text-sm">
                    Loading lists...
                  </div>
                ) : lists.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-zinc-500 text-sm">
                    No lists yet. Create one to get started.
                  </div>
                ) : (
                  <ScrollArea className="h-full">
                    <div className="space-y-2 pr-2">
                      {lists.map((list) => (
                        <div
                          key={list.id}
                          onClick={() => setSelectedListId(list.id)}
                          className={cn(
                            "flex items-center justify-between p-2.5 rounded-md border cursor-pointer transition-colors",
                            selectedListId === list.id
                              ? "border-white bg-white/5"
                              : "border-zinc-800 hover:border-zinc-700"
                          )}
                        >
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-white text-sm truncate">{list.name}</p>
                            {list.description && (
                              <p className="text-xs text-zinc-500 truncate">{list.description}</p>
                            )}
                          </div>
                          <span className="text-xs text-zinc-500 ml-3 shrink-0">
                            {list.lead_count}
                          </span>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </div>
            )}

            {/* New list form */}
            {mode === "new" && (
              <div className="space-y-3 h-full">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-zinc-400 text-xs">
                    List name *
                  </Label>
                  <Input
                    id="name"
                    placeholder="e.g., Q1 Outreach Targets"
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    className="h-9 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="description" className="text-zinc-400 text-xs">
                    Description (optional)
                  </Label>
                  <Input
                    id="description"
                    placeholder="e.g., SaaS founders in healthcare vertical"
                    value={newListDescription}
                    onChange={(e) => setNewListDescription(e.target.value)}
                    className="h-9 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="pt-2 gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-zinc-400 hover:text-white hover:bg-zinc-800"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={!canSubmit || submitting}
            className="bg-white text-black hover:bg-zinc-200"
          >
            {submitting ? "Adding..." : "Add to List"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

