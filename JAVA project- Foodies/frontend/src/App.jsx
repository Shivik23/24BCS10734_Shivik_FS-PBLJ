import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import CartReplaceDialog from './components/CartReplaceDialog';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import ToastNotification from './components/ToastNotification';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import OrdersPage from './pages/OrdersPage';
import RegisterPage from './pages/RegisterPage';
import RestaurantMenuPage from './pages/RestaurantMenuPage';
import RestaurantsPage from './pages/RestaurantsPage';

function RouteTitleUpdater() {
  const { pathname } = useLocation();

  useEffect(() => {
    const titles = {
      '/': 'Foodies — Online Food Ordering',
      '/restaurants': 'Restaurants | Foodies',
      '/cart': 'Your Cart | Foodies',
      '/checkout': 'Checkout | Foodies',
      '/orders': 'My Orders | Foodies',
      '/login': 'Sign In | Foodies',
      '/register': 'Create Account | Foodies',
    };
    if (pathname.startsWith('/restaurants/')) {
      document.title = 'Restaurant Menu | Foodies';
      return;
    }
    document.title = titles[pathname] || 'Foodies — Online Food Ordering';
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <RouteTitleUpdater />
      <AuthProvider>
        <CartProvider>
          <div className="app-shell">
            <Navbar />
            <main id="main-content" className="main-content" tabIndex={-1}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/restaurants" element={<RestaurantsPage />} />
                <Route path="/restaurants/:id" element={<RestaurantMenuPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route
                  path="/cart"
                  element={
                    <ProtectedRoute>
                      <CartPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/checkout"
                  element={
                    <ProtectedRoute>
                      <CheckoutPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/orders"
                  element={
                    <ProtectedRoute>
                      <OrdersPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
          <CartReplaceDialog />
          <ToastNotification />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
