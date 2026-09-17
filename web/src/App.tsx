import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import { Accommodation, Booking, Home, Location, Privacy } from './pages/public';
import { Admin } from './pages/admin';

export function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/">Home</Link> · <Link to="/accommodation">Rooms</Link> ·{' '}
        <Link to="/location">Location</Link> · <Link to="/booking">Enquire</Link> ·{' '}
        <Link to="/privacy">Privacy</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/accommodation" element={<Accommodation />} />
        <Route path="/location" element={<Location />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/admin/*" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  );
}
