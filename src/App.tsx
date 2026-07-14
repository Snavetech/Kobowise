import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Navbar } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { Home } from './pages/Home';
import { ProductDetails } from './pages/ProductDetails';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { Profile } from './pages/Profile';
import { Settings } from './pages/Settings';
import { Login } from './pages/Login';
import { SignUp } from './pages/SignUp';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { TraderDashboard } from './pages/TraderDashboard';
import { dbService, mockRealtime } from './supabase';

// Helper to protect routes by role
const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRole?: 'buyer' | 'trader' }> = ({ 
  children, 
  allowedRole 
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <h3>Checking student credentials...</h3>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    // Redirect traders to dashboard, buyers to homepage
    return <Navigate to={user.role === 'trader' ? '/trader-dashboard' : '/home'} replace />;
  }

  return <>{children}</>;
};

// Outer layout to connect routing context to navbar props
const AppLayout: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [unreadNotifsCount, setUnreadNotifsCount] = useState(0);

  const fetchUnreadCount = useCallback(async () => {
    if (user) {
      const notifs = await dbService.getNotifications(user.id);
      setUnreadNotifsCount(notifs.filter(n => !n.is_read).length);
    } else {
      setUnreadNotifsCount(0);
    }
  }, [user]);

  useEffect(() => {
    fetchUnreadCount();

    // Subscribe to notification alerts in real-time
    const notifSub = mockRealtime.subscribe('notifications_updated', () => {
      fetchUnreadCount();
    });

    return () => {
      notifSub.unsubscribe();
    };
  }, [user, fetchUnreadCount]);

  // Hide Navbar/Footer on landing page to let it shine
  const isLandingPage = location.pathname === '/';
  const isAuthPage = ['/login', '/signup', '/forgot-password', '/reset-password'].includes(location.pathname);
  const hideChrome = isLandingPage || isAuthPage;

  const handleToggleNotifications = () => {
    // Dispatch custom event to notify homepage/dashboard to show notifications drawer
    mockRealtime.emit('toggle_notif_drawer', {});
    // For convenience: if not on homepage, redirect to profile where alerts reside
    if (location.pathname !== '/home' && location.pathname !== '/trader-dashboard') {
      window.location.hash = user?.role === 'trader' ? '#/trader-dashboard' : '#/profile';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {!hideChrome && (
        <Navbar 
          onToggleNotifications={handleToggleNotifications} 
          unreadNotificationsCount={unreadNotifsCount} 
        />
      )}
      
      <main style={{ 
        flexGrow: 1, 
        paddingLeft: (user && !hideChrome) ? '250px' : '0',
        paddingTop: !hideChrome ? '70px' : '0',
        transition: 'padding var(--transition-normal)'
      }} className="main-content-layout">
        <Routes>
          {/* Landing / Root */}
          <Route path="/" element={<LandingPage />} />

          {/* Authentication */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Buyer Routes */}
          <Route path="/home" element={
            <ProtectedRoute allowedRole="buyer">
              <Home />
            </ProtectedRoute>
          } />
          <Route path="/product/:id" element={
            <ProtectedRoute allowedRole="buyer">
              <ProductDetails />
            </ProtectedRoute>
          } />
          <Route path="/cart" element={
            <ProtectedRoute allowedRole="buyer">
              <Cart />
            </ProtectedRoute>
          } />
          <Route path="/checkout" element={
            <ProtectedRoute allowedRole="buyer">
              <Checkout />
            </ProtectedRoute>
          } />

          {/* Shared Routes */}
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } />

          {/* Trader Routes */}
          <Route path="/trader-dashboard" element={
            <ProtectedRoute allowedRole="trader">
              <TraderDashboard />
            </ProtectedRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <AppLayout />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;
