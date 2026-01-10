'use client';

import { useEffect, useState } from 'react';
import { X, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Reply, EmailAccount } from '@/lib/emailbison/types';

interface ReplyComposerProps {
  parentReply: Reply;
  onClose: () => void;
  onSent: () => void;
}

export function ReplyComposer({ parentReply, onClose, onSent }: ReplyComposerProps) {
  const [senderEmails, setSenderEmails] = useState<EmailAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [senderEmailId, setSenderEmailId] = useState<number | null>(
    parentReply.sender_email_id || null
  );
  const [toEmail, setToEmail] = useState(parentReply.from_email_address);
  const [ccEmails, setCcEmails] = useState('');
  const [message, setMessage] = useState('');
  const [includePrevious, setIncludePrevious] = useState(true);

  // Fetch sender emails
  useEffect(() => {
    async function fetchSenderEmails() {
      setLoading(true);
      try {
        const res = await fetch('/api/emailbison/email-accounts');
        const data = await res.json();
        const accounts = data.data || [];
        setSenderEmails(accounts);

        // If we don't have a sender email set, try to match the original receiver
        if (!senderEmailId) {
          const matchingAccount = accounts.find(
            (acc: EmailAccount) => acc.email === parentReply.primary_to_email_address
          );
          if (matchingAccount) {
            setSenderEmailId(matchingAccount.id);
          } else if (accounts.length > 0) {
            setSenderEmailId(accounts[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to fetch sender emails:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchSenderEmails();
  }, [parentReply.primary_to_email_address, parentReply.sender_email_id, senderEmailId]);

  const handleSend = async () => {
    if (!senderEmailId) {
      setError('Please select a sender email');
      return;
    }
    if (!toEmail.trim()) {
      setError('Please enter a recipient');
      return;
    }
    if (!message.trim()) {
      setError('Please enter a message');
      return;
    }

    setSending(true);
    setError(null);

    try {
      const toEmails = [{ name: null, address: toEmail.trim() }];
      const cc = ccEmails
        .split(',')
        .map((e) => e.trim())
        .filter(Boolean)
        .map((address) => ({ name: null, address }));

      const payload = {
        message,
        sender_email_id: senderEmailId,
        to_emails: toEmails,
        inject_previous_email_body: includePrevious,
        content_type: 'text' as const,
        ...(cc.length > 0 && { cc_emails: cc }),
      };

      const res = await fetch(`/api/emailbison/replies/${parentReply.id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.error) {
        throw new Error(data.error);
      }

      onSent();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reply');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="border-t border-zinc-800 bg-zinc-900">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
        <h3 className="text-sm font-medium text-white">Reply</h3>
        <Button variant="ghost" size="sm" onClick={onClose} className="text-zinc-400">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Form */}
      <div className="p-4 space-y-4">
        {/* From */}
        <div className="space-y-2">
          <Label className="text-xs text-zinc-500">From</Label>
          {loading ? (
            <div className="h-9 bg-zinc-800 rounded animate-pulse" />
          ) : (
            <Select
              value={senderEmailId?.toString() || ''}
              onValueChange={(val) => setSenderEmailId(parseInt(val, 10))}
            >
              <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                <SelectValue placeholder="Select sender" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-700">
                {senderEmails.map((email) => (
                  <SelectItem
                    key={email.id}
                    value={email.id.toString()}
                    className="text-zinc-300"
                  >
                    {email.name ? `${email.name} <${email.email}>` : email.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* To */}
        <div className="space-y-2">
          <Label className="text-xs text-zinc-500">To</Label>
          <Input
            value={toEmail}
            onChange={(e) => setToEmail(e.target.value)}
            className="bg-zinc-800 border-zinc-700 text-white"
            placeholder="recipient@example.com"
          />
        </div>

        {/* CC */}
        <div className="space-y-2">
          <Label className="text-xs text-zinc-500">CC (comma-separated)</Label>
          <Input
            value={ccEmails}
            onChange={(e) => setCcEmails(e.target.value)}
            className="bg-zinc-800 border-zinc-700 text-white"
            placeholder="cc@example.com, another@example.com"
          />
        </div>

        {/* Message */}
        <div className="space-y-2">
          <Label className="text-xs text-zinc-500">Message</Label>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="bg-zinc-800 border-zinc-700 text-white min-h-[150px] resize-none"
            placeholder="Type your reply..."
          />
        </div>

        {/* Include previous */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="include-previous"
            checked={includePrevious}
            onCheckedChange={(checked) => setIncludePrevious(!!checked)}
            className="border-zinc-600"
          />
          <Label htmlFor="include-previous" className="text-sm text-zinc-400 cursor-pointer">
            Include previous message
          </Label>
        </div>

        {/* Error */}
        {error && (
          <div className="text-sm text-red-400 bg-red-400/10 px-3 py-2 rounded">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose} className="text-zinc-400">
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={sending} className="bg-blue-600 hover:bg-blue-700">
            {sending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

