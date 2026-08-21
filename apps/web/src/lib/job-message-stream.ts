'use client';

import { useEffect, useRef } from 'react';

export type LiveJobMessage = {
  id: string;
  body: string;
  createdAt: string | Date;
  mine: boolean;
  sender: { id: string; role: string | null; name: string };
};

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

function consumeSse(
  buffer: string,
  onEvent: (event: string, data: string) => void,
) {
  const parts = buffer.split('\n\n');
  const rest = parts.pop() ?? '';
  for (const block of parts) {
    let event = 'message';
    const dataLines: string[] = [];
    for (const line of block.split('\n')) {
      if (line.startsWith('event:')) event = line.slice(6).trim();
      else if (line.startsWith('data:')) dataLines.push(line.slice(5).trim());
    }
    if (dataLines.length > 0) onEvent(event, dataLines.join('\n'));
  }
  return rest;
}

/** Server-sent live updates. Reconnects until the screen unmounts. */
export function useJobMessageLive(
  jobId: string | undefined,
  enabled: boolean,
  onMessage: (message: LiveJobMessage) => void,
) {
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;
  const afterRef = useRef(new Date(Date.now() - 2_000).toISOString());

  useEffect(() => {
    if (!jobId || !enabled) return;
    const controller = new AbortController();

    const run = async () => {
      while (!controller.signal.aborted) {
        try {
          const url = `/api/jobs/${jobId}/messages/stream?after=${encodeURIComponent(afterRef.current)}`;
          const res = await fetch(url, {
            headers: { Accept: 'text/event-stream' },
            credentials: 'include',
            signal: controller.signal,
          });
          if (!res.ok || !res.body) {
            await sleep(2_000, controller.signal);
            continue;
          }

          const reader = res.body.getReader();
          const decoder = new TextDecoder();
          let buffer = '';
          while (!controller.signal.aborted) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            buffer = consumeSse(buffer, (event, data) => {
              if (event !== 'message') return;
              const message = JSON.parse(data) as LiveJobMessage;
              afterRef.current = new Date(message.createdAt).toISOString();
              onMessageRef.current(message);
            });
          }
        } catch {
          if (controller.signal.aborted) return;
          await sleep(2_000, controller.signal);
        }
      }
    };

    void run();
    return () => controller.abort();
  }, [jobId, enabled]);
}
