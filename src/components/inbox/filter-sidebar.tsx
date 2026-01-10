'use client';

import { useEffect, useState } from 'react';
import { Inbox, Send, AlertCircle, BellOff, Star, Bot, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

export type FolderFilter = 'inbox' | 'sent' | 'spam' | 'bounced' | 'all';
export type StatusFilter = 'interested' | 'automated_reply' | 'not_automated_reply' | undefined;

interface Campaign {
  id: number;
  name: string;
}

interface SenderEmail {
  id: number;
  email: string;
  name: string;
}

interface FilterState {
  folder: FolderFilter;
  status: StatusFilter;
  read: boolean | undefined;
  campaign_id: number | undefined;
  sender_email_id: number | undefined;
  search: string;
}

interface FilterSidebarProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
}

const folders: { value: FolderFilter; label: string; icon: React.ElementType }[] = [
  { value: 'inbox', label: 'Inbox', icon: Inbox },
  { value: 'sent', label: 'Sent', icon: Send },
  { value: 'spam', label: 'Spam', icon: AlertCircle },
  { value: 'bounced', label: 'Bounced', icon: BellOff },
  { value: 'all', label: 'All', icon: Inbox },
];

export function FilterSidebar({ filters, onFilterChange }: FilterSidebarProps) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [senderEmails, setSenderEmails] = useState<SenderEmail[]>([]);
  const [searchInput, setSearchInput] = useState(filters.search);

  // Fetch campaigns and sender emails for filter dropdowns
  useEffect(() => {
    async function fetchCampaigns() {
      try {
        const res = await fetch('/api/emailbison/campaigns');
        const data = await res.json();
        setCampaigns(data.data || []);
      } catch (err) {
        console.error('Failed to fetch campaigns:', err);
      }
    }

    async function fetchSenderEmails() {
      try {
        const res = await fetch('/api/emailbison/email-accounts');
        const data = await res.json();
        setSenderEmails(data.data || []);
      } catch (err) {
        console.error('Failed to fetch sender emails:', err);
      }
    }

    fetchCampaigns();
    fetchSenderEmails();
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== filters.search) {
        onFilterChange({ ...filters, search: searchInput });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput, filters, onFilterChange]);

  const setFolder = (folder: FolderFilter) => {
    onFilterChange({ ...filters, folder });
  };

  const setStatus = (status: StatusFilter) => {
    onFilterChange({ ...filters, status });
  };

  const setReadFilter = (read: boolean | undefined) => {
    onFilterChange({ ...filters, read });
  };

  const setCampaignId = (id: number | undefined) => {
    onFilterChange({ ...filters, campaign_id: id });
  };

  const setSenderEmailId = (id: number | undefined) => {
    onFilterChange({ ...filters, sender_email_id: id });
  };

  const clearFilters = () => {
    setSearchInput('');
    onFilterChange({
      folder: 'inbox',
      status: undefined,
      read: undefined,
      campaign_id: undefined,
      sender_email_id: undefined,
      search: '',
    });
  };

  const hasActiveFilters =
    filters.status !== undefined ||
    filters.read !== undefined ||
    filters.campaign_id !== undefined ||
    filters.sender_email_id !== undefined ||
    filters.search !== '';

  return (
    <div className="w-64 flex-shrink-0 border-r border-zinc-800 bg-zinc-950 p-4 space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
        <Input
          placeholder="Search..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="pl-9 bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500"
        />
      </div>

      {/* Folders */}
      <div className="space-y-1">
        <Label className="text-xs uppercase tracking-wider text-zinc-500 mb-2 block">Folder</Label>
        {folders.map((folder) => {
          const Icon = folder.icon;
          return (
            <button
              key={folder.value}
              onClick={() => setFolder(folder.value)}
              className={cn(
                'w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors',
                filters.folder === folder.value
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
              )}
            >
              <Icon className="h-4 w-4" />
              {folder.label}
            </button>
          );
        })}
      </div>

      {/* Status */}
      <div className="space-y-1">
        <Label className="text-xs uppercase tracking-wider text-zinc-500 mb-2 block">Status</Label>
        <button
          onClick={() => setStatus(filters.status === 'interested' ? undefined : 'interested')}
          className={cn(
            'w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors',
            filters.status === 'interested'
              ? 'bg-amber-500/20 text-amber-400'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
          )}
        >
          <Star className="h-4 w-4" />
          Interested
        </button>
        <button
          onClick={() => setStatus(filters.status === 'automated_reply' ? undefined : 'automated_reply')}
          className={cn(
            'w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors',
            filters.status === 'automated_reply'
              ? 'bg-blue-500/20 text-blue-400'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
          )}
        >
          <Bot className="h-4 w-4" />
          Automated
        </button>
      </div>

      {/* Read/Unread */}
      <div className="space-y-1">
        <Label className="text-xs uppercase tracking-wider text-zinc-500 mb-2 block">Read State</Label>
        <div className="flex gap-2">
          <button
            onClick={() => setReadFilter(filters.read === false ? undefined : false)}
            className={cn(
              'flex-1 px-3 py-2 rounded-md text-sm transition-colors',
              filters.read === false
                ? 'bg-zinc-700 text-white'
                : 'text-zinc-400 border border-zinc-700 hover:border-zinc-600'
            )}
          >
            Unread
          </button>
          <button
            onClick={() => setReadFilter(filters.read === true ? undefined : true)}
            className={cn(
              'flex-1 px-3 py-2 rounded-md text-sm transition-colors',
              filters.read === true
                ? 'bg-zinc-700 text-white'
                : 'text-zinc-400 border border-zinc-700 hover:border-zinc-600'
            )}
          >
            Read
          </button>
        </div>
      </div>

      {/* Campaign Filter */}
      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-wider text-zinc-500">Campaign</Label>
        <Select
          value={filters.campaign_id?.toString() || 'all'}
          onValueChange={(value) => setCampaignId(value === 'all' ? undefined : parseInt(value, 10))}
        >
          <SelectTrigger className="bg-zinc-900 border-zinc-700 text-white">
            <SelectValue placeholder="All campaigns" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-zinc-700">
            <SelectItem value="all" className="text-zinc-300">All campaigns</SelectItem>
            {campaigns.map((campaign) => (
              <SelectItem key={campaign.id} value={campaign.id.toString()} className="text-zinc-300">
                {campaign.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Sender Email Filter */}
      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-wider text-zinc-500">Sender Account</Label>
        <Select
          value={filters.sender_email_id?.toString() || 'all'}
          onValueChange={(value) => setSenderEmailId(value === 'all' ? undefined : parseInt(value, 10))}
        >
          <SelectTrigger className="bg-zinc-900 border-zinc-700 text-white">
            <SelectValue placeholder="All accounts" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-zinc-700">
            <SelectItem value="all" className="text-zinc-300">All accounts</SelectItem>
            {senderEmails.map((sender) => (
              <SelectItem key={sender.id} value={sender.id.toString()} className="text-zinc-300">
                {sender.email}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="w-full text-zinc-400 hover:text-white"
        >
          <X className="h-4 w-4 mr-2" />
          Clear filters
        </Button>
      )}
    </div>
  );
}

