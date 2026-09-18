/* ── Responsive image map: room/gallery photos + intrinsic sizes (CLS hint). ── */

export type Photo = { base: string; w: number; h: number };
export type Img = { src: string; srcSet: string; width: number; height: number };

export const gridImg = (base: string, w = 1024, h = 768): Img => ({
  src: `/images/${base}-640w.jpg`,
  srcSet: `/images/${base}-640w.jpg 640w, /images/${base}-1280w.jpg 1280w, /images/${base}-1920w.jpg 1920w`,
  width: w,
  height: h,
});

export const ROOM_IMAGES: Photo[] = [
  { base: 'room-double-1', w: 1024, h: 768 },
  { base: 'room-double-2', w: 768, h: 1024 },
  { base: 'room-double-3', w: 1024, h: 768 },
  { base: 'room-double-4', w: 1024, h: 768 },
];

export const ROOM_SIZES = '(min-width: 64rem) 33vw, (min-width: 40rem) 50vw, 100vw';
export const GALLERY_SIZES = '(min-width: 64rem) 25vw, (min-width: 40rem) 33vw, 50vw';
export const FEATURED_SIZES = '(min-width: 64rem) 50vw, 100vw';

export const GALLERY: (Photo & { alt: string; sizes: string })[] = [
  { base: 'grounds', w: 1024, h: 768, alt: 'Riverside Guest House grounds and garden', sizes: FEATURED_SIZES },
  { base: 'patio', w: 1024, h: 768, alt: 'Private veranda and patio', sizes: GALLERY_SIZES },
  { base: 'room-double-3', w: 1024, h: 768, alt: 'Deluxe bedroom suite with chandelier', sizes: GALLERY_SIZES },
  { base: 'bathroom-1', w: 1024, h: 768, alt: 'En-suite bathroom with marble tiles', sizes: GALLERY_SIZES },
  { base: 'garden', w: 1024, h: 768, alt: 'Lush shaded garden retreat', sizes: GALLERY_SIZES },
  { base: 'corridor', w: 768, h: 1024, alt: 'Warm wood-panelled corridor with numbered room doors', sizes: GALLERY_SIZES },
  { base: 'bathroom-2', w: 768, h: 1024, alt: 'Private shower room', sizes: GALLERY_SIZES },
  { base: 'parking', w: 1024, h: 768, alt: 'Secure enclosed parking area', sizes: GALLERY_SIZES },
];