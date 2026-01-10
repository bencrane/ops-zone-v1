'use client';

import { Star, Bot, Paperclip, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import type { Reply } from '@/lib/emailbison/types';

interface ReplyListItemProps {
  reply: Reply;
  isSelected: boolean;
  onClick: () => void;
}

export function ReplyListItem({ reply, isSelected, onClick }: ReplyListItemProps) {
  const dateReceived = new Date(reply.date_received);
  const timeAgo = formatDistanceToNow(dateReceived, { addSuffix: true });

  // Extract preview from text_body
  const preview = reply.text_body
    ?.replace(/\s+/g, ' ')
    .trim()
    .slice(0, 100) || '(No preview available)';

  const isUntracked = reply.type === 'Untracked Reply';

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left p-4 border-b border-zinc-800 transition-colors',
        isSelected
          ? 'bg-zinc-800'
          : 'hover:bg-zinc-800/50',
        !reply.read && 'bg-zinc-900/50'
      )}
    >
      <div className="flex items-start gap-3">
        {/* Unread indicator */}
        <div className="flex-shrink-0 pt-1.5">
          {!reply.read && (
            <div className="h-2 w-2 rounded-full bg-blue-500" />
          )}
          {reply.read && <div className="h-2 w-2" />}
        </div>

        <div className="flex-1 min-w-0">
          {/* Top row: From name + indicators + time */}
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className={cn(
                  'text-sm truncate',
                  !reply.read ? 'font-semibold text-white' : 'text-zinc-300'
                )}
              >
                {reply.from_name || reply.from_email_address}
              </span>

              {/* Status indicators */}
              <div className="flex items-center gap-1 flex-shrink-0">
                {reply.interested && (
                  <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                )}
                {reply.automated_reply && (
                  <Bot className="h-3.5 w-3.5 text-blue-400" />
                )}
                {reply.attachments.length > 0 && (
                  <Paperclip className="h-3.5 w-3.5 text-zinc-500" />
                )}
                {isUntracked && (
                  <AlertTriangle className="h-3.5 w-3.5 text-orange-400" title="Untracked reply" />
                )}
              </div>
            </div>

            <span className="text-xs text-zinc-500 flex-shrink-0">{timeAgo}</span>
          </div>

          {/* Subject */}
          <p
            className={cn(
              'text-sm truncate mb-1',
              !reply.read ? 'text-zinc-200' : 'text-zinc-400'
            )}
          >
            {reply.subject || '(No subject)'}
          </p>

          {/* Preview */}
          <p className="text-xs text-zinc-500 truncate">{preview}</p>
        </div>
      </div>
    </button>
  );
}

