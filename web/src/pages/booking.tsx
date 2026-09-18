import { useEffect, useState } from 'react';
import { useAccommodations } from '../lib/content';
import { submitEnquiry, validateEnquiry } from '../lib/enquiry';
import { enqueue, flushQueue, isRetryable, listPending, requestBackgroundFlush } from '../lib/queue';
import { Notice } from './public';
import { Button } from '../components/Button';
import { CheckIcon, WhatsAppIcon } from '../components/icons';

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
      <div className="booking-wrapper" style={{ maxWidth: '640px', margin: '0 auto', paddingTop: '2rem' }}>
        {/* ── Intro banner ── */}
        <div className="booking-intro">
          <p className="section-label" style={{ color: 'var(--gold-light)', marginTop: 0 }}>Reserve your stay</p>
          <h1>Book Your Stay</h1>
          <p>Tell us your dates and a person — not a machine — reads your enquiry and confirms your booking on WhatsApp. Direct, honest, no fine print.</p>
        </div>

        <Notice error={rooms.error} />

        {/* ── Form ── */}
        <form onSubmit={onSubmit} aria-label="Accommodation enquiry form">
          <fieldset className="booking-fieldset">
            <legend>Contact details</legend>
            <div className="form-row">
              <label htmlFor="booking-name">
                Your Name
                <input
                  id="booking-name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Full name"
                  required
                  autoComplete="name"
                />
              </label>
              <label htmlFor="booking-phone">
                Phone (WhatsApp)
                <input
                  id="booking-phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+263…"
                  required
                  autoComplete="tel"
                  inputMode="tel"
                />
              </label>
            </div>

            <label htmlFor="booking-email">
              Email <span style={{ fontWeight: 400, color: 'var(--muted)' }}>(optional)</span>
              <input
                id="booking-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="your@email.com"
                autoComplete="email"
                inputMode="email"
              />
            </label>
          </fieldset>

          <fieldset className="booking-fieldset">
            <legend>Stay details</legend>
            <label htmlFor="booking-room">
              Room
              <select
                id="booking-room"
                value={form.accommodationId}
                onChange={(e) => setForm({ ...form, accommodationId: e.target.value })}
              >
                {rooms.data.map((r) => (
                  <option key={r.id} value={r.id}>{r.name} — US${r.rate}/night</option>
                ))}
              </select>
            </label>

            <div className="form-row">
              <label htmlFor="booking-checkin">
                Check-in Date
                <input
                  id="booking-checkin"
                  type="date"
                  value={form.checkIn}
                  onChange={(e) => setForm({ ...form, checkIn: e.target.value })}
                  required
                />
              </label>
              <label htmlFor="booking-checkout">
                Check-out Date
                <input
                  id="booking-checkout"
                  type="date"
                  value={form.checkOut}
                  onChange={(e) => setForm({ ...form, checkOut: e.target.value })}
                  required
                />
              </label>
            </div>

            <label htmlFor="booking-guests">
              Number of Guests
              <input
                id="booking-guests"
                type="number"
                min={1}
                max={10}
                step={1}
                value={form.partySize}
                onChange={(e) => setForm({ ...form, partySize: Number(e.target.value) })}
                required
              />
            </label>

            <label className="checkbox-label" htmlFor="booking-longstay">
              <input
                id="booking-longstay"
                type="checkbox"
                checked={form.longStay}
                onChange={(e) => setForm({ ...form, longStay: e.target.checked })}
              />
              I'm interested in a long stay (7+ nights)
            </label>
          </fieldset>

          <fieldset className="booking-fieldset">
            <legend>Anything else?</legend>
            <label htmlFor="booking-message">
              Message <span style={{ fontWeight: 400, color: 'var(--muted)' }}>(optional)</span>
              <textarea
                id="booking-message"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Any special requests, questions, or additional details…"
              />
            </label>
          </fieldset>

          <button type="submit" disabled={busy} id="booking-submit-btn">
            {busy ? 'Sending…' : 'Send Enquiry →'}
          </button>
        </form>

        {error && <p role="alert">{error}</p>}
        {status && <p role="note">{status}</p>}

        {success && (
          <div className="success" role="status">
            <h2 className="success-heading"><CheckIcon size={22} /> Enquiry received — ref {success.ref}</h2>
            <p style={{ fontWeight: 600 }}>{success.room} · {success.dates} · {form.partySize} guest{form.partySize === 1 ? '' : 's'}</p>
            <p><strong>What happens next:</strong></p>
            <ol style={{ paddingLeft: '1.2rem', color: 'var(--muted)', fontSize: '0.93rem' }}>
              <li>Now — tap below to send your enquiry on WhatsApp.</li>
              <li>Within minutes — management confirms availability and pricing.</li>
              <li>On arrival — show this chat at check-in. No hidden fees.</li>
            </ol>
            <p>
              <Button href={success.whatsappUrl} external id="success-whatsapp-btn">
                <WhatsAppIcon size={18} />
                Continue to WhatsApp →
              </Button>
            </p>
          </div>
        )}

        {queued > 0 && (
          <p role="note">{queued} enquir{queued === 1 ? 'y' : 'ies'} waiting to send when you reconnect.</p>
        )}
      </div>
    </main>
  );
}
