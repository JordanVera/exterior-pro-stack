/** In-process wakeups for live job threads on this isolate. */
type Listener = () => void;

const listeners = new Map<string, Set<Listener>>();

export function publishJobMessage(jobId: string) {
  const set = listeners.get(jobId);
  if (!set) return;
  for (const listener of Array.from(set)) listener();
}

export function waitForJobMessage(
  jobId: string,
  timeoutMs: number,
  signal: AbortSignal,
): Promise<void> {
  return new Promise((resolve) => {
    if (signal.aborted) {
      resolve();
      return;
    }

    let settled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const finish = () => {
      if (settled) return;
      settled = true;
      if (timer) clearTimeout(timer);
      signal.removeEventListener('abort', finish);
      const set = listeners.get(jobId);
      if (set) {
        set.delete(finish);
        if (set.size === 0) listeners.delete(jobId);
      }
      resolve();
    };

    let set = listeners.get(jobId);
    if (!set) {
      set = new Set();
      listeners.set(jobId, set);
    }
    set.add(finish);
    signal.addEventListener('abort', finish);
    timer = setTimeout(finish, timeoutMs);
  });
}
