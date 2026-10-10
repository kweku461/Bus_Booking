import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Home from './pages/Home.jsx';
import Seats from './pages/Seats.jsx';
import Confirmation from './pages/Confirmation.jsx';

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/trips/:id" element={<Seats />} />
        <Route path="/Confirmation" element={<Confirmation />} />
      </Routes>
    </>
  );
}