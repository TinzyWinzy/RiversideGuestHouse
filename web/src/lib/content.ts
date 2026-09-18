import { useEffect, useState } from 'react';
import { ACCOMMODATION as FALLBACK_ROOMS, PROPERTY as FALLBACK_PROPERTY } from './property';

export interface PropertyContent {
  name: string;
  description: string;
  addressText: string;
  facilities: string[];
  contactPhone: string;
  whatsappNumber: string;
  startingPriceText: string;
  longStayMessage: string | null;
  navigationLandmarks: string;
  dirUrl: string;
  searchUrl: string;
}

export interface RoomContent {
  id: string;
  type: string;
  name: string;
  description: string | null;
  capacity: number | null;
  rate: number;
  currency: string;
  amenities: string[];
  images: string[];
  active: boolean;
}

interface ContentState<T> {
  data: T;
  loading: boolean;
  error: string | null;
  live: boolean; // false = showing baked-in fallback (offline or fetch failed)
}

function mapProperty(raw: Record<string, unknown> | undefined): PropertyContent {
  const loc = (raw?.location ?? {}) as Record<string, unknown>;
  return {
    name: (raw?.name as string) ?? FALLBACK_PROPERTY.name,
    description: (raw?.description as string) ?? '',
    addressText: (loc.addressText as string) ?? FALLBACK_PROPERTY.addressText,
    facilities: (raw?.facilities as string[]) ?? [],
    contactPhone: (raw?.contactPhone as string) ?? FALLBACK_PROPERTY.contactPhone,
    whatsappNumber: (raw?.whatsappNumber as string) ?? FALLBACK_PROPERTY.whatsappNumber,
    startingPriceText: (raw?.startingPriceText as string) ?? FALLBACK_PROPERTY.startingPriceText,
    longStayMessage: (raw?.longStayMessage as string) ?? null,
    navigationLandmarks: (raw?.navigationLandmarks as string) ?? FALLBACK_PROPERTY.navigationLandmarks,
    dirUrl: (loc.dirUrl as string) ?? FALLBACK_PROPERTY.dirUrl,
    searchUrl: (loc.searchUrl as string) ?? FALLBACK_PROPERTY.searchUrl,
  };
}

const FALLBACK_PROPERTY_CONTENT: PropertyContent = {
  ...FALLBACK_PROPERTY,
  facilities: [],
  longStayMessage: null,
  searchUrl: FALLBACK_PROPERTY.dirUrl,
};

const FALLBACK_ROOMS_CONTENT: RoomContent[] = FALLBACK_ROOMS.map((r) => ({
  ...r,
  description: null,
  capacity: null,
  amenities: [],
  images: [],
  active: true,
}));

export function useProperty(): ContentState<PropertyContent> {
  const [state, setState] = useState<ContentState<PropertyContent>>({
    data: FALLBACK_PROPERTY_CONTENT,
    loading: true,
    error: null,
    live: false,
  });
  useEffect(() => {
    let alive = true;
    // Firebase loads lazily so the landing shell paints without the SDK.
    import('./firebase')
      .then(({ db }) => import('firebase/firestore').then((fs) => ({ db, fs })))
      .then(({ db, fs }) => fs.getDoc(fs.doc(db, 'settings', 'property')))
      .then((snap) => {
        if (!alive) return;
        if (snap.exists()) setState({ data: mapProperty(snap.data()), loading: false, error: null, live: true });
        else setState({ data: FALLBACK_PROPERTY_CONTENT, loading: false, error: null, live: false });
      })
      .catch(() => {
        if (alive) setState({ data: FALLBACK_PROPERTY_CONTENT, loading: false, error: 'Showing saved info (offline).', live: false });
      });
    return () => {
      alive = false;
    };
  }, []);
  return state;
}

export function useAccommodations(): ContentState<RoomContent[]> {
  const [state, setState] = useState<ContentState<RoomContent[]>>({
    data: FALLBACK_ROOMS_CONTENT,
    loading: true,
    error: null,
    live: false,
  });
  useEffect(() => {
    let alive = true;
    import('./firebase')
      .then(({ db }) => import('firebase/firestore').then((fs) => ({ db, fs })))
      .then(({ db, fs }) => fs.getDocs(fs.query(fs.collection(db, 'accommodations'), fs.where('active', '==', true))))
      .then((snap) => {
        if (!alive) return;
        const rooms = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<RoomContent, 'id'>) }));
        setState({
          data: rooms.length > 0 ? rooms : FALLBACK_ROOMS_CONTENT,
          loading: false,
          error: null,
          live: rooms.length > 0,
        });
      })
      .catch(() => {
        if (alive) setState({ data: FALLBACK_ROOMS_CONTENT, loading: false, error: 'Showing saved rooms (offline).', live: false });
      });
    return () => {
      alive = false;
    };
  }, []);
  return state;
}

/** "From US$X/night" derived from live rates — never hard-coded. */
export function fromPrice(rooms: RoomContent[], currency = 'USD'): string {
  if (rooms.length === 0) return '';
  const min = Math.min(...rooms.map((r) => r.rate));
  return `From ${currency === 'USD' ? 'US$' : currency + ' '}${min}/night`;
}
