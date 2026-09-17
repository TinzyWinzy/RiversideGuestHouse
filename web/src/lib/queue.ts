// Offline enquiry queue (Phase C): IndexedDB-backed, flushed on reconnect.
// Server-side idempotencyKey makes retries safe — a replayed flush can never double-book.
import type { EnquiryPayload } from './enquiry';

const DB = 'riverside';
const STORE = 'enquiryQueue';

export interface QueuedEnquiry {
  idempotencyKey: string;
  payload: EnquiryPayload;
  createdAt: number;
  attempts: number;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE, { keyPath: 'idempotencyKey' });
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function tx<T>(mode: IDBTransactionMode, fn: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const t = db.transaction(STORE, mode);
        const req = fn(t.objectStore(STORE));
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
        t.oncomplete = () => db.close();
      }),
  );
}

export const enqueue = (payload: EnquiryPayload): Promise<void> =>
  tx('readwrite', (s) =>
    s.put({ idempotencyKey: payload.idempotencyKey, payload, createdAt: Date.now(), attempts: 0 }),
  ).then(() => undefined);

export const listPending = (): Promise<QueuedEnquiry[]> => tx('readonly', (s) => s.getAll());

export const removeQueued = (key: string): Promise<void> =>
  tx('readwrite', (s) => s.delete(key)).then(() => undefined);

export function isRetryable(err: unknown): boolean {
  const code = (err as { code?: string })?.code;
  if (code === 'unavailable' || code === 'deadline-exceeded') return true;
  const msg = err instanceof Error ? err.message : String(err);
  return /network|fetch|offline|Failed to fetch|Load failed/i.test(msg);
}

/** Ask the service worker to flush on reconnect (no-op where SyncManager is absent). */
export async function requestBackgroundFlush(): Promise<void> {
  try {
    const reg = await navigator.serviceWorker?.ready;
    const sync = (reg as ServiceWorkerRegistration & { sync?: { register: (t: string) => Promise<void> } })?.sync;
    await sync?.register('enquiry-flush');
  } catch {
    // Fallback path (online-event listener in App) covers this.
  }
}

export interface FlushResult {
  key: string;
  ok: boolean;
  whatsappUrl?: string;
  enquiryId?: string;
}

/** Send every queued enquiry. Stops at first retryable failure (keeps order, retries later). */
export async function flushQueue(
  submit: (p: EnquiryPayload) => Promise<{ enquiryId: string; whatsappUrl: string }>,
): Promise<FlushResult[]> {
  const pending = await listPending();
  const results: FlushResult[] = [];
  for (const q of pending) {
    try {
      const res = await submit(q.payload);
      await removeQueued(q.idempotencyKey);
      results.push({ key: q.idempotencyKey, ok: true, ...res });
    } catch (err) {
      if (isRetryable(err)) {
        results.push({ key: q.idempotencyKey, ok: false });
        break; // still offline — leave the rest queued
      }
      // Non-retryable (validation etc.): drop to avoid a poisoned queue, surface via result.
      await removeQueued(q.idempotencyKey);
      results.push({ key: q.idempotencyKey, ok: false });
      break;
    }
  }
  return results;
}
