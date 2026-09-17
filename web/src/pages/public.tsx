import { useEffect, useState } from 'react';
import { PROPERTY as FALLBACK } from '../lib/property';
import { fromPrice, useAccommodations, useProperty } from '../lib/content';
import { submitEnquiry, validateEnquiry } from '../lib/enquiry';
import { enqueue, flushQueue, isRetryable, listPending, requestBackgroundFlush } from '../lib/queue';

function Notice({ error }: { error: string | null }) {
  if (!error) return null;
  return <p role="note">{error}</p>;
}

export function Home() {
  const prop = useProperty();
  const rooms = useAccommodations();
  const p = prop.data;
  return (
    <main>
      {prop.loading || rooms.loading ? <p>Loading…</p> : null}
      <Notice error={prop.error ?? rooms.error} />
      <h1>{p.name}</h1>
      <p>Hotel comfort at guesthouse prices. {rooms.data.length > 0 ? fromPrice(rooms.data) : p.startingPriceText}. No hidden fees.</p>
      {p.description ? <p>{p.description}</p> : null}
      <p>
        <a href="/booking">Enquire now</a> · <a href={`https://wa.me/${p.whatsappNumber.replace('+', '')}`}>WhatsApp us</a>
      </p>

      <section>
        <h2>Rooms &amp; rates</h2>
        {rooms.data.length === 0 ? (
          <p>No rooms currently listed — please WhatsApp us for availability.</p>
        ) : (
          <ul>
            {rooms.data.map((a) => (
              <li key={a.id}>
                {a.name} — US${a.rate}/night (per room){a.capacity ? ` · sleeps ${a.capacity}` : ''}
              </li>
            ))}
          </ul>
        )}
        <p><a href="/accommodation">See all accommodation</a></p>
      </section>

      <section>
        <h2>Why Riverside</h2>
        {p.facilities.length > 0 ? (
          <ul>{p.facilities.map((f) => <li key={f}>{f}</li>)}</ul>
        ) : (
          <ul>
            <li>High-speed Wi-Fi</li>
            <li>Solar backup</li>
            <li>Quiet, business-ready workspace</li>
            <li>Secure spacious parking</li>
            <li>Hot showers &amp; fresh linen</li>
            <li>Braai area</li>
          </ul>
        )}
      </section>

      <section>
        <h2>Who it&rsquo;s for</h2>
        <ul>
          <li>Couples &amp; singles</li>
          <li>Business travellers</li>
          <li>Mutare Road travellers passing through</li>
          <li>Corporate events &amp; family gatherings (accommodation only)</li>
        </ul>
      </section>

      <section>
        <h2>Long stays</h2>
        <p>{p.longStayMessage ?? 'Discounts available for long stays — tell us your dates and management will confirm a rate.'}</p>
        <p><a href="/booking">Enquire about a long stay</a></p>
      </section>

      <section>
        <h2>Location</h2>
        <p>{p.addressText}. {p.navigationLandmarks}.</p>
        <p><a href="/location">Maps &amp; directions</a></p>
      </section>
    </main>
  );
}

export function Accommodation() {
  const rooms = useAccommodations();
  if (rooms.loading) return <main><p>Loading rooms…</p></main>;
  return (
    <main>
      <h1>Accommodation</h1>
      <Notice error={rooms.error} />
      {rooms.data.length === 0 ? (
        <p>No rooms currently listed — please WhatsApp us on {FALLBACK.contactPhone} for availability.</p>
      ) : (
        rooms.data.map((a) => (
          <section key={a.id}>
            <h2>{a.name} — US${a.rate}/night</h2>
            {a.description ? <p>{a.description}</p> : <p>Details to be confirmed — photos, capacity and amenities coming soon.</p>}
            {a.capacity ? <p>Sleeps {a.capacity}.</p> : null}
            {a.amenities.length > 0 ? <ul>{a.amenities.map((m) => <li key={m}>{m}</li>)}</ul> : null}
            <p><a href="/booking">Enquire about {a.name}</a></p>
          </section>
        ))
      )}
    </main>
  );
}

export function Location() {
  const prop = useProperty();
  const p = prop.data;
  return (
    <main>
      <h1>Location &amp; Directions</h1>
      <Notice error={prop.error} />
      <p>{p.addressText}</p>
      <p><a href={p.dirUrl}>Get directions (Google Maps)</a></p>
      <p>Landmark fallback: {p.navigationLandmarks}.</p>
    </main>
  );
}

export function Privacy() {
  const prop = useProperty();
  return (
    <main>
      <h1>Privacy Policy</h1>
      <p>We collect name, phone, optional email, dates, party size and message to handle your enquiry (FR-020).</p>
      <p>We keep enquiry records to run the guesthouse and respond to you. Contact us on {prop.data.contactPhone} to ask what we hold or request deletion.</p>
    </main>
  );
}

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
      setStatus(`Enquiry ${res.enquiryId} saved. Opening WhatsApp…`);
      window.location.href = res.whatsappUrl; // persist-before-redirect (server persisted first)
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
      {queued > 0 && <p>{queued} enquir{queued === 1 ? 'y' : 'ies'} waiting to send.</p>}
    </main>
  );
}
