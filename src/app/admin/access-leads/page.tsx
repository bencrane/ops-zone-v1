"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Search,
  X,
  Users,
  Building2,
  Download,
  Plus,
  ArrowLeft,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Lead,
  LeadList,
  Industry,
  CompanySize,
  INDUSTRY_LABELS,
} from "@/types";
import { getLeads, getLeadLists } from "@/lib/data";
import { cn } from "@/lib/utils";
import { AddToListDialog } from "@/components/leads/add-to-list-dialog";
import { FilterSidebar, Filters } from "@/components/leads/filter-sidebar";

// Company type derived from leads
interface Company {
  id: string;
  name: string;
  industry: Industry;
  company_size: CompanySize;
  employee_count: number;
  tags: string[];
}

function AccessLeadsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const mode = searchParams.get("mode") || "people";
  const listId = searchParams.get("list") || "all";
  
  // Filter state for sidebar
  const [filters, setFilters] = useState<Filters>({
    industries: [],
    companySizes: [],
    jobTitles: [],
    tags: [],
  });
  
  const [leads, setLeads] = useState<Lead[]>([]);
  const [leadLists, setLeadLists] = useState<LeadList[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [addToListDialogOpen, setAddToListDialogOpen] = useState(false);

  // Fetch data
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const [leadsData, listsData] = await Promise.all([
        getLeads(),
        getLeadLists(),
      ]);
      setLeads(leadsData);
      setLeadLists(listsData);
      setLoading(false);
    }
    fetchData();
  }, []);

  const handleListChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete("list");
    } else {
      params.set("list", value);
    }
    router.push(`/admin/access-leads?${params.toString()}`);
  };

  const selectedList = leadLists.find((l) => l.id === listId);

  // Clear selection when mode changes
  useEffect(() => {
    setSelectedIds([]);
  }, [mode]);

  // Derive companies from leads
  const companies = useMemo(() => {
    const companyMap = new Map<string, Company>();
    leads.forEach((lead) => {
      if (!companyMap.has(lead.company)) {
        companyMap.set(lead.company, {
          id: lead.company.toLowerCase().replace(/\s+/g, "-"),
          name: lead.company,
          industry: lead.industry,
          company_size: lead.company_size,
          employee_count: 1,
          tags: [...lead.tags],
        });
      } else {
        const existing = companyMap.get(lead.company)!;
        existing.employee_count++;
        lead.tags.forEach((tag) => {
          if (!existing.tags.includes(tag)) {
            existing.tags.push(tag);
          }
        });
      }
    });
    return Array.from(companyMap.values());
  }, [leads]);

  // Filter people using sidebar filters + local search
  const filteredPeople = useMemo(() => {
    let result = [...leads];

    // Local search
    if (searchValue) {
      const search = searchValue.toLowerCase();
      result = result.filter(
        (lead) =>
          lead.first_name.toLowerCase().includes(search) ||
          lead.last_name.toLowerCase().includes(search) ||
          lead.email.toLowerCase().includes(search) ||
          lead.company.toLowerCase().includes(search) ||
          lead.position.toLowerCase().includes(search)
      );
    }

    // Sidebar industry filters (fuzzy match on industry labels)
    if (filters.industries.length > 0) {
      result = result.filter((lead) => {
        const industryLabel = INDUSTRY_LABELS[lead.industry].toLowerCase();
        return filters.industries.some(
          (filter) => industryLabel.includes(filter.toLowerCase())
        );
      });
    }

    // Sidebar company size filters (fuzzy match)
    if (filters.companySizes.length > 0) {
      result = result.filter((lead) => {
        const sizeString = lead.company_size.toLowerCase();
        return filters.companySizes.some(
          (filter) => sizeString.includes(filter.toLowerCase())
        );
      });
    }

    // Sidebar job title filters (fuzzy match)
    if (filters.jobTitles.length > 0) {
      result = result.filter((lead) => {
        const position = lead.position.toLowerCase();
        return filters.jobTitles.some(
          (filter) => position.includes(filter.toLowerCase())
        );
      });
    }

    // Sidebar tag filters
    if (filters.tags.length > 0) {
      result = result.filter((lead) =>
        filters.tags.some((tag) =>
          lead.tags.some((leadTag) =>
            leadTag.toLowerCase().includes(tag.toLowerCase())
          )
        )
      );
    }

    return result;
  }, [leads, searchValue, filters]);

  // Filter companies using sidebar filters + local search
  const filteredCompanies = useMemo(() => {
    let result = [...companies];

    if (searchValue) {
      const search = searchValue.toLowerCase();
      result = result.filter((company) =>
        company.name.toLowerCase().includes(search)
      );
    }

    // Sidebar industry filters (fuzzy match)
    if (filters.industries.length > 0) {
      result = result.filter((company) => {
        const industryLabel = INDUSTRY_LABELS[company.industry].toLowerCase();
        return filters.industries.some(
          (filter) => industryLabel.includes(filter.toLowerCase())
        );
      });
    }

    // Sidebar company size filters (fuzzy match)
    if (filters.companySizes.length > 0) {
      result = result.filter((company) => {
        const sizeString = company.company_size.toLowerCase();
        return filters.companySizes.some(
          (filter) => sizeString.includes(filter.toLowerCase())
        );
      });
    }

    // Sidebar tag filters
    if (filters.tags.length > 0) {
      result = result.filter((company) =>
        filters.tags.some((tag) =>
          company.tags.some((companyTag) =>
            companyTag.toLowerCase().includes(tag.toLowerCase())
          )
        )
      );
    }

    return result;
  }, [companies, searchValue, filters]);

  // Selection handlers for people
  const allPeopleSelected = filteredPeople.length > 0 && selectedIds.length === filteredPeople.length;
  const somePeopleSelected = selectedIds.length > 0 && selectedIds.length < filteredPeople.length;

  // Selection handlers for companies
  const allCompaniesSelected = filteredCompanies.length > 0 && selectedIds.length === filteredCompanies.length;
  const someCompaniesSelected = selectedIds.length > 0 && selectedIds.length < filteredCompanies.length;

  const toggleAllPeople = () => {
    if (allPeopleSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredPeople.map((l) => l.id));
    }
  };

  const toggleAllCompanies = () => {
    if (allCompaniesSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredCompanies.map((c) => c.id));
    }
  };

  const toggleOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((i) => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const totalPeople = leads.length;
  const totalCompanies = companies.length;
  const isPeopleMode = mode === "people";

  const activeFilterCount =
    filters.industries.length +
    filters.companySizes.length +
    filters.jobTitles.length +
    filters.tags.length;

  return (
    <div className="h-screen flex bg-black overflow-hidden">
      {/* Filter Sidebar */}
      <FilterSidebar 
        filters={filters} 
        onFiltersChange={setFilters}
        leadLists={leadLists}
        selectedListId={listId}
        onListChange={handleListChange}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Row 0: People/Companies toggle + Search - aligns with sidebar Admin header (h-[64px]) */}
        <div className="h-[64px] px-6 flex items-center justify-between border-b border-zinc-800 bg-black shrink-0">
          <div className="flex items-center gap-4">
            {/* Mode toggle + Search */}
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-zinc-900 rounded-lg p-0.5">
                <Link href={`/admin/access-leads?mode=people${listId !== "all" ? `&list=${listId}` : ""}`}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "h-8 px-3 gap-2 rounded-md transition-all",
                      isPeopleMode
                        ? "bg-white text-black hover:bg-white hover:text-black"
                        : "text-zinc-400 hover:text-white hover:bg-transparent"
                    )}
                  >
                    <Users className="h-4 w-4" />
                    People
                  </Button>
                </Link>
                <Link href={`/admin/access-leads?mode=companies${listId !== "all" ? `&list=${listId}` : ""}`}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "h-8 px-3 gap-2 rounded-md transition-all",
                      !isPeopleMode
                        ? "bg-white text-black hover:bg-white hover:text-black"
                        : "text-zinc-400 hover:text-white hover:bg-transparent"
                    )}
                  >
                    <Building2 className="h-4 w-4" />
                    Companies
                  </Button>
                </Link>
              </div>
              
              {/* Search toggle/field */}
              {searchOpen ? (
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <Input
                      type="search"
                      placeholder={isPeopleMode ? "Search people..." : "Search companies..."}
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      className="pl-9 w-64 h-8 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500 text-sm"
                      autoFocus
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setSearchOpen(false);
                      setSearchValue("");
                    }}
                    className="h-8 w-8 text-zinc-400 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSearchOpen(true)}
                  className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-800"
                >
                  <Search className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            {selectedList && (
              <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs">
                {selectedList.lead_count} leads in list
              </Badge>
            )}
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="bg-white text-black text-xs">
                {activeFilterCount} filter{activeFilterCount !== 1 ? "s" : ""} active
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {selectedIds.length > 0 && (
              <Button 
                className="gap-2 bg-white text-black hover:bg-zinc-200 h-8 text-sm"
                onClick={() => setAddToListDialogOpen(true)}
              >
                <Plus className="h-3.5 w-3.5" />
                Add {selectedIds.length} to Lead List
              </Button>
            )}
            <Button variant="outline" className="gap-2 border-zinc-700 text-zinc-300 hover:bg-zinc-800 h-8 text-sm">
              <Download className="h-3.5 w-3.5" />
              Export
            </Button>
            <Link href="/admin">
              <Button variant="outline" className="gap-2 border-zinc-700 text-zinc-300 hover:bg-zinc-800 h-8 text-sm">
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to Admin
              </Button>
            </Link>
          </div>
        </div>

        {/* Row 1: Empty spacer - aligns with sidebar lead list dropdown (h-[64px]) */}
        <div className="h-[64px] px-6 flex items-center border-b border-zinc-800 shrink-0">
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-zinc-800 text-white text-xs">
                {selectedIds.length} selected
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedIds([])}
                className="h-6 px-2 text-xs text-zinc-400 hover:text-white"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>

        {/* Table - fills remaining space */}
        <div className="flex-1 overflow-auto px-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-zinc-400">Loading records...</div>
            </div>
          ) : isPeopleMode ? (
            /* People Table */
            <Table>
              <TableHeader className="sticky top-0 bg-zinc-900/95 backdrop-blur z-10">
                <TableRow className="h-[48px] hover:bg-transparent border-b border-zinc-800">
                  <TableHead className="w-[40px]">
                    <Checkbox
                      checked={allPeopleSelected ? true : somePeopleSelected ? "indeterminate" : false}
                      onCheckedChange={toggleAllPeople}
                    />
                  </TableHead>
                  <TableHead className="w-[40px]"></TableHead>
                  <TableHead className="text-zinc-400 text-xs font-medium">Contact</TableHead>
                  <TableHead className="text-zinc-400 text-xs font-medium">Company</TableHead>
                  <TableHead className="text-zinc-400 text-xs font-medium">Job Title</TableHead>
                  <TableHead className="text-zinc-400 text-xs font-medium">Industry</TableHead>
                  <TableHead className="text-zinc-400 text-xs font-medium">Size</TableHead>
                  <TableHead className="text-zinc-400 text-xs font-medium">Tags</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPeople.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center text-zinc-500">
                      No people match your filters
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPeople.map((lead) => (
                    <TableRow
                      key={lead.id}
                      className={cn(
                        "border-b border-zinc-800/50 hover:bg-zinc-900/50 transition-colors",
                        selectedIds.includes(lead.id) && "bg-zinc-900"
                      )}
                    >
                      <TableCell className="py-2">
                        <Checkbox
                          checked={selectedIds.includes(lead.id)}
                          onCheckedChange={() => toggleOne(lead.id)}
                        />
                      </TableCell>
                      <TableCell className="py-2">
                        <Avatar className="h-7 w-7">
                          <AvatarFallback className="bg-zinc-800 text-zinc-300 text-[10px]">
                            {lead.first_name[0]}
                            {lead.last_name[0]}
                          </AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell className="py-2">
                        <span className="font-medium text-white text-sm">
                          {lead.first_name} {lead.last_name}
                        </span>
                      </TableCell>
                      <TableCell className="py-2">
                        <span className="font-medium text-white text-sm">{lead.company}</span>
                      </TableCell>
                      <TableCell className="py-2">
                        <span className="text-sm text-zinc-300">{lead.position}</span>
                      </TableCell>
                      <TableCell className="py-2">
                        <span className="text-xs text-zinc-400">
                          {INDUSTRY_LABELS[lead.industry]}
                        </span>
                      </TableCell>
                      <TableCell className="py-2">
                        <span className="text-xs text-zinc-400">
                          {lead.company_size}
                        </span>
                      </TableCell>
                      <TableCell className="py-2">
                        <div className="flex items-center gap-1 flex-wrap">
                          {lead.tags.slice(0, 2).map((tag) => (
                            <Badge
                              key={tag}
                              variant="outline"
                              className="text-[10px] border-zinc-700 text-zinc-400 px-1.5 py-0"
                            >
                              {tag}
                            </Badge>
                          ))}
                          {lead.tags.length > 2 && (
                            <span className="text-[10px] text-zinc-500">
                              +{lead.tags.length - 2}
                            </span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          ) : (
            /* Companies Table */
            <Table>
              <TableHeader className="sticky top-0 bg-zinc-900/95 backdrop-blur z-10">
                <TableRow className="h-[48px] hover:bg-transparent border-b border-zinc-800">
                  <TableHead className="w-[40px]">
                    <Checkbox
                      checked={allCompaniesSelected ? true : someCompaniesSelected ? "indeterminate" : false}
                      onCheckedChange={toggleAllCompanies}
                    />
                  </TableHead>
                  <TableHead className="w-[40px]"></TableHead>
                  <TableHead className="text-zinc-400 text-xs font-medium">Company</TableHead>
                  <TableHead className="text-zinc-400 text-xs font-medium">Industry</TableHead>
                  <TableHead className="text-zinc-400 text-xs font-medium">Size</TableHead>
                  <TableHead className="text-zinc-400 text-xs font-medium">People in DB</TableHead>
                  <TableHead className="text-zinc-400 text-xs font-medium">Tags</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCompanies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-zinc-500">
                      No companies match your filters
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCompanies.map((company) => (
                    <TableRow
                      key={company.id}
                      className={cn(
                        "border-b border-zinc-800/50 hover:bg-zinc-900/50 transition-colors",
                        selectedIds.includes(company.id) && "bg-zinc-900"
                      )}
                    >
                      <TableCell className="py-2">
                        <Checkbox
                          checked={selectedIds.includes(company.id)}
                          onCheckedChange={() => toggleOne(company.id)}
                        />
                      </TableCell>
                      <TableCell className="py-2">
                        <div className="h-7 w-7 rounded-lg bg-zinc-800 flex items-center justify-center">
                          <Building2 className="h-3.5 w-3.5 text-zinc-400" />
                        </div>
                      </TableCell>
                      <TableCell className="py-2">
                        <span className="font-medium text-white text-sm">{company.name}</span>
                      </TableCell>
                      <TableCell className="py-2">
                        <span className="text-xs text-zinc-400">
                          {INDUSTRY_LABELS[company.industry]}
                        </span>
                      </TableCell>
                      <TableCell className="py-2">
                        <span className="text-xs text-zinc-400">
                          {company.company_size}
                        </span>
                      </TableCell>
                      <TableCell className="py-2">
                        <Badge variant="secondary" className="bg-zinc-800 text-zinc-300 text-[10px]">
                          {company.employee_count}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-2">
                        <div className="flex items-center gap-1 flex-wrap">
                          {company.tags.slice(0, 2).map((tag) => (
                            <Badge
                              key={tag}
                              variant="outline"
                              className="text-[10px] border-zinc-700 text-zinc-400 px-1.5 py-0"
                            >
                              {tag}
                            </Badge>
                          ))}
                          {company.tags.length > 2 && (
                            <span className="text-[10px] text-zinc-500">
                              +{company.tags.length - 2}
                            </span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {/* Add to List Dialog */}
      <AddToListDialog
        open={addToListDialogOpen}
        onOpenChange={setAddToListDialogOpen}
        selectedCount={selectedIds.length}
        selectedIds={selectedIds}
        onSuccess={() => setSelectedIds([])}
      />
    </div>
  );
}

export default function AccessLeadsPage() {
  return (
    <Suspense fallback={<div className="h-screen bg-black flex items-center justify-center text-zinc-400">Loading...</div>}>
      <AccessLeadsContent />
    </Suspense>
  );
}
