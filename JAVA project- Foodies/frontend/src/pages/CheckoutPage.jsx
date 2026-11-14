import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { placeOrder } from '../services/orderService';
import { formatRupees } from '../utils/formatters';

const PAYMENT_OPTIONS = [
  {
    value: 'Cash on Delivery',
    title: 'Cash on Delivery',
    desc: 'Pay in cash or UPI directly to the delivery partner at your doorstep.',
  },
  {
    value: 'UPI',
    title: 'UPI (GPay / PhonePe / Paytm)',
    desc: 'Instant simulated UPI approval with immediate payment confirmation.',
  },
  {
    value: 'Card',
    title: 'Credit / Debit Card',
    desc: 'Simulated card checkout — no real card details are stored.',
  },
];

export default function CheckoutPage() {
  const { user } = useAuth();
  const { cart, cartLoading, refreshCart, showToast } = useCart();
  const navigate = useNavigate();

  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
  const [orderNotes, setOrderNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (user) {
      setDeliveryAddress((prev) => prev || user.defaultAddress || '');
      setContactPhone((prev) => prev || user.phone || '');
    }
  }, [user]);

  if (cartLoading) {
    return (
      <div className="container">
        <div className="state-card">
          <h2>Preparing checkout…</h2>
          <p>Loading your order details.</p>
        </div>
      </div>
    );
  }

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="container">
        <div className="state-card">
          <h2>Nothing to check out</h2>
          <p>Your cart is empty. Add food from a restaurant first.</p>
          <Link to="/restaurants" className="btn btn-primary">
            Explore Restaurants
          </Link>
        </div>
      </div>
    );
  }

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSubmitting(true);
    try {
      const createdOrder = await placeOrder({
        deliveryAddress: deliveryAddress.trim(),
        contactPhone: contactPhone.trim(),
        paymentMethod,
        orderNotes: orderNotes.trim(),
      });
      await refreshCart();
      showToast(`Order #${createdOrder.id} placed successfully!`);
      navigate(`/orders?placed=${createdOrder.id}`, { replace: true });
    } catch (err) {
      setErrorMessage(err.message || 'Unable to place your order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container">
      <div className="page-header">
        <h1>Checkout</h1>
        <p>Confirm delivery details and payment preference for {cart.restaurantName}.</p>
      </div>

      {errorMessage && (
        <div className="alert-banner alert-error" role="alert">
          {errorMessage}
        </div>
      )}

      <div className="two-col-layout">
        <form className="panel-card" onSubmit={handlePlaceOrder}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1rem' }}>
            Delivery Details
          </h2>

          <div className="form-field">
            <label htmlFor="checkout-address" className="form-label">
              Delivery address <span aria-hidden="true">*</span>
            </label>
            <textarea
              id="checkout-address"
              name="deliveryAddress"
              className="form-textarea"
              autoComplete="street-address"
              minLength={5}
              maxLength={300}
              required
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
            />
          </div>

          <div className="form-field">
            <label htmlFor="checkout-phone" className="form-label">
              Contact number <span aria-hidden="true">*</span>
            </label>
            <input
              id="checkout-phone"
              name="contactPhone"
              type="tel"
              className="form-input"
              autoComplete="tel"
              inputMode="tel"
              pattern="[0-9+\-\s]{10,15}"
              required
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
            />
          </div>

          <div className="form-field">
            <label htmlFor="checkout-notes" className="form-label">
              Cooking or delivery instructions (optional)
            </label>
            <input
              id="checkout-notes"
              name="orderNotes"
              type="text"
              className="form-input"
              maxLength={255}
              placeholder="E.g., Ring the doorbell once, keep extra tissues"
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
            />
          </div>

          <fieldset style={{ border: 'none', padding: 0, margin: '1.25rem 0 0' }}>
            <legend style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.85rem' }}>
              Select Payment Method
            </legend>

            <div className="payment-options">
              {PAYMENT_OPTIONS.map((option) => (
                <label key={option.value} className="payment-option">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={option.value}
                    checked={paymentMethod === option.value}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <span>
                    <span className="payment-option-title">{option.title}</span>
                    <span className="payment-option-desc">{option.desc}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
            {submitting
              ? 'Placing your order…'
              : `Place Order · ${formatRupees(cart.totalAmount)}`}
          </button>
        </form>

        <aside className="panel-card" aria-label="Order summary">
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.35rem' }}>
            Order Summary
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
            From <strong>{cart.restaurantName}</strong>
          </p>

          <ul style={{ display: 'grid', gap: '0.6rem', paddingBottom: '1rem', borderBottom: '1px solid var(--bg-secondary)', marginBottom: '0.85rem' }}>
            {cart.items.map((item) => (
              <li
                key={item.menuItemId}
                style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', fontSize: '0.94rem' }}
              >
                <span>
                  {item.itemName} × {item.quantity}
                </span>
                <strong>{formatRupees(item.lineTotal)}</strong>
              </li>
            ))}
          </ul>

          <div className="bill-summary-row">
            <span>Subtotal</span>
            <span>{formatRupees(cart.subtotal)}</span>
          </div>
          <div className="bill-summary-row">
            <span>Delivery Fee</span>
            <span>{formatRupees(cart.deliveryFee)}</span>
          </div>
          <div className="bill-total-row">
            <span>Total Payable</span>
            <span>{formatRupees(cart.totalAmount)}</span>
          </div>
        </aside>
      </div>
    </div>
  );
}

