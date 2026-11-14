import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import MenuItemCard from '../components/MenuItemCard';
import { useCart } from '../context/CartContext';
import { fetchRestaurantDetails } from '../services/restaurantService';
import { formatRupees, handleFoodImageError } from '../utils/formatters';

export default function RestaurantMenuPage() {
  const { id } = useParams();
  const { cart } = useCart();

  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [vegOnly, setVegOnly] = useState(false);
  const [dishSearch, setDishSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    async function loadRestaurant() {
      setLoading(true);
      setError('');
      try {
        const data = await fetchRestaurantDetails(id);
        if (!active) return;
        setRestaurant(data.restaurant);
        setMenuItems(data.menuItems || []);
        setSelectedCategory('All');
      } catch (err) {
        if (active) {
          setError(err.message || 'Unable to load restaurant menu.');
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    loadRestaurant();
    return () => {
      active = false;
    };
  }, [id]);

  const categories = useMemo(() => {
    const unique = Array.from(new Set(menuItems.map((item) => item.category)));
    return ['All', ...unique];
  }, [menuItems]);

  const groupedItems = useMemo(() => {
    const query = dishSearch.trim().toLowerCase();
    const filtered = menuItems.filter((item) => {
      if (vegOnly && !item.isVeg) return false;
      if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;
      if (
        query &&
        !item.name.toLowerCase().includes(query) &&
        !item.description.toLowerCase().includes(query)
      ) {
        return false;
      }
      return true;
    });

    return filtered.reduce((groups, item) => {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
      return groups;
    }, {});
  }, [menuItems, vegOnly, selectedCategory, dishSearch]);

  if (loading) {
    return (
      <div className="container">
        <div className="state-card">
          <h2>Loading menu…</h2>
          <p>Fetching fresh dishes and prices.</p>
        </div>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="container">
        <div className="state-card">
          <h2>Restaurant unavailable</h2>
          <p>{error || 'We could not find the requested restaurant.'}</p>
          <Link to="/restaurants" className="btn btn-primary">
            Back to restaurants
          </Link>
        </div>
      </div>
    );
  }

  const categoryEntries = Object.entries(groupedItems);

  return (
    <div className="container">
      <section className="restaurant-banner">
        <img
          src={restaurant.imageUrl}
          alt={restaurant.name}
          className="restaurant-banner-img"
          onError={handleFoodImageError}
        />

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <h1>{restaurant.name}</h1>
            <span className="rating-pill">★ {restaurant.rating}</span>
          </div>

          <p style={{ fontWeight: 700, color: 'var(--accent-dark)', marginBottom: '0.45rem' }}>
            {restaurant.cuisineType}
          </p>
          <p style={{ color: 'var(--text-secondary)' }}>{restaurant.description}</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.35rem' }}>
            {restaurant.address}
          </p>

          <div className="restaurant-stats">
            <span>Delivery in {restaurant.deliveryTimeMins} mins</span>
            <span>Delivery fee {formatRupees(restaurant.deliveryFee)}</span>
            <span>{restaurant.isOpen ? 'Open for orders' : 'Currently closed'}</span>
          </div>
        </div>
      </section>

      <div className="menu-controls">
        <div className="filter-pills" role="group" aria-label="Menu categories">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`filter-pill ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <label className="veg-toggle-label">
            <input
              type="checkbox"
              checked={vegOnly}
              onChange={(e) => setVegOnly(e.target.checked)}
            />
            <span>Veg only</span>
          </label>

          <search>
            <label htmlFor="menu-dish-search" className="visually-hidden">
              Search dishes in this menu
            </label>
            <input
              id="menu-dish-search"
              type="search"
              className="form-input"
              style={{ minWidth: '220px', minHeight: '40px', padding: '0.4rem 0.85rem' }}
              placeholder="Search in menu…"
              value={dishSearch}
              onChange={(e) => setDishSearch(e.target.value)}
            />
          </search>
        </div>
      </div>

      {categoryEntries.length === 0 ? (
        <div className="state-card">
          <h2>No matching dishes</h2>
          <p>Try turning off the Veg-only filter or clearing your menu search.</p>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              setVegOnly(false);
              setDishSearch('');
              setSelectedCategory('All');
            }}
          >
            Reset menu filters
          </button>
        </div>
      ) : (
        categoryEntries.map(([category, items]) => (
          <section key={category} className="menu-category-block">
            <h2 className="menu-category-heading">
              {category} ({items.length})
            </h2>
            <div className="menu-items-list">
              {items.map((item) => (
                <MenuItemCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        ))
      )}

      {cart.totalQuantity > 0 && cart.restaurantId === restaurant.id && (
        <div
          className="panel-card"
          style={{
            marginTop: '1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
            flexWrap: 'wrap',
            backgroundColor: 'var(--bg-accent-soft)',
            borderColor: '#fdba74',
          }}
        >
          <div>
            <strong>
              {cart.totalQuantity} {cart.totalQuantity === 1 ? 'item' : 'items'} in your cart
            </strong>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
              Subtotal: {formatRupees(cart.subtotal)} + {formatRupees(cart.deliveryFee)} delivery
            </p>
          </div>
          <Link to="/cart" className="btn btn-primary">
            View Cart &amp; Checkout →
          </Link>
        </div>
      )}
    </div>
  );
}

