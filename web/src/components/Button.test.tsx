import { expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

it('renders an anchor when given an href', () => {
  render(<Button href="/booking">Book Now</Button>);
  const link = screen.getByRole('link', { name: 'Book Now' });
  expect(link).toHaveAttribute('href', '/booking');
  expect(link).toBeInTheDocument();
});

it('renders a button with type="button" by default (never accidentally submits)', () => {
  render(<Button>Send</Button>);
  const btn = screen.getByRole('button', { name: 'Send' });
  expect(btn).toHaveAttribute('type', 'button');
});

it('supports explicit submit type', () => {
  render(<Button type="submit">Send Enquiry →</Button>);
  expect(screen.getByRole('button', { name: 'Send Enquiry →' })).toHaveAttribute('type', 'submit');
});

it('opens external links safely', () => {
  render(<Button href="https://wa.me/263774114599" external>WhatsApp</Button>);
  const link = screen.getByRole('link', { name: 'WhatsApp' });
  expect(link).toHaveAttribute('target', '_blank');
  expect(link).toHaveAttribute('rel', 'noreferrer');
});

it('does not add target when not external', () => {
  render(<Button href="/privacy">Privacy</Button>);
  expect(screen.getByRole('link', { name: 'Privacy' })).not.toHaveAttribute('target');
});

it('applies variant and size classes with the base button class', () => {
  const { container } = render(
    <Button variant="outline" size="sm">Small</Button>,
  );
  expect(container.querySelector('button')).toHaveClass('btn', 'btn-outline', 'btn-sm');
});

it('merges an extra className and forwards id', () => {
  render(<Button href="/" className="hero-cta" id="hero-book-btn">Go</Button>);
  const link = screen.getByRole('link', { name: 'Go' });
  expect(link).toHaveClass('btn', 'hero-cta');
  expect(link).toHaveAttribute('id', 'hero-book-btn');
});

it('forwards disabled state on buttons', () => {
  render(<Button disabled>Sending…</Button>);
  expect(screen.getByRole('button', { name: 'Sending…' })).toBeDisabled();
});