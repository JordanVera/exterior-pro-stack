'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { EmptyState } from '@/components/dashboard/empty-state';
import { useJobMessageLive } from '@/lib/job-message-stream';

type JobMessage = {
  id: string;
  body: string;
  createdAt: string | Date;
  mine: boolean;
  sender: { id: string; role: string | null; name: string };
};

function formatMessageTime(value: string | Date) {
  const date = new Date(value);
  const now = new Date();
  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  if (sameDay) {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  }

  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function JobMessageCenter({
  jobId,
  enabled = true,
}: {
  jobId: string;
  /** Hide the composer for jobs that are not yet assigned. */
  enabled?: boolean;
}) {
  const [messages, setMessages] = useState<JobMessage[]>([]);
  const [canSend, setCanSend] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [draft, setDraft] = useState('');
  const scrollerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    const node = scrollerRef.current;
    if (!node) return;
    node.scrollTop = node.scrollHeight;
  }, []);

  const loadMessages = useCallback(async () => {
    if (!jobId || !enabled) return;
    try {
      const result = await trpc.message.list.query({ jobId });
      setMessages(result.messages);
      setCanSend(result.canSend);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [jobId, enabled]);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    void loadMessages();
    void trpc.message.markRead.mutate({ jobId }).catch(() => undefined);
  }, [enabled, jobId, loadMessages]);

  useJobMessageLive(jobId, enabled, (message) => {
    setMessages((current) => {
      if (current.some((row) => row.id === message.id)) return current;
      return [...current, message];
    });
  });

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSend = async () => {
    const body = draft.trim();
    if (!body || sending || !canSend) return;

    setSending(true);
    try {
      const created = await trpc.message.send.mutate({ jobId, body });
      setMessages((current) => [...current, created]);
      setDraft('');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to send');
    } finally {
      setSending(false);
    }
  };

  if (!enabled) {
    return (
      <EmptyState
        icon={MessageSquare}
        title="Messaging opens after a provider is assigned"
        description="Once you accept a bid, you can message the provider and crew from this job."
        className="py-12"
      />
    );
  }

  return (
    <div className="flex min-h-[360px] flex-col">
      <div
        ref={scrollerRef}
        className="flex max-h-[420px] min-h-[260px] flex-1 flex-col gap-3 overflow-y-auto px-1 py-1"
      >
        {loading ? (
          <p className="py-10 text-sm text-center text-muted-foreground">
            Loading messages…
          </p>
        ) : messages.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="No messages yet"
            description="Ask about access, timing, or anything the crew should know before they arrive."
            className="py-10"
          />
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex flex-col gap-1',
                message.mine ? 'items-end' : 'items-start',
              )}
            >
              {!message.mine ? (
                <span className="px-1 text-[11px] font-semibold text-muted-foreground">
                  {message.sender.name}
                </span>
              ) : null}
              <div
                className={cn(
                  'max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-5',
                  message.mine
                    ? 'rounded-br-md bg-brand-lime text-brand-ink'
                    : 'rounded-bl-md bg-muted text-foreground',
                )}
              >
                <p className="whitespace-pre-wrap break-words">
                  {message.body}
                </p>
              </div>
              <span className="px-1 text-[10px] text-muted-foreground">
                {formatMessageTime(message.createdAt)}
              </span>
            </div>
          ))
        )}
      </div>

      <div className="flex gap-2 items-end pt-4 mt-4 border-t border-border">
        <Textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              void handleSend();
            }
          }}
          placeholder={
            canSend ? 'Write a message…' : 'Messaging is closed for this job'
          }
          disabled={!canSend || sending}
          rows={2}
          className="min-h-[44px] resize-none rounded-xl"
        />
        <Button
          type="button"
          size="icon"
          disabled={!canSend || sending || !draft.trim()}
          onClick={() => void handleSend()}
          className="w-10 h-10 rounded-full shrink-0 bg-brand-lime text-brand-ink hover:bg-brand-lime/90"
        >
          <Send className="w-4 h-4" />
          <span className="sr-only">Send</span>
        </Button>
      </div>
    </div>
  );
}
