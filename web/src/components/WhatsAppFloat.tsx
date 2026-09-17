import { generalEnquiry } from '../lib/whatsapp';

// Always-on-top floating WhatsApp button: real glyph, brand green, instant display.
export function WhatsAppFloat() {
  return (
    <a
      href={generalEnquiry('Floating button')}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat to Riverside Guest House on WhatsApp"
      className="wa-float"
    >
      <svg viewBox="0 0 32 32" width="30" height="30" aria-hidden="true">
        <path
          fill="#fff"
          d="M16 3C9.4 3 4 8.4 4 15c0 2.4.7 4.6 1.9 6.5L4 29l7.7-1.8c1.8 1 3.9 1.6 6.1 1.6h.2c6.6 0 12-5.4 12-12S22.6 3 16 3zm0 21.8c-1.9 0-3.7-.5-5.3-1.5l-.4-.2-4.5 1.1 1.1-4.4-.3-.4c-1.1-1.7-1.7-3.6-1.7-5.6 0-5.4 4.4-9.8 9.9-9.8s9.9 4.4 9.9 9.8-4.5 9.9-9.7 9.9zm5.4-7.4c-.3-.2-1.8-.9-2-1-.3-.1-.5-.2-.7.1-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-.3-.2-1.2-.4-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6.2-.2.2-.7.9-.9 1.2-.2.3-.3.3-.6.2-.3-.1-1.2-.4-2.4-1.4-.9-.8-1.5-1.8-1.6-2-.2-.3 0-.4.1-.6l.6-.7c.2-.2.2-.4.4-.6.1-.2 0-.4 0-.6L9.7 9c-.3-.6-.5-.5-.7-.6h-.6c-.2 0-.6.2-.9.6-.3.3-1.1 1.1-1.1 2.7s1.2 3.1 1.3 3.4c.2.2 2.3 3.5 5.5 4.9 3.7 1.6 3.7 1.1 4.4 1 .7-.1 2.1-.9 2.4-1.7.3-.9.3-1.6.2-1.7-.1-.2-.3-.2-.6-.4z"
        />
      </svg>
    </a>
  );
}
