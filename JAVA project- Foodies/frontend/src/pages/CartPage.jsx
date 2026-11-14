import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatRupees, handleFoodImageError } from '../utils/formatters';

export default function CartPage() {
  const { cart, cartLoading, updateQuantity, removeItem, clearCart } = useCart();

  if (cartLoading) {
    return (
      <div className="container">
        <div className="state-card">
          <h2>Loading your cart…</h2>
          <p>Fetching your selected dishes.</p>
        </div>
      </div>
    );
  }

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="container">
        <div className="state-card">
          <h2>Your cart is empty</h2>
          <p>Explore our restaurants and add your favourite dishes to begin an order.</p>
          <Link to="/restaurants" className="btn btn-primary">
            Browse restaurants
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
        <div>
          <h1>Your Cart</h1>
          <p>
            Ordering from{' '}
            <Link
              to={`/restaurants/${cart.restaurantId}`}
              style={{ color: 'var(--accent-primary)', fontWeight: 800 }}
            >
              {cart.restaurantName}
            </Link>{' '}
            · Estimated delivery {cart.deliveryTimeMins} mins
          </p>
        </div>
        <button type="button" className="btn btn-secondary btn-sm" onClick={clearCart}>
          Clear Cart
        </button>
      </div>

      <div className="two-col-layout">
        <section className="panel-card" aria-label="Selected food items">
          {cart.items.map((item) => (
            <div key={item.menuItemId} className="cart-item-row">
              <div className="cart-item-left">
                <img
                  src={item.imageUrl}
                  alt={item.itemName}
                  className="cart-item-thumb"
                  onError={handleFoodImageError}
                />
                <div>
                  <div className="dish-title-row">
                    <span
                      className={`diet-mark ${item.isVeg ? 'veg' : 'nonveg'}`}
                      role="img"
                      aria-label={item.isVeg ? 'Vegetarian' : 'Non-vegetarian'}
                    >
                      <span className="diet-dot" />
                    </span>
                    <h2 style={{ fontSize: '1.02rem', fontWeight: 800 }}>{item.itemName}</h2>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '0.2rem' }}>
                    {formatRupees(item.unitPrice)} each
                  </p>
                </div>
              </div>

              <div className="cart-item-actions">
                <div className="qty-stepper">
                  <button
                    type="button"
                    className="qty-btn"
                    aria-label={`Decrease quantity of ${item.itemName}`}
                    onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}
                  >
                    −
                  </button>
                  <span className="qty-value">{item.quantity}</span>
                  <button
                    type="button"
                    className="qty-btn"
                    aria-label={`Increase quantity of ${item.itemName}`}
                    onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                  >
                    +
                  </button>
                </div>

                <strong style={{ minWidth: '72px', textAlign: 'right' }}>
                  {formatRupees(item.lineTotal)}
                </strong>

                <button
                  type="button"
                  className="remove-link-btn"
                  onClick={() => removeItem(item.menuItemId)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </section>

        <aside className="panel-card" aria-label="Bill summary">
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1rem' }}>
            Bill Summary
          </h2>

          <div className="bill-summary-row">
            <span>Item Subtotal ({cart.totalQuantity} items)</span>
            <span>{formatRupees(cart.subtotal)}</span>
          </div>
          <div className="bill-summary-row">
            <span>Delivery Fee</span>
            <span>{formatRupees(cart.deliveryFee)}</span>
          </div>
          <div className="bill-total-row">
            <span>Final Payable</span>
            <span>{formatRupees(cart.totalAmount)}</span>
          </div>

          <div style={{ display: 'grid', gap: '0.75rem', marginTop: '1.35rem' }}>
            <Link to="/checkout" className="btn btn-primary btn-block">
              Proceed to Checkout →
            </Link>
            <Link to={`/restaurants/${cart.restaurantId}`} className="btn btn-secondary btn-block">
              Add More Items
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}

