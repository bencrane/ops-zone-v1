"use client";

import { Search, X, Filter, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import {
  LeadFilters as LeadFiltersType,
  LeadStatus,
  Industry,
  CompanySize,
  INDUSTRY_LABELS,
  COMPANY_SIZE_LABELS,
  STATUS_LABELS,
} from "@/types";
import { Campaign } from "@/types";

interface LeadFiltersProps {
  filters: LeadFiltersType;
  onFiltersChange: (filters: LeadFiltersType) => void;
  campaigns: Campaign[];
  allTags: string[];
}

export function LeadFilters({
  filters,
  onFiltersChange,
  campaigns,
  allTags,
}: LeadFiltersProps) {
  const activeFilterCount = [
    filters.status !== "all",
    filters.industry !== "all",
    filters.company_size !== "all",
    filters.campaign_id !== "all",
    filters.tags.length > 0,
  ].filter(Boolean).length;

  const updateFilter = <K extends keyof LeadFiltersType>(
    key: K,
    value: LeadFiltersType[K]
  ) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({
      search: "",
      status: "all",
      industry: "all",
      company_size: "all",
      campaign_id: "all",
      tags: [],
    });
  };

  const toggleTag = (tag: string) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter((t) => t !== tag)
      : [...filters.tags, tag];
    updateFilter("tags", newTags);
  };

  return (
    <div className="space-y-3">
      {/* Search and main filters row */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search leads..."
            value={filters.search}
            onChange={(e) => updateFilter("search", e.target.value)}
            className="pl-9 bg-transparent"
          />
        </div>

        {/* Status filter */}
        <Select
          value={filters.status}
          onValueChange={(value) => updateFilter("status", value as LeadStatus | "all")}
        >
          <SelectTrigger className="w-[140px] bg-transparent">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Industry filter */}
        <Select
          value={filters.industry}
          onValueChange={(value) => updateFilter("industry", value as Industry | "all")}
        >
          <SelectTrigger className="w-[140px] bg-transparent">
            <SelectValue placeholder="Industry" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Industries</SelectItem>
            {Object.entries(INDUSTRY_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Company size filter */}
        <Select
          value={filters.company_size}
          onValueChange={(value) =>
            updateFilter("company_size", value as CompanySize | "all")
          }
        >
          <SelectTrigger className="w-[160px] bg-transparent">
            <SelectValue placeholder="Company Size" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sizes</SelectItem>
            {Object.entries(COMPANY_SIZE_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Campaign filter */}
        <Select
          value={filters.campaign_id}
          onValueChange={(value) => updateFilter("campaign_id", value)}
        >
          <SelectTrigger className="w-[180px] bg-transparent">
            <SelectValue placeholder="Campaign" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Campaigns</SelectItem>
            <SelectItem value="none">Not Enrolled</SelectItem>
            {campaigns.map((campaign) => (
              <SelectItem key={campaign.id} value={campaign.id}>
                {campaign.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Tags popover */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2 bg-transparent">
              <Filter className="h-4 w-4" />
              Tags
              {filters.tags.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                  {filters.tags.length}
                </Badge>
              )}
              <ChevronDown className="h-3 w-3 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-3" align="end">
            <div className="space-y-3">
              <p className="text-sm font-medium">Filter by tags</p>
              <div className="grid grid-cols-2 gap-2">
                {allTags.map((tag) => (
                  <label
                    key={tag}
                    className="flex items-center gap-2 text-sm cursor-pointer"
                  >
                    <Checkbox
                      checked={filters.tags.includes(tag)}
                      onCheckedChange={() => toggleTag(tag)}
                    />
                    <span className="truncate">{tag}</span>
                  </label>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Clear filters */}
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="gap-1 text-muted-foreground hover:text-foreground"
          >
            <X className="h-3 w-3" />
            Clear ({activeFilterCount})
          </Button>
        )}
      </div>

      {/* Active tag badges */}
      {filters.tags.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground">Tags:</span>
          {filters.tags.map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className="cursor-pointer hover:bg-secondary"
              onClick={() => toggleTag(tag)}
            >
              {tag}
              <X className="ml-1 h-3 w-3" />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

