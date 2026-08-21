import { useEffect, useRef } from 'react';
import { queryClient } from '@/lib/query';
import { getBaseUrl } from '@/lib/trpc';
import { useAuth } from '@/lib/auth';

export type LiveJobMessage = {
  id: string;
  body: string;
  createdAt: string | Date;
  mine: boolean;
  sender: { id: string; role: string | null; name: string };
};

export function applyLiveJobMessage(jobId: string, message: LiveJobMessage) {
  queryClient.setQueryData(['job-messages', jobId], (old: unknown) => {
    const current = old as { messages?: LiveJobMessage[] } | undefined;
    if (!current?.messages) return old;
    if (current.messages.some((row) => row.id === message.id)) return current;
    return { ...current, messages: [...current.messages, message] };
  });
  if (!message.mine) {
    void queryClient.invalidateQueries({
      queryKey: ['job-message-unread', jobId],
    });
  }
}

function sleep(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve) => {
    if (signal.aborted) {
      resolve();
      return;
    }
    const timer = setTimeout(resolve, ms);
    signal.addEventListener(
      'abort',
      () => {
        clearTimeout(timer);
        resolve();
      },
      { once: true },
    );
  });
}

/** Hold-request live updates. Reconnects until the screen unmounts. */
export function useJobMessageLive(
  jobId: string | undefined,
  enabled: boolean,
  onMessage: (message: LiveJobMessage) => void,
) {
  const { token } = useAuth();
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;
  const afterRef = useRef(new Date(Date.now() - 2_000).toISOString());

  useEffect(() => {
    if (!jobId || !enabled || !token) return;
    const controller = new AbortController();

    const run = async () => {
      while (!controller.signal.aborted) {
        try {
          const url = `${getBaseUrl()}/api/jobs/${jobId}/messages/stream?after=${encodeURIComponent(afterRef.current)}`;
          const res = await fetch(url, {
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${token}`,
            },
            signal: controller.signal,
          });
          if (!res.ok) {
            await sleep(2_000, controller.signal);
            continue;
          }
          const body = (await res.json()) as { messages?: LiveJobMessage[] };
          for (const message of body.messages ?? []) {
            afterRef.current = new Date(message.createdAt).toISOString();
            onMessageRef.current(message);
          }
        } catch {
          if (controller.signal.aborted) return;
          await sleep(2_000, controller.signal);
        }
      }
    };

    void run();
    return () => controller.abort();
  }, [jobId, enabled, token]);
}
