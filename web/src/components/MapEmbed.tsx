import { PROPERTY } from '../lib/property';

const { lat, lng } = PROPERTY;
const BBOX_SIZE = 0.004;
const bbox = `${lng - BBOX_SIZE},${lat - BBOX_SIZE},${lng + BBOX_SIZE},${lat + BBOX_SIZE}`;
const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;

export function MapEmbed({ className }: { className?: string }) {
  return (
    <div className={className}>
      <iframe
        title="Riverside Guest House location on OpenStreetMap"
        src={src}
        loading="lazy"
        referrerPolicy="no-referrer"
        sandbox="allow-scripts allow-same-origin"
        style={{ border: 0, width: '100%', height: '100%', minHeight: 320 }}
      />
    </div>
  );
}