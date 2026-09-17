import { useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  updateDoc,
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import {
  BOOKING_NEXT,
  ENQUIRY_NEXT,
  apiConvertToBooking,
  apiUpdateBookingStatus,
  apiUpdateEnquiryStatus,
} from '../lib/admin';

type Tab = 'enquiries' | 'bookings' | 'guests' | 'rooms';
type Doc = Record<string, unknown> & { id: string };

async function listAll(col: string, n = 100): Promise<Doc[]> {
  const snap = await getDocs(query(collection(db, col), orderBy('createdAt', 'desc'), limit(n)));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Record<string, unknown>) }));
}

const fmtDate = (v: unknown) => {
  if (typeof v === 'string') return v;
  const t = v as { toDate?: () => Date };
  return t?.toDate ? t.toDate().toLocaleString() : '';
};

export function Admin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('enquiries');
  const [rows, setRows] = useState<Doc[]>([]);
  const [busy, setBusy] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selected, setSelected] = useState<Doc | null>(null);
  const [guest, setGuest] = useState<Doc | null>(null);
  const [note, setNote] = useState('');

  const load = () => {
    setBusy(true);
    setError(null);
    const col = tab === 'enquiries' ? 'enquiries' : tab === 'bookings' ? 'bookings' : tab === 'guests' ? 'guests' : 'accommodations';
    listAll(col, tab === 'guests' ? 50 : 100)
      .then((r) => {
        setRows(r);
        setSelected(null);
        setGuest(null);
      })
      .catch((ex: unknown) => setError(ex instanceof Error ? ex.message : 'Load failed.'))
      .finally(() => setBusy(false));
  };

  // Route guard: resolve auth before mounting any data reads (no permission-denied flash).
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u?.email ?? null);
      setAuthReady(true);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (authReady && user) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, authReady, user]);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      setUser(cred.user.email);
    } catch (ex: unknown) {
      setError(ex instanceof Error ? ex.message : 'Login failed.');
    }
  }

  async function openEnquiry(row: Doc) {
    setSelected(row);
    setGuest(null);
    if (row.guestId) {
      try {
        const g = await getDoc(doc(db, 'guests', row.guestId as string));
        if (g.exists()) setGuest({ id: g.id, ...(g.data() as Record<string, unknown>) });
      } catch {
        // guest read optional
      }
    }
  }

  async function doEnquiryAction(next: string) {
    if (!selected) return;
    if ((next === 'CANCELLED' || next === 'COMPLETED') && !window.confirm(`${next} enquiry ${selected.id.slice(0, 8)}?`)) return;
    setBusy(true);
    setError(null);
    try {
      await apiUpdateEnquiryStatus(selected.id, next, note || undefined);
      setNote('');
      load();
    } catch (ex: unknown) {
      setError(ex instanceof Error ? ex.message : 'Update failed.');
      setBusy(false);
    }
  }

  async function doConvert() {
    if (!selected) return;
    if (!window.confirm(`Convert enquiry ${selected.id.slice(0, 8)} into a booking?`)) return;
    setBusy(true);
    setError(null);
    try {
      const res = await apiConvertToBooking(selected.id, note || undefined);
      setNote('');
      setStatusFilter('ALL');
      setTab('bookings');
      setError(null);
      setSelected({ ...selected, convertedTo: res.bookingId });
      load();
    } catch (ex: unknown) {
      setError(ex instanceof Error ? ex.message : 'Convert failed.');
      setBusy(false);
    }
  }

  async function doBookingAction(id: string, next: string) {
    if ((next === 'CANCELLED' || next === 'NO_SHOW') && !window.confirm(`${next} booking ${id.slice(0, 8)}?`)) return;    setBusy(true);
    setError(null);
    try {
      await apiUpdateBookingStatus(id, next, note || undefined);
      setNote('');
      load();
    } catch (ex: unknown) {
      setError(ex instanceof Error ? ex.message : 'Update failed.');
      setBusy(false);
    }
  }

  async function toggleRoom(row: Doc) {
    setBusy(true);
    setError(null);
    try {
      await updateDoc(doc(db, 'accommodations', row.id), { active: !row.active });
      load();
    } catch (ex: unknown) {
      setError(ex instanceof Error ? ex.message : 'Update failed.');
      setBusy(false);
    }
  }

  if (!authReady) {
    return (
      <main>
        <h1>Management</h1>
        <p>Checking sign-in…</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main>
        <h1>Management sign in</h1>
        <form onSubmit={login}>
          <label>Email<input value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
          <label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
          <button type="submit">Sign in</button>
        </form>
        {error && <p role="alert">{error}</p>}
      </main>
    );
  }

  const visible = rows.filter((r) => statusFilter === 'ALL' || r.status === statusFilter);

  return (
    <main>
      <h1>Management</h1>
      <p>Signed in as {user}. <button type="button" onClick={() => signOut(auth).then(() => setUser(null))}>Sign out</button></p>
      <div className="row">
        {(['enquiries', 'bookings', 'guests', 'rooms'] as Tab[]).map((t) => (
          <button key={t} type="button" disabled={tab === t} onClick={() => { setTab(t); setStatusFilter('ALL'); }}>
            {t}
          </button>
        ))}
        <button type="button" onClick={load} disabled={busy}>Refresh</button>
      </div>
      {error && <p role="alert">{error}</p>}
      {busy && <p>Working…</p>}

      {(tab === 'enquiries' || tab === 'bookings') && (
        <p>
          <label>Filter status{' '}
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="ALL">All</option>
              {(tab === 'enquiries'
                ? ['NEW', 'CONTACTED', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED']
                : ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']
              ).map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </label>
        </p>
      )}

      {tab === 'rooms' ? (
        <table className="stacked">
          <thead><tr><th>Room</th><th>Rate</th><th>Active</th><th></th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{String(r.name)}</td>
                <td>{String(r.currency)} {String(r.rate)}</td>
                <td>{r.active ? 'Yes' : 'No'}</td>
                <td><button type="button" onClick={() => toggleRoom(r)}>{r.active ? 'Hide' : 'Show'}</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <table className="stacked">
          <thead><tr>
            <th>{tab === 'guests' ? 'Name' : 'Ref'}</th>
            <th>{tab === 'guests' ? 'Phone' : 'Status'}</th>
            <th>{tab === 'guests' ? 'Email' : 'Dates'}</th>
            <th></th>
          </tr></thead>
          <tbody>
            {visible.map((r) => (
              <tr key={r.id}>
                <td>{tab === 'guests' ? String(r.name) : r.id.slice(0, 8)}</td>
                <td>{tab === 'guests' ? String(r.phone) : String(r.status)}</td>
                <td>{tab === 'guests' ? String(r.email ?? '—') : `${String(r.checkIn ?? '')} → ${String(r.checkOut ?? '')}`}</td>
                <td>
                  {tab === 'enquiries' && <button type="button" onClick={() => openEnquiry(r)}>Open</button>}
                  {tab === 'bookings' && (BOOKING_NEXT[String(r.status)] ?? []).map((n) => (
                    <button key={n} type="button" onClick={() => doBookingAction(r.id, n)}>{n}</button>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {visible.length === 0 && tab !== 'rooms' && <p>No records.</p>}

      {selected && tab === 'enquiries' && (
        <section>
          <h2>Enquiry {selected.id.slice(0, 8)}</h2>
          <p>Status: {String(selected.status)} · Guests: {String(selected.partySize)} · Long stay: {selected.longStay ? 'Yes' : 'No'}</p>
          <p>Dates: {String(selected.checkIn)} → {String(selected.checkOut)}</p>
          <p>Rate snapshot: {String(selected.currency)} {String(selected.quotedRate)} · Source: {String(selected.source ?? 'web')}</p>
          {selected.message ? <p>Message: {String(selected.message)}</p> : null}
          {guest && <p>Guest: {String(guest.name)} · {String(guest.phone)}{guest.email ? ` · ${String(guest.email)}` : ''}</p>}
          <p>Created: {fmtDate(selected.createdAt)}</p>
          <label>Internal note<input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional note" /></label>
          <div className="row">
            {(ENQUIRY_NEXT[String(selected.status)] ?? []).map((n) => (
              <button key={n} type="button" disabled={busy} onClick={() => doEnquiryAction(n)}>{n}</button>
            ))}
            {(selected.status === 'PENDING' || selected.status === 'CONFIRMED') && (
              <button type="button" disabled={busy} onClick={doConvert}>Convert to booking</button>
            )}
          </div>
        </section>
      )}
    </main>
  );
}
