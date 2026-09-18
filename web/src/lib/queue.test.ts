import { beforeEach, describe, expect, it, vi } from 'vitest';
import { enqueue, flushQueue, isRetryable, listPending, requestBackgroundFlush } from './queue';
import type { EnquiryPayload } from './enquiry';

const payload = (key: string): EnquiryPayload => ({
  guest: { name: 'Tendai', phone: '+263774114599' },
  details: {
    accommodationId: 'ordinary-room',
    checkIn: '2026-10-01',
    checkOut: '2026-10-03',
    partySize: 2,
    longStay: false,
  },
  idempotencyKey: key,
});

async function clearDb(): Promise<void> {
  await new Promise<void>((resolve) => {
    const req = indexedDB.deleteDatabase('riverside');
    req.onsuccess = () => resolve();
    req.onerror = () => resolve();
    req.onblocked = () => resolve();
  });
}

beforeEach(async () => {
  await clearDb();
});

describe('queue', () => {
  it('round-trips an enquiry through IndexedDB', async () => {
    await enqueue(payload('k-roundtrip'));
    const pending = await listPending();
    expect(pending.map((q) => q.idempotencyKey)).toEqual(['k-roundtrip']);
  });

  it('flushes queued enquiries in order and clears them on success', async () => {
    await enqueue(payload('k-1'));
    await enqueue(payload('k-2'));
    const submit = vi.fn().mockResolvedValue({ enquiryId: 'abc', whatsappUrl: 'https://wa.me/x' });

    const results = await flushQueue(submit);

    expect(submit).toHaveBeenCalledTimes(2);
    expect(results).toEqual([
      { key: 'k-1', ok: true, enquiryId: 'abc', whatsappUrl: 'https://wa.me/x' },
      { key: 'k-2', ok: true, enquiryId: 'abc', whatsappUrl: 'https://wa.me/x' },
    ]);
    expect(await listPending()).toHaveLength(0);
  });

  it('stops at a retryable failure and keeps the rest queued', async () => {
    await enqueue(payload('k-a'));
    await enqueue(payload('k-b'));
    const submit = vi.fn().mockRejectedValue(Object.assign(new Error('network'), { code: 'unavailable' }));

    const results = await flushQueue(submit);

    expect(results).toEqual([{ key: 'k-a', ok: false }]);
    expect(submit).toHaveBeenCalledTimes(1);
    expect((await listPending()).map((q) => q.idempotencyKey)).toEqual(['k-a', 'k-b']);
  });

  it('drops a non-retryable poisoned entry instead of blocking the queue', async () => {
    await enqueue(payload('k-bad'));
    const submit = vi.fn().mockRejectedValue(new Error('validation failed'));

    const results = await flushQueue(submit);

    expect(results).toEqual([{ key: 'k-bad', ok: false }]);
    expect(await listPending()).toHaveLength(0);
  });

  it('defaults to flushing only pending items when queue is empty', async () => {
    const submit = vi.fn().mockResolvedValue({ enquiryId: 'abc', whatsappUrl: 'x' });
    await expect(flushQueue(submit)).resolves.toEqual([]);
    expect(submit).not.toHaveBeenCalled();
  });

  it('resolves gracefully where the SyncManager is absent (no service worker)', async () => {
    await expect(requestBackgroundFlush()).resolves.toBeUndefined();
  });
});

describe('isRetryable', () => {
  it.each([
    [{ code: 'unavailable' }, true],
    [{ code: 'deadline-exceeded' }, true],
    [new Error('Failed to fetch'), true],
    [new Error('Load failed'), true],
    [new Error('validation failed'), false],
    [null, false],
  ])('classifies %o', (err, expected) => {
    expect(isRetryable(err)).toBe(expected);
  });
});