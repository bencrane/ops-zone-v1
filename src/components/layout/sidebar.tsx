"use client";

import { useState, useEffect, KeyboardEvent } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Terminal,
  Plus,
  ChevronLeft,
  ChevronRight,
  Lock,
  Unlock,
  X,
  List,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { LeadList } from "@/types";
import { getLeadLists } from "@/lib/data";

// ============================================================================
// DESIGN CONSTANTS - Match main content bands exactly
// ============================================================================
// Main content row 1 (People/Companies toggle): px-6 py-4 = h-[56px]
// Main content row 2 (Search bar): px-6 py-3 = h-[46px]
// We use explicit heights to ensure pixel-perfect alignment

const BAND_HEIGHT = {
  header: "h-[57px]",      // Admin header
  toggleRow: "h-[56px]",   // Matches People/Companies toggle row
  searchRow: "h-[46px]",   // Matches Search bar row - Lead List selector goes here
  tableHeader: "h-[41px]", // Matches table header row
};

// ============================================================================
// FILTER STATE
// ============================================================================
interface Filters {
  industries: string[];
  companySizes: string[];
  jobTitles: string[];
  tags: string[];
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
      {/* Filter row - height matches table row height for visual consistency */}
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

      {/* Expanded input */}
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

      {/* Show chips when collapsed */}
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
// SIDEBAR COMPONENT
// ============================================================================
export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  
  // Lead list state
  const [leadLists, setLeadLists] = useState<LeadList[]>([]);
  const [selectedListId, setSelectedListId] = useState<string>("all");

  // Filter state
  const [filters, setFilters] = useState<Filters>({
    industries: [],
    companySizes: [],
    jobTitles: [],
    tags: [],
  });

  const isAccessLeads = pathname === "/admin/access-leads";
  const isCampaigns = pathname === "/campaigns";

  // Fetch lead lists on mount
  useEffect(() => {
    async function fetchLists() {
      const lists = await getLeadLists();
      setLeadLists(lists);
    }
    fetchLists();
  }, []);

  const toggleOpen = () => setIsOpen((prev) => !prev);
  const toggleLocked = () => setIsLocked((prev) => !prev);

  const addFilter = (key: keyof Filters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: [...prev[key], value],
    }));
  };

  const removeFilter = (key: keyof Filters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: prev[key].filter((v) => v !== value),
    }));
  };

  const totalActiveFilters =
    filters.industries.length +
    filters.companySizes.length +
    filters.jobTitles.length +
    filters.tags.length;

  const clearAllFilters = () => {
    setFilters({
      industries: [],
      companySizes: [],
      jobTitles: [],
      tags: [],
    });
  };

  // Collapsed state
  if (!isOpen) {
    return (
      <div className="h-screen border-r border-zinc-800 bg-black flex flex-col w-12 shrink-0">
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
    <div className="h-screen border-r border-zinc-800 bg-black flex flex-col w-[280px] shrink-0">
      {/* ================================================================
          ROW 0: ADMIN HEADER
          Height matches border-b only (no corresponding main content)
          ================================================================ */}
      <div className={cn("px-4 flex items-center justify-between border-b border-zinc-800", BAND_HEIGHT.header)}>
        <Link href="/admin" className="flex items-center gap-3 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-black transition-transform group-hover:scale-105">
            <Terminal className="h-4 w-4" strokeWidth={2.5} />
          </div>
          <h1 className="text-sm font-bold tracking-tight">Admin</h1>
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

      {/* CONTEXTUAL CONTENT AREA */}
      <div className="flex-1 overflow-y-auto">
        {isAccessLeads && (
          <>
            {/* ================================================================
                ROW 1: SPACER - Aligns with People/Companies toggle row
                ================================================================ */}
            <div className={cn("border-b border-zinc-800", BAND_HEIGHT.toggleRow)} />

            {/* ================================================================
                ROW 2: LEAD LISTS SELECTOR - Aligns with Search bar row
                ================================================================ */}
            <div className={cn("px-4 flex items-center border-b border-zinc-800", BAND_HEIGHT.searchRow)}>
              <Select value={selectedListId} onValueChange={setSelectedListId}>
                <SelectTrigger className="w-full h-8 bg-zinc-900 border-zinc-700 text-white text-sm">
                  <div className="flex items-center gap-2">
                    <List className="h-4 w-4 text-zinc-400 shrink-0" />
                    <SelectValue placeholder="All Leads" />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-700">
                  <SelectItem value="all" className="text-white hover:bg-zinc-800">
                    All Leads
                  </SelectItem>
                  {leadLists.map((list) => (
                    <SelectItem key={list.id} value={list.id} className="text-white hover:bg-zinc-800">
                      {list.name} ({list.lead_count})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* ================================================================
                ROW 3: FILTERS LABEL - Aligns with table header row
                ================================================================ */}
            <div className={cn("px-4 flex items-center justify-between border-b border-zinc-800", BAND_HEIGHT.tableHeader)}>
              <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Filters</span>
              {totalActiveFilters > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="h-5 px-1.5 text-[10px] text-zinc-500 hover:text-white"
                >
                  Clear {totalActiveFilters}
                </Button>
              )}
            </div>

            {/* ================================================================
                FILTER SECTIONS - Align with table rows
                ================================================================ */}
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
            <ChipInputSection
              title="Tags"
              placeholder="e.g. decision-maker..."
              values={filters.tags}
              onAdd={(v) => addFilter("tags", v)}
              onRemove={(v) => removeFilter("tags", v)}
            />
          </>
        )}

        {isCampaigns && (
          <div className="p-4">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 h-10 px-3 font-medium text-zinc-400 hover:text-white hover:bg-white/5"
            >
              <Plus className="h-4 w-4" />
              New Campaign
            </Button>
          </div>
        )}

        {!isAccessLeads && !isCampaigns && (
          <div className="flex items-center justify-center h-32 text-zinc-600 text-sm">
            {/* Empty state */}
          </div>
        )}
      </div>
    </div>
  );
}
