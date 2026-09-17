import { Suspense, lazy } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Accommodation, Home, Location, NotFound, Privacy } from './pages/public';
import { Navbar } from './components/Navbar';
import { WhatsAppFloat } from './components/WhatsAppFloat';

const Booking = lazy(() => import('./pages/booking').then((m) => ({ default: m.Booking })));
const Admin = lazy(() => import('./pages/admin').then((m) => ({ default: m.Admin })));

export function App() {
  return (
    <BrowserRouter>
      <div className="trustbar" role="note">
        Solar backup · Borehole water · Secure parking · Book direct on WhatsApp
      </div>
      <Navbar />
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
      <WhatsAppFloat />
    </BrowserRouter>
  );
}
