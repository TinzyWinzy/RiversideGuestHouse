// Post-build SSG fallback: clone index.html per public route, inject per-page
// title/meta + LodgingBusiness JSON-LD, emit sitemap.xml + robots.txt.
// Upgrade path: replace with Vike pre-render for fully inlined route content.
import { copyFileSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const base = process.env.SITE_URL ?? 'https://riverside.example';

const routes = {
  'index.html': { title: 'Riverside Guest House — Ruwa Accommodation from US$20/night', desc: 'Quiet business-ready guesthouse, 22418 Riverside Park Ruwa. Ordinary US$20, Ensuite US$30 per room/night.' },
  'accommodation.html': { title: 'Rooms & Rates — Riverside Guest House Ruwa', desc: 'Ordinary Room US$20/night, Ensuite Room US$30/night. Per-room pricing, no hidden fees.' },
  'location.html': { title: 'Location & Directions — Riverside Guest House, Ruwa', desc: '22418 Riverside Park, Ruwa. Near KFC/Steers, Mutare Road. Maps directions + landmark fallback.' },
};

const jsonLd = `<script type="application/ld+json">${JSON.stringify({
  '@context': 'https://schema.org', '@type': 'LodgingBusiness', name: 'Riverside Guest House',
  address: '22418 Riverside Park, Ruwa Zimbabwe',
  geo: { '@type': 'GeoCoordinates', latitude: -17.876727, longitude: 31.228801 },
  telephone: '+263774114599', priceRange: 'USD 20-30',
})}</script>`;

const faqLd = `<script type="application/ld+json">${JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'Is there power during load-shedding?', acceptedAnswer: { '@type': 'Answer', text: 'Yes — the property has solar backup.' } },
    { '@type': 'Question', name: 'Is water reliable?', acceptedAnswer: { '@type': 'Answer', text: 'Yes — prolific borehole water, plus hot showers.' } },
    { '@type': 'Question', name: 'Is it safe and quiet enough for work calls?', acceptedAnswer: { '@type': 'Answer', text: 'Yes — secure parking in an affluent Ruwa suburb, quiet workspace-ready rooms.' } },
    { '@type': 'Question', name: 'How do I check in?', acceptedAnswer: { '@type': 'Answer', text: 'Self check-in, with arrival details confirmed on WhatsApp.' } },
    { '@type': 'Question', name: 'What is the cancellation policy?', acceptedAnswer: { '@type': 'Answer', text: 'Confirmed with your booking on WhatsApp. No hidden fees.' } },
  ],
})}</script>`;

for (const [file, meta] of Object.entries(routes)) {
  if (file !== 'index.html') copyFileSync(join(dist, 'index.html'), join(dist, file));
  let html = readFileSync(join(dist, file), 'utf8');
  html = html.replace(/<title>.*?<\/title>/, () => `<title>${meta.title}</title>`);
  html = html.replace(/(<meta name="description" content=")[^"]*(")/, (_m, p1, p2) => `${p1}${meta.desc}${p2}`);
  if (!html.includes('application/ld+json')) html = html.replace('</head>', `${jsonLd}</head>`);
  if (file === 'index.html' && !html.includes('FAQPage')) html = html.replace('</head>', `${faqLd}</head>`);
  html = html.replace(/(<meta property="og:image" content=")[^"]*(")/, (_m, p1, p2) => `${p1}${base}/brand-banner.jpg${p2}`);
  writeFileSync(join(dist, file), html);
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${['/', '/accommodation', '/location', '/booking', '/privacy'].map((p) => `<url><loc>${base}${p}</loc></url>`).join('')}</urlset>`;
writeFileSync(join(dist, 'sitemap.xml'), sitemap);
writeFileSync(join(dist, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${base}/sitemap.xml\n`);
console.log('postbuild: SSG fallback + sitemap/robots/JSON-LD done.');
