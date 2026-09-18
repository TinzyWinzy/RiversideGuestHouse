import { cn } from '../lib/cn';
import type { RoomContent } from '../lib/content';
import type { Img } from '../lib/images';
import { buildDraftMessage, waLink } from '../lib/whatsapp';
import { Button } from './Button';

const FALLBACK_DESC = 'A restful room with a warm wood-panelled ceiling, en-suite bathroom and garden views.';
const FALLBACK_AMENITIES = ['Wi-Fi', 'Solar power', 'Hot shower', 'Fresh linen', 'Parking'];

interface RoomCardProps {
  room: RoomContent;
  img: Img;
  sizes: string;
  eager: boolean;
  animationDelay: string;
  alt: string;
  facilitiesLine?: boolean;
  bookLabel?: string;
}

/** Room teaser card shared by the Home and Accommodation pages. */
export function RoomCard({
  room,
  img,
  sizes,
  eager,
  animationDelay,
  alt,
  facilitiesLine = false,
  bookLabel = 'Book Room',
}: RoomCardProps) {
  return (
    <article className="room-card" style={{ animationDelay }}>
      <div className="room-card-img">
        <img {...img} alt={alt} loading={eager ? 'eager' : 'lazy'} sizes={sizes} />
        <span className="room-card-badge">US${room.rate}/night</span>
      </div>
      <div className="room-card-body">
        <div className="room-card-title">{room.name}</div>
        <div className="room-card-price">
          US${room.rate}/night per room{room.capacity ? ` · Sleeps ${room.capacity}` : ''}
        </div>
        <p className="room-card-desc">{room.description ?? FALLBACK_DESC}</p>
        {facilitiesLine && (
          <p className={cn('room-card-facilities')}>Solar backup · WiFi · Secure parking</p>
        )}
        <div className="room-card-amenities">
          {(room.amenities.length > 0 ? room.amenities : FALLBACK_AMENITIES).map((am) => (
            <span key={am} className="amenity-tag">{am}</span>
          ))}
        </div>
        <div className="room-card-actions">
          <Button size="sm" href="/booking">{bookLabel}</Button>
          <Button
            size="sm"
            variant="outline"
            href={waLink(buildDraftMessage({ roomName: room.name, nightlyRate: room.rate, source: `Room: ${room.name}` }))}
            external
          >
            Ask on WhatsApp
          </Button>
        </div>
      </div>
    </article>
  );
}