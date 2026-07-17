import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { isDemoMode } from '../supabase';
import { 
  ShoppingCart, 
  LogOut, 
  User, 
  LayoutDashboard, 
  Menu, 
  X, 
  RefreshCw,
  Bell,
  Home,
  Search as SearchIcon,
  ClipboardList,
  Leaf,
  ChevronDown,
  Heart,
  Sparkles
} from 'lucide-react';

interface NavbarProps {
  onToggleNotifications?: () => void;
  unreadNotificationsCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  onToggleNotifications, 
  unreadNotificationsCount = 0 
}) => {
  const { user, logout, switchRole } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchText, setSearchText] = useState('');

  // Handle global search input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchText(val);
    
    // Dispatch global event for pages (like Home.tsx) to capture search query
    window.dispatchEvent(new CustomEvent('globalSearch', { detail: val }));
    
    // Redirect to home if typing elsewhere and logged in
    if (val && location.pathname !== '/home' && user?.role === 'buyer') {
      navigate('/home');
    }
  };

  const handleRoleToggle = () => {
    if (user) {
      const nextRole = user.role === 'buyer' ? 'trader' : 'buyer';
      switchRole(nextRole);
      navigate(nextRole === 'trader' ? '/trader-dashboard' : '/home');
      setMobileMenuOpen(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setMobileMenuOpen(false);
    setShowDropdown(false);
  };

  const getInitials = (name: string) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'U';
  };

  // Helper to determine if link is active
  const isLinkActive = (path: string, queryParam?: string) => {
    const isPath = location.pathname === path;
    if (!queryParam) return isPath;
    const searchParams = new URLSearchParams(location.search);
    return isPath && searchParams.get('tab') === queryParam;
  };

  // Listen to search reset
  useEffect(() => {
    const handleReset = () => setSearchText('');
    window.addEventListener('resetSearch', handleReset);
    return () => window.removeEventListener('resetSearch', handleReset);
  }, []);

  // Render horizontal navbar for logged-out users
  if (!user) {
    return (
      <nav className="navbar-glass" style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: '#FFFFFF', position: 'sticky', top: 0, zIndex: 1000 }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '70px' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <div style={{
              backgroundColor: '#2563EB',
              color: '#FFFFFF',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
            }}>
              <Leaf size={22} />
            </div>
            <span style={{ 
              fontFamily: 'var(--font-heading)', 
              fontWeight: '800', 
              fontSize: '22px', 
              color: '#1E3A8A', 
              letterSpacing: '-0.5px' 
            }}>
              KoboWise
            </span>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link to="/login" style={{ fontWeight: '700', color: '#1E3A8A', textDecoration: 'none', fontSize: '14px' }}>Login</Link>
            <Link to="/signup" className="btn btn-secondary btn-sm" style={{ fontWeight: '700', borderRadius: 'var(--radius-full)' }}>Get Started</Link>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <>
      {/* ==========================================
          DESKTOP SIDEBAR (width >= 768px)
          ========================================== */}
      <aside className="desktop-sidebar" style={{
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        width: '250px',
        backgroundColor: '#FFFFFF',
        borderRight: '1px solid var(--border-color)',
        padding: '24px 16px',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1010
      }}>
        {/* LOGO */}
        <Link 
          to={user.role === 'trader' ? '/trader-dashboard' : '/home'} 
          style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', marginBottom: '32px', padding: '0 8px' }}
        >
          <div style={{
            backgroundColor: '#2563EB',
            color: '#FFFFFF',
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 10px rgba(37, 99, 235, 0.25)'
          }}>
            <Leaf size={20} />
          </div>
          <span style={{ 
            fontFamily: 'var(--font-heading)', 
            fontWeight: '800', 
            fontSize: '20px', 
            color: '#1E3A8A', 
            letterSpacing: '-0.5px' 
          }}>
            KoboWise
          </span>
        </Link>

        {/* MENU SECTION */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ 
            fontSize: '11px', 
            fontWeight: '700', 
            color: 'var(--text-muted)', 
            letterSpacing: '1px', 
            textTransform: 'uppercase',
            margin: '0 0 8px 8px' 
          }}>
            Menu
          </span>

          <Link to="/home" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 14px',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: isLinkActive('/home') && !location.search ? '700' : '600',
            color: isLinkActive('/home') && !location.search ? '#2563EB' : 'var(--text-secondary)',
            backgroundColor: isLinkActive('/home') && !location.search ? 'rgba(37, 99, 235, 0.08)' : 'transparent',
            textDecoration: 'none',
            transition: 'all 0.2s'
          }} className="sidebar-link">
            <Home size={18} />
            Home
          </Link>

          <Link to="/home?tab=browse" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 14px',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: isLinkActive('/home', 'browse') ? '700' : '600',
            color: isLinkActive('/home', 'browse') ? '#2563EB' : 'var(--text-secondary)',
            backgroundColor: isLinkActive('/home', 'browse') ? 'rgba(37, 99, 235, 0.08)' : 'transparent',
            textDecoration: 'none',
            transition: 'all 0.2s'
          }} onClick={() => {
            // Trigger search input focus on homepage
            setTimeout(() => {
              const searchInput = document.getElementById('navbar-search-input');
              if (searchInput) searchInput.focus();
            }, 100);
          }} className="sidebar-link">
            <SearchIcon size={18} />
            Browse
          </Link>

          <Link to="/profile?tab=groups" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 14px',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: isLinkActive('/profile', 'groups') || isLinkActive('/profile', 'orders') ? '700' : '600',
            color: isLinkActive('/profile', 'groups') || isLinkActive('/profile', 'orders') ? '#2563EB' : 'var(--text-secondary)',
            backgroundColor: isLinkActive('/profile', 'groups') || isLinkActive('/profile', 'orders') ? 'rgba(37, 99, 235, 0.08)' : 'transparent',
            textDecoration: 'none',
            transition: 'all 0.2s'
          }} className="sidebar-link">
            <ClipboardList size={18} />
            My Purchases
          </Link>

          <Link to="/profile?tab=wishlist" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 14px',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: isLinkActive('/profile', 'wishlist') ? '700' : '600',
            color: isLinkActive('/profile', 'wishlist') ? '#2563EB' : 'var(--text-secondary)',
            backgroundColor: isLinkActive('/profile', 'wishlist') ? 'rgba(37, 99, 235, 0.08)' : 'transparent',
            textDecoration: 'none',
            transition: 'all 0.2s'
          }} className="sidebar-link">
            <Heart size={18} />
            Wishlist
          </Link>

          <Link to="/profile?tab=notifications" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 14px',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: isLinkActive('/profile', 'notifications') ? '700' : '600',
            color: isLinkActive('/profile', 'notifications') ? '#2563EB' : 'var(--text-secondary)',
            backgroundColor: isLinkActive('/profile', 'notifications') ? 'rgba(37, 99, 235, 0.08)' : 'transparent',
            textDecoration: 'none',
            transition: 'all 0.2s'
          }} className="sidebar-link">
            <Bell size={18} />
            Notifications
            {unreadNotificationsCount > 0 && (
              <span style={{
                marginLeft: 'auto',
                backgroundColor: '#EF4444',
                color: '#FFFFFF',
                borderRadius: '50%',
                width: '18px',
                height: '18px',
                fontSize: '10px',
                fontWeight: '800',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {unreadNotificationsCount}
              </span>
            )}
          </Link>

          <Link to="/profile" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 14px',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: isLinkActive('/profile') && !location.search ? '700' : '600',
            color: isLinkActive('/profile') && !location.search ? '#2563EB' : 'var(--text-secondary)',
            backgroundColor: isLinkActive('/profile') && !location.search ? 'rgba(37, 99, 235, 0.08)' : 'transparent',
            textDecoration: 'none',
            transition: 'all 0.2s'
          }} className="sidebar-link">
            <User size={18} />
            Profile
          </Link>

          {user.role === 'buyer' && (
            <button 
              onClick={() => window.dispatchEvent(new CustomEvent('start_user_tour'))}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 14px',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600',
                color: 'var(--text-secondary)',
                backgroundColor: 'transparent',
                border: 'none',
                width: '100%',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s'
              }}
              className="sidebar-link"
            >
              <Sparkles size={18} style={{ color: 'var(--accent-gold)' }} />
              Welcome Guide
            </button>
          )}
        </div>

        {/* TRADER OPTIONS */}
        {user.role === 'trader' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '20px' }}>
            <span style={{ 
              fontSize: '11px', 
              fontWeight: '700', 
              color: 'var(--text-muted)', 
              letterSpacing: '1px', 
              textTransform: 'uppercase',
              margin: '0 0 8px 8px' 
            }}>
              Trader Options
            </span>

            <Link to="/trader-dashboard" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 14px',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: isLinkActive('/trader-dashboard') ? '700' : '600',
              color: isLinkActive('/trader-dashboard') ? '#2563EB' : 'var(--text-secondary)',
              backgroundColor: isLinkActive('/trader-dashboard') ? 'rgba(37, 99, 235, 0.08)' : 'transparent',
              textDecoration: 'none',
              transition: 'all 0.2s'
            }} className="sidebar-link">
              <LayoutDashboard size={18} />
              Trader Dashboard
            </Link>
          </div>
        )}

        {/* BOTTOM SECTION */}
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {isDemoMode && (
            <button 
              onClick={handleRoleToggle}
              className="btn btn-outline btn-sm"
              style={{
                borderColor: 'var(--status-pending)',
                color: 'var(--status-pending)',
                backgroundColor: 'var(--status-pending-bg)',
                borderRadius: '10px',
                fontSize: '11px',
                padding: '8px 10px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                justifyContent: 'center'
              }}
              title="Switch buyer/trader views"
            >
              <RefreshCw size={12} />
              Switch view
            </button>
          )}

          <button 
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 14px',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '700',
              color: '#EF4444',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#FEE2E2'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <LogOut size={18} />
            Log Out
          </button>
        </div>
      </aside>

      {/* ==========================================
          DESKTOP TOP BAR next to sidebar
          ========================================== */}
      <header className="desktop-topbar" style={{
        position: 'fixed',
        top: 0,
        left: '250px',
        right: 0,
        height: '70px',
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px',
        zIndex: 1000
      }}>
        {/* Search Input */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%', maxWidth: '400px' }}>
          <SearchIcon size={18} style={{ position: 'absolute', left: '14px', color: '#94A3B8' }} />
          <input 
            type="text" 
            id="navbar-search-input"
            placeholder="Search products, groups, or traders..." 
            value={searchText}
            onChange={handleSearchChange}
            style={{ 
              width: '100%', 
              padding: '10px 14px 10px 42px', 
              border: '1px solid #DBEAFE', 
              borderRadius: '12px', 
              fontSize: '13px',
              fontWeight: '500',
              color: '#0F172A',
              backgroundColor: '#F8FAFC',
              outline: 'none',
              transition: 'all 0.2s'
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#2563EB';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#DBEAFE';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
          {searchText && (
            <button 
              onClick={() => { setSearchText(''); window.dispatchEvent(new CustomEvent('globalSearch', { detail: '' })); }}
              style={{ position: 'absolute', right: '14px', background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Right Side Icons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {/* Notifications Bell */}
          <button 
            onClick={onToggleNotifications}
            style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative', padding: '6px', color: '#475569' }}
          >
            <Bell size={22} />
            {unreadNotificationsCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '2px',
                right: '2px',
                backgroundColor: '#EF4444',
                color: '#FFFFFF',
                borderRadius: '50%',
                width: '18px',
                height: '18px',
                fontSize: '10px',
                fontWeight: '800',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid #FFFFFF'
              }}>
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* Cart Icon (Buyer only) */}
          {user.role === 'buyer' && (
            <Link to="/cart" style={{ position: 'relative', padding: '6px', color: '#475569', display: 'flex', alignItems: 'center' }}>
              <ShoppingCart size={22} />
              {cartCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '2px',
                  right: '2px',
                  backgroundColor: '#2563EB',
                  color: '#FFFFFF',
                  borderRadius: '50%',
                  width: '18px',
                  height: '18px',
                  fontSize: '10px',
                  fontWeight: '800',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 5px rgba(37, 99, 235, 0.4)'
                }}>
                  {cartCount}
                </span>
              )}
            </Link>
          )}

          {/* User Profile Selector */}
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setShowDropdown(!showDropdown)}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0
              }}
            >
              <div style={{ 
                width: '36px', 
                height: '36px', 
                borderRadius: '50%', 
                backgroundColor: '#2563EB', 
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '800',
                fontSize: '13px'
              }}>
                {getInitials(user.full_name)}
              </div>
              <span style={{ 
                fontSize: '14px', 
                fontWeight: '700', 
                color: '#0F172A',
                display: 'none',
                alignItems: 'center',
                gap: '4px'
              }} className="desktop-avatar-name">
                {user.full_name ? user.full_name.split(' ')[0] : 'Student'}
                <ChevronDown size={14} style={{ color: '#94A3B8' }} />
              </span>
            </button>

            {showDropdown && (
              <div style={{
                position: 'absolute',
                top: '46px',
                right: 0,
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--shadow-lg)',
                padding: '8px 0',
                minWidth: '170px',
                zIndex: 999
              }}>
                <Link 
                  to={user.role === 'trader' ? '/trader-dashboard' : '/profile'} 
                  onClick={() => setShowDropdown(false)}
                  style={{ display: 'block', padding: '10px 16px', fontSize: '13px', color: '#0F172A', textDecoration: 'none', fontWeight: '600', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#EFF6FF'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/settings" 
                  onClick={() => setShowDropdown(false)}
                  style={{ display: 'block', padding: '10px 16px', fontSize: '13px', color: '#0F172A', textDecoration: 'none', fontWeight: '600', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#EFF6FF'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  Settings
                </Link>
                <hr style={{ border: 0, borderTop: '1px solid var(--border-color)', margin: '6px 0' }} />
                <button 
                  onClick={handleLogout}
                  style={{ display: 'block', width: '100%', textAlign: 'left', border: 'none', background: 'none', padding: '10px 16px', fontSize: '13px', color: '#EF4444', fontWeight: '700', cursor: 'pointer', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#FEE2E2'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ==========================================
          MOBILE TOP BAR (width < 768px)
          ========================================== */}
      <nav className="mobile-header" style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '70px',
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid var(--border-color)',
        display: 'none',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        zIndex: 1000
      }}>
        <Link to="/home" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
          <div style={{
            backgroundColor: '#2563EB',
            color: '#FFFFFF',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Leaf size={16} />
          </div>
          <span style={{ 
            fontFamily: 'var(--font-heading)', 
            fontWeight: '800', 
            fontSize: '18px', 
            color: '#1E3A8A', 
            letterSpacing: '-0.5px' 
          }}>
            KoboWise
          </span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {user.role === 'buyer' && (
            <Link to="/cart" style={{ position: 'relative', color: '#475569', padding: '6px' }}>
              <ShoppingCart size={22} />
              {cartCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '2px',
                  right: '2px',
                  backgroundColor: '#2563EB',
                  color: '#FFFFFF',
                  borderRadius: '50%',
                  width: '16px',
                  height: '16px',
                  fontSize: '9px',
                  fontWeight: '800',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {cartCount}
                </span>
              )}
            </Link>
          )}

          <button 
            onClick={onToggleNotifications}
            style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative', padding: '6px', color: '#475569' }}
          >
            <Bell size={22} />
            {unreadNotificationsCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '2px',
                right: '2px',
                backgroundColor: '#EF4444',
                color: '#FFFFFF',
                borderRadius: '50%',
                width: '16px',
                height: '16px',
                fontSize: '9px',
                fontWeight: '800',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1E3A8A' }}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* MOBILE DRAWER */}
      {mobileMenuOpen && (
        <div style={{
          position: 'fixed',
          top: '70px',
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: '#FFFFFF',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          zIndex: 999,
          overflowY: 'auto'
        }} className="mobile-drawer">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#2563EB', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' }}>
              {getInitials(user.full_name)}
            </div>
            <div>
              <div style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{user.full_name}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{user.role} Account</div>
            </div>
          </div>

          <Link to="/home" onClick={() => setMobileMenuOpen(false)} style={{ fontWeight: '600', padding: '6px 0', textDecoration: 'none', color: '#0F172A' }}>Home</Link>
          <Link to="/profile?tab=groups" onClick={() => setMobileMenuOpen(false)} style={{ fontWeight: '600', padding: '6px 0', textDecoration: 'none', color: '#0F172A' }}>My Purchases</Link>
          <Link to="/profile?tab=wishlist" onClick={() => setMobileMenuOpen(false)} style={{ fontWeight: '600', padding: '6px 0', textDecoration: 'none', color: '#0F172A' }}>Wishlist</Link>
          <Link to="/profile?tab=notifications" onClick={() => setMobileMenuOpen(false)} style={{ fontWeight: '600', padding: '6px 0', textDecoration: 'none', color: '#0F172A' }}>Notifications</Link>
          <Link to="/profile" onClick={() => setMobileMenuOpen(false)} style={{ fontWeight: '600', padding: '6px 0', textDecoration: 'none', color: '#0F172A' }}>Profile</Link>
          
          {user.role === 'trader' && (
            <Link to="/trader-dashboard" onClick={() => setMobileMenuOpen(false)} style={{ fontWeight: '600', padding: '6px 0', display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: '#0F172A' }}>
              <LayoutDashboard size={18} />
              Trader Dashboard
            </Link>
          )}
          <Link to="/settings" onClick={() => setMobileMenuOpen(false)} style={{ fontWeight: '600', padding: '6px 0', textDecoration: 'none', color: '#0F172A' }}>Settings</Link>
          
          {user.role === 'buyer' && (
            <button 
              onClick={() => {
                setMobileMenuOpen(false);
                window.dispatchEvent(new CustomEvent('start_user_tour'));
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 0',
                fontWeight: '600',
                color: '#0F172A',
                backgroundColor: 'transparent',
                border: 'none',
                width: '100%',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <Sparkles size={18} style={{ color: 'var(--accent-gold)' }} />
              Welcome Guide
            </button>
          )}

          {isDemoMode && (
            <button 
              onClick={handleRoleToggle}
              className="btn btn-outline btn-sm btn-full"
              style={{ 
                borderColor: 'var(--status-pending)', 
                color: 'var(--status-pending)',
                backgroundColor: 'var(--status-pending-bg)',
                justifyContent: 'center'
              }}
            >
              <RefreshCw size={14} />
              Switch View to {user.role === 'buyer' ? 'Trader' : 'Buyer'}
            </button>
          )}

          <button 
            onClick={handleLogout}
            className="btn btn-outline btn-full"
            style={{ color: '#EF4444', borderColor: '#EF4444', justifyContent: 'center' }}
          >
            <LogOut size={18} />
            Log Out
          </button>
        </div>
      )}

      {/* Responsive layout styles */}
      <style>{`
        /* Sidebar layout styling */
        @media (min-width: 768px) {
          .desktop-sidebar { display: flex !important; }
          .desktop-topbar { display: flex !important; }
          .mobile-header { display: none !important; }
          .desktop-avatar-name { display: flex !important; }
        }
        @media (max-width: 767px) {
          .desktop-sidebar { display: none !important; }
          .desktop-topbar { display: none !important; }
          .mobile-header { display: flex !important; }
          .desktop-avatar-name { display: none !important; }
        }
        .sidebar-link:hover {
          background-color: rgba(37, 99, 235, 0.04) !important;
          color: var(--primary-green) !important;
        }
      `}</style>
    </>
  );
};
