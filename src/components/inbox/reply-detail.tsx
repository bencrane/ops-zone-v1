'use client';

import { useEffect, useState } from 'react';
import {
  Star,
  Bot,
  Trash2,
  ChevronDown,
  ChevronUp,
  Reply as ReplyIcon,
  Forward,
  MoreHorizontal,
  Loader2,
  Paperclip,
  Download,
  Mail,
  UserX,
  AlertTriangle,
} from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ReplyComposer } from './reply-composer';
import type { Reply } from '@/lib/emailbison/types';
import { cn } from '@/lib/utils';

interface ReplyDetailProps {
  reply: Reply;
  onStatusUpdate: (reply: Reply) => void;
  onDelete: (replyId: number) => void;
}

export function ReplyDetail({ reply, onStatusUpdate, onDelete }: ReplyDetailProps) {
  const [thread, setThread] = useState<Reply[]>([]);
  const [loadingThread, setLoadingThread] = useState(false);
  const [showThread, setShowThread] = useState(false);
  const [showComposer, setShowComposer] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Fetch conversation thread when reply changes
  useEffect(() => {
    async function fetchThread() {
      setLoadingThread(true);
      try {
        const res = await fetch(`/api/emailbison/replies/${reply.id}/conversation`);
        const data = await res.json();
        if (data.data?.messages) {
          // Filter out the current reply from the thread
          setThread(data.data.messages.filter((m: Reply) => m.id !== reply.id));
        }
      } catch (error) {
        console.error('Failed to fetch thread:', error);
      } finally {
        setLoadingThread(false);
      }
    }

    fetchThread();
    setShowComposer(false);
  }, [reply.id]);

  const handleStatusAction = async (action: string) => {
    setActionLoading(action);
    try {
      const res = await fetch(`/api/emailbison/replies/${reply.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (data.data) {
        onStatusUpdate(data.data);
      }
    } catch (error) {
      console.error(`Failed to ${action}:`, error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this reply?')) return;

    setActionLoading('delete');
    try {
      await fetch(`/api/emailbison/replies/${reply.id}`, {
        method: 'DELETE',
      });
      onDelete(reply.id);
    } catch (error) {
      console.error('Failed to delete:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnsubscribe = async () => {
    if (!confirm('Are you sure you want to unsubscribe this contact from future emails?')) return;

    setActionLoading('unsubscribe');
    try {
      await fetch(`/api/emailbison/replies/${reply.id}/unsubscribe`, {
        method: 'PATCH',
      });
      // Optionally refresh or show success
    } catch (error) {
      console.error('Failed to unsubscribe:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReplySent = () => {
    setShowComposer(false);
    // Refresh the thread
    // Could also just append the new reply to the thread
  };

  const dateReceived = new Date(reply.date_received);
  const isUntracked = reply.type === 'Untracked Reply';

  return (
    <div className="h-full flex flex-col bg-zinc-950">
      {/* Header with actions */}
      <div className="flex-shrink-0 border-b border-zinc-800 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Interest toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleStatusAction(reply.interested ? 'not_interested' : 'interested')}
              disabled={actionLoading === 'interested' || actionLoading === 'not_interested'}
              className={cn(
                reply.interested
                  ? 'text-amber-400 hover:text-amber-300'
                  : 'text-zinc-500 hover:text-amber-400'
              )}
            >
              <Star
                className={cn('h-4 w-4', reply.interested && 'fill-current')}
              />
            </Button>

            {/* Automated toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleStatusAction(reply.automated_reply ? 'not_automated' : 'automated')}
              disabled={actionLoading === 'automated' || actionLoading === 'not_automated'}
              className={cn(
                reply.automated_reply
                  ? 'text-blue-400 hover:text-blue-300'
                  : 'text-zinc-500 hover:text-blue-400'
              )}
              title={reply.automated_reply ? 'Marked as automated' : 'Mark as automated'}
            >
              <Bot className="h-4 w-4" />
            </Button>

            {/* Read/unread toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleStatusAction(reply.read ? 'unread' : 'read')}
              disabled={actionLoading === 'read' || actionLoading === 'unread'}
              className="text-zinc-500"
              title={reply.read ? 'Mark as unread' : 'Mark as read'}
            >
              <Mail className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {/* Reply button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowComposer(true)}
              className="text-zinc-300"
            >
              <ReplyIcon className="h-4 w-4 mr-2" />
              Reply
            </Button>

            {/* More actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-zinc-500">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-700">
                <DropdownMenuItem className="text-zinc-300 focus:bg-zinc-800">
                  <Forward className="h-4 w-4 mr-2" />
                  Forward
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-zinc-700" />
                <DropdownMenuItem
                  className="text-zinc-300 focus:bg-zinc-800"
                  onClick={handleUnsubscribe}
                >
                  <UserX className="h-4 w-4 mr-2" />
                  Unsubscribe contact
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-zinc-700" />
                <DropdownMenuItem
                  className="text-red-400 focus:bg-zinc-800 focus:text-red-400"
                  onClick={handleDelete}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Email content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Untracked warning */}
        {isUntracked && (
          <div className="mb-4 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center gap-2 text-orange-400 text-sm">
            <AlertTriangle className="h-4 w-4" />
            <span>This is an untracked reply - not linked to a campaign</span>
          </div>
        )}

        {/* Subject */}
        <h2 className="text-xl font-semibold text-white mb-4">{reply.subject || '(No subject)'}</h2>

        {/* From/To/Date */}
        <div className="mb-6 text-sm">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-zinc-500 w-12">From</span>
            <span className="text-white">
              {reply.from_name && <span className="font-medium">{reply.from_name} </span>}
              <span className="text-zinc-400">&lt;{reply.from_email_address}&gt;</span>
            </span>
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-zinc-500 w-12">To</span>
            <span className="text-zinc-300">{reply.primary_to_email_address}</span>
          </div>
          {reply.cc && reply.cc.length > 0 && (
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-zinc-500 w-12">CC</span>
              <span className="text-zinc-400">
                {reply.cc.map((c) => c.address).join(', ')}
              </span>
            </div>
          )}
          <div className="flex items-baseline gap-2">
            <span className="text-zinc-500 w-12">Date</span>
            <span className="text-zinc-400">
              {format(dateReceived, 'PPpp')}
            </span>
          </div>
        </div>

        {/* Attachments */}
        {reply.attachments.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 text-sm text-zinc-400 mb-2">
              <Paperclip className="h-4 w-4" />
              <span>{reply.attachments.length} attachment{reply.attachments.length > 1 ? 's' : ''}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {reply.attachments.map((attachment) => (
                <a
                  key={attachment.id}
                  href={attachment.download_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 bg-zinc-800 rounded-lg text-sm text-zinc-300 hover:bg-zinc-700 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  {attachment.file_name}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Email body */}
        <div className="prose prose-invert prose-sm max-w-none">
          {reply.html_body ? (
            <div
              className="bg-zinc-900 rounded-lg p-4"
              dangerouslySetInnerHTML={{ __html: reply.html_body }}
            />
          ) : (
            <pre className="whitespace-pre-wrap font-sans text-zinc-300 bg-zinc-900 rounded-lg p-4">
              {reply.text_body}
            </pre>
          )}
        </div>

        {/* Conversation thread */}
        {thread.length > 0 && (
          <div className="mt-8 border-t border-zinc-800 pt-6">
            <button
              onClick={() => setShowThread(!showThread)}
              className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
            >
              {showThread ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
              {thread.length} previous message{thread.length > 1 ? 's' : ''}
            </button>

            {showThread && (
              <div className="mt-4 space-y-4">
                {loadingThread ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-zinc-500" />
                  </div>
                ) : (
                  thread.map((msg) => (
                    <div
                      key={msg.id}
                      className="border-l-2 border-zinc-700 pl-4 py-2"
                    >
                      <div className="flex items-center gap-2 text-sm mb-2">
                        <span className="text-zinc-300 font-medium">
                          {msg.from_name || msg.from_email_address}
                        </span>
                        <span className="text-zinc-500">
                          {format(new Date(msg.date_received), 'MMM d, yyyy')}
                        </span>
                      </div>
                      <div className="text-sm text-zinc-400">
                        {msg.text_body?.slice(0, 200)}
                        {(msg.text_body?.length || 0) > 200 && '...'}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Reply composer */}
      {showComposer && (
        <ReplyComposer
          parentReply={reply}
          onClose={() => setShowComposer(false)}
          onSent={handleReplySent}
        />
      )}
    </div>
  );
}

