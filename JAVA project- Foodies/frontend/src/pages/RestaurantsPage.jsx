import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import RestaurantCard from '../components/RestaurantCard';
import { fetchRestaurants, searchDishes } from '../services/restaurantService';
import { formatRupees, handleFoodImageError } from '../utils/formatters';

const CUISINE_FILTERS = [
  'All',
  'Biryani',
  'North Indian',
  'South Indian',
  'Pizza',
  'Burgers',
  'Momos',
  'Thali',
  'Desserts',
];

export default function RestaurantsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeSearch = searchParams.get('search') || '';
  const activeCuisine = searchParams.get('cuisine') || 'All';

  const [inputSearch, setInputSearch] = useState(activeSearch);
  const [restaurants, setRestaurants] = useState([]);
  const [matchingDishes, setMatchingDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setInputSearch(activeSearch);
  }, [activeSearch]);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const restaurantList = await fetchRestaurants({
          search: activeSearch,
          cuisine: activeCuisine,
        });
        const dishList = activeSearch.trim() ? await searchDishes(activeSearch) : [];
        if (!active) return;
        setRestaurants(restaurantList);
        setMatchingDishes(dishList);
      } catch (err) {
        if (active) {
          setError(err.message || 'Unable to load restaurants.');
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [activeSearch, activeCuisine]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const next = new URLSearchParams(searchParams);
    if (inputSearch.trim()) {
      next.set('search', inputSearch.trim());
    } else {
      next.delete('search');
    }
    setSearchParams(next);
  };

  const handleCuisineSelect = (cuisine) => {
    const next = new URLSearchParams(searchParams);
    if (cuisine === 'All') {
      next.delete('cuisine');
    } else {
      next.set('cuisine', cuisine);
    }
    setSearchParams(next);
  };

  const resetFilters = () => {
    setInputSearch('');
    setSearchParams({});
  };

  return (
    <div className="container">
      <div className="page-header">
        <h1>Restaurants &amp; Kitchens</h1>
        <p>Browse menus, filter by cuisine, and order directly from open kitchens.</p>
      </div>

      <div className="filter-toolbar">
        <search className="filter-search-box">
          <form className="hero-search-form" onSubmit={handleSearchSubmit}>
            <label htmlFor="restaurant-search" className="visually-hidden">
              Search restaurants or dishes
            </label>
            <input
              id="restaurant-search"
              type="search"
              className="hero-search-input"
              placeholder="Search restaurant, cuisine, or dish…"
              value={inputSearch}
              onChange={(e) => setInputSearch(e.target.value)}
            />
            <button type="submit" className="btn btn-primary btn-sm">
              Search
            </button>
          </form>
        </search>

        <div className="filter-pills" role="group" aria-label="Filter by cuisine">
          {CUISINE_FILTERS.map((cuisine) => (
            <button
              key={cuisine}
              type="button"
              className={`filter-pill ${
                activeCuisine.toLowerCase() === cuisine.toLowerCase() ? 'active' : ''
              }`}
              onClick={() => handleCuisineSelect(cuisine)}
            >
              {cuisine}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="alert-banner alert-error">{error}</div>}

      {loading ? (
        <div className="state-card">
          <h2>Loading kitchens…</h2>
          <p>Finding restaurants matching your filters.</p>
        </div>
      ) : restaurants.length === 0 ? (
        <div className="state-card">
          <h2>No restaurants found</h2>
          <p>Try a different dish name or reset your cuisine filters.</p>
          <button type="button" className="btn btn-primary" onClick={resetFilters}>
            Show all restaurants
          </button>
        </div>
      ) : (
        <div className="restaurants-grid">
          {restaurants.map((restaurant) => (
            <RestaurantCard key={restaurant.id} restaurant={restaurant} />
          ))}
        </div>
      )}

      {!loading && activeSearch.trim() && matchingDishes.length > 0 && (
        <section className="page-section">
          <div className="section-header">
            <div>
              <h2 className="section-title">Dishes matching &ldquo;{activeSearch}&rdquo;</h2>
              <p className="section-subtitle">Click any dish to jump straight to its kitchen menu</p>
            </div>
          </div>

          <div className="popular-dishes-grid">
            {matchingDishes.map((dish) => (
              <Link
                key={dish.id}
                to={`/restaurants/${dish.restaurantId}`}
                className="dish-mini-card"
              >
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
                  <span className="dish-restaurant-label">{dish.restaurantName}</span>
                  <div className="dish-footer-row">
                    <span className="price-tag">{formatRupees(dish.price)}</span>
                    <span style={{ color: 'var(--accent-primary)', fontWeight: 700, fontSize: '0.88rem' }}>
                      Order →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

