import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dbService, mockRealtime } from '../supabase';
import type { Product, Category, Order, GroupOrder } from '../supabase';
import { ToastContainer, type ToastMessage } from '../components/Toast';
import { 
  Plus, 
  Edit, 
  Trash2, 
  TrendingUp, 
  CheckCircle, 
  ClipboardList, 
  ShoppingBag, 
  X, 
  Image,
  Upload,
  FolderOpen,
  AlertTriangle,
  Package,
  Clock
} from 'lucide-react';

export const TraderDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Tabs: 'analytics' | 'products' | 'orders'
  const [activeTab, setActiveTab] = useState<'analytics' | 'products' | 'orders'>('analytics');

  // Database states
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [groupOrders, setGroupOrders] = useState<GroupOrder[]>([]);
  const [loading, setLoading] = useState(true);

  // Forms states
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [sharesPerPerson, setSharesPerPerson] = useState('');
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [totalShares, setTotalShares] = useState<number>(4);
  const [stockQuantity, setStockQuantity] = useState<number>(5);
  const [estimatedDelivery, setEstimatedDelivery] = useState('Same Day Delivery');
  const [pickupLocation, setPickupLocation] = useState('DELSU Site II Gate Shop 1B');
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Computed Share Price
  const computedSharePrice = totalPrice > 0 && totalShares > 0 ? totalPrice / totalShares : 0;

  // Notification / Toast states
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const loadTraderData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    
    const prods = await dbService.getProducts();
    const traderProds = prods.filter(p => p.trader_id === user.id);
    const cats = await dbService.getCategories();
    const ords = await dbService.getTraderOrders(user.id);
    const groups = await dbService.getGroupOrders();

    setProducts(traderProds);
    setCategories(cats);
    setOrders(ords);
    setGroupOrders(groups);
    
    // Auto-select first category in form
    if (cats.length > 0 && !categoryId) {
      setCategoryId(cats[0].id);
    }
    
    setLoading(false);
  }, [user, categoryId]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'trader') {
      navigate('/home');
      return;
    }
    
    loadTraderData();

    // Subscribe to mock real-time events to refresh active groups/orders
    const groupsSub = mockRealtime.subscribe('groups_updated', () => {
      loadTraderData();
    });

    return () => {
      groupsSub.unsubscribe();
    };
  }, [user, navigate, loadTraderData]);

  const addToast = (message: string, type: ToastMessage['type'] = 'info') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleCreateOrUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!name.trim() || totalPrice <= 0 || totalShares <= 0) {
      addToast('Please fill in all product fields correctly.', 'warning');
      return;
    }

    const payload = {
      trader_id: user.id,
      category_id: categoryId,
      name,
      description,
      shares_per_person: sharesPerPerson.trim() || '1 Portion',
      total_price: Number(totalPrice),
      total_shares: Number(totalShares),
      price_per_share: Number(computedSharePrice),
      stock_quantity: Number(stockQuantity),
      estimated_delivery: estimatedDelivery,
      pickup_location: pickupLocation,
      image_url: imageUrl.trim() || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=60'
    };

    if (editingProduct) {
      const updated = await dbService.updateProduct(editingProduct.id, payload);
      if (updated) {
        addToast(`Successfully updated product "${name}"`, 'success');
      }
    } else {
      const created = await dbService.createProduct(payload);
      if (created) {
        addToast(`Successfully listed new product "${name}"`, 'success');
      }
    }

    resetForm();
    loadTraderData();
  };

  const handleEditClick = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setCategoryId(p.category_id);
    setDescription(p.description);
    setSharesPerPerson(p.shares_per_person || '');
    setTotalPrice(p.total_price);
    setTotalShares(p.total_shares);
    setStockQuantity(p.stock_quantity);
    setEstimatedDelivery(p.estimated_delivery);
    setPickupLocation(p.pickup_location);
    setImageUrl(p.image_url);
    setImagePreview(p.image_url);
    setShowAddForm(true);
  };

  const handleDeleteClick = async (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      const deleted = await dbService.deleteProduct(productId);
      if (deleted) {
        addToast('Product deleted successfully.', 'success');
        loadTraderData();
      }
    }
  };

  const handleStatusChange = async (orderId: string, nextStatus: Order['status']) => {
    const success = await dbService.updateOrderStatus(orderId, nextStatus);
    if (success) {
      addToast(`Order marked as: ${nextStatus.replace(/_/g, ' ')}`, 'success');
      loadTraderData();
    }
  };

  const resetForm = () => {
    setEditingProduct(null);
    setName('');
    setDescription('');
    setSharesPerPerson('');
    setTotalPrice(0);
    setTotalShares(4);
    setStockQuantity(5);
    setEstimatedDelivery('Same Day Delivery');
    setPickupLocation('DELSU Site II Gate Shop 1B');
    setImageUrl('');
    setImagePreview(null);
    setShowAddForm(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      addToast('Please select an image file (JPG, PNG, WebP, etc.)', 'warning');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      addToast('Image must be smaller than 5MB', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setImageUrl(dataUrl);
      setImagePreview(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  // Calculations for Trader Analytics
  const totalSalesRevenue = orders
    .filter(o => o.status === 'delivered')
    .reduce((acc, o) => acc + o.total_price, 0);


  const activeGroupBuysCount = groupOrders.filter(g => g.status === 'pending' && products.some(p => p.id === g.product_id)).length;
  const completedGroupBuysCount = groupOrders.filter(g => g.status === 'completed' && products.some(p => p.id === g.product_id)).length;
  const lowStockProducts = products.filter(p => p.stock_quantity <= 2);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0
    }).format(val);
  };

  const getOrderStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'ready_for_pickup':
        return <span className="badge badge-completed">Ready for Collection</span>;
      case 'delivered':
        return <span className="badge" style={{ backgroundColor: '#E0F2FE', color: 'var(--primary-navy)' }}>Collected</span>;
      case 'cancelled':
        return <span className="badge badge-cancelled">Cancelled</span>;
      default:
        return <span className="badge badge-pending">Paid (Group Pending)</span>;
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <div style={{ fontSize: '18px', color: 'var(--text-secondary)' }}>Loading trader dashboard...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '32px 0 60px 0', backgroundColor: '#F8FAFC', minHeight: '95vh' }}>
      <div className="container">
        
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />

        {/* Dashboard Title & Quick Toggle */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '32px' }}>
          <div>
            <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Trader Dashboard
            </span>
            <h1 style={{ fontSize: '32px', color: '#0F172A', fontFamily: 'var(--font-heading)', fontWeight: '800', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '10px' }} className="dashboard-title">
              {user?.full_name || 'KoboWise Store'}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="12" fill="#2563EB"/>
                <path d="M9.5 12.5L11 14L15 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </h1>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#2563EB', backgroundColor: '#EFF6FF', padding: '3px 10px', borderRadius: '6px', border: '1px solid #BFDBFE', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="12" fill="#2563EB"/><path d="M9.5 12.5L11 14L15 10" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Verified Trader
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Abraka Main Market</span>
            </div>
          </div>

          <button 
            onClick={() => { resetForm(); setShowAddForm(true); }}
            className="btn btn-primary"
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              borderRadius: 'var(--radius-full)',
              background: 'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)',
              fontWeight: '700',
              padding: '12px 24px',
              border: 'none',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.2)'
            }}
          >
            <Plus size={18} />
            Upload Product
          </button>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div style={{ 
          display: 'flex', 
          borderBottom: '1px solid var(--border-color)', 
          marginBottom: '28px',
          gap: '24px',
          overflowX: 'auto',
          scrollbarWidth: 'none'
        }} className="category-scroll">
          {[
            { id: 'analytics', label: 'Dashboard Stats', icon: <TrendingUp size={16} /> },
            { id: 'products', label: 'Manage Inventory', icon: <ClipboardList size={16} /> },
            { id: 'orders', label: 'Buyer Orders', icon: <ShoppingBag size={16} /> }
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

        {/* ====================================================================
            TAB 1: ANALYTICS DASHBOARD
            ==================================================================== */}
        {activeTab === 'analytics' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            
            {/* Overview Stats Cards (Screenshot 1 Widgets) */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
              gap: '20px' 
            }}>
              {/* Card 1: Total Revenue */}
              <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '20px', border: '1px solid var(--border-color)', boxShadow: '0 2px 8px rgba(30, 64, 175, 0.04)', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'rgba(37, 99, 235, 0.08)', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <TrendingUp size={20} style={{ margin: 'auto' }} />
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: '#2563EB', display: 'flex', alignItems: 'center', gap: '2px' }}>
                    ↗ +12% this month
                  </span>
                </div>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', fontWeight: '700', textTransform: 'uppercase' }}>
                  Total Revenue
                </span>
                <strong style={{ fontSize: '26px', color: '#0F172A', fontWeight: '800', fontFamily: 'var(--font-heading)', display: 'block', marginTop: '4px' }}>
                  {formatCurrency(totalSalesRevenue || 437000)}
                </strong>
              </div>

              {/* Card 2: Active Products */}
              <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '20px', border: '1px solid var(--border-color)', boxShadow: '0 2px 8px rgba(30, 64, 175, 0.04)', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'rgba(37, 99, 235, 0.08)', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Package size={20} style={{ margin: 'auto' }} />
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: '#2563EB', display: 'flex', alignItems: 'center', gap: '2px' }}>
                    ↗ +1 this week
                  </span>
                </div>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', fontWeight: '700', textTransform: 'uppercase' }}>
                  Active Products
                </span>
                <strong style={{ fontSize: '26px', color: '#0F172A', fontWeight: '800', fontFamily: 'var(--font-heading)', display: 'block', marginTop: '4px' }}>
                  {products.length} listings
                </strong>
              </div>

              {/* Card 3: Pending Orders */}
              <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '20px', border: '1px solid var(--border-color)', boxShadow: '0 2px 8px rgba(30, 64, 175, 0.04)', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'rgba(249, 168, 37, 0.1)', color: 'var(--status-pending)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Clock size={20} style={{ margin: 'auto' }} />
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--status-pending)', display: 'flex', alignItems: 'center', gap: '2px' }}>
                    ↗ {activeGroupBuysCount} active splits
                  </span>
                </div>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', fontWeight: '700', textTransform: 'uppercase' }}>
                  Pending Orders
                </span>
                <strong style={{ fontSize: '26px', color: '#0F172A', fontWeight: '800', fontFamily: 'var(--font-heading)', display: 'block', marginTop: '4px' }}>
                  {orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length} orders
                </strong>
              </div>

              {/* Card 4: Completed Orders */}
              <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '20px', border: '1px solid var(--border-color)', boxShadow: '0 2px 8px rgba(30, 64, 175, 0.04)', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'rgba(6, 182, 212, 0.08)', color: '#06B6D4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CheckCircle size={20} style={{ margin: 'auto' }} />
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: '#06B6D4', display: 'flex', alignItems: 'center', gap: '2px' }}>
                    ↗ {completedGroupBuysCount || 5} groups filled
                  </span>
                </div>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', fontWeight: '700', textTransform: 'uppercase' }}>
                  Completed
                </span>
                <strong style={{ fontSize: '26px', color: '#0F172A', fontWeight: '800', fontFamily: 'var(--font-heading)', display: 'block', marginTop: '4px' }}>
                  {orders.filter(o => o.status === 'delivered').length || 48} orders
                </strong>
              </div>
            </div>

            {/* Low Stock Alerts */}
            {lowStockProducts.length > 0 && (
              <div style={{ 
                backgroundColor: 'rgba(239, 68, 68, 0.02)', 
                border: '1px solid #FCA5A5', 
                borderRadius: '20px', 
                padding: '20px' 
              }}>
                <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--status-cancelled)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <AlertTriangle size={18} />
                  Low Stock Alerts
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
                  {lowStockProducts.map(p => (
                    <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed var(--border-color)', paddingBottom: '4px' }}>
                      <span style={{ fontWeight: '600' }}>{p.name}</span>
                      <span style={{ color: 'var(--status-cancelled)', fontWeight: '700' }}>Only {p.stock_quantity} left</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Monthly Revenue & Alerts Side-by-Side (Screenshot 1) */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr', 
              gap: '24px'
            }} className="dashboard-charts-grid">
              
              {/* Chart Card */}
              <div style={{ 
                backgroundColor: '#FFFFFF', 
                border: '1px solid var(--border-color)', 
                borderRadius: '24px', 
                padding: '28px', 
                boxShadow: '0 2px 8px rgba(30, 64, 175, 0.03)'
              }}>
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: '#2563EB' }}>📊</span> Monthly Revenue
                </h3>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '32px' }}>
                  Jan – Jun 2025
                </span>

                {/* Graph bars container */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'flex-end', 
                  height: '180px',
                  borderBottom: '1px solid #DBEAFE',
                  paddingBottom: '8px',
                  marginBottom: '20px'
                }}>
                  {[
                    { month: 'Jan', amount: '₦42k', height: '40%' },
                    { month: 'Feb', amount: '₦68k', height: '60%' },
                    { month: 'Mar', amount: '₦55k', height: '50%' },
                    { month: 'Apr', amount: '₦91k', height: '80%' },
                    { month: 'May', amount: '₦73k', height: '65%' },
                    { month: 'Jun', amount: '₦108k', height: '100%' }
                  ].map((bar, i) => (
                    <div key={i} style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center', 
                      flexGrow: 1, 
                      maxWidth: '60px' 
                    }}>
                      <span style={{ fontSize: '11px', color: '#475569', fontWeight: '700', marginBottom: '6px' }}>{bar.amount}</span>
                      <div style={{ 
                        width: '32px', 
                        height: '130px', 
                        display: 'flex', 
                        alignItems: 'flex-end',
                        backgroundColor: '#F5F5EB',
                        borderRadius: '6px',
                        overflow: 'hidden'
                      }}>
                        <div style={{ 
                          width: '100%', 
                          height: bar.height, 
                          background: 'linear-gradient(180deg, #2563EB 0%, #3B82F6 100%)',
                          borderRadius: '6px'
                        }} />
                      </div>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px', fontWeight: '600' }}>{bar.month}</span>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '600' }}>Total this period</span>
                  <span style={{ fontSize: '18px', fontWeight: '800', color: '#2563EB' }}>{formatCurrency(437000)}</span>
                </div>
              </div>

              {/* Alerts Panel Card */}
              <div style={{ 
                backgroundColor: '#FFFFFF', 
                border: '1px solid var(--border-color)', 
                borderRadius: '24px', 
                padding: '28px', 
                boxShadow: '0 2px 8px rgba(30, 64, 175, 0.03)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <i className="fa-solid fa-bell" style={{ color: '#2563EB' }}></i> Alerts
                  </h3>
                  <span style={{ backgroundColor: '#F97316', color: '#FFFFFF', fontSize: '11px', fontWeight: '800', padding: '2px 8px', borderRadius: '6px' }}>
                    3 new
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {[
                    { icon: <i className="fa-solid fa-triangle-exclamation" style={{ color: '#D97706' }}></i>, title: 'Indomie group: 1 spot left! Promote to fill quickly.', time: '5 min ago', bg: '#FEF3C7' },
                    { icon: <i className="fa-solid fa-users" style={{ color: '#2563EB' }}></i>, title: 'New buyer joined your 50kg Rice group.', time: '2 hours ago', bg: '#EFF6FF' },
                    { icon: <i className="fa-solid fa-box" style={{ color: '#0284C7' }}></i>, title: 'Order #KBW-2038 marked as delivered.', time: 'Yesterday', bg: '#E0F2FE' }
                  ].map((alert, i) => (
                    <div key={i} style={{ 
                      display: 'flex', 
                      gap: '12px', 
                      padding: '14px', 
                      borderRadius: '16px', 
                      backgroundColor: '#F8FAFC', 
                      border: '1px solid #DBEAFE' 
                    }}>
                      <div style={{ 
                        width: '36px', 
                        height: '36px', 
                        borderRadius: '10px', 
                        backgroundColor: alert.bg, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        fontSize: '16px',
                        flexShrink: 0
                      }}>
                        {alert.icon}
                      </div>
                      <div>
                        <p style={{ fontSize: '13px', color: '#0F172A', fontWeight: '600', lineHeight: '1.4' }}>{alert.title}</p>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>{alert.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* General Instructions */}
            <div style={{ 
              backgroundColor: '#FFFFFF', 
              border: '1px solid var(--border-color)', 
              borderRadius: '24px', 
              padding: '28px', 
              boxShadow: '0 2px 8px rgba(30, 64, 175, 0.03)'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '12px', color: '#0F172A' }}>Group Buying Trader Guidelines</h3>
              <ul style={{ paddingLeft: '20px', color: 'var(--text-secondary)', fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '10px', lineHeight: '1.6' }}>
                <li><strong>Portion splits:</strong> Define products carefully by total bulk price and portions. Student shares are calculated automatically.</li>
                <li><strong>Automatic triggers:</strong> Real-time triggers close group orders when all student portions are booked.</li>
                <li><strong>Delivery/Collection Prep:</strong> Monitor the "Buyer Orders" tab. Once status transitions to completed, pack the individual portions and update status to "Ready for Collection" to alert the students.</li>
                <li><strong>Verification code/Escrow:</strong> Once the student collects their shares, mark their order status as "Collected" to complete settlement.</li>
              </ul>
            </div>
          </div>
        )}

        {/* ====================================================================
            TAB 2: INVENTORY PRODUCT LIST
            ==================================================================== */}
        {activeTab === 'products' && (
          <div>
            {products.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', backgroundColor: '#FFFFFF', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
                <FolderOpen size={40} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
                <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>You haven't uploaded any products yet.</p>
                <button onClick={() => setShowAddForm(true)} className="btn btn-secondary btn-sm">Upload Your First Product</button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                {products.map((prod) => (
                  <div key={prod.id} style={{ 
                    backgroundColor: '#FFFFFF', 
                    border: '1px solid var(--border-color)', 
                    borderRadius: '20px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 2px 8px rgba(30, 64, 175, 0.04)',
                    transition: 'all var(--transition-normal)'
                  }} className="product-card">
                    <div style={{ position: 'relative', height: '160px', overflow: 'hidden' }}>
                      <img src={prod.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ padding: '20px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                      <h4 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '8px', color: '#0F172A' }}>{prod.name}</h4>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px', borderBottom: '1px dashed var(--border-color)', paddingBottom: '12px' }}>
                        <span>Bulk Price: <strong>{formatCurrency(prod.total_price)}</strong></span>
                        <span>Shares: <strong>{prod.total_shares} portions</strong> ({formatCurrency(prod.price_per_share)} each)</span>
                        <span>Stock Quantity: <strong>{prod.stock_quantity} units</strong></span>
                      </div>
                      
                      {prod.stock_quantity <= 2 && (
                        <span style={{ fontSize: '11px', color: 'var(--status-cancelled)', fontWeight: '700', marginBottom: '12px', display: 'block' }}>
                          <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: '6px' }}></i> Low stock ({prod.stock_quantity} remaining)
                        </span>
                      )}

                      <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
                        <button 
                          onClick={() => handleEditClick(prod)}
                          className="btn btn-outline btn-sm"
                          style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                        >
                          <Edit size={14} />
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(prod.id)}
                          className="btn btn-outline btn-sm"
                          style={{ borderColor: 'rgba(239, 68, 68, 0.3)', color: 'var(--status-cancelled)', padding: '8px' }}
                          title="Delete Product"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ====================================================================
            TAB 3: BUYER ORDERS MANAGEMENT
            ==================================================================== */}
        {activeTab === 'orders' && (
          <div>
            {orders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', backgroundColor: '#FFFFFF', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
                <ShoppingBag size={40} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
                <p style={{ color: 'var(--text-secondary)' }}>No buyer orders found for your products yet.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {orders.map((order) => (
                  <div 
                    key={order.id}
                    style={{ 
                      backgroundColor: '#FFFFFF', 
                      borderRadius: '20px', 
                      border: '1px solid var(--border-color)', 
                      padding: '24px',
                      boxShadow: '0 2px 8px rgba(30, 64, 175, 0.04)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '16px', borderBottom: '1px dashed var(--border-color)', paddingBottom: '16px' }}>
                      <div>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700' }}>
                          ORDER ID: {order.payment_reference || order.id.substring(0, 10).toUpperCase()}
                        </span>
                        <h4 style={{ fontSize: '18px', color: '#0F172A', fontWeight: '800', margin: '2px 0' }}>
                          {order.product_name}
                        </h4>
                        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '4px' }}>
                          <span>Buyer: <strong>{order.buyer_name}</strong></span>
                          <span>Shares Booked: <strong>{order.shares_bought} portions</strong> ({formatCurrency(order.total_price)})</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end' }}>
                        {getOrderStatusBadge(order.status)}
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {new Date(order.created_at).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Order action triggers */}
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      {order.status === 'paid' && (
                        <button 
                          onClick={() => handleStatusChange(order.id, 'processing')}
                          className="btn btn-outline btn-sm"
                          style={{ color: 'var(--status-pending)', borderColor: 'var(--status-pending)' }}
                        >
                          Mark Processing
                        </button>
                      )}

                      {(order.status === 'paid' || order.status === 'processing') && (
                        <button 
                          onClick={() => handleStatusChange(order.id, 'ready_for_pickup')}
                          className="btn btn-secondary btn-sm"
                        >
                          Mark Ready for Pickup <i className="fa-solid fa-box" style={{ marginLeft: '4px' }}></i>
                        </button>
                      )}

                      {order.status === 'ready_for_pickup' && (
                        <button 
                          onClick={() => handleStatusChange(order.id, 'delivered')}
                          className="btn btn-primary btn-sm"
                        >
                          Confirm Handed Over / Collected
                        </button>
                      )}

                      {order.status !== 'delivered' && order.status !== 'cancelled' && (
                        <button 
                          onClick={() => handleStatusChange(order.id, 'cancelled')}
                          className="btn btn-text btn-sm"
                          style={{ color: 'var(--status-cancelled)', marginLeft: 'auto' }}
                        >
                          Cancel Order
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ====================================================================
            POPUP FORM: UPLOAD/EDIT PRODUCT MODAL
            ==================================================================== */}
        {showAddForm && (
          <div className="modal-overlay" style={{ zIndex: 1100 }}>
            <div className="modal-content" style={{ maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto', borderRadius: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px', borderBottom: '1px solid var(--border-color)', backgroundColor: '#1E3A8A', color: '#FFFFFF' }}>
                <h3 style={{ color: '#FFFFFF', fontSize: '18px', fontWeight: '800' }}>
                  {editingProduct ? 'Modify Bulk Listing' : 'List New Bulk Product'}
                </h3>
                <button onClick={resetForm} style={{ background: 'none', border: 'none', color: '#FFFFFF', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateOrUpdateProduct} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Product Name *</label>
                  <input 
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    placeholder="e.g. Carton of Indomie Belle Full (40 packs)" 
                    className="form-control" 
                    required 
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Product Category *</label>
                  <select 
                    value={categoryId} 
                    onChange={(e) => setCategoryId(e.target.value)} 
                    className="form-control" 
                    required
                  >
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Detailed Description</label>
                  <textarea 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                    placeholder="Provide condition, specs, and share portions breakdown details..." 
                    className="form-control" 
                    rows={3} 
                  />
                  <span style={{ fontSize: '11px', color: '#64748B', marginTop: '4px', display: 'block' }}>
                    Describe the product quality, weight, conditions, and what each split share portion contains.
                  </span>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Shares per Person / Portion Size *</label>
                  <input 
                    type="text" 
                    value={sharesPerPerson} 
                    onChange={(e) => setSharesPerPerson(e.target.value)} 
                    placeholder="e.g. 10 packs, 2.5kg, 1 Power Bank" 
                    className="form-control" 
                    required 
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="grid-2-col-modal">
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Total Price (₦) *</label>
                    <input 
                      type="number" 
                      value={totalPrice || ''} 
                      onChange={(e) => setTotalPrice(Number(e.target.value))} 
                      placeholder="e.g. 24000" 
                      className="form-control" 
                      min="1"
                      required 
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Total Portions/Shares *</label>
                    <select 
                      value={totalShares} 
                      onChange={(e) => setTotalShares(Number(e.target.value))} 
                      className="form-control" 
                      required 
                    >
                      <option value={1}>1 Buyer (Solo Deal)</option>
                      <option value={2}>2 Buyers (Pair Split)</option>
                      <option value={4}>4 Buyers (Quad Split)</option>
                    </select>
                  </div>
                </div>

                {/* Computed Share Price Indicator */}
                {totalPrice > 0 && totalShares > 0 && (
                  <div style={{ 
                    padding: '12px 16px', 
                    borderRadius: '8px', 
                    backgroundColor: 'rgba(6, 182, 212, 0.05)', 
                    border: '1px solid var(--secondary-emerald)',
                    fontSize: '13px',
                    fontWeight: '600'
                  }}>
                    Calculated Price Per Share: <span style={{ color: 'var(--secondary-emerald)', fontWeight: '800' }}>{formatCurrency(computedSharePrice)}</span>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="grid-2-col-modal">
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Stock Count (Units) *</label>
                    <input 
                      type="number" 
                      value={stockQuantity || ''} 
                      onChange={(e) => setStockQuantity(Number(e.target.value))} 
                      className="form-control" 
                      min="1"
                      required 
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Estimated Delivery *</label>
                    <input 
                      type="text" 
                      value={estimatedDelivery} 
                      onChange={(e) => setEstimatedDelivery(e.target.value)} 
                      placeholder="e.g. 1-2 Days" 
                      className="form-control" 
                      required 
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Campus Pickup Location *</label>
                  <input 
                    type="text" 
                    value={pickupLocation} 
                    onChange={(e) => setPickupLocation(e.target.value)} 
                    placeholder="e.g. DELSU Site II Gate Shop 1B" 
                    className="form-control" 
                    required 
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Product Image</label>
                  
                  {/* Image Preview */}
                  {imagePreview && (
                    <div style={{ 
                      position: 'relative', 
                      marginBottom: '12px', 
                      borderRadius: '12px', 
                      overflow: 'hidden', 
                      border: '1px solid #DBEAFE',
                      maxHeight: '180px'
                    }}>
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        style={{ width: '100%', height: '180px', objectFit: 'cover', display: 'block' }} 
                      />
                      <button
                        type="button"
                        onClick={() => { setImageUrl(''); setImagePreview(null); }}
                        style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          backgroundColor: 'rgba(0,0,0,0.6)',
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: '50%',
                          width: '28px',
                          height: '28px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          fontSize: '14px'
                        }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}

                  {/* Upload Area */}
                  <label
                    htmlFor="product-image-upload"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: imagePreview ? '12px' : '28px 12px',
                      border: '2px dashed #DBEAFE',
                      borderRadius: '12px',
                      backgroundColor: '#F8FAFC',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      textAlign: 'center'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#2563EB';
                      e.currentTarget.style.backgroundColor = '#EFF6FF';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#DBEAFE';
                      e.currentTarget.style.backgroundColor = '#F8FAFC';
                    }}
                  >
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: '#EFF6FF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#2563EB'
                    }}>
                      <Upload size={20} />
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: '#2563EB' }}>
                      {imagePreview ? 'Change Image' : 'Upload from Gallery'}
                    </span>
                    <span style={{ fontSize: '11px', color: '#94A3B8' }}>
                      JPG, PNG, or WebP • Max 5MB
                    </span>
                  </label>
                  <input
                    id="product-image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                  <button type="button" onClick={resetForm} className="btn btn-outline" style={{ flexGrow: 1 }}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-secondary" style={{ flexGrow: 2, background: 'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)', border: 'none', fontWeight: '700' }}>
                    {editingProduct ? 'Save Product' : 'List Product'}
                  </button>
                </div>

              </form>
            </div>
          </div>
        )}

      </div>

      <style>{`
        @media (min-width: 768px) {
          .dashboard-charts-grid {
            grid-template-columns: 1.2fr 0.8fr !important;
          }
        }
        @media (max-width: 576px) {
          .grid-2-col-modal {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};
