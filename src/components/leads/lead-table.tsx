"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  ExternalLink,
  Mail,
  UserMinus,
  Eye,
  ChevronRight,
} from "lucide-react";
import { Lead, STATUS_LABELS, INDUSTRY_LABELS } from "@/types";
import { cn } from "@/lib/utils";

interface LeadTableProps {
  leads: Lead[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onViewLead?: (lead: Lead) => void;
}

const STATUS_STYLES: Record<string, string> = {
  new: "border-white/30 text-white bg-white/5",
  enrolled: "border-blue-400/30 text-blue-400 bg-blue-400/5",
  contacted: "border-yellow-400/30 text-yellow-400 bg-yellow-400/5",
  opened: "border-purple-400/30 text-purple-400 bg-purple-400/5",
  replied: "border-emerald-400/30 text-emerald-400 bg-emerald-400/5",
  bounced: "border-red-400/30 text-red-400 bg-red-400/5",
  unsubscribed: "border-zinc-400/30 text-zinc-400 bg-zinc-400/5",
};

export function LeadTable({
  leads,
  selectedIds,
  onSelectionChange,
  onViewLead,
}: LeadTableProps) {
  const allSelected = leads.length > 0 && selectedIds.length === leads.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < leads.length;

  const toggleAll = () => {
    if (allSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(leads.map((l) => l.id));
    }
  };

  const toggleOne = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((i) => i !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-b border-border">
            <TableHead className="w-[40px]">
              <Checkbox
                checked={allSelected ? true : someSelected ? "indeterminate" : false}
                onCheckedChange={toggleAll}
              />
            </TableHead>
            <TableHead className="w-[40px]"></TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Industry</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Campaigns</TableHead>
            <TableHead>Tags</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                No leads found
              </TableCell>
            </TableRow>
          ) : (
            leads.map((lead, index) => (
              <TableRow
                key={lead.id}
                className={cn(
                  "data-row group",
                  selectedIds.includes(lead.id) && "bg-white/[0.02]"
                )}
                style={{ animationDelay: `${index * 20}ms` }}
              >
                <TableCell>
                  <Checkbox
                    checked={selectedIds.includes(lead.id)}
                    onCheckedChange={() => toggleOne(lead.id)}
                  />
                </TableCell>
                <TableCell>
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-white/10 text-xs">
                      {lead.first_name[0]}
                      {lead.last_name[0]}
                    </AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {lead.first_name} {lead.last_name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {lead.email}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{lead.company}</span>
                    <span className="text-xs text-muted-foreground">
                      {lead.position}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {INDUSTRY_LABELS[lead.industry]}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn("text-xs", STATUS_STYLES[lead.status])}
                  >
                    {STATUS_LABELS[lead.status]}
                  </Badge>
                </TableCell>
                <TableCell>
                  {lead.campaigns.length > 0 ? (
                    <div className="flex items-center gap-1">
                      <Badge variant="secondary" className="text-xs">
                        {lead.campaigns[0].campaign_name.length > 15
                          ? lead.campaigns[0].campaign_name.slice(0, 15) + "..."
                          : lead.campaigns[0].campaign_name}
                      </Badge>
                      {lead.campaigns.length > 1 && (
                        <span className="text-xs text-muted-foreground">
                          +{lead.campaigns.length - 1}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 flex-wrap max-w-[150px]">
                    {lead.tags.slice(0, 2).map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="text-xs border-white/10"
                      >
                        {tag}
                      </Badge>
                    ))}
                    {lead.tags.length > 2 && (
                      <span className="text-xs text-muted-foreground">
                        +{lead.tags.length - 2}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => onViewLead?.(lead)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Mail className="mr-2 h-4 w-4" />
                        Send Email
                      </DropdownMenuItem>
                      {lead.linkedin_url && (
                        <DropdownMenuItem asChild>
                          <a
                            href={lead.linkedin_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="mr-2 h-4 w-4" />
                            LinkedIn Profile
                          </a>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                        <UserMinus className="mr-2 h-4 w-4" />
                        Remove Lead
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

