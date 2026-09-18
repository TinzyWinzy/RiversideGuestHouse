import { generalEnquiry } from '../lib/whatsapp';
import { WhatsAppIcon } from './icons';

// Always-on-top floating WhatsApp button: brand green, instant display.
export function WhatsAppFloat() {
  return (
    <aside aria-label="Quick contact">
      <a
        href={generalEnquiry('Floating button')}
        target="_blank"
        rel="noreferrer"
        aria-label="Chat to Riverside Guest House on WhatsApp"
        className="wa-float"
      >
        <WhatsAppIcon size={30} />
      </a>
    </aside>
  );
}