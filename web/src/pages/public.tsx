import { PROPERTY as FALLBACK } from '../lib/property';
import { fromPrice, useAccommodations, useProperty } from '../lib/content';
import { buildDraftMessage, waLink } from '../lib/whatsapp';

export function Notice({ error }: { error: string | null }) {
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
      <img src="/brand-banner.jpg" alt="Riverside Guest House Lodge — let us accommodate you. Stand 22418, Riverside Park, Ruwa." width="1080" height="523" loading="eager" />
      <p className="pricestrip">{rooms.data.length > 0 ? fromPrice(rooms.data) : p.startingPriceText} · Ruwa, off Mutare Road · No hidden fees</p>
      {p.description ? <p>{p.description}</p> : null}
      <p>
        <a className="btn" href="/booking">Book on WhatsApp</a>{' '}
        <a href="/accommodation">View rooms</a>
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

      <section>
        <h2>Guest reviews</h2>
        <p>No public reviews yet — stayed with us recently?</p>
        <p><a href={`https://wa.me/${p.whatsappNumber.replace('+', '')}?text=${encodeURIComponent('Hello Riverside, I would like to leave a review of my stay.')}`} target="_blank" rel="noreferrer">Share your experience on WhatsApp</a></p>
      </section>

      <section>
        <h2>Common questions</h2>
        <details>
          <summary>Is there power during load-shedding?</summary>
          <p>Yes — the property has solar backup, so lights, WiFi and charging keep working.</p>
        </details>
        <details>
          <summary>Is water reliable?</summary>
          <p>Yes — prolific borehole water, plus hot showers.</p>
        </details>
        <details>
          <summary>Is it safe and quiet enough for work calls?</summary>
          <p>Yes — secure, spacious parking in an affluent Ruwa suburb, and quiet rooms suitable as a workspace.</p>
        </details>
        <details>
          <summary>How do I check in?</summary>
          <p>Self check-in. Management confirms your arrival details on WhatsApp after you enquire.</p>
        </details>
        <details>
          <summary>What is the cancellation policy?</summary>
          <p>Ask on WhatsApp when you enquire — the policy is confirmed with your booking. No hidden fees, ever.</p>
        </details>
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
            <p>{a.description ?? 'Comfortable, quiet room. Full details and photos coming soon.'}</p>
            <p>
              {a.capacity ? `Sleeps ${a.capacity} · ` : ''}US${a.rate}/night per room · Solar backup · WiFi · Secure parking
            </p>
            {a.amenities.length > 0 ? <ul>{a.amenities.map((m) => <li key={m}>{m}</li>)}</ul> : null}
            <p>
              <a className="btn" href="/booking">Enquire about {a.name}</a>{' '}
              <a
                href={waLink(buildDraftMessage({ roomName: a.name, nightlyRate: a.rate, source: `Room: ${a.name}` }))}
                target="_blank"
                rel="noreferrer"
              >
                Ask on WhatsApp
              </a>
            </p>
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

export function NotFound() {
  return (
    <main>
      <h1>Page not found</h1>
      <p>That address doesn&rsquo;t exist. Start over:</p>
      <p><a className="btn" href="/">Back to Riverside Guest House</a></p>
    </main>
  );
}
