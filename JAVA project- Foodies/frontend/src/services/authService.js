import { apiRequest } from './api';

export function registerCustomer(payload) {
  return apiRequest('/api/auth/register', {
    method: 'POST',
    body: payload,
  });
}

export function loginCustomer(payload) {
  return apiRequest('/api/auth/login', {
    method: 'POST',
    body: payload,
  });
}

export function logoutCustomer() {
  return apiRequest('/api/auth/logout', {
    method: 'POST',
  });
}

export function fetchCurrentUser() {
  return apiRequest('/api/auth/me');
}

