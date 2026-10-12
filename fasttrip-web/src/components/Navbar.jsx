import { Link, NavLink } from 'react-router-dom';
import logo from '../assets/Logo.png';
import './Navbar.css';

export default function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar__inner">
        <Link to="/" className="navbar__brand">
          <img src={logo} alt="FastTrip logo" className="navbar__logo-img" />
        </Link>

        <nav className="navbar__links">
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/routes">Routes</NavLink>
          <NavLink to="/manage-tickets">Manage Tickets</NavLink>
          <NavLink to="/help">Help</NavLink>
        </nav>
      </div>
    </header>
  );
}