import { apiRequest } from './api';

export function fetchCart() {
  return apiRequest('/api/cart');
}

export function addItemToCart(menuItemId, quantity = 1, replaceExisting = false) {
  return apiRequest('/api/cart/items', {
    method: 'POST',
    body: { menuItemId, quantity, replaceExisting },
  });
}

export function updateCartItemQuantity(menuItemId, quantity) {
  return apiRequest(`/api/cart/items/${menuItemId}`, {
    method: 'PUT',
    body: { quantity },
  });
}

export function removeCartItem(menuItemId) {
  return apiRequest(`/api/cart/items/${menuItemId}`, {
    method: 'DELETE',
  });
}

export function clearCartItems() {
  return apiRequest('/api/cart', {
    method: 'DELETE',
  });
}

