import { Link, NavLink } from 'react-router-dom';
import { Bus } from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
  return (
    <header className="navbar">
      <div className="container navbar__inner">
        <Link to="/" className="navbar__brand">
          <span className="navbar__logo"><Bus size={22} /></span>
          FastTrip
        </Link>

        <nav className="navbar__links">
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/routes">Routes</NavLink>
        </nav>
      </div>
    </header>
  );
}