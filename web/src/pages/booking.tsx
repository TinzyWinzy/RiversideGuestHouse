import { useEffect, useState } from 'react';
import { useAccommodations } from '../lib/content';
import { submitEnquiry, validateEnquiry } from '../lib/enquiry';
import { enqueue, flushQueue, isRetryable, listPending, requestBackgroundFlush } from '../lib/queue';
import { Notice } from './public';

export function Booking() {
  const rooms = useAccommodations();
  const [form, setForm] = useState({
    name: '', phone: '', email: '', accommodationId: 'ordinary-room',
    checkIn: '', checkOut: '', partySize: 2, longStay: false, message: '',
  });
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [queued, setQueued] = useState(0);
  const [success, setSuccess] = useState<{ ref: string; room: string; dates: string; whatsappUrl: string } | null>(null);

  // Flush offline queue: on mount, on reconnect, and on service-worker sync message.
  useEffect(() => {
    let alive = true;
    const refresh = () => listPending().then((p) => alive && setQueued(p.length)).catch(() => undefined);
    const flush = () =>
      flushQueue(submitEnquiry)
        .then((results) => {
          const done = results.find((r) => r.ok && r.whatsappUrl);
          if (done && alive) {
            setStatus(`Queued enquiry sent. Opening WhatsApp…`);
            window.location.href = done.whatsappUrl!;
          }
          refresh();
        })
        .catch(() => undefined);
    const onMsg = (e: MessageEvent) => {
      if (e.data?.type === 'FLUSH_QUEUE') flush();
    };
    refresh();
    if (!navigator.onLine) setStatus('You are offline. You can still submit — it will send automatically.');
    window.addEventListener('online', flush);
    navigator.serviceWorker?.addEventListener('message', onMsg);
    flush();
    return () => {
      alive = false;
      window.removeEventListener('online', flush);
      navigator.serviceWorker?.removeEventListener('message', onMsg);
    };
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null); setStatus(null);
    const payload = {
      guest: { name: form.name, phone: form.phone, email: form.email || undefined },
      details: {
        accommodationId: form.accommodationId, checkIn: form.checkIn, checkOut: form.checkOut,
        partySize: Number(form.partySize), longStay: form.longStay, message: form.message || undefined,
      },
      idempotencyKey: crypto.randomUUID(),
    };
    const err = validateEnquiry(payload);
    if (err) { setError(err); return; }
    setBusy(true);
    try {
      const res = await submitEnquiry(payload);
      // Peak-end: explicit confirmation first — the guest chooses when to open WhatsApp.
      const roomName = rooms.data.find((r) => r.id === form.accommodationId)?.name ?? form.accommodationId;
      setSuccess({
        ref: res.enquiryId.slice(0, 8).toUpperCase(),
        room: roomName,
        dates: `${form.checkIn} → ${form.checkOut}`,
        whatsappUrl: res.whatsappUrl,
      });
    } catch (ex: unknown) {
      if (isRetryable(ex)) {
        // Offline or unreachable: queue locally, sync later. IdempotencyKey makes replay safe.
        await enqueue(payload).catch(() => undefined);
        await requestBackgroundFlush();
        listPending().then((p) => setQueued(p.length)).catch(() => undefined);
        setStatus('Saved on this device. It will send automatically when you are back online.');
      } else {
        setError(ex instanceof Error ? ex.message : 'Submission failed. Please retry or WhatsApp us directly.');
      }
    } finally { setBusy(false); }
  }

  return (
    <main>
      <h1>Request accommodation</h1>
      <p>Enquiries are requests, not instant reservations — management confirms availability (FR-019).</p>
      <Notice error={rooms.error} />
      <form onSubmit={onSubmit}>
        <label>Name<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></label>
        <label>Phone (E.164)<input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+263…" required /></label>
        <label>Email (optional)<input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
        <label>Room<select value={form.accommodationId} onChange={(e) => setForm({ ...form, accommodationId: e.target.value })}>
          {rooms.data.map((r) => (
            <option key={r.id} value={r.id}>{r.name} — US${r.rate}/night</option>
          ))}
        </select></label>
        <label>Check-in<input type="date" value={form.checkIn} onChange={(e) => setForm({ ...form, checkIn: e.target.value })} required /></label>
        <label>Check-out<input type="date" value={form.checkOut} onChange={(e) => setForm({ ...form, checkOut: e.target.value })} required /></label>
        <label>Guests<input type="number" min={1} max={10} value={form.partySize} onChange={(e) => setForm({ ...form, partySize: Number(e.target.value) })} required /></label>
        <label><input type="checkbox" checked={form.longStay} onChange={(e) => setForm({ ...form, longStay: e.target.checked })} /> Long stay?</label>
        <label>Message<textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} /></label>
        <button type="submit" disabled={busy}>{busy ? 'Sending…' : 'Send enquiry'}</button>
      </form>
      {error && <p role="alert">{error}</p>}
      {status && <p>{status}</p>}
      {success && (
        <div className="success" role="status">
          <h2>Enquiry received — ref {success.ref}</h2>
          <p>{success.room} · {success.dates} · {form.partySize} guest{form.partySize === 1 ? '' : 's'}</p>
          <p>What happens next: management confirms availability and pricing on WhatsApp (usually same day).</p>
          <p><a className="btn" href={success.whatsappUrl}>Continue to WhatsApp</a></p>
        </div>
      )}
      {queued > 0 && <p>{queued} enquir{queued === 1 ? 'y' : 'ies'} waiting to send.</p>}
    </main>
  );
}
