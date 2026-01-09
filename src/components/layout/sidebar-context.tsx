"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { Industry, CompanySize } from "@/types";

interface FilterState {
  search: string;
  industry: Industry | "all";
  company_size: CompanySize | "all";
  tags: string[];
}

interface SidebarContextType {
  isOpen: boolean;
  isLocked: boolean;
  setIsOpen: (open: boolean) => void;
  setIsLocked: (locked: boolean) => void;
  toggleOpen: () => void;
  toggleLocked: () => void;
  // Filter state for Access Leads
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  updateFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
}

const SidebarContext = createContext<SidebarContextType | null>(null);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    industry: "all",
    company_size: "all",
    tags: [],
  });

  const toggleOpen = () => setIsOpen((prev) => !prev);
  const toggleLocked = () => setIsLocked((prev) => !prev);

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <SidebarContext.Provider
      value={{
        isOpen,
        isLocked,
        setIsOpen,
        setIsLocked,
        toggleOpen,
        toggleLocked,
        filters,
        setFilters,
        updateFilter,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}

