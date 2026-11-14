import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="brand-link" style={{ marginBottom: '0.65rem' }}>
              <span className="brand-mark" aria-hidden="true">
                F
              </span>
              <span>Foodies</span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', maxWidth: '340px' }}>
              Order freshly prepared meals from local restaurants across Indian, Italian, Tibetan,
              and fast-food kitchens directly to your doorstep.
            </p>
          </div>

          <div>
            <h2 className="footer-heading">Explore</h2>
            <ul className="footer-links">
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/restaurants">All Restaurants</Link>
              </li>
              <li>
                <Link to="/cart">Your Cart</Link>
              </li>
              <li>
                <Link to="/orders">My Orders</Link>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="footer-heading">Customer Account</h2>
            <ul className="footer-links">
              <li>
                <Link to="/login">Customer Login</Link>
              </li>
              <li>
                <Link to="/register">Create Account</Link>
              </li>
              <li>
                <Link to="/checkout">Checkout</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Foodies Online Food Ordering System</span>
          <span>Powered by React, Spring Boot, JDBC &amp; PostgreSQL</span>
        </div>
      </div>
    </footer>
  );
}

