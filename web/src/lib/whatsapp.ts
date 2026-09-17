// Structured WhatsApp templates (CityView-inspired): every CTA carries context +
// page attribution so management replies faster with fewer round-trips.
const WA_NUM = '263774114599';

export interface DraftDetails {
  roomName: string;
  checkIn?: string;
  checkOut?: string;
  partySize?: number;
  nightlyRate?: number;
  longStay?: boolean;
  source: string; // e.g. 'Home hero', 'Room: Ensuite', 'Floating button'
}

export function buildDraftMessage(d: DraftDetails): string {
  const lines = [
    `Hello Riverside Guest House, I would like to enquire about the *${d.roomName}*.`,
    `Could you please check availability?`,
  ];
  if (d.checkIn && d.checkOut) {
    const nights = Math.max(
      0,
      Math.round((new Date(d.checkOut).getTime() - new Date(d.checkIn).getTime()) / 86_400_000),
    );
    lines.push('');
    lines.push('My booking draft:');
    lines.push(`- Room: ${d.roomName}`);
    lines.push(`- Check-in: ${d.checkIn}`);
    lines.push(`- Check-out: ${d.checkOut}`);
    if (d.partySize) lines.push(`- Guests: ${d.partySize}`);
    if (d.longStay) lines.push(`- Long stay: Yes (please share discount)`);
    if (nights > 0 && d.nightlyRate) lines.push(`- Estimated total: US$${nights * d.nightlyRate} for ${nights} night${nights === 1 ? '' : 's'}`);
    lines.push('');
    lines.push('Kindly confirm availability and pricing.');
  }
  lines.push('');
  lines.push(`(Sent from: ${d.source})`);
  return lines.join('\n');
}

export function waLink(message: string): string {
  return `https://wa.me/${WA_NUM}?text=${encodeURIComponent(message)}`;
}

/** Generic fallback for chrome buttons (no draft context). */
export function generalEnquiry(source: string): string {
  return waLink(`Hello Riverside Guest House, I would like to enquire about accommodation.\n\n(Sent from: ${source})`);
}
