"use client";

import { Sidebar } from "./sidebar";
import { SidebarProvider } from "./sidebar-context";
import { cn } from "@/lib/utils";

interface ShellProps {
  children: React.ReactNode;
  className?: string;
}

export function Shell({ children, className }: ShellProps) {
  return (
    <SidebarProvider>
      <ShellContent className={className}>{children}</ShellContent>
    </SidebarProvider>
  );
}

function ShellContent({ children, className }: ShellProps) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main
        className={cn(
          "flex-1 min-h-screen bg-black transition-all duration-300",
          className
        )}
      >
        {children}
      </main>
    </div>
  );
}
