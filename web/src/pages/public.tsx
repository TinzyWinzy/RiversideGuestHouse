import { PROPERTY as FALLBACK } from '../lib/property';
import { fromPrice, useAccommodations, useProperty } from '../lib/content';
import { GALLERY, ROOM_IMAGES, ROOM_SIZES, gridImg } from '../lib/images';
import { Button } from '../components/Button';
import { MapEmbed } from '../components/MapEmbed';
import { RoomCard } from '../components/RoomCard';
import { BedIcon, BriefcaseIcon, CarIcon, DropletIcon, FlameIcon, LockIcon, SunIcon, UserPlusIcon, UsersIcon, WhatsAppIcon, WifiIcon } from '../components/icons';

export function Notice({ error }: { error: string | null }) {
  if (!error) return null;
  return <p role="note">{error}</p>;
}

/* ── Home Page ── */
export function Home() {
  const prop = useProperty();
  const rooms = useAccommodations();
  const p = prop.data;

  return (
    <div>
      {/* ── HERO ── */}
      <section className="hero" aria-label="Welcome to Riverside Guest House">
        <div className="hero-bg" role="img" aria-label="Riverside Guest House exterior — tranquil grounds in Ruwa" />
        <div className="hero-overlay" />
        <div className="hero-content">
          <div className="hero-eyebrow">Ruwa · Off Mutare Road · Zimbabwe</div>
          <h1>
            Between Harare &amp; Mutare,<br />
            a <em>quiet place</em> to rest
          </h1>
          <p className="hero-desc">
            Halfway up the road is a house that keeps its promises: power that stays on,
            water that always runs, and a rate with no surprises. Come tired; leave rested.
          </p>
          <div className="hero-cta-group">
            <Button href="/booking" id="hero-book-btn">
              <WhatsAppIcon size={18} />
              Book on WhatsApp
            </Button>
            <Button variant="ghost" href="/accommodation" id="hero-rooms-btn">
              View Rooms
            </Button>
          </div>
        </div>
        <div className="hero-scroll-hint" aria-hidden="true">Scroll</div>
      </section>

      <main>
        {prop.loading || rooms.loading ? null : null}
        <Notice error={prop.error ?? rooms.error} />

        {/* ── PRICE STRIP ── */}
        <div className="pricestrip" role="note" aria-label="Pricing summary">
          {rooms.data.length > 0 ? fromPrice(rooms.data) : p.startingPriceText}
          <span className="dot" aria-hidden="true" />
          Ruwa, on the Harare–Mutare road
          <span className="dot" aria-hidden="true" />
          The rate you see is the rate you pay
        </div>

        {p.description ? (
          <p className="home-lead">{p.description}</p>
        ) : null}

        {/* ── ROOMS & RATES ── */}
        <section aria-labelledby="rooms-heading">
          <div className="section-inner">
            <p className="section-label">Our Accommodation</p>
            <h2 id="rooms-heading">Rooms &amp; Rates</h2>

            {rooms.data.length === 0 ? (
              <p>No rooms currently listed — please WhatsApp us for availability.</p>
            ) : (
              <div className="rooms-grid">
                {rooms.data.map((a, i) => {
                  const pic = ROOM_IMAGES[i % ROOM_IMAGES.length];
                  return (
                    <RoomCard
                      key={a.id}
                      room={a}
                      img={gridImg(pic.base, pic.w, pic.h)}
                      sizes={ROOM_SIZES}
                      eager={i === 0}
                      animationDelay={`${i * 0.1}s`}
                      alt={`${a.name} interior at Riverside Guest House`}
                      bookLabel="Book Room"
                    />
                  );
                })}
              </div>
            )}

            <p style={{ marginTop: '1.5rem' }}>
              <a href="/accommodation">See all accommodation details →</a>
            </p>
          </div>
        </section>

        {/* ── WHY RIVERSIDE ── */}
        <div className="features-section" aria-labelledby="features-heading">
          <p className="section-label">Why choose us</p>
          <h2 id="features-heading">The Riverside Difference</h2>
          <div className="features-grid">
            {[
              { icon: SunIcon, title: 'Solar Backup', desc: 'Load-shedding visits the neighbourhood. The light in your room doesn\u2019t blink.' },
              { icon: DropletIcon, title: 'Borehole Water', desc: 'When city water stutters, ours doesn\u2019t. The showers stay hot.' },
              { icon: LockIcon, title: 'Secure Parking', desc: 'Gate in, key out. Your car rests as soundly as you do.' },
              { icon: BedIcon, title: 'Fresh Linen', desc: 'Crisp linen and honest housekeeping, ready before you arrive.' },
              { icon: FlameIcon, title: 'Braai Area', desc: 'Evenings end around the fire. The stories are on the house.' },
              { icon: WifiIcon, title: 'High-Speed Wi-Fi', desc: 'Morning calls, evening calls — the line holds, power cut or not.' },
            ].map((f) => (
              <div key={f.title} className="feature-item">
                <div className="feature-icon" aria-hidden="true"><f.icon size={20} /></div>
                <div className="feature-text">
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── PHOTO GALLERY ── */}
        <section className="gallery-section" aria-labelledby="gallery-heading">
          <div className="section-inner">
            <p className="section-label">A look around the house</p>
            <h2 id="gallery-heading">A Place to Call Home</h2>
            <div className="gallery-grid">
              {GALLERY.map((g) => (
                <div key={g.base} className={g.base === 'grounds' ? 'gallery-item featured' : 'gallery-item'}>
                  <img
                    {...gridImg(g.base, g.w, g.h)}
                    alt={g.alt}
                    loading="lazy"
                    sizes={g.sizes}
                  />
                </div>
              ))}
            </div>
            <p style={{ marginTop: '1rem' }}>
              <a href="/accommodation">Explore all rooms and photos →</a>
            </p>
          </div>
        </section>

        {/* ── WHO IT'S FOR ── */}
        <section className="guests-section" aria-labelledby="guests-heading">
          <div className="section-inner">
            <p className="section-label">Perfect for</p>
            <h2 id="guests-heading">Who Stays at Riverside</h2>
            <div className="guests-grid">
              {[
                { icon: BriefcaseIcon, label: 'Business Travellers', sub: 'Rooms quiet enough for a morning of calls' },
                { icon: UsersIcon, label: 'Couples & Singles', sub: 'A clean, private room and a restful night' },
                { icon: CarIcon, label: 'Mutare Road Travellers', sub: 'An easy stop between Harare and Mutare' },
                { icon: UserPlusIcon, label: 'Families & Groups', sub: 'Several rooms, a garden, room to gather' },
              ].map((g) => (
                <div key={g.label} className="guest-card">
                  <div className="guest-icon" aria-hidden="true"><g.icon size={20} /></div>
                  <div>
                    <div className="guest-label">{g.label}</div>
                    <div className="guest-sublabel">{g.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── LONG STAYS ── */}
        <div className="longestay-banner" role="complementary" aria-label="Long stay enquiry">
          <div>
            <p className="section-label" style={{ color: 'var(--accent)' }}>Extended stays</p>
            <h2 style={{ fontSize: '1.5rem' }}>Staying a while?</h2>
            <p>{p.longStayMessage ?? 'Send us your dates and we\u2019ll work out a rate that makes coming back easier.'}</p>
          </div>
          <Button href="/booking" className="longestay-btn" id="longestay-enquire-btn">
            Enquire About Long Stay
          </Button>
        </div>

        {/* ── LOCATION ── */}
        <section aria-labelledby="location-heading">
          <div className="section-inner">
            <p className="section-label">Find us</p>
            <h2 id="location-heading">Location</h2>
            <div className="location-card">
              <div className="location-map-placeholder">
                <img
                  {...gridImg('exterior-gate')}
                  alt="Riverside Guest House entrance gate"
                  loading="lazy"
                  sizes="(min-width: 64rem) 40vw, 100vw"
                />
              </div>
              <div className="location-info">
                <p style={{ fontWeight: 600, color: 'var(--brand)' }}>{p.addressText}</p>
                <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>{p.navigationLandmarks}</p>
                <p>
                  <Button size="sm" variant="outline" href="/location" className="map-cta">Maps &amp; Directions →</Button>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── GUEST REVIEWS ── */}
        <section aria-labelledby="reviews-heading">
          <div className="section-inner">
            <p className="section-label">Guest experiences</p>
            <h2 id="reviews-heading">What Our Guests Say</h2>
            <p style={{ color: 'var(--muted)', fontSize: '0.93rem' }}>
              Good guesthouses are built on word of mouth. If you&rsquo;ve stayed, tell the next traveller
              what it was like — a line from you means everything to them.
            </p>
            <p>
              <Button
                size="sm"
                variant="outline"
                href={`https://wa.me/${p.whatsappNumber.replace('+', '')}?text=${encodeURIComponent('Hello Riverside, I would like to leave a review of my stay.')}`}
                external
                id="leave-review-btn"
              >
                Share Your Experience on WhatsApp
              </Button>
            </p>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section aria-labelledby="faq-heading">
          <div className="section-inner">
            <p className="section-label">Common questions</p>
            <h2 id="faq-heading">Frequently Asked</h2>
            <div className="faq-list">
              {[
                {
                  q: 'Is there power during load-shedding?',
                  a: 'Yes — the property has solar backup, so lights, WiFi and charging keep working throughout any load-shedding schedule.',
                },
                {
                  q: 'Is water reliable?',
                  a: 'Yes — prolific borehole water, plus reliable hot showers at all times.',
                },
                {
                  q: 'Is it safe and quiet enough for work calls?',
                  a: 'Yes — secure, spacious parking in a quiet, affluent Ruwa suburb. Rooms are peaceful and ideal as a workspace.',
                },
                {
                  q: 'How do I check in?',
                  a: 'Self check-in. Management confirms your arrival details on WhatsApp after you enquire.',
                },
                {
                  q: 'What is the cancellation policy?',
                  a: 'Ask on WhatsApp when you enquire — the policy is confirmed with your booking. No hidden fees, ever.',
                },
              ].map(({ q, a }) => (
                <details key={q}>
                  <summary>{q}</summary>
                  <p>{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

/* ── Accommodation Page ── */
export function Accommodation() {
  const rooms = useAccommodations();
  if (rooms.loading) return <main><p>Loading rooms…</p></main>;
  return (
    <div className="accom-page">
      <section className="accom-hero" aria-labelledby="accom-heading">
        <img {...gridImg('room-double-1')} alt="Riverside Guest House room interior" loading="eager" sizes="100vw" />
        <div className="accom-hero-overlay">
          <div>
            <h1 id="accom-heading">Accommodation</h1>
            <p className="accom-hero-sub">Quiet en-suite rooms · Solar backup · Borehole water · Secure parking</p>
          </div>
        </div>
      </section>
      <main>
        <Notice error={rooms.error} />
        <p className="accom-intro">
          Rooms are simple the way good rooms are — warm wood ceilings, an en-suite bathroom, and a bed that
          ends a long day well. Rates are per room, per night, and confirmed on WhatsApp before you travel.
        </p>
        {rooms.data.length === 0 ? (
          <p>No rooms currently listed — please WhatsApp us on {FALLBACK.contactPhone} for availability.</p>
        ) : (
          <div className="rooms-grid">
            {rooms.data.map((a, i) => {
              const pic = ROOM_IMAGES[i % ROOM_IMAGES.length];
              return (
                <RoomCard
                  key={a.id}
                  room={a}
                  img={gridImg(pic.base, pic.w, pic.h)}
                  sizes={ROOM_SIZES}
                  eager={i === 0}
                  animationDelay={`${i * 0.08}s`}
                  alt={`${a.name} at Riverside Guest House`}
                  facilitiesLine
                  bookLabel={`Enquire about ${a.name}`}
                />
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

/* ── Location Page ── */
export function Location() {
  const prop = useProperty();
  const p = prop.data;
  return (
    <main>
      <div className="section-inner" style={{ borderTop: 'none', paddingTop: '2rem' }}>
        <p className="section-label">Find us</p>
        <h1>Location &amp; Directions</h1>
        <Notice error={prop.error} />
        <div className="location-card">
          <MapEmbed className="location-map" />
          <div className="location-info location-detail">
            <p style={{ fontWeight: 600, color: 'var(--brand)', fontSize: '1rem' }}>{p.addressText}</p>
            <p>
              <Button href={p.dirUrl} className="directions-btn" id="get-directions-btn">
                Get Directions (Google Maps)
              </Button>
            </p>
            <p style={{ marginTop: '1rem', color: 'var(--muted)', fontSize: '0.9rem' }}>
              <strong>Landmark navigation:</strong> {p.navigationLandmarks}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

/* ── Privacy Page ── */
export function Privacy() {
  const prop = useProperty();
  return (
    <main>
      <div className="section-inner" style={{ borderTop: 'none', paddingTop: '2rem' }}>
        <h1>Privacy Policy</h1>
        <p>We collect name, phone, optional email, dates, party size and message to handle your enquiry.</p>
        <p>We keep enquiry records to run the guesthouse and respond to you. Contact us on {prop.data.contactPhone} to ask what we hold or request deletion.</p>
      </div>
    </main>
  );
}

/* ── Not Found Page ── */
export function NotFound() {
  return (
    <main>
      <div className="section-inner notfound" style={{ borderTop: 'none', paddingTop: '3rem', textAlign: 'center' }}>
        <p className="section-label">404</p>
        <h1>Lost on Mutare Road?</h1>
        <p style={{ color: 'var(--muted)', maxWidth: '30rem', margin: '0 auto' }}>
          This page isn&rsquo;t here. The good news: Riverside Guest House is easy to find.
          Head back to one of these:
        </p>
        <div className="notfound-links" style={{ marginTop: '1.5rem' }}>
          <Button href="/" id="back-home-btn">Back to Home</Button>
          <Button variant="outline" href="/accommodation">Rooms &amp; Rates</Button>
          <Button variant="outline" href="/location">Location &amp; Directions</Button>
          <Button variant="outline" href="/booking">Book on WhatsApp</Button>
        </div>
      </div>
    </main>
  );
}
