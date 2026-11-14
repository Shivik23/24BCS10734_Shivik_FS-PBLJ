import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
    navigate('/');
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="site-header">
      <a href="#main-content" className="skip-link visually-hidden">
        Skip to main content
      </a>

      <div className="container navbar">
        <Link to="/" className="brand-link" onClick={closeMenu}>
          <span className="brand-mark" aria-hidden="true">
            F
          </span>
          <span>Foodies</span>
        </Link>

        <button
          type="button"
          className="mobile-menu-btn"
          aria-expanded={menuOpen}
          aria-controls="primary-navigation"
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          {menuOpen ? 'Close' : 'Menu'}
        </button>

        <div
          id="primary-navigation"
          className={`nav-collapsible ${menuOpen ? 'open' : ''}`}
        >
          <nav aria-label="Primary" className="nav-links">
            <NavLink to="/" end className="nav-link" onClick={closeMenu}>
              Home
            </NavLink>
            <NavLink to="/restaurants" className="nav-link" onClick={closeMenu}>
              Restaurants
            </NavLink>
            {user && (
              <NavLink to="/orders" className="nav-link" onClick={closeMenu}>
                My Orders
              </NavLink>
            )}
          </nav>

          <div className="nav-actions">
            <Link to="/cart" className="cart-link" onClick={closeMenu}>
              <span>Cart</span>
              <span className="cart-badge">{cart.totalQuantity || 0}</span>
            </Link>

            {user ? (
              <>
                <span className="user-pill" title={user.email}>
                  Hi, {user.fullName.split(' ')[0]}
                </span>
                <button type="button" className="btn btn-secondary btn-sm" onClick={handleLogout}>
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-secondary btn-sm" onClick={closeMenu}>
                  Log in
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm" onClick={closeMenu}>
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
