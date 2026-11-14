import { apiRequest } from './api';

export function placeOrder(payload) {
  return apiRequest('/api/orders', {
    method: 'POST',
    body: payload,
  });
}

export function fetchOrderHistory() {
  return apiRequest('/api/orders');
}

export function fetchOrderById(orderId) {
  return apiRequest(`/api/orders/${orderId}`);
}

