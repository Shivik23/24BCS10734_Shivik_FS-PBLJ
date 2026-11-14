import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  addItemToCart,
  clearCartItems,
  fetchCart,
  removeCartItem,
  updateCartItemQuantity,
} from '../services/cartService';
import { useAuth } from './AuthContext';

const EMPTY_CART = {
  restaurantId: null,
  restaurantName: null,
  restaurantCuisine: null,
  deliveryTimeMins: null,
  items: [],
  totalQuantity: 0,
  subtotal: 0,
  deliveryFee: 0,
  totalAmount: 0,
};

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user, authLoading } = useAuth();
  const [cart, setCart] = useState(EMPTY_CART);
  const [cartLoading, setCartLoading] = useState(false);
  const [pendingConflict, setPendingConflict] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(timer);
  }, [toast]);

  const refreshCart = useCallback(async () => {
    if (!user) {
      setCart(EMPTY_CART);
      return;
    }
    setCartLoading(true);
    try {
      const data = await fetchCart();
      setCart(data);
    } catch {
      setCart(EMPTY_CART);
    } finally {
      setCartLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading) {
      refreshCart();
    }
  }, [authLoading, refreshCart]);

  const addItem = useCallback(
    async (menuItem, quantity = 1) => {
      try {
        const updated = await addItemToCart(menuItem.id, quantity, false);
        setCart(updated);
        showToast(`${menuItem.name} added to your cart`);
        return { ok: true };
      } catch (err) {
        if (err.status === 409 && err.code === 'DIFFERENT_RESTAURANT') {
          setPendingConflict({
            menuItem,
            quantity,
            currentRestaurantName: cart.restaurantName || 'another restaurant',
          });
          return { ok: false, conflict: true };
        }
        showToast(err.message || 'Could not add item to cart.', 'error');
        return { ok: false, error: err };
      }
    },
    [cart.restaurantName, showToast]
  );

  const confirmReplaceCart = useCallback(async () => {
    if (!pendingConflict) return;
    const { menuItem, quantity } = pendingConflict;
    try {
      const updated = await addItemToCart(menuItem.id, quantity, true);
      setCart(updated);
      setPendingConflict(null);
      showToast(`Cart updated with ${menuItem.name}`);
    } catch (err) {
      showToast(err.message || 'Unable to replace cart.', 'error');
      setPendingConflict(null);
    }
  }, [pendingConflict, showToast]);

  const cancelReplaceCart = useCallback(() => {
    setPendingConflict(null);
  }, []);

  const updateQuantity = useCallback(
    async (menuItemId, quantity) => {
      try {
        const updated = await updateCartItemQuantity(menuItemId, quantity);
        setCart(updated);
      } catch (err) {
        showToast(err.message || 'Could not update quantity.', 'error');
      }
    },
    [showToast]
  );

  const removeItem = useCallback(
    async (menuItemId) => {
      try {
        const updated = await removeCartItem(menuItemId);
        setCart(updated);
        showToast('Item removed from cart');
      } catch (err) {
        showToast(err.message || 'Could not remove item.', 'error');
      }
    },
    [showToast]
  );

  const clearCart = useCallback(async () => {
    try {
      const updated = await clearCartItems();
      setCart(updated);
    } catch (err) {
      showToast(err.message || 'Could not clear cart.', 'error');
    }
  }, [showToast]);

  const getItemQuantity = useCallback(
    (menuItemId) => {
      const found = cart.items.find((item) => item.menuItemId === menuItemId);
      return found ? found.quantity : 0;
    },
    [cart.items]
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        cartLoading,
        pendingConflict,
        toast,
        dismissToast: () => setToast(null),
        refreshCart,
        addItem,
        confirmReplaceCart,
        cancelReplaceCart,
        updateQuantity,
        removeItem,
        clearCart,
        getItemQuantity,
        showToast,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

