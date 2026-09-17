import { Suspense, lazy } from 'react';
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import { Accommodation, Home, Location, NotFound, Privacy } from './pages/public';

const Booking = lazy(() => import('./pages/booking').then((m) => ({ default: m.Booking })));
const Admin = lazy(() => import('./pages/admin').then((m) => ({ default: m.Admin })));

export function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/">Home</Link> · <Link to="/accommodation">Rooms</Link> ·{' '}
        <Link to="/location">Location</Link> · <Link to="/booking" className="cta">Enquire</Link> ·{' '}
        <Link to="/privacy">Privacy</Link>
      </nav>
      <Suspense fallback={<main><p>Loading…</p></main>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/accommodation" element={<Accommodation />} />
          <Route path="/location" element={<Location />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/admin/*" element={<Admin />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
