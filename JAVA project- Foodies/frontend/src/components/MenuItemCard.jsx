import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { formatRupees, handleFoodImageError } from '../utils/formatters';

export default function MenuItemCard({ item }) {
  const { user } = useAuth();
  const { addItem, updateQuantity, getItemQuantity } = useCart();
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const quantityInCart = getItemQuantity(item.id);

  const handleAdd = async () => {
    if (!user) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    setBusy(true);
    try {
      await addItem(item, 1);
    } finally {
      setBusy(false);
    }
  };

  const handleStep = async (nextQty) => {
    setBusy(true);
    try {
      await updateQuantity(item.id, nextQty);
    } finally {
      setBusy(false);
    }
  };

  return (
    <article className="menu-item-card">
      <div className="menu-item-info">
        <div className="dish-title-row">
          <span
            className={`diet-mark ${item.isVeg ? 'veg' : 'nonveg'}`}
            role="img"
            aria-label={item.isVeg ? 'Vegetarian dish' : 'Non-vegetarian dish'}
          >
            <span className="diet-dot" />
          </span>
          <h3>{item.name}</h3>
        </div>

        <p className="price-tag">{formatRupees(item.price)}</p>
        <p className="menu-item-desc">{item.description}</p>
      </div>

      <div className="menu-item-media">
        <img
          src={item.imageUrl}
          alt={item.name}
          loading="lazy"
          onError={handleFoodImageError}
        />

        {quantityInCart === 0 ? (
          <button
            type="button"
            className="btn btn-soft btn-sm btn-block"
            onClick={handleAdd}
            disabled={busy || !item.isAvailable}
          >
            {item.isAvailable ? '+ Add' : 'Unavailable'}
          </button>
        ) : (
          <div className="qty-stepper" aria-label={`Quantity controls for ${item.name}`}>
            <button
              type="button"
              className="qty-btn"
              aria-label={`Decrease quantity of ${item.name}`}
              disabled={busy}
              onClick={() => handleStep(quantityInCart - 1)}
            >
              −
            </button>
            <span className="qty-value">{quantityInCart}</span>
            <button
              type="button"
              className="qty-btn"
              aria-label={`Increase quantity of ${item.name}`}
              disabled={busy || quantityInCart >= 20}
              onClick={() => handleStep(quantityInCart + 1)}
            >
              +
            </button>
          </div>
        )}
      </div>
    </article>
  );
}

