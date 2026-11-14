import { apiRequest } from './api';

export function fetchRestaurants({ search = '', cuisine = '' } = {}) {
  const params = new URLSearchParams();
  if (search.trim()) params.set('search', search.trim());
  if (cuisine.trim() && cuisine !== 'All') params.set('cuisine', cuisine.trim());
  const queryString = params.toString();
  return apiRequest(`/api/restaurants${queryString ? `?${queryString}` : ''}`);
}

export function fetchRestaurantDetails(restaurantId) {
  return apiRequest(`/api/restaurants/${restaurantId}`);
}

export function fetchRestaurantMenu(restaurantId, { vegOnly = false, search = '' } = {}) {
  const params = new URLSearchParams();
  if (vegOnly) params.set('vegOnly', 'true');
  if (search.trim()) params.set('search', search.trim());
  const queryString = params.toString();
  return apiRequest(`/api/restaurants/${restaurantId}/menu${queryString ? `?${queryString}` : ''}`);
}

export function fetchPopularDishes() {
  return apiRequest('/api/dishes/popular');
}

export function searchDishes(query) {
  const params = new URLSearchParams({ q: query || '' });
  return apiRequest(`/api/dishes/search?${params.toString()}`);
}

