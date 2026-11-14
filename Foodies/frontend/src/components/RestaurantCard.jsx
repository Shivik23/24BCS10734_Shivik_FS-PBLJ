import { Link } from 'react-router-dom';
import { formatRupees, handleFoodImageError } from '../utils/formatters';

export default function RestaurantCard({ restaurant }) {
  return (
    <Link to={`/restaurants/${restaurant.id}`} className="restaurant-card">
      <div className="restaurant-card-media">
        <img
          src={restaurant.imageUrl}
          alt={restaurant.name}
          loading="lazy"
          onError={handleFoodImageError}
        />
        <span className="restaurant-eta-badge">{restaurant.deliveryTimeMins} mins</span>
      </div>

      <div className="restaurant-card-body">
        <div className="restaurant-card-top">
          <h3 className="restaurant-card-title">{restaurant.name}</h3>
          <span className="rating-pill" aria-label={`Rated ${restaurant.rating} out of 5`}>
            ★ {restaurant.rating}
          </span>
        </div>

        <p className="restaurant-cuisine">{restaurant.cuisineType}</p>
        <p className="restaurant-desc">{restaurant.description}</p>

        <div className="restaurant-meta-row">
          <span>Delivery {formatRupees(restaurant.deliveryFee)}</span>
          <span style={{ color: 'var(--accent-primary)' }}>View Menu →</span>
        </div>
      </div>
    </Link>
  );
}

