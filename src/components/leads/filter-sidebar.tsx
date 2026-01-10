"use client";

import { useState, useEffect, KeyboardEvent } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Lock,
  Unlock,
  X,
  Terminal,
  List,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LeadList } from "@/types";
import { getLeadLists } from "@/lib/data";

// ============================================================================
// DESIGN CONSTANTS
// ============================================================================
const BAND_HEIGHT = {
  header: "h-[64px]",
  spacer: "h-[64px]",
};

// ============================================================================
// FILTER STATE TYPES
// ============================================================================
export interface Filters {
  selectedListId: string | null; // null = "All Leads"
  industries: string[];
  companySizes: string[];
  jobTitles: string[];
}

export interface FilterSidebarProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
}

// ============================================================================
// CHIP INPUT SECTION
// ============================================================================
interface ChipInputSectionProps {
  title: string;
  placeholder: string;
  values: string[];
  onAdd: (value: string) => void;
  onRemove: (value: string) => void;
}

function ChipInputSection({ title, placeholder, values, onAdd, onRemove }: ChipInputSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      const value = inputValue.trim();
      if (!values.includes(value)) {
        onAdd(value);
      }
      setInputValue("");
    }
  };

  const hasValues = values.length > 0;

  return (
    <div className="border-b border-zinc-800 last:border-b-0">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "w-full flex items-center justify-between px-4 h-[52px] text-left transition-colors",
          "hover:bg-zinc-900/50",
          isExpanded && "bg-zinc-900/30"
        )}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-zinc-200">{title}</span>
          {hasValues && (
            <Badge variant="secondary" className="h-5 px-1.5 text-[10px] bg-white text-black font-semibold">
              {values.length}
            </Badge>
          )}
        </div>
        <ChevronRight
          className={cn(
            "h-4 w-4 text-zinc-500 transition-transform duration-200",
            isExpanded && "rotate-90"
          )}
        />
      </button>

      {isExpanded && (
        <div className="px-4 pb-3 space-y-2">
          <Input
            type="text"
            placeholder={placeholder}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            className="h-8 text-sm bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500"
          />
          {hasValues && (
            <div className="flex flex-wrap gap-1 pt-1">
              {values.map((value) => (
                <Badge
                  key={value}
                  variant="secondary"
                  className="text-xs bg-zinc-800 text-zinc-200 hover:bg-zinc-700 cursor-pointer pr-1"
                  onClick={() => onRemove(value)}
                >
                  {value}
                  <X className="ml-1 h-3 w-3" />
                </Badge>
              ))}
            </div>
          )}
        </div>
      )}

      {!isExpanded && hasValues && (
        <div className="px-4 pb-3 flex flex-wrap gap-1">
          {values.slice(0, 3).map((value) => (
            <Badge
              key={value}
              variant="outline"
              className="text-[10px] border-zinc-700 text-zinc-400 px-1.5 py-0 cursor-pointer hover:border-zinc-500"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(value);
              }}
            >
              {value}
              <X className="ml-1 h-2.5 w-2.5" />
            </Badge>
          ))}
          {values.length > 3 && (
            <span className="text-[10px] text-zinc-500">+{values.length - 3}</span>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// FILTER SIDEBAR COMPONENT
// ============================================================================
export function FilterSidebar({ 
  filters, 
  onFiltersChange,
}: FilterSidebarProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [leadLists, setLeadLists] = useState<LeadList[]>([]);

  // Fetch lead lists on mount
  useEffect(() => {
    async function fetchLists() {
      try {
        const lists = await getLeadLists();
        setLeadLists(lists);
      } catch (err) {
        console.error("Failed to fetch lead lists:", err);
      }
    }
    fetchLists();
  }, []);

  const toggleOpen = () => setIsOpen((prev) => !prev);
  const toggleLocked = () => setIsLocked((prev) => !prev);

  const handleListSelect = (listId: string | null) => {
    onFiltersChange({
      ...filters,
      selectedListId: listId,
    });
  };

  const addFilter = (key: keyof Omit<Filters, 'selectedListId'>, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: [...(filters[key] as string[]), value],
    });
  };

  const removeFilter = (key: keyof Omit<Filters, 'selectedListId'>, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: (filters[key] as string[]).filter((v) => v !== value),
    });
  };

  const totalActiveFilters =
    filters.industries.length +
    filters.companySizes.length +
    filters.jobTitles.length;

  const clearAllFilters = () => {
    onFiltersChange({
      ...filters,
      industries: [],
      companySizes: [],
      jobTitles: [],
    });
  };

  const selectedList = filters.selectedListId 
    ? leadLists.find(l => l.id === filters.selectedListId) 
    : null;

  // Collapsed state
  if (!isOpen) {
    return (
      <div className="h-full border-r border-zinc-800 bg-black flex flex-col w-12 shrink-0">
        <div className="p-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleOpen}
            className="w-8 h-8 text-zinc-400 hover:text-white hover:bg-white/5"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full border-r border-zinc-800 bg-black flex flex-col w-[280px] shrink-0">
      {/* Row 0: HQ Header */}
      <div className={cn("px-4 flex items-center justify-between border-b border-zinc-800", BAND_HEIGHT.header)}>
        <Link href="/hq" className="flex items-center gap-3 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-black transition-transform group-hover:scale-105">
            <Terminal className="h-4 w-4" strokeWidth={2.5} />
          </div>
          <h1 className="text-sm font-bold tracking-tight">hq</h1>
        </Link>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleLocked}
            className={cn(
              "w-7 h-7 text-zinc-500 hover:text-white hover:bg-white/5",
              isLocked && "text-white bg-white/10"
            )}
            title={isLocked ? "Unlock sidebar" : "Lock sidebar open"}
          >
            {isLocked ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
          </Button>
          {!isLocked && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleOpen}
              className="w-7 h-7 text-zinc-500 hover:text-white hover:bg-white/5"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Row 1: Lead List Selector */}
      <div className={cn("px-4 flex items-center justify-between border-b border-zinc-800", BAND_HEIGHT.spacer)}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="h-8 px-2 gap-2 text-sm font-medium text-zinc-200 hover:bg-zinc-800 hover:text-white"
            >
              <List className="h-4 w-4 text-zinc-500" />
              <span className="truncate max-w-[160px]">
                {selectedList ? selectedList.name : "All Leads"}
              </span>
              <ChevronDown className="h-3.5 w-3.5 text-zinc-500" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56 bg-zinc-900 border-zinc-800">
            <DropdownMenuItem 
              onClick={() => handleListSelect(null)}
              className={cn(
                "text-sm cursor-pointer",
                !filters.selectedListId && "bg-zinc-800"
              )}
            >
              All Leads
            </DropdownMenuItem>
            {leadLists.map((list) => (
              <DropdownMenuItem
                key={list.id}
                onClick={() => handleListSelect(list.id)}
                className={cn(
                  "text-sm cursor-pointer",
                  filters.selectedListId === list.id && "bg-zinc-800"
                )}
              >
                <span className="truncate">{list.name}</span>
                <Badge variant="secondary" className="ml-auto text-[10px] bg-zinc-700 text-zinc-300">
                  {list.lead_count}
                </Badge>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Filter sections */}
      <div className="flex-1 overflow-y-auto">
        <ChipInputSection
          title="Industry"
          placeholder="e.g. SaaS, Fintech..."
          values={filters.industries}
          onAdd={(v) => addFilter("industries", v)}
          onRemove={(v) => removeFilter("industries", v)}
        />
        <ChipInputSection
          title="Company Size"
          placeholder="e.g. 11-50, 1000+..."
          values={filters.companySizes}
          onAdd={(v) => addFilter("companySizes", v)}
          onRemove={(v) => removeFilter("companySizes", v)}
        />
        <ChipInputSection
          title="Job Title"
          placeholder="e.g. CEO, VP Sales..."
          values={filters.jobTitles}
          onAdd={(v) => addFilter("jobTitles", v)}
          onRemove={(v) => removeFilter("jobTitles", v)}
        />
      </div>
    </div>
  );
}
