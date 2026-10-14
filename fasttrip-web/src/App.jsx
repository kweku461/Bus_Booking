import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Home from './pages/Home.jsx';
import RoutesPage from './pages/RoutesPage.jsx';
import Seats from './pages/Seats.jsx';
import PaymentCallback from './pages/PaymentCallback.jsx';
import Confirmation from './pages/Confirmation.jsx';
import ManageTickets from './pages/ManageTickets.jsx';

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/routes" element={<RoutesPage />} />
        <Route path="/trips/:id" element={<Seats />} />
        <Route path="/payment/callback" element={<PaymentCallback />} />
        <Route path="/confirmation" element={<Confirmation />} />
        <Route path="/manage-tickets" element={<ManageTickets />} />
      </Routes>
    </>
  );
}