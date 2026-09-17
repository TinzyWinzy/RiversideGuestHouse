// Canonical property constants (mirror schema/seed.property.json). Single source for UI copy.
export const PROPERTY = {
  name: 'Riverside Guest House',
  addressText: '22418 Riverside Park, Ruwa Zimbabwe',
  lat: -17.876727,
  lng: 31.228801,
  searchUrl: 'https://www.google.com/maps/search/?api=1&query=-17.876727,31.228801',
  dirUrl: 'https://www.google.com/maps/dir/?api=1&destination=-17.876727,31.228801',
  contactPhone: '+263774114599',
  whatsappNumber: '+263774114599',
  waLink: 'https://wa.me/263774114599',
  startingPriceText: 'From US$20/night',
  navigationLandmarks: 'Near KFC/Steers food courts, Mutare Road, Ruwa',
} as const;

export const ACCOMMODATION = [
  { id: 'ordinary-room', type: 'ordinary', name: 'Ordinary Room', rate: 20, currency: 'USD' },
  { id: 'ensuite-room', type: 'ensuite', name: 'Ensuite Room', rate: 30, currency: 'USD' },
] as const;

export function buildLocalWhatsappPreview(ref: string, name: string, room: string): string {
  const text = `Hello Riverside Guest House,\n\nI would like to enquire about accommodation.\n\nRef: ${ref}\nName: ${name}\nRoom: ${room}\n\nPlease confirm availability and pricing.`;
  return `https://wa.me/263774114599?text=${encodeURIComponent(text)}`;
}
