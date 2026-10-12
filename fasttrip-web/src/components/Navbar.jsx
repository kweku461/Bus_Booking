import { Link, NavLink } from 'react-router-dom';
import { CircleHelp, House, Map, Ticket } from 'lucide-react';
import logo from '../assets/Logo.png';
import './Navbar.css';

export default function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar__inner">
        <Link to="/" className="navbar__brand">
          <img src={logo} alt="FastTrip logo" className="navbar__logo-img" />
        </Link>

        <nav className="navbar__links" aria-label="Main navigation">
          <NavLink to="/" end>
            <House size={19} aria-hidden="true" />
            <span>Home</span>
          </NavLink>
          <NavLink to="/routes">
            <Map size={19} aria-hidden="true" />
            <span>Routes</span>
          </NavLink>
          <NavLink to="/manage-tickets">
            <Ticket size={19} aria-hidden="true" />
            <span>Manage Tickets</span>
          </NavLink>
          <NavLink to="/help">
            <CircleHelp size={19} aria-hidden="true" />
            <span>Help</span>
          </NavLink>
        </nav>
      </div>
    </header>
  );
}