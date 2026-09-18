import { expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RoomCard } from './RoomCard';
import type { RoomContent } from '../lib/content';

const room: RoomContent = {
  id: 'ordinary-room',
  type: 'ordinary',
  name: 'Double Room',
  description: 'Spacious with garden views.',
  capacity: 2,
  rate: 55,
  currency: 'USD',
  amenities: ['Wi-Fi', 'Solar power'],
  images: [],
  active: true,
};

const img = { src: '/images/room-double-1-640w.jpg', srcSet: 'a 640w, b 1280w', width: 1024, height: 768 };

function renderCard(overrides: Partial<Parameters<typeof RoomCard>[0]> = {}) {
  return render(
    <RoomCard
      room={room}
      img={img}
      sizes="(min-width:64rem) 33vw, 100vw"
      eager={false}
      animationDelay="0s"
      alt="Double Room interior at Riverside Guest House"
      {...overrides}
    />,
  );
}

it('renders room name, rate and capacity', () => {
  renderCard();
  expect(screen.getByText('Double Room')).toBeInTheDocument();
  expect(screen.getByText('US$55/night')).toBeInTheDocument();
  expect(screen.getByText('US$55/night per room · Sleeps 2')).toBeInTheDocument();
});

it('uses a helpful fallback description when none is set', () => {
  renderCard({ room: { ...room, description: null } });
  expect(screen.getByText(/warm wood-panelled ceiling/)).toBeInTheDocument();
});

it('lists amenities from the room, falling back to defaults', () => {
  renderCard();
  expect(screen.getByText('Wi-Fi')).toBeInTheDocument();
  expect(screen.getByText('Solar power')).toBeInTheDocument();
  renderCard({ room: { ...room, amenities: [] } });
  expect(screen.getAllByText('Fresh linen').length).toBeGreaterThan(0);
});

it('only shows the facilities line when requested', () => {
  renderCard();
  expect(screen.queryByText(/Solar backup · WiFi · Secure parking/)).not.toBeInTheDocument();
  renderCard({ facilitiesLine: true });
  expect(screen.getAllByText(/Solar backup · WiFi · Secure parking/).length).toBeGreaterThan(0);
});

it('renders a booking CTA with the requested label and a WhatsApp handoff', () => {
  renderCard({ bookLabel: 'Enquire about Double Room' });
  expect(screen.getByRole('link', { name: 'Enquire about Double Room' })).toHaveAttribute('href', '/booking');
  const wa = screen.getByRole('link', { name: 'Ask on WhatsApp' });
  expect(wa).toHaveAttribute('href', expect.stringContaining('wa.me'));
  expect(wa).toHaveAttribute('target', '_blank');
});

it('does not lazy-load the first card when eager', () => {
  const { container } = renderCard({ eager: true });
  expect(container.querySelector('img')).toHaveAttribute('loading', 'eager');
});