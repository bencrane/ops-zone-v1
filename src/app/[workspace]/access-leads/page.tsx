"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Users,
  Building2,
  Download,
  ArrowLeft,
  Loader2,
  ListPlus,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { FilterSidebar, Filters } from "@/components/leads/filter-sidebar";
import { AddToListDialog } from "@/components/leads/add-to-list-dialog";
import { useWorkspaceNav } from "@/hooks/use-workspace-nav";
import type { Person, Company, PaginatedResponse } from "@/lib/hq-data";

// =============================================================================
// TYPES
// =============================================================================

interface FetchState<T> {
  data: T[];
  total: number;
  loading: boolean;
  error: string | null;
}

// =============================================================================
// API FETCH FUNCTIONS
// =============================================================================

async function fetchPeople(params: Record<string, string>): Promise<PaginatedResponse<Person>> {
  const searchParams = new URLSearchParams(params);
  const response = await fetch(`/api/hq/people?${searchParams.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch people');
  }
  return response.json();
}

async function fetchCompanies(params: Record<string, string>): Promise<PaginatedResponse<Company>> {
  const searchParams = new URLSearchParams(params);
  const response = await fetch(`/api/hq/companies?${searchParams.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch companies');
  }
  return response.json();
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

function AccessLeadsContent() {
  const searchParams = useSearchParams();
  const { workspace, href } = useWorkspaceNav();
  const mode = searchParams.get("mode") || "people";
  
  // Filter state for sidebar
  const [filters, setFilters] = useState<Filters>({
    selectedListId: null,
    industries: [],
    companySizes: [],
    jobTitles: [],
  });
  
  // Data state
  const [people, setPeople] = useState<FetchState<Person>>({
    data: [],
    total: 0,
    loading: true,
    error: null,
  });
  
  const [companies, setCompanies] = useState<FetchState<Company>>({
    data: [],
    total: 0,
    loading: true,
    error: null,
  });
  
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [addToListOpen, setAddToListOpen] = useState(false);

  // Build query params from filters
  const buildPeopleParams = useCallback(() => {
    const params: Record<string, string> = { limit: "100" };
    
    // Use first filter value for API (API doesn't support multiple values per field)
    if (filters.industries.length > 0) {
      params.industry = filters.industries[0];
    }
    if (filters.companySizes.length > 0) {
      params.size_range = filters.companySizes[0];
    }
    if (filters.jobTitles.length > 0) {
      params.job_title = filters.jobTitles[0];
    }
    
    return params;
  }, [filters]);

  const buildCompaniesParams = useCallback(() => {
    const params: Record<string, string> = { limit: "100" };
    
    if (filters.industries.length > 0) {
      params.industry = filters.industries[0];
    }
    if (filters.companySizes.length > 0) {
      params.size_range = filters.companySizes[0];
    }
    
    return params;
  }, [filters]);

  // Fetch people data
  useEffect(() => {
    if (mode !== "people") return;
    
    let cancelled = false;
    
    async function loadPeople() {
      setPeople(prev => ({ ...prev, loading: true, error: null }));
      
      try {
        const params = buildPeopleParams();
        const result = await fetchPeople(params);
        
        if (!cancelled) {
          setPeople({
            data: result.data,
            total: result.pagination.total,
            loading: false,
            error: null,
          });
        }
      } catch (err) {
        if (!cancelled) {
          setPeople(prev => ({
            ...prev,
            loading: false,
            error: err instanceof Error ? err.message : 'Failed to fetch people',
          }));
        }
      }
    }
    
    loadPeople();
    
    return () => {
      cancelled = true;
    };
  }, [mode, buildPeopleParams]);

  // Fetch companies data
  useEffect(() => {
    if (mode !== "companies") return;
    
    let cancelled = false;
    
    async function loadCompanies() {
      setCompanies(prev => ({ ...prev, loading: true, error: null }));
      
      try {
        const params = buildCompaniesParams();
        const result = await fetchCompanies(params);
        
        if (!cancelled) {
          setCompanies({
            data: result.data,
            total: result.pagination.total,
            loading: false,
            error: null,
          });
        }
      } catch (err) {
        if (!cancelled) {
          setCompanies(prev => ({
            ...prev,
            loading: false,
            error: err instanceof Error ? err.message : 'Failed to fetch companies',
          }));
        }
      }
    }
    
    loadCompanies();
    
    return () => {
      cancelled = true;
    };
  }, [mode, buildCompaniesParams]);

  // Clear selection when mode changes
  useEffect(() => {
    setSelectedIds([]);
  }, [mode]);

  // Selection handlers
  const isPeopleMode = mode === "people";
  const currentData = isPeopleMode ? people : companies;
  const items = isPeopleMode ? people.data : companies.data;
  
  const allSelected = items.length > 0 && selectedIds.length === items.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < items.length;

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(items.map((item) => item.id));
    }
  };

  const toggleOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((i) => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const activeFilterCount =
    filters.industries.length +
    filters.companySizes.length +
    filters.jobTitles.length;

  return (
    <div className="h-screen flex bg-black overflow-hidden">
      {/* Filter Sidebar */}
      <FilterSidebar 
        filters={filters} 
        onFiltersChange={setFilters}
        workspaceId={workspace}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Row 0: People/Companies toggle + Actions */}
        <div className="h-[64px] px-6 flex items-center justify-between border-b border-zinc-800 bg-black shrink-0">
          <div className="flex items-center gap-4">
            {/* Mode toggle */}
            <div className="flex items-center bg-zinc-900 rounded-lg p-0.5">
              <Link href={`${href('/access-leads')}?mode=people`}>
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
              <Link href={`${href('/access-leads')}?mode=companies`}>
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
            
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="bg-white text-black text-xs">
                {activeFilterCount} filter{activeFilterCount !== 1 ? "s" : ""} active
              </Badge>
            )}
            {selectedIds.length > 0 && (
              <Badge variant="secondary" className="bg-zinc-800 text-white text-xs">
                {selectedIds.length} selected
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {selectedIds.length > 0 && (
              <Button 
                onClick={() => setAddToListOpen(true)}
                className="gap-2 bg-white text-black hover:bg-zinc-200 h-8 text-sm"
              >
                <ListPlus className="h-3.5 w-3.5" />
                Add to List
              </Button>
            )}
            <Button variant="outline" className="gap-2 border-zinc-700 text-zinc-300 hover:bg-zinc-800 h-8 text-sm">
              <Download className="h-3.5 w-3.5" />
              Export
            </Button>
            <Link href={href('/')}>
              <Button variant="outline" className="gap-2 border-zinc-700 text-zinc-300 hover:bg-zinc-800 h-8 text-sm">
                <ArrowLeft className="h-3.5 w-3.5" />
                Back
              </Button>
            </Link>
          </div>
        </div>

        {/* Row 1: Table Header (aligned with sidebar "All Leads" row) */}
        <div className="h-[64px] px-6 flex items-center border-b border-zinc-800 bg-black shrink-0">
          <Table className="w-full">
            <TableHeader>
              <TableRow className="h-[64px] hover:bg-transparent border-0">
                <TableHead className="w-[40px] border-0">
                  <Checkbox
                    checked={allSelected ? true : someSelected ? "indeterminate" : false}
                    onCheckedChange={toggleAll}
                  />
                </TableHead>
                <TableHead className="w-[40px] border-0"></TableHead>
                {isPeopleMode ? (
                  <>
                    <TableHead className="text-zinc-400 text-xs font-medium border-0">Contact</TableHead>
                    <TableHead className="text-zinc-400 text-xs font-medium border-0">Company</TableHead>
                    <TableHead className="text-zinc-400 text-xs font-medium border-0">Job Title</TableHead>
                    <TableHead className="text-zinc-400 text-xs font-medium border-0">Industry</TableHead>
                    <TableHead className="text-zinc-400 text-xs font-medium border-0">Size</TableHead>
                  </>
                ) : (
                  <>
                    <TableHead className="text-zinc-400 text-xs font-medium border-0">Company</TableHead>
                    <TableHead className="text-zinc-400 text-xs font-medium border-0">Industry</TableHead>
                    <TableHead className="text-zinc-400 text-xs font-medium border-0">Size</TableHead>
                    <TableHead className="text-zinc-400 text-xs font-medium border-0">Employees</TableHead>
                    <TableHead className="text-zinc-400 text-xs font-medium border-0">Country</TableHead>
                  </>
                )}
                <TableHead className="text-right text-zinc-500 text-xs font-normal border-0 w-[100px]">
                  <div className="flex items-center justify-end gap-2">
                    {currentData.loading && (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    )}
                    {currentData.total.toLocaleString()}
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
          </Table>
        </div>

        {/* Table Body */}
        <div className="flex-1 overflow-auto px-6">
          {currentData.error ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="text-red-400 mb-2">Error loading data</div>
                <div className="text-zinc-500 text-sm">{currentData.error}</div>
              </div>
            </div>
          ) : currentData.loading && items.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex items-center gap-2 text-zinc-400">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Loading records...</span>
              </div>
            </div>
          ) : isPeopleMode ? (
            /* People Table */
            <Table>
              <TableBody>
                {people.data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center text-zinc-500">
                      No people match your filters
                    </TableCell>
                  </TableRow>
                ) : (
                  people.data.map((person) => (
                    <TableRow
                      key={person.id}
                      className={cn(
                        "border-b border-zinc-800/50 hover:bg-zinc-900/50 transition-colors",
                        selectedIds.includes(person.id) && "bg-zinc-900"
                      )}
                    >
                      <TableCell className="py-2">
                        <Checkbox
                          checked={selectedIds.includes(person.id)}
                          onCheckedChange={() => toggleOne(person.id)}
                        />
                      </TableCell>
                      <TableCell className="py-2">
                        <Avatar className="h-7 w-7">
                          {person.picture_url && (
                            <AvatarImage src={person.picture_url} alt={person.full_name || ''} />
                          )}
                          <AvatarFallback className="bg-zinc-800 text-zinc-300 text-[10px]">
                            {person.initials || '??'}
                          </AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell className="py-2">
                        <span className="font-medium text-white text-sm">
                          {person.full_name || `${person.first_name || ''} ${person.last_name || ''}`.trim() || '—'}
                        </span>
                      </TableCell>
                      <TableCell className="py-2">
                        <span className="font-medium text-white text-sm">
                          {person.company_name || '—'}
                        </span>
                      </TableCell>
                      <TableCell className="py-2">
                        <span className="text-sm text-zinc-300">
                          {person.job_title || '—'}
                        </span>
                      </TableCell>
                      <TableCell className="py-2">
                        <span className="text-xs text-zinc-400">
                          {person.industry || '—'}
                        </span>
                      </TableCell>
                      <TableCell className="py-2">
                        <span className="text-xs text-zinc-400">
                          {person.size_range || '—'}
                        </span>
                      </TableCell>
                      <TableCell className="w-[100px]"></TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          ) : (
            /* Companies Table */
            <Table>
              <TableBody>
                {companies.data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center text-zinc-500">
                      No companies match your filters
                    </TableCell>
                  </TableRow>
                ) : (
                  companies.data.map((company) => (
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
                        {company.logo_url ? (
                          <Avatar className="h-7 w-7 rounded-lg">
                            <AvatarImage src={company.logo_url} alt={company.name || ''} />
                            <AvatarFallback className="bg-zinc-800 rounded-lg">
                              <Building2 className="h-3.5 w-3.5 text-zinc-400" />
                            </AvatarFallback>
                          </Avatar>
                        ) : (
                          <div className="h-7 w-7 rounded-lg bg-zinc-800 flex items-center justify-center">
                            <Building2 className="h-3.5 w-3.5 text-zinc-400" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="py-2">
                        <span className="font-medium text-white text-sm">
                          {company.name || '—'}
                        </span>
                      </TableCell>
                      <TableCell className="py-2">
                        <span className="text-xs text-zinc-400">
                          {company.industry || '—'}
                        </span>
                      </TableCell>
                      <TableCell className="py-2">
                        <span className="text-xs text-zinc-400">
                          {company.size_range || '—'}
                        </span>
                      </TableCell>
                      <TableCell className="py-2">
                        {company.employee_count ? (
                          <Badge variant="secondary" className="bg-zinc-800 text-zinc-300 text-[10px]">
                            {company.employee_count.toLocaleString()}
                          </Badge>
                        ) : (
                          <span className="text-xs text-zinc-500">—</span>
                        )}
                      </TableCell>
                      <TableCell className="py-2">
                        <span className="text-xs text-zinc-400">
                          {company.country || '—'}
                        </span>
                      </TableCell>
                      <TableCell className="w-[100px]"></TableCell>
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
        open={addToListOpen}
        onOpenChange={setAddToListOpen}
        selectedCount={selectedIds.length}
        selectedIds={selectedIds}
        workspaceId={workspace}
        onSuccess={() => setSelectedIds([])}
      />
    </div>
  );
}

export default function AccessLeadsPage() {
  return (
    <Suspense fallback={
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="flex items-center gap-2 text-zinc-400">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    }>
      <AccessLeadsContent />
    </Suspense>
  );
}
