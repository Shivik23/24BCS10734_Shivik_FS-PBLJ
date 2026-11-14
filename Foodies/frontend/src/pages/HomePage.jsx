import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import RestaurantCard from '../components/RestaurantCard';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { fetchPopularDishes, fetchRestaurants } from '../services/restaurantService';
import { formatRupees, handleFoodImageError } from '../utils/formatters';

const POPULAR_CUISINES = [
  { label: 'Biryani', image: '/images/biryani.jpg' },
  { label: 'North Indian', image: '/images/north-indian.jpg' },
  { label: 'South Indian', image: '/images/dosa.jpg' },
  { label: 'Pizza', image: '/images/pizza.jpg' },
  { label: 'Burgers', image: '/images/burger.jpg' },
  { label: 'Momos', image: '/images/momos.jpg' },
  { label: 'Thali', image: '/images/thali.jpg' },
  { label: 'Desserts', image: '/images/gulab-jamun.jpg' },
];

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [restaurants, setRestaurants] = useState([]);
  const [popularDishes, setPopularDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { user } = useAuth();
  const { addItem, getItemQuantity, updateQuantity } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let active = true;
    async function loadHomeData() {
      setLoading(true);
      setError('');
      try {
        const [restaurantList, dishList] = await Promise.all([
          fetchRestaurants(),
          fetchPopularDishes(),
        ]);
        if (!active) return;
        setRestaurants(restaurantList);
        setPopularDishes(dishList);
      } catch (err) {
        if (active) {
          setError(err.message || 'Unable to load restaurants right now.');
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    loadHomeData();
    return () => {
      active = false;
    };
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const q = searchTerm.trim();
    navigate(q ? `/restaurants?search=${encodeURIComponent(q)}` : '/restaurants');
  };

  const handleQuickAdd = async (dish) => {
    if (!user) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    await addItem(dish, 1);
  };

  return (
    <>
      <section className="hero-section">
        <div className="container hero-grid">
          <div>
            <h1 className="hero-title">
              Freshly cooked <span>Indian &amp; global favourites</span>, delivered warm.
            </h1>
            <p className="hero-subtitle">
              Explore trusted local kitchens for dum biryani, crispy dosas, tandoori platters,
              wood-fired pizzas, and homestyle thalis.
            </p>

            <search>
              <form className="hero-search-form" onSubmit={handleSearchSubmit}>
                <label htmlFor="home-search-input" className="visually-hidden">
                  Search for restaurants or dishes
                </label>
                <input
                  id="home-search-input"
                  type="search"
                  className="hero-search-input"
                  placeholder="Search for biryani, masala dosa, pizza, or restaurant name…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button type="submit" className="btn btn-primary">
                  Search Food
                </button>
              </form>
            </search>
          </div>

          <div className="hero-media">
            <img
              src="/images/hero-spread.jpg"
              alt="Fresh Indian feast featuring curries, naan, and rice dishes"
              onError={handleFoodImageError}
            />
          </div>
        </div>
      </section>

      <section className="page-section">
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">Popular Cuisines</h2>
              <p className="section-subtitle">Pick a craving to explore matching restaurants</p>
            </div>
            <Link to="/restaurants" className="btn btn-secondary btn-sm">
              Browse All
            </Link>
          </div>

          <div className="cuisine-strip">
            {POPULAR_CUISINES.map((cuisine) => (
              <button
                key={cuisine.label}
                type="button"
                className="cuisine-chip-card"
                onClick={() =>
                  navigate(`/restaurants?cuisine=${encodeURIComponent(cuisine.label)}`)
                }
              >
                <img
                  src={cuisine.image}
                  alt={cuisine.label}
                  className="cuisine-thumb"
                  onError={handleFoodImageError}
                />
                <span className="cuisine-name">{cuisine.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="page-section">
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">Featured Restaurants</h2>
              <p className="section-subtitle">Top-rated kitchens ready to take your order</p>
            </div>
            <Link to="/restaurants" className="btn btn-soft btn-sm">
              View all ({restaurants.length})
            </Link>
          </div>

          {error && <div className="alert-banner alert-error">{error}</div>}

          {loading ? (
            <div className="state-card">
              <h3>Loading restaurants…</h3>
              <p>Fetching live kitchens and menus from Foodies.</p>
            </div>
          ) : (
            <div className="restaurants-grid">
              {restaurants.slice(0, 8).map((restaurant) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="page-section">
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">Popular Dishes</h2>
              <p className="section-subtitle">Customer favourites ordered across kitchens</p>
            </div>
          </div>

          {!loading && !error && (
            <div className="popular-dishes-grid">
              {popularDishes.map((dish) => {
                const qty = getItemQuantity(dish.id);
                return (
                  <article key={dish.id} className="dish-mini-card">
                    <div className="dish-mini-media">
                      <img
                        src={dish.imageUrl}
                        alt={dish.name}
                        loading="lazy"
                        onError={handleFoodImageError}
                      />
                    </div>
                    <div className="dish-mini-body">
                      <div className="dish-title-row">
                        <span
                          className={`diet-mark ${dish.isVeg ? 'veg' : 'nonveg'}`}
                          role="img"
                          aria-label={dish.isVeg ? 'Vegetarian' : 'Non-vegetarian'}
                        >
                          <span className="diet-dot" />
                        </span>
                        <h3>{dish.name}</h3>
                      </div>

                      <Link
                        to={`/restaurants/${dish.restaurantId}`}
                        className="dish-restaurant-label"
                      >
                        {dish.restaurantName} · {dish.deliveryTimeMins} mins
                      </Link>

                      <div className="dish-footer-row">
                        <span className="price-tag">{formatRupees(dish.price)}</span>
                        {qty === 0 ? (
                          <button
                            type="button"
                            className="btn btn-soft btn-sm"
                            onClick={() => handleQuickAdd(dish)}
                          >
                            + Add
                          </button>
                        ) : (
                          <div className="qty-stepper">
                            <button
                              type="button"
                              className="qty-btn"
                              aria-label={`Decrease quantity of ${dish.name}`}
                              onClick={() => updateQuantity(dish.id, qty - 1)}
                            >
                              −
                            </button>
                            <span className="qty-value">{qty}</span>
                            <button
                              type="button"
                              className="qty-btn"
                              aria-label={`Increase quantity of ${dish.name}`}
                              onClick={() => updateQuantity(dish.id, qty + 1)}
                            >
                              +
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

