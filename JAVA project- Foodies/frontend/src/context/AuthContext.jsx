import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  fetchCurrentUser,
  loginCustomer,
  logoutCustomer,
  registerCustomer,
} from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const loadSession = useCallback(async () => {
    setAuthLoading(true);
    try {
      const profile = await fetchCurrentUser();
      setUser(profile);
    } catch {
      setUser(null);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  const login = useCallback(async (credentials) => {
    const response = await loginCustomer(credentials);
    setUser(response.user);
    return response.user;
  }, []);

  const register = useCallback(async (payload) => {
    const response = await registerCustomer(payload);
    setUser(response.user);
    return response.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutCustomer();
    } finally {
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        authLoading,
        login,
        register,
        logout,
        refreshUser: loadSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

