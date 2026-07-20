import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dbService, mockRealtime } from '../supabase';
import type { Order, Product, Notification, GroupOrder } from '../supabase';
import { ProgressBar } from '../components/ProgressBar';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { 
  ShoppingBag, 
  Heart, 
  Bell, 
  MapPin, 
  ClipboardList,
  TrendingUp,
  FolderOpen,
  CheckCircle,
  Trash2
} from 'lucide-react';

export const Profile: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as any) || 'groups';
  const [activeTab, setActiveTab] = useState<'groups' | 'orders' | 'wishlist' | 'notifications'>(initialTab);

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

  const getOrderStatusStyle = (status: Order['status']) => {
    switch (status) {
      case 'ready_for_pickup':
        return { color: 'var(--status-completed)', backgroundColor: 'var(--status-completed-bg)' };
      case 'delivered':
        return { color: 'var(--primary-navy)', backgroundColor: '#E0F2FE' };
      case 'cancelled':
        return { color: 'var(--status-cancelled)', backgroundColor: 'var(--status-cancelled-bg)' };
      default:
        return { color: 'var(--status-pending)', backgroundColor: 'var(--status-pending-bg)' };
    }
  };

  const getOrderStatusText = (status: Order['status']) => {
    switch (status) {
      case 'ready_for_pickup': 
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            Ready for Pickup <i className="fa-solid fa-box" style={{ fontSize: '11px' }}></i>
          </span>
        );
      case 'delivered': 
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            Delivered/Collected <i className="fa-solid fa-circle-check" style={{ fontSize: '11px' }}></i>
          </span>
        );
      case 'cancelled': 
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            Cancelled <i className="fa-solid fa-circle-xmark" style={{ fontSize: '11px' }}></i>
          </span>
        );
      case 'processing': 
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            Processing Order <i className="fa-solid fa-gear fa-spin" style={{ fontSize: '11px' }}></i>
          </span>
        );
      default: 
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            Paid (Group Pending) <i className="fa-regular fa-clock" style={{ fontSize: '11px' }}></i>
          </span>
        );
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
          {/* TAB 1: ACTIVE GROUP BUYS */}
          {activeTab === 'groups' && (
            <div>
              {activeOrders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', backgroundColor: '#FFFFFF', borderRadius: '24px', border: '1px solid var(--border-color)' }}>
                  <ClipboardList size={40} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>No active group splits at the moment.</p>
                  <Link to="/home" className="btn btn-secondary btn-sm">Browse Products</Link>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {activeOrders.map((order) => {
                    const group = groupOrders.find(g => g.id === order.group_order_id);
                    // Determine custom badges
                    const sharesLeft = group ? group.shares_needed - group.shares_purchased : 0;
                    let badgeText = 'Just Started';
                    let badgeBg = '#E0F2FE';
                    let badgeColor = '#0284C7';
                    
                    if (sharesLeft === 1) {
                      badgeText = 'Almost Complete';
                      badgeBg = '#FFE4E6';
                      badgeColor = '#E11D48';
                    } else if (sharesLeft === 2) {
                      badgeText = 'In Progress';
                      badgeBg = '#FEF3C7';
                      badgeColor = '#D97706';
                    }
                    
                    return (
                      <div 
                        key={order.id}
                        style={{ 
                          backgroundColor: '#FFFFFF', 
                          borderRadius: '20px', 
                          border: '1px solid var(--border-color)', 
                          padding: '24px',
                          boxShadow: '0 2px 8px rgba(30, 64, 175, 0.03)'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                          <div>
                            <span style={{ fontSize: '11px', color: '#2563EB', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '2px' }}>
                              ORDER #: {order.payment_reference || order.id}
                            </span>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              Trader: {order.trader_name}
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
                                <circle cx="12" cy="12" r="12" fill="#2563EB"/>
                                <path d="M9.5 12.5L11 14L15 10" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </span>
                            <h4 style={{ fontSize: '18px', color: '#0F172A', fontWeight: '800', margin: '2px 0 6px 0', fontFamily: 'var(--font-heading)' }}>
                              {order.product_name}
                            </h4>
                            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                              Your Share: <strong>{order.shares_bought} portions</strong> paid at <strong style={{ color: '#2563EB' }}>{formatCurrency(order.total_price)}</strong>
                            </span>
                          </div>

                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                            <span className="badge" style={{ backgroundColor: badgeBg, color: badgeColor, textTransform: 'none', fontWeight: '700' }}>
                              {badgeText}
                            </span>
                            <span className="badge" style={getOrderStatusStyle(order.status)}>
                              {getOrderStatusText(order.status)}
                            </span>
                            <button
                              type="button"
                              onClick={async () => {
                                if (!user) return;
                                if (window.confirm(`Are you sure you want to cancel and delete Order #${order.payment_reference || order.id}? This will free up your share and update the group progress bar.`)) {
                                  await dbService.deleteOrder(order.id, user.id);
                                  loadProfileData();
                                }
                              }}
                              title="Cancel & Delete Order"
                              style={{
                                backgroundColor: '#FEF2F2',
                                color: '#EF4444',
                                border: '1px solid #FECACA',
                                borderRadius: '12px',
                                padding: '5px 10px',
                                fontSize: '12px',
                                fontWeight: '700',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                marginLeft: '4px'
                              }}
                            >
                              <Trash2 size={13} /> Delete
                            </button>
                          </div>
                        </div>

                        {/* Progress Bar of actual group order */}
                        {group && (
                          <div style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                              <span>Split Progress</span>
                              <span style={{ color: '#2563EB' }}>{group.shares_purchased}/{group.shares_needed} joined</span>
                            </div>
                            <ProgressBar purchased={group.shares_purchased} needed={group.shares_needed} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ORDER HISTORY */}
          {activeTab === 'orders' && (
            <div>
              {completedOrdersList.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', backgroundColor: '#FFFFFF', borderRadius: '24px', border: '1px solid var(--border-color)' }}>
                  <ShoppingBag size={40} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
                  <p style={{ color: 'var(--text-secondary)' }}>No completed orders on your invoice history.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {completedOrdersList.map((order) => (
                    <div 
                      key={order.id}
                      style={{ 
                        backgroundColor: '#FFFFFF', 
                        borderRadius: '20px', 
                        border: '1px solid var(--border-color)', 
                        padding: '20px',
                        boxShadow: '0 2px 8px rgba(30, 64, 175, 0.03)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                        <div>
                          <span style={{ fontSize: '11px', color: '#2563EB', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '2px' }}>
                            ORDER #: {order.payment_reference || order.id}
                          </span>
                          <h4 style={{ fontSize: '16px', color: '#0F172A', fontWeight: '800', margin: '2px 0 4px 0', fontFamily: 'var(--font-heading)' }}>
                            {order.product_name}
                          </h4>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                            <span>Shares Bought: <strong>{order.shares_bought} shares</strong> ({formatCurrency(order.total_price)})</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#2563EB', fontWeight: '600', marginTop: '4px' }}>
                              <MapPin size={13} />
                              Pickup: {order.pickup_location}
                            </span>
                          </div>
                        </div>

                        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end' }}>
                          <span className="badge" style={getOrderStatusStyle(order.status)}>
                            {getOrderStatusText(order.status)}
                          </span>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                            {new Date(order.created_at).toLocaleDateString()}
                          </span>
                          <button
                            type="button"
                            onClick={async () => {
                              if (!user) return;
                              if (window.confirm(`Are you sure you want to delete Order #${order.payment_reference || order.id}?`)) {
                                await dbService.deleteOrder(order.id, user.id);
                                loadProfileData();
                              }
                            }}
                            title="Delete Order"
                            style={{
                              backgroundColor: '#FEF2F2',
                              color: '#EF4444',
                              border: '1px solid #FECACA',
                              borderRadius: '10px',
                              padding: '4px 8px',
                              fontSize: '11px',
                              fontWeight: '700',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              marginTop: '4px'
                            }}
                          >
                            <Trash2 size={12} /> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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

      </div>
    </div>
  );
};
