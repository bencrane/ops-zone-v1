'use client';

import { useEffect, useState, useCallback } from 'react';
import { FilterSidebar, type FolderFilter, type StatusFilter } from '@/components/inbox/filter-sidebar';
import { ReplyList } from '@/components/inbox/reply-list';
import { ReplyDetail } from '@/components/inbox/reply-detail';
import type { Reply, PaginatedResponse } from '@/lib/emailbison/types';

interface FilterState {
  folder: FolderFilter;
  status: StatusFilter;
  read: boolean | undefined;
  campaign_id: number | undefined;
  sender_email_id: number | undefined;
  search: string;
}

export default function InboxPage() {
  const [filters, setFilters] = useState<FilterState>({
    folder: 'inbox',
    status: undefined,
    read: undefined,
    campaign_id: undefined,
    sender_email_id: undefined,
    search: '',
  });

  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [selectedReply, setSelectedReply] = useState<Reply | null>(null);

  const fetchReplies = useCallback(async (pageNum: number = 1, append: boolean = false) => {
    if (pageNum === 1) {
      setLoading(true);
    }

    try {
      const params = new URLSearchParams();
      params.set('page', pageNum.toString());
      params.set('per_page', '25');
      if (filters.folder && filters.folder !== 'all') params.set('folder', filters.folder);
      if (filters.status) params.set('status', filters.status);
      if (filters.read !== undefined) params.set('read', filters.read.toString());
      if (filters.campaign_id) params.set('campaign_id', filters.campaign_id.toString());
      if (filters.sender_email_id) params.set('sender_email_id', filters.sender_email_id.toString());
      if (filters.search) params.set('search', filters.search);

      const res = await fetch(`/api/emailbison/replies?${params.toString()}`);
      const data: PaginatedResponse<Reply> = await res.json();

      if (append) {
        setReplies((prev) => [...prev, ...data.data]);
      } else {
        setReplies(data.data || []);
      }

      if (data.meta) {
        setHasMore(data.meta.current_page < data.meta.last_page);
      } else {
        setHasMore(false);
      }

      setPage(pageNum);
    } catch (error) {
      console.error('Failed to fetch replies:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    setSelectedReply(null);
    fetchReplies(1);
  }, [fetchReplies]);

  const handleLoadMore = () => {
    fetchReplies(page + 1, true);
  };

  const handleReplySelect = async (reply: Reply) => {
    setSelectedReply(reply);

    if (!reply.read) {
      try {
        await fetch(`/api/emailbison/replies/${reply.id}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'read' }),
        });

        setReplies((prev) =>
          prev.map((r) => (r.id === reply.id ? { ...r, read: true } : r))
        );
        setSelectedReply((prev) => (prev ? { ...prev, read: true } : null));
      } catch (error) {
        console.error('Failed to mark as read:', error);
      }
    }
  };

  const handleStatusUpdate = (updatedReply: Reply) => {
    setReplies((prev) =>
      prev.map((r) => (r.id === updatedReply.id ? updatedReply : r))
    );
    setSelectedReply(updatedReply);
  };

  const handleReplyDeleted = (deletedId: number) => {
    setReplies((prev) => prev.filter((r) => r.id !== deletedId));
    setSelectedReply(null);
  };

  return (
    <div className="h-[calc(100vh-56px)] flex overflow-hidden bg-black pt-6">
      {/* Filter sidebar */}
      <FilterSidebar filters={filters} onFilterChange={setFilters} />

      {/* Reply list */}
      <div className="w-96 flex-shrink-0 border-r border-zinc-800 overflow-hidden">
        <ReplyList
          replies={replies}
          loading={loading}
          selectedReplyId={selectedReply?.id ?? null}
          onReplySelect={handleReplySelect}
          onLoadMore={handleLoadMore}
          hasMore={hasMore}
        />
      </div>

      {/* Reply detail */}
      <div className="flex-1 overflow-hidden">
        {selectedReply ? (
          <ReplyDetail
            reply={selectedReply}
            onStatusUpdate={handleStatusUpdate}
            onDelete={handleReplyDeleted}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-zinc-600">
            <p>Select a message to view</p>
          </div>
        )}
      </div>
    </div>
  );
}
