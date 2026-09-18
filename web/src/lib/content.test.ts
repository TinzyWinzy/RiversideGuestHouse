import { describe, expect, it } from 'vitest';
import { fromPrice, type RoomContent } from './content';

const room = (rate: number): RoomContent => ({
  id: 'r',
  type: 'ordinary',
  name: 'Room',
  description: null,
  capacity: null,
  rate,
  currency: 'USD',
  amenities: [],
  images: [],
  active: true,
});

describe('fromPrice', () => {
  it('derives "From US$X/night" from the minimum rate', () => {
    expect(fromPrice([room(30), room(20)])).toBe('From US$20/night');
  });

  it('honours a non-USD currency', () => {
    expect(fromPrice([room(20)], 'ZWL')).toBe('From ZWL 20/night');
  });

  it('returns empty when no rooms', () => {
    expect(fromPrice([])).toBe('');
  });
});