import { expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { WhatsAppFloat } from '../components/WhatsAppFloat';
import { DropletIcon, LockIcon, MessageIcon, SunIcon } from '../components/icons';
import { Accommodation, Home, Location, Privacy } from './public';
import { Booking } from './booking';

vi.mock('../lib/content', () => {
  const room = {
    id: 'ordinary-room',
    type: 'ordinary',
    name: 'Double Room',
    description: 'Spacious with garden views.',
    capacity: 2,
    rate: 55,
    currency: 'USD',
    amenities: ['Wi-Fi', 'Solar power', 'Hot shower', 'Fresh linen', 'Parking'],
    images: [],
    active: true,
  };
  const property = {
    name: 'Riverside Guest House',
    description: 'A quiet boutique retreat.',
    addressText: '12 Mutare Road, Ruwa',
    facilities: ['Solar Backup', 'Borehole Water', 'Secure Parking'],
    contactPhone: '0774114599',
    whatsappNumber: '263774114599',
    startingPriceText: 'From US$55/night',
    longStayMessage: null,
    navigationLandmarks: 'Ruwa turnoff, Mutare Road',
    dirUrl: 'https://maps.google.com/?q=Riverside',
    searchUrl: 'https://goo.gl/maps',
  };
  return {
    useProperty: () => ({ data: property, loading: false, error: null, live: false }),
    useAccommodations: () => ({ data: [room], loading: false, error: null, live: false }),
    fromPrice: (rooms: { rate: number }[]) =>
      rooms.length ? `From US$${Math.min(...rooms.map((r) => r.rate))}/night` : '',
  };
});

vi.mock('../lib/enquiry', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../lib/enquiry')>();
  return { ...actual, submitEnquiry: vi.fn() };
});

function renderApp(ui: React.ReactNode, route = '/') {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <div className="trustbar" role="region" aria-label="Property highlights">
        <span className="trustbar-item"><SunIcon size={13} /> Solar Backup</span>
        <span className="trustbar-item"><DropletIcon size={13} /> Borehole Water</span>
        <span className="trustbar-item"><LockIcon size={13} /> Secure Parking</span>
        <span className="trustbar-item"><MessageIcon size={13} /> Book Direct — No Hidden Fees</span>
      </div>
      <Navbar />
      {ui}
      <WhatsAppFloat />
    </MemoryRouter>,
  );
}

const AXE_OPTIONS = { iframes: false };

it.each([
  ['home', <Home key="home" />, '/'],
  ['accommodation', <Accommodation key="acc" />, '/accommodation'],
  ['location', <Location key="loc" />, '/location'],
  ['privacy', <Privacy key="privacy" />, '/privacy'],
] as const)('%s page has no axe violations', async (_name, ui, route) => {
  renderApp(ui, route);
  const results = await axe(document.body, AXE_OPTIONS);
  expect(results).toHaveNoViolations();
});

it('booking form has no axe violations', async () => {
  renderApp(<Booking key="booking" />, '/booking');
  const results = await axe(document.body, AXE_OPTIONS);
  expect(results).toHaveNoViolations();
});

it('open mobile menu has no axe violations', async () => {
  const user = userEvent.setup();
  renderApp(<Home key="home" />, '/');
  await user.click(screen.getByRole('button', { name: 'Open menu' }));
  expect(screen.getByRole('navigation', { name: 'Mobile navigation' })).toBeInTheDocument();
  const results = await axe(document.body, AXE_OPTIONS);
  expect(results).toHaveNoViolations();
});