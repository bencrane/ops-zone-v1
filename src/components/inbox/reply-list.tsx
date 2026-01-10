'use client';

import { Loader2, Inbox } from 'lucide-react';
import { ReplyListItem } from './reply-list-item';
import type { Reply } from '@/lib/emailbison/types';

interface ReplyListProps {
  replies: Reply[];
  loading: boolean;
  selectedReplyId: number | null;
  onReplySelect: (reply: Reply) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

export function ReplyList({
  replies,
  loading,
  selectedReplyId,
  onReplySelect,
  onLoadMore,
  hasMore,
}: ReplyListProps) {
  if (loading && replies.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
      </div>
    );
  }

  if (!loading && replies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-zinc-500">
        <Inbox className="h-12 w-12 mb-3 opacity-50" />
        <p className="text-sm">No replies found</p>
        <p className="text-xs text-zinc-600 mt-1">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        {replies.map((reply) => (
          <ReplyListItem
            key={reply.id}
            reply={reply}
            isSelected={selectedReplyId === reply.id}
            onClick={() => onReplySelect(reply)}
          />
        ))}

        {/* Load more button */}
        {hasMore && (
          <div className="p-4 text-center">
            <button
              onClick={onLoadMore}
              disabled={loading}
              className="text-sm text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading...
                </span>
              ) : (
                'Load more'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

