'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import type { Reply } from '@/lib/emailbison/types';

const STANDARD_VARIABLES = [
  { name: 'FIRST_NAME', description: 'Lead first name' },
  { name: 'LAST_NAME', description: 'Lead last name' },
  { name: 'EMAIL', description: 'Lead email address' },
  { name: 'COMPANY', description: 'Lead company' },
  { name: 'TITLE', description: 'Lead job title' },
];

interface ReplyComposerProps {
  parentReply: Reply;
  onClose: () => void;
  onSent: () => void;
}

export function ReplyComposer({ parentReply, onClose, onSent }: ReplyComposerProps) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showVars, setShowVars] = useState(false);
  const [varFilter, setVarFilter] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const cursorPosRef = useRef(0);

  const filteredVars = STANDARD_VARIABLES.filter(v =>
    v.name.toLowerCase().includes(varFilter.toLowerCase())
  );

  useEffect(() => {
    if (showVars) {
      setSelectedIndex(0);
    }
  }, [showVars, varFilter]);

  const insertVariable = (varName: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const pos = cursorPosRef.current;
    // Find the opening { before cursor
    const beforeCursor = message.slice(0, pos);
    const bracePos = beforeCursor.lastIndexOf('{');
    
    if (bracePos !== -1) {
      const before = message.slice(0, bracePos);
      const after = message.slice(pos);
      const newMessage = `${before}{${varName}}${after}`;
      setMessage(newMessage);
      
      // Set cursor after the inserted variable
      setTimeout(() => {
        const newPos = bracePos + varName.length + 2;
        textarea.setSelectionRange(newPos, newPos);
        textarea.focus();
      }, 0);
    }
    
    setShowVars(false);
    setVarFilter('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const pos = e.target.selectionStart || 0;
    cursorPosRef.current = pos;
    setMessage(value);

    // Check if we just typed {
    const charBefore = value[pos - 1];
    if (charBefore === '{') {
      setShowVars(true);
      setVarFilter('');
    } else if (showVars) {
      // Update filter based on text after {
      const beforeCursor = value.slice(0, pos);
      const bracePos = beforeCursor.lastIndexOf('{');
      if (bracePos !== -1) {
        const typed = beforeCursor.slice(bracePos + 1);
        if (typed.includes('}') || typed.includes(' ') || typed.includes('\n')) {
          setShowVars(false);
          setVarFilter('');
        } else {
          setVarFilter(typed);
        }
      } else {
        setShowVars(false);
        setVarFilter('');
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSend();
      return;
    }

    if (showVars) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(i => Math.min(i + 1, filteredVars.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(i => Math.max(i - 1, 0));
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        if (filteredVars[selectedIndex]) {
          insertVariable(filteredVars[selectedIndex].name);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setShowVars(false);
        setVarFilter('');
      }
    }
  };

  const handleSend = async () => {
    if (!message.trim()) {
      setError('Please enter a message');
      return;
    }

    setSending(true);
    setError(null);

    try {
      const payload = {
        message,
        sender_email_id: parentReply.sender_email_id,
        to_emails: [{ name: parentReply.from_name || null, address: parentReply.from_email_address }],
        inject_previous_email_body: true,
        content_type: 'text' as const,
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
    <div className="bg-zinc-900/50 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-zinc-400">
          Reply to <span className="text-zinc-200">{parentReply.from_email_address}</span>
        </span>
        <Button variant="ghost" size="sm" onClick={onClose} className="text-zinc-500 h-6 w-6 p-0">
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="relative">
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className="bg-zinc-800 border-zinc-700 text-white min-h-[200px] resize-y"
          placeholder="Type your reply... (type { for variables)"
          autoFocus
        />
        
        {/* Variable autocomplete dropdown */}
        {showVars && filteredVars.length > 0 && (
          <div className="absolute top-0 left-0 -translate-y-full -mt-1 w-64 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl overflow-hidden z-50">
            <div className="px-3 py-2 border-b border-zinc-800 text-xs text-zinc-500">
              Variables • ↑↓ to navigate • Enter to select
            </div>
            {filteredVars.map((v, i) => (
              <button
                key={v.name}
                onClick={() => insertVariable(v.name)}
                className={`w-full px-3 py-2 text-left text-sm flex items-center justify-between transition-colors ${
                  i === selectedIndex 
                    ? 'bg-blue-600 text-white' 
                    : 'text-zinc-300 hover:bg-zinc-800'
                }`}
              >
                <span className="font-mono text-green-400">{`{${v.name}}`}</span>
                <span className={`text-xs ${i === selectedIndex ? 'text-blue-200' : 'text-zinc-500'}`}>
                  {v.description}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {error && (
        <div className="text-sm text-red-400 mt-3">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between mt-3">
        <span className="text-xs text-zinc-600">⌘+Enter to send • Type {'{'} for variables</span>
        <Button 
          onClick={handleSend} 
          disabled={sending || !message.trim()} 
          size="sm"
          className="bg-blue-600 hover:bg-blue-700"
        >
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
  );
}
