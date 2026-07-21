import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import type { CartItem } from '../context/CartContext';
import { dbService, mockRealtime } from '../supabase';
import type { Order, Product, Notification, GroupOrder } from '../supabase';
import { ProgressBar } from '../components/ProgressBar';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { 
  ShoppingBag, 
  Heart, 
  Bell, 
  ClipboardList,
  TrendingUp,
  FolderOpen,
  CheckCircle,
  Trash2,
  Search,
  SlidersHorizontal,
  Headphones,
  Truck,
  X,
  ChevronRight,
  CreditCard
} from 'lucide-react';

export const Profile: React.FC = () => {
  const { user } = useAuth();
  const { cartItems, removeFromCart } = useCart();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as any) || 'groups';
  const [activeTab, setActiveTab] = useState<'groups' | 'orders' | 'wishlist' | 'notifications'>(initialTab);
  
  // Purchases lifecycle subtabs state (AliExpress style)
  const [searchQuery, setSearchQuery] = useState('');
  const [purchaseTab, setPurchaseTab] = useState<'all' | 'to_pay' | 'processing' | 'processed' | 'returns' | 'review' | 'completed'>('all');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [trackingModalOrder, setTrackingModalOrder] = useState<Order | null>(null);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['groups', 'orders', 'wishlist', 'notifications'].includes(tab)) {
      setActiveTab(tab as any);
    }
  }, [searchParams]);

  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [groupOrders, setGroupOrders] = useState<GroupOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProfileData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const ords = await dbService.getBuyerOrders(user.id);
    const wish = await dbService.getWishlist(user.id);
    const notifs = await dbService.getNotifications(user.id);
    const groups = await dbService.getGroupOrders();

    setOrders(ords);
    setWishlist(wish);
    setNotifications(notifs);
    setGroupOrders(groups);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadProfileData();

    // Subscribe to mock real-time events to refresh active groups/notifs
    const groupsSub = mockRealtime.subscribe('groups_updated', () => {
      loadProfileData();
    });

    const notifsSub = mockRealtime.subscribe('notifications_updated', () => {
      if (user) {
        dbService.getNotifications(user.id).then(setNotifications);
      }
    });

    return () => {
      groupsSub.unsubscribe();
      notifsSub.unsubscribe();
    };
  }, [user, navigate, loadProfileData]);

  const handleMarkRead = async (id: string) => {
    await dbService.markNotificationAsRead(id);
    if (user) {
      const notifs = await dbService.getNotifications(user.id);
      setNotifications(notifs);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0
    }).format(val);
  };

  if (loading) {
    return (
      <div style={{ padding: '32px 0 60px 0', backgroundColor: '#F8FAFC', minHeight: '95vh' }}>
        <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div className="skeleton-box" style={{ width: '120px', height: '14px' }} />
            <div className="skeleton-box" style={{ width: '320px', height: '36px' }} />
          </div>

          <SkeletonLoader type="profile" count={1} />

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '20px'
          }}>
            <SkeletonLoader type="stats" count={4} />
          </div>
        </div>
      </div>
    );
  }

  // Filter orders into active groups vs completed orders
  const activeOrders = orders.filter(o => o.status === 'paid' || o.status === 'processing');
  const completedOrdersList = orders.filter(o => o.status === 'ready_for_pickup' || o.status === 'delivered' || o.status === 'cancelled');

  return (
    <div style={{ padding: '32px 0 60px 0', backgroundColor: '#F8FAFC', minHeight: '95vh' }}>
      <div className="container">
        
        {/* Welcome Header (Screenshot 4) */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '32px' }}>
          <div>
            <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Student Profile
            </span>
            <h1 style={{ fontSize: '32px', color: '#0F172A', fontFamily: 'var(--font-heading)', fontWeight: '800', marginTop: '4px' }} className="profile-title">
              Welcome back, {user?.full_name?.split(' ')[0] || 'Chioma'} 👋
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '6px' }}>
              You have <strong style={{ color: '#2563EB' }}>{activeOrders.length} active groups</strong> and <strong style={{ color: '#F97316' }}>1 spot waiting to be filled!</strong>
            </p>
          </div>
        </div>

        {/* Overview Stats Cards (Screenshot 4 Widgets) */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '20px',
          marginBottom: '28px'
        }}>
          {/* Card 1: Active Groups */}
          <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: '0 2px 6px rgba(30, 64, 175, 0.02)', display: 'flex', gap: '14px', alignItems: 'center' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'rgba(37, 99, 235, 0.08)', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FolderOpen size={20} />
            </div>
            <div>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', fontWeight: '700', textTransform: 'uppercase' }}>Active Groups</span>
              <strong style={{ fontSize: '20px', color: '#0F172A', fontWeight: '800' }}>{activeOrders.length || 3}</strong>
              <span style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'block', marginTop: '1px' }}>Participating</span>
            </div>
          </div>

          {/* Card 2: Total Saved */}
          <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: '0 2px 6px rgba(30, 64, 175, 0.02)', display: 'flex', gap: '14px', alignItems: 'center' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'rgba(37, 99, 235, 0.08)', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={20} />
            </div>
            <div>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', fontWeight: '700', textTransform: 'uppercase' }}>Total Saved</span>
              <strong style={{ fontSize: '20px', color: '#0F172A', fontWeight: '800' }}>{formatCurrency(54000)}</strong>
              <span style={{ fontSize: '10px', color: '#2563EB', display: 'block', marginTop: '1px' }}>All-time savings</span>
            </div>
          </div>

          {/* Card 3: Orders Done */}
          <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: '0 2px 6px rgba(30, 64, 175, 0.02)', display: 'flex', gap: '14px', alignItems: 'center' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'rgba(37, 99, 235, 0.08)', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle size={20} />
            </div>
            <div>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', fontWeight: '700', textTransform: 'uppercase' }}>Orders Done</span>
              <strong style={{ fontSize: '20px', color: '#0F172A', fontWeight: '800' }}>{completedOrdersList.length || 12}</strong>
              <span style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'block', marginTop: '1px' }}>Completed purchases</span>
            </div>
          </div>

          {/* Card 4: Wishlist */}
          <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: '0 2px 6px rgba(30, 64, 175, 0.02)', display: 'flex', gap: '14px', alignItems: 'center' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'rgba(239, 68, 68, 0.08)', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Heart size={20} />
            </div>
            <div>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', fontWeight: '700', textTransform: 'uppercase' }}>Wishlist</span>
              <strong style={{ fontSize: '20px', color: '#0F172A', fontWeight: '800' }}>{wishlist.length || 7} items</strong>
              <span style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'block', marginTop: '1px' }}>Saved for later</span>
            </div>
          </div>
        </div>

        {/* Quick Action buttons (Screenshot 4) */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '36px' }}>
          <Link to="/home" className="btn" style={{ 
            borderRadius: 'var(--radius-full)', 
            backgroundColor: '#2563EB', 
            color: '#FFFFFF',
            border: 'none',
            fontWeight: '700',
            fontSize: '13px',
            padding: '10px 22px',
            boxShadow: '0 4px 10px rgba(37, 99, 235, 0.15)'
          }}>
            Browse Products
          </Link>
          <button onClick={() => setActiveTab('wishlist')} className="btn btn-outline" style={{ borderRadius: 'var(--radius-full)', fontSize: '13px', padding: '10px 22px' }}>
            View Wishlist
          </button>
          <button onClick={() => setActiveTab('notifications')} className="btn btn-outline" style={{ borderRadius: 'var(--radius-full)', fontSize: '13px', padding: '10px 22px' }}>
            My Notifications
          </button>
        </div>

        {/* Profile Tabs */}
        <div style={{ 
          display: 'flex', 
          borderBottom: '1px solid var(--border-color)', 
          marginBottom: '24px',
          gap: '24px',
          overflowX: 'auto',
          scrollbarWidth: 'none'
        }} className="profile-tabs">
          {[
            { id: 'groups', label: 'Active Groups', icon: <ClipboardList size={16} /> },
            { id: 'orders', label: 'Purchase History', icon: <ShoppingBag size={16} /> },
            { id: 'wishlist', label: 'Wishlist', icon: <Heart size={16} /> },
            { id: 'notifications', label: `Notifications (${notifications.filter(n => !n.is_read).length})`, icon: <Bell size={16} /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 6px',
                border: 'none',
                background: 'none',
                fontWeight: '700',
                fontSize: '14px',
                color: activeTab === tab.id ? '#2563EB' : 'var(--text-secondary)',
                borderBottom: activeTab === tab.id ? '3px solid #2563EB' : '3px solid transparent',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
                flexShrink: 0
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content Panels */}
        <div>
          {/* TAB 1 & 2: MY PURCHASES ORDER LIFECYCLE DASHBOARD */}
          {(activeTab === 'groups' || activeTab === 'orders') && (
            <div>
              {/* SEARCH & ACTION HEADER BAR (Exact match to reference images) */}
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '20px',
                border: '1px solid #DBEAFE',
                padding: '16px 20px',
                marginBottom: '20px',
                boxShadow: '0 4px 14px rgba(30, 64, 175, 0.03)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  {/* Search Box */}
                  <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
                    <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                    <input
                      type="text"
                      placeholder="Order ID, product name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 36px 10px 42px',
                        borderRadius: '30px',
                        border: '1px solid #CBD5E1',
                        fontSize: '13px',
                        outline: 'none',
                        backgroundColor: '#F8FAFC'
                      }}
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', cursor: 'pointer', color: '#94A3B8' }}
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  {/* Icon Controls */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      title="Filter"
                      style={{ width: '38px', height: '38px', borderRadius: '50%', border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#475569' }}
                    >
                      <SlidersHorizontal size={16} />
                    </button>
                    <button
                      title="Support & Customer Care"
                      onClick={() => alert('Kobowise DELSU Campus Support: Call/WhatsApp 08123456789')}
                      style={{ width: '38px', height: '38px', borderRadius: '50%', border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#2563EB' }}
                    >
                      <Headphones size={16} />
                    </button>
                    <button
                      title="Clear Search"
                      onClick={() => setSearchQuery('')}
                      style={{ width: '38px', height: '38px', borderRadius: '50%', border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#EF4444' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* HORIZONTAL LIFECYCLE TABS (Exact match to reference images) */}
                <div style={{
                  display: 'flex',
                  gap: '20px',
                  marginTop: '16px',
                  borderTop: '1px solid #F1F5F9',
                  paddingTop: '12px',
                  overflowX: 'auto',
                  scrollbarWidth: 'none'
                }} className="purchases-subtabs">
                  {[
                    { id: 'all', label: 'View all', count: cartItems.length + orders.length },
                    { id: 'to_pay', label: 'To pay', count: cartItems.length },
                    { id: 'processing', label: 'Processing', count: orders.filter(o => o.status === 'paid').length },
                    { id: 'processed', label: 'Processed', count: orders.filter(o => o.status === 'processing' || o.status === 'ready_for_pickup').length },
                    { id: 'returns', label: 'Returns/refunds', count: orders.filter(o => o.status === 'cancelled').length },
                    { id: 'review', label: 'Review', count: orders.filter(o => o.status === 'delivered').length },
                    { id: 'completed', label: 'Completed', count: orders.filter(o => o.status === 'delivered').length }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setPurchaseTab(tab.id as any)}
                      style={{
                        border: 'none',
                        background: 'none',
                        padding: '6px 2px',
                        fontSize: '13px',
                        fontWeight: purchaseTab === tab.id ? '800' : '600',
                        color: purchaseTab === tab.id ? '#0F172A' : '#64748B',
                        borderBottom: purchaseTab === tab.id ? '3px solid #0F172A' : '3px solid transparent',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      {tab.label}
                      {tab.count > 0 && (
                        <span style={{
                          fontSize: '10px',
                          backgroundColor: purchaseTab === tab.id ? '#0F172A' : '#E2E8F0',
                          color: purchaseTab === tab.id ? '#FFFFFF' : '#475569',
                          padding: '1px 6px',
                          borderRadius: '10px',
                          fontWeight: '700'
                        }}>
                          {tab.count}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* LIST PANEL */}
              {(() => {
                const isMatch = (name?: string, ref?: string, trader?: string) => {
                  if (!searchQuery.trim()) return true;
                  const q = searchQuery.toLowerCase();
                  return (
                    (name && name.toLowerCase().includes(q)) ||
                    (ref && ref.toLowerCase().includes(q)) ||
                    (trader && trader.toLowerCase().includes(q))
                  );
                };

                const showCart = (purchaseTab === 'to_pay' || purchaseTab === 'all') && cartItems.length > 0;
                const filteredCart = showCart ? cartItems.filter((c: CartItem) => isMatch(c.product.name, c.product.id, c.product.trader_name)) : [];

                const filteredOrders = orders.filter(o => {
                  if (!isMatch(o.product_name, o.payment_reference || o.id, o.trader_name)) return false;
                  if (purchaseTab === 'to_pay') return false;
                  if (purchaseTab === 'processing') return o.status === 'paid';
                  if (purchaseTab === 'processed') return o.status === 'processing' || o.status === 'ready_for_pickup';
                  if (purchaseTab === 'returns') return o.status === 'cancelled';
                  if (purchaseTab === 'review') return o.status === 'delivered';
                  if (purchaseTab === 'completed') return o.status === 'delivered';
                  return true;
                });

                if (filteredCart.length === 0 && filteredOrders.length === 0) {
                  return (
                    <div style={{ textAlign: 'center', padding: '48px 20px', backgroundColor: '#FFFFFF', borderRadius: '24px', border: '1px solid var(--border-color)' }}>
                      <ShoppingBag size={44} style={{ color: '#94A3B8', marginBottom: '12px' }} />
                      <h4 style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A', marginBottom: '6px' }}>No purchases found</h4>
                      <p style={{ color: '#64748B', fontSize: '13px', marginBottom: '16px' }}>There are no items in this tab.</p>
                      <Link to="/home" className="btn btn-primary btn-sm">Explore Products</Link>
                    </div>
                  );
                }

                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* CART ITEMS (TO PAY) */}
                    {filteredCart.map((c: CartItem) => (
                      <div key={`cart-${c.product.id}`} style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', border: '1px solid #DBEAFE', padding: '20px', boxShadow: '0 4px 12px rgba(30, 64, 175, 0.02)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                          <span style={{ fontSize: '13px', fontWeight: '800', color: '#DC2626' }}>
                            ⚡ In Cart - Unpaid
                          </span>
                          <span style={{ fontSize: '11px', color: '#94A3B8' }}>{new Date().toLocaleDateString()}</span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                          <span style={{ backgroundColor: '#FEF08A', color: '#854D0E', fontSize: '10px', padding: '2px 6px', borderRadius: '4px', fontWeight: '800' }}>Choice</span>
                          <strong style={{ fontSize: '13px', color: '#0F172A' }}>{c.product.trader_name || 'KoboWise Store'} &gt;</strong>
                        </div>

                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                          <img
                            src={c.product.image_url}
                            alt=""
                            style={{ width: '80px', height: '80px', borderRadius: '12px', objectFit: 'cover', border: '1px solid #E2E8F0' }}
                            onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=60'; }}
                          />
                          <div style={{ flex: 1 }}>
                            <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#0F172A', margin: '0 0 4px 0' }}>{c.product.name}</h4>
                            <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 6px 0' }}>{c.product.shares_per_person || '4 Basket per share'} • {c.sharesBought} share(s)</p>
                            <strong style={{ fontSize: '15px', color: '#0F172A' }}>{formatCurrency(c.product.price_per_share)}</strong>
                          </div>
                          <span style={{ fontSize: '14px', fontWeight: '700', color: '#64748B' }}>x{c.sharesBought}</span>
                        </div>

                        <div style={{ backgroundColor: '#F8FAFC', borderRadius: '12px', padding: '10px 14px', marginTop: '14px', border: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <CreditCard size={16} style={{ color: '#2563EB' }} />
                            <span style={{ fontSize: '12px', color: '#475569', fontWeight: '600' }}>Item saved in cart for instant group join payment</span>
                          </div>
                        </div>

                        <div style={{ marginTop: '16px', borderTop: '1px solid #F1F5F9', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                          <div style={{ fontSize: '13px', color: '#0F172A' }}>
                            Total for {c.sharesBought} item(s): <strong>{formatCurrency(c.product.price_per_share * c.sharesBought)}</strong>
                          </div>
                          <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                              onClick={() => removeFromCart(c.product.id)}
                              style={{ border: '1px solid #CBD5E1', borderRadius: '20px', padding: '6px 14px', fontSize: '12px', fontWeight: '700', color: '#64748B', backgroundColor: '#FFFFFF', cursor: 'pointer' }}
                            >
                              Remove
                            </button>
                            <button
                              onClick={() => navigate('/checkout')}
                              style={{ border: '1px solid #DC2626', borderRadius: '20px', padding: '6px 18px', fontSize: '12px', fontWeight: '800', color: '#DC2626', backgroundColor: '#FFFFFF', cursor: 'pointer' }}
                            >
                              Pay now
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* PAID & PROCESSED ORDERS */}
                    {filteredOrders.map(order => {
                      const group = groupOrders.find(g => g.id === order.group_order_id);
                      let statusBannerText = 'Awaiting delivery';
                      if (order.status === 'paid') statusBannerText = 'Processing Trader Acceptance';
                      if (order.status === 'ready_for_pickup') statusBannerText = 'Ready for Pickup';
                      if (order.status === 'delivered') statusBannerText = 'Delivered & Received';
                      if (order.status === 'cancelled') statusBannerText = 'Refunded / Cancelled';

                      return (
                        <div key={order.id} style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', border: '1px solid #DBEAFE', padding: '20px', boxShadow: '0 4px 12px rgba(30, 64, 175, 0.02)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <span style={{ fontSize: '14px', fontWeight: '800', color: '#0F172A' }}>
                              {statusBannerText}
                            </span>
                            <span style={{ fontSize: '12px', color: '#94A3B8' }}>{new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '14px' }}>
                            <span style={{ backgroundColor: '#FEF08A', color: '#854D0E', fontSize: '10px', padding: '2px 6px', borderRadius: '4px', fontWeight: '800' }}>Choice</span>
                            <strong style={{ fontSize: '13px', color: '#0F172A' }}>{order.trader_name || 'KoboWise Store'} &gt;</strong>
                          </div>

                          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                            <img
                              src={order.product_image || '/images/Garri.png'}
                              alt=""
                              style={{ width: '80px', height: '80px', borderRadius: '12px', objectFit: 'cover', border: '1px solid #E2E8F0' }}
                              onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=60'; }}
                            />
                            <div style={{ flex: 1 }}>
                              <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#0F172A', margin: '0 0 4px 0' }}>{order.product_name}</h4>
                              <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 6px 0' }}>
                                {order.portion_size || '4 Basket per share'} • {order.shares_bought} share(s)
                              </p>
                              <strong style={{ fontSize: '15px', color: '#0F172A' }}>{formatCurrency(order.unit_price || (order.total_price / (order.shares_bought || 1)))}</strong>
                            </div>
                            <span style={{ fontSize: '14px', fontWeight: '700', color: '#64748B' }}>x{order.shares_bought}</span>
                          </div>

                          {group && group.status === 'pending' && (
                            <div style={{ backgroundColor: '#EFF6FF', borderRadius: '12px', padding: '12px 14px', marginTop: '14px', border: '1px solid #DBEAFE' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: '700', color: '#1E3A8A', marginBottom: '4px' }}>
                                <span>Group Buyers Split Progress</span>
                                <span>{group.shares_purchased}/{group.shares_needed} joined</span>
                              </div>
                              <ProgressBar purchased={group.shares_purchased} needed={group.shares_needed} />
                            </div>
                          )}

                          <div 
                            onClick={() => setTrackingModalOrder(order)}
                            style={{ backgroundColor: '#F8FAFC', borderRadius: '12px', padding: '12px 16px', marginTop: '14px', border: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <Truck size={18} style={{ color: '#2563EB' }} />
                              <div>
                                <span style={{ fontSize: '13px', fontWeight: '700', color: '#0F172A', display: 'block' }}>
                                  Click to check tracking details &gt;
                                </span>
                                <span style={{ fontSize: '11px', color: '#64748B' }}>
                                  Estimated delivery / Pickup: {order.pickup_location || order.estimated_delivery || 'DELSU Site II Gate Shop 1B'}
                                </span>
                              </div>
                            </div>
                            <ChevronRight size={16} style={{ color: '#94A3B8' }} />
                          </div>

                          <div style={{ marginTop: '16px', borderTop: '1px solid #F1F5F9', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                            <div style={{ fontSize: '13px', color: '#0F172A' }}>
                              Total for {order.shares_bought} item(s): <strong>{formatCurrency(order.total_price)}</strong>
                            </div>

                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                              <button
                                onClick={() => setTrackingModalOrder(order)}
                                style={{ border: '1px solid #94A3B8', borderRadius: '20px', padding: '6px 16px', fontSize: '12px', fontWeight: '700', color: '#334155', backgroundColor: '#FFFFFF', cursor: 'pointer' }}
                              >
                                Track status
                              </button>

                              {(order.status === 'processing' || order.status === 'ready_for_pickup' || order.status === 'paid') && (
                                <button
                                  onClick={async () => {
                                    setActionLoadingId(order.id);
                                    await dbService.updateOrderStatus(order.id, 'delivered');
                                    await loadProfileData();
                                    setActionLoadingId(null);
                                  }}
                                  disabled={actionLoadingId === order.id}
                                  style={{ border: '1px solid #DC2626', borderRadius: '20px', padding: '6px 18px', fontSize: '12px', fontWeight: '800', color: '#DC2626', backgroundColor: '#FFFFFF', cursor: 'pointer' }}
                                >
                                  {actionLoadingId === order.id ? 'Updating...' : 'Confirm received'}
                                </button>
                              )}

                              {order.status === 'delivered' && (
                                <Link
                                  to={`/product/${order.product_id || 'prod-1'}`}
                                  style={{ border: '1px solid #DC2626', borderRadius: '20px', padding: '6px 18px', fontSize: '12px', fontWeight: '800', color: '#DC2626', backgroundColor: '#FFFFFF', cursor: 'pointer', textDecoration: 'none' }}
                                >
                                  Leave review
                                </Link>
                              )}

                              <button
                                onClick={async () => {
                                  if (!user) return;
                                  if (window.confirm(`Delete Order #${order.payment_reference || order.id} from your list?`)) {
                                    await dbService.deleteOrder(order.id, user.id);
                                    loadProfileData();
                                  }
                                }}
                                style={{ border: '1px solid #FECACA', borderRadius: '20px', padding: '6px 12px', fontSize: '12px', fontWeight: '700', color: '#EF4444', backgroundColor: '#FEF2F2', cursor: 'pointer' }}
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          )}

          {/* TAB 3: WISHLIST */}
          {activeTab === 'wishlist' && (
            <div>
              {wishlist.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', backgroundColor: '#FFFFFF', borderRadius: '24px', border: '1px solid var(--border-color)' }}>
                  <Heart size={40} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
                  <p style={{ color: 'var(--text-secondary)' }}>Your wishlist is currently empty.</p>
                </div>
              ) : (
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', 
                  gap: '20px' 
                }}>
                  {wishlist.map((prod) => (
                    <div 
                      key={prod.id}
                      style={{ 
                        backgroundColor: '#FFFFFF', 
                        borderRadius: '20px', 
                        border: '1px solid var(--border-color)', 
                        overflow: 'hidden',
                        boxShadow: '0 2px 8px rgba(30, 64, 175, 0.03)',
                        transition: 'all var(--transition-normal)'
                      }}
                      className="product-card"
                    >
                      <img src={prod.image_url} alt={prod.name} style={{ width: '100%', height: '140px', objectFit: 'cover' }} />
                      <div style={{ padding: '14px' }}>
                        <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '8px', color: '#0F172A', height: '40px', overflow: 'hidden' }}>
                          <Link to={`/product/${prod.id}`} style={{ textDecoration: 'none', color: '#0F172A' }}>{prod.name}</Link>
                        </h4>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '14px', fontWeight: '800', color: '#2563EB' }}>
                            {formatCurrency(prod.price_per_share)}
                          </span>
                          <Link to={`/product/${prod.id}`} className="btn btn-outline btn-sm" style={{ padding: '4px 8px', fontSize: '12px' }}>
                            View
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: NOTIFICATIONS INBOX */}
          {activeTab === 'notifications' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {notifications.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', backgroundColor: '#FFFFFF', borderRadius: '24px', border: '1px solid var(--border-color)' }}>
                  <Bell size={40} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
                  <p style={{ color: 'var(--text-secondary)' }}>You have no notifications yet.</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div 
                    key={notif.id}
                    style={{ 
                      padding: '16px', 
                      borderRadius: '16px', 
                      backgroundColor: notif.is_read ? '#F8FAFC' : 'rgba(37, 99, 235, 0.04)',
                      border: '1px solid var(--border-color)',
                      borderLeft: notif.is_read ? '1px solid var(--border-color)' : '4px solid #2563EB',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '16px'
                    }}
                  >
                    <div>
                      <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#0F172A', marginBottom: '4px' }}>
                        {notif.title}
                      </h4>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                        {notif.message}
                      </p>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginTop: '6px' }}>
                        {new Date(notif.created_at).toLocaleString()}
                      </span>
                    </div>

                    {!notif.is_read && (
                      <button 
                        onClick={() => handleMarkRead(notif.id)}
                        className="btn btn-outline btn-sm"
                        style={{ flexShrink: 0, padding: '4px 8px', fontSize: '11px' }}
                      >
                        Dismiss
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* TRACKING STATUS MODAL */}
        {trackingModalOrder && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '20px' }}>
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', maxWidth: '480px', width: '100%', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', position: 'relative' }}>
              <button
                onClick={() => setTrackingModalOrder(null)}
                style={{ position: 'absolute', top: '16px', right: '16px', border: 'none', background: 'none', cursor: 'pointer', color: '#94A3B8' }}
              >
                <X size={20} />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <Truck size={22} style={{ color: '#2563EB' }} />
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A', margin: 0 }}>Order Tracking Details</h3>
              </div>

              <div style={{ backgroundColor: '#F8FAFC', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '20px' }}>
                <div style={{ fontSize: '12px', color: '#64748B' }}>Order Ref: <strong style={{ color: '#2563EB' }}>{trackingModalOrder.payment_reference || trackingModalOrder.id}</strong></div>
                <div style={{ fontSize: '14px', fontWeight: '800', color: '#0F172A', marginTop: '2px' }}>{trackingModalOrder.product_name}</div>
                <div style={{ fontSize: '12px', color: '#475569', marginTop: '4px' }}>Fulfillment Center: {trackingModalOrder.pickup_location || 'DELSU Site II Gate Shop 1B'}</div>
              </div>

              {/* Timeline Steps */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderLeft: '2px solid #DBEAFE', paddingLeft: '20px', marginLeft: '10px' }}>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '-27px', top: '2px', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#2563EB' }} />
                  <span style={{ fontSize: '13px', fontWeight: '800', color: '#0F172A', display: 'block' }}>Order Joined & Paid</span>
                  <span style={{ fontSize: '11px', color: '#64748B' }}>Payment confirmed via {trackingModalOrder.payment_method || 'KoboWise Escrow Wallet'}</span>
                </div>

                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '-27px', top: '2px', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: trackingModalOrder.status !== 'paid' ? '#2563EB' : '#CBD5E1' }} />
                  <span style={{ fontSize: '13px', fontWeight: '800', color: trackingModalOrder.status !== 'paid' ? '#0F172A' : '#64748B', display: 'block' }}>Trader Accepted & Processing</span>
                  <span style={{ fontSize: '11px', color: '#64748B' }}>{trackingModalOrder.trader_name || 'KoboWise Store'} has accepted the bulk order</span>
                </div>

                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '-27px', top: '2px', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: (trackingModalOrder.status === 'ready_for_pickup' || trackingModalOrder.status === 'delivered') ? '#2563EB' : '#CBD5E1' }} />
                  <span style={{ fontSize: '13px', fontWeight: '800', color: (trackingModalOrder.status === 'ready_for_pickup' || trackingModalOrder.status === 'delivered') ? '#0F172A' : '#64748B', display: 'block' }}>Awaiting Delivery / Pickup</span>
                  <span style={{ fontSize: '11px', color: '#64748B' }}>Package ready at {trackingModalOrder.pickup_location || 'DELSU Site II Gate'}</span>
                </div>

                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '-27px', top: '2px', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: trackingModalOrder.status === 'delivered' ? '#10B981' : '#CBD5E1' }} />
                  <span style={{ fontSize: '13px', fontWeight: '800', color: trackingModalOrder.status === 'delivered' ? '#10B981' : '#64748B', display: 'block' }}>Order Received & Confirmed</span>
                  <span style={{ fontSize: '11px', color: '#64748B' }}>{trackingModalOrder.status === 'delivered' ? 'Completed & Confirmed' : 'Pending student confirmation'}</span>
                </div>
              </div>

              <div style={{ marginTop: '24px', textAlign: 'right' }}>
                <button
                  onClick={() => setTrackingModalOrder(null)}
                  className="btn btn-primary btn-sm"
                  style={{ borderRadius: '20px' }}
                >
                  Close Tracking
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
