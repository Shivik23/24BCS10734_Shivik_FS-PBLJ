import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { fetchOrderHistory } from '../services/orderService';
import {
  ORDER_STATUS_META,
  formatOrderDate,
  formatRupees,
  handleFoodImageError,
} from '../utils/formatters';

export default function OrdersPage() {
  const [searchParams] = useSearchParams();
  const placedOrderId = searchParams.get('placed');

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    async function loadOrders() {
      setLoading(true);
      setError('');
      try {
        const list = await fetchOrderHistory();
        if (active) setOrders(list);
      } catch (err) {
        if (active) {
          setError(err.message || 'Unable to load your orders.');
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    loadOrders();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="container">
      <div className="page-header">
        <h1>My Orders</h1>
        <p>Track recent orders and view complete itemized receipts.</p>
      </div>

      {placedOrderId && (
        <div className="alert-banner alert-success" role="status">
          Order #{placedOrderId} has been confirmed and sent to the kitchen.
        </div>
      )}

      {error && <div className="alert-banner alert-error">{error}</div>}

      {loading ? (
        <div className="state-card">
          <h2>Loading order history…</h2>
          <p>Fetching your previous orders from Foodies.</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="state-card">
          <h2>No orders yet</h2>
          <p>When you place an order, your live order status and receipts will appear here.</p>
          <Link to="/restaurants" className="btn btn-primary">
            Explore Restaurants
          </Link>
        </div>
      ) : (
        <div className="orders-stack">
          {orders.map((order) => {
            const statusMeta = ORDER_STATUS_META[order.status] || {
              label: order.status,
              className: 'status-placed',
            };

            return (
              <article key={order.id} className="order-card">
                <div className="order-card-header">
                  <div className="order-restaurant-head">
                    <img
                      src={order.restaurantImageUrl}
                      alt={order.restaurantName}
                      className="order-restaurant-thumb"
                      onError={handleFoodImageError}
                    />
                    <div>
                      <h2 style={{ fontSize: '1.15rem', fontWeight: 800 }}>
                        {order.restaurantName}
                      </h2>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                        Order #{order.id} · {formatOrderDate(order.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <span className={`order-status-pill ${statusMeta.className}`}>
                      {order.status}
                    </span>
                    <strong style={{ fontSize: '1.08rem' }}>
                      {formatRupees(order.totalAmount)}
                    </strong>
                  </div>
                </div>

                <ul className="order-items-table">
                  {(order.items || []).map((item) => (
                    <li key={item.id} className="order-item-line">
                      <span>
                        {item.itemName} × {item.quantity}{' '}
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                          ({formatRupees(item.unitPrice)} each)
                        </span>
                      </span>
                      <strong>{formatRupees(item.lineTotal)}</strong>
                    </li>
                  ))}
                  <li
                    className="order-item-line"
                    style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}
                  >
                    <span>Delivery Fee</span>
                    <span>{formatRupees(order.deliveryFee)}</span>
                  </li>
                </ul>

                <div className="order-card-footer">
                  <span>Delivered to: {order.deliveryAddress}</span>
                  <span>
                    Payment: <strong>{order.paymentMethod}</strong> ({order.paymentStatus})
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

