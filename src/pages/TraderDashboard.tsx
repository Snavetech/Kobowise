import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dbService, mockRealtime } from '../supabase';
import type { Product, Category, Order, GroupOrder } from '../supabase';
import { ToastContainer, type ToastMessage } from '../components/Toast';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { KoboWiseModal } from '../components/KoboWiseModal';
import { 
  Plus, 
  Edit, 
  Trash2, 
  TrendingUp, 
  CheckCircle, 
  ClipboardList, 
  ShoppingBag, 
  X, 
  Upload,
  FolderOpen,
  AlertTriangle,
  Package,
  Clock,
  Bell
} from 'lucide-react';

export const TraderDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Tabs: 'analytics' | 'products' | 'orders'
  const [activeTab, setActiveTab] = useState<'analytics' | 'products' | 'orders'>('analytics');

  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText: string;
    type: 'danger' | 'confirm';
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    type: 'danger',
    onConfirm: () => {}
  });

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
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifDrawer, setShowNotifDrawer] = useState(false);

  const loadTraderData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    
    const prods = await dbService.getProducts();
    const traderProds = prods.filter(p => p.trader_id === user.id);
    const cats = await dbService.getCategories();
    const ords = await dbService.getTraderOrders(user.id);
    const groups = await dbService.getGroupOrders();
    const notifs = await dbService.getNotifications(user.id);

    setProducts(traderProds);
    setCategories(cats);
    setOrders(ords);
    setGroupOrders(groups);
    setNotifications(notifs);
    
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

    // Subscribe to mock real-time events to refresh active groups/orders/notifications
    const groupsSub = mockRealtime.subscribe('groups_updated', () => {
      loadTraderData();
    });

    const notifsSub = mockRealtime.subscribe('notifications_updated', () => {
      if (user) {
        dbService.getNotifications(user.id).then(setNotifications);
      }
    });

    const toggleDrawerSub = mockRealtime.subscribe('toggle_notif_drawer', () => {
      setShowNotifDrawer(prev => !prev);
    });

    return () => {
      groupsSub.unsubscribe();
      notifsSub.unsubscribe();
      toggleDrawerSub.unsubscribe();
    };
  }, [user, navigate, loadTraderData]);

  const markNotificationRead = async (id: string) => {
    await dbService.markNotificationAsRead(id);
    if (user) {
      const notifs = await dbService.getNotifications(user.id);
      setNotifications(notifs);
    }
  };

  const markAllNotificationsRead = async () => {
    if (user) {
      await dbService.markAllNotificationsAsRead(user.id);
      const notifs = await dbService.getNotifications(user.id);
      setNotifications(notifs);
    }
  };

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

  const handleDeleteClick = (productId: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Product Listing',
      message: 'Are you sure you want to delete this product listing from KoboWise? This action cannot be undone.',
      confirmText: 'Delete Listing',
      type: 'danger',
      onConfirm: async () => {
        const deleted = await dbService.deleteProduct(productId);
        if (deleted) {
          addToast('Product deleted successfully.', 'success');
          loadTraderData();
        }
      }
    });
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

  // Dynamic Monthly Revenue Calculation matching current time and date
  const monthlyRevenueInfo = React.useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonthIndex = now.getMonth();

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Generate 6 months sequence ending at the current month & year
    const last6Months: Array<{ month: string; year: number; monthKey: string }> = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentYear, currentMonthIndex - i, 1);
      const mName = monthNames[d.getMonth()];
      const yr = d.getFullYear();
      const mKey = `${yr}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      last6Months.push({ month: mName, year: yr, monthKey: mKey });
    }

    // Default base revenue values to preserve existing data profile
    const defaultAmounts = [42000, 68000, 55000, 91000, 73000, 108000];

    // Map order sales into matching month buckets
    const monthTotals = last6Months.map((mObj, idx) => {
      const actualSales = orders
        .filter(o => (o.status === 'delivered' || o.status === 'ready_for_pickup' || o.status === 'paid' || o.status === 'processing'))
        .filter(o => {
          const oDate = new Date(o.created_at || Date.now());
          const oKey = `${oDate.getFullYear()}-${String(oDate.getMonth() + 1).padStart(2, '0')}`;
          return oKey === mObj.monthKey;
        })
        .reduce((sum, o) => sum + o.total_price, 0);

      const totalVal = defaultAmounts[idx] + actualSales;
      return {
        month: mObj.month,
        year: mObj.year,
        amountVal: totalVal,
        amount: totalVal >= 1000 ? `₦${Math.round(totalVal / 1000)}k` : `₦${totalVal}`
      };
    });

    const maxVal = Math.max(...monthTotals.map(b => b.amountVal), 1);
    const bars = monthTotals.map(b => ({
      ...b,
      height: `${Math.max(25, Math.round((b.amountVal / maxVal) * 100))}%`
    }));

    const startMonth = last6Months[0].month;
    const endMonth = last6Months[5].month;
    const startYear = last6Months[0].year;
    const endYear = last6Months[5].year;
    const rangeLabel = startYear === endYear 
      ? `${startMonth} – ${endMonth} ${endYear}` 
      : `${startMonth} ${startYear} – ${endMonth} ${endYear}`;

    const periodTotal = monthTotals.reduce((acc, b) => acc + b.amountVal, 0);

    return {
      rangeLabel,
      bars,
      periodTotal
    };
  }, [orders]);


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
      case 'paid':
      case 'processing':
        return <span className="badge" style={{ backgroundColor: '#FEF3C7', color: '#D97706', border: '1px solid #FDE68A', fontWeight: '800' }}>Processing Order</span>;
      case 'ready_for_pickup':
        return <span className="badge" style={{ backgroundColor: '#DCFCE7', color: '#15803D', border: '1px solid #BBF7D0', fontWeight: '800' }}>Processed Order</span>;
      case 'delivered':
        return <span className="badge" style={{ backgroundColor: '#E0F2FE', color: '#0369A1', border: '1px solid #BAE6FD', fontWeight: '800' }}>Delivered & Collected</span>;
      case 'refund_requested':
        return <span className="badge" style={{ backgroundColor: '#FEE2E2', color: '#DC2626', border: '1px solid #FCA5A5', fontWeight: '800' }}>Refund Requested</span>;
      case 'refunded':
        return <span className="badge badge-cancelled">Refunded</span>;
      case 'cancelled':
        return <span className="badge badge-cancelled">Cancelled</span>;
      default:
        return <span className="badge badge-pending">Processing Order</span>;
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading trader dashboard..." fullPage />;
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
                  <TrendingUp size={18} style={{ color: '#2563EB' }} /> Monthly Revenue
                </h3>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '32px' }}>
                  {monthlyRevenueInfo.rangeLabel}
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
                  {monthlyRevenueInfo.bars.map((bar, i) => (
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
                          borderRadius: '6px',
                          transition: 'height 0.3s ease'
                        }} />
                      </div>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px', fontWeight: '600' }}>{bar.month}</span>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '600' }}>Total this period</span>
                  <span style={{ fontSize: '18px', fontWeight: '800', color: '#2563EB' }}>{formatCurrency(monthlyRevenueInfo.periodTotal)}</span>
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
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                      {/* 1. Processing Order -> Trader confirms order */}
                      {(order.status === 'paid' || order.status === 'processing') && (
                        <button 
                          onClick={() => handleStatusChange(order.id, 'ready_for_pickup')}
                          className="btn btn-secondary btn-sm"
                          style={{ background: 'linear-gradient(135deg, #2563EB, #3B82F6)', border: 'none', color: '#FFFFFF', fontWeight: '800', borderRadius: '12px', padding: '10px 22px' }}
                        >
                          Confirm Order
                        </button>
                      )}

                      {/* 3. Refund Requested State -> Approve or Reject */}
                      {order.status === 'refund_requested' && (
                        <>
                          <button 
                            onClick={async () => {
                              const success = await dbService.processRefund(order.id, true);
                              if (success) {
                                addToast(`Approved refund of ${formatCurrency(order.total_price)} for ${order.buyer_name || 'buyer'}`, 'success');
                                loadTraderData();
                              }
                            }}
                            className="btn btn-sm"
                            style={{ backgroundColor: '#DC2626', color: '#FFFFFF', border: 'none', borderRadius: '12px', padding: '10px 20px', fontWeight: '800' }}
                          >
                            Approve Refund ({formatCurrency(order.total_price)})
                          </button>
                          <button 
                            onClick={async () => {
                              const success = await dbService.processRefund(order.id, false);
                              if (success) {
                                addToast('Refund request rejected.', 'info');
                                loadTraderData();
                              }
                            }}
                            className="btn btn-outline btn-sm"
                            style={{ borderRadius: '12px', padding: '10px 16px', fontWeight: '700' }}
                          >
                            Reject Refund
                          </button>
                        </>
                      )}

                      {/* Issue Refund / Cancel Button for active orders */}
                      {order.status !== 'delivered' && order.status !== 'cancelled' && order.status !== 'refunded' && order.status !== 'refund_requested' && (
                        <button 
                          onClick={() => {
                            setConfirmModal({
                              isOpen: true,
                              title: 'Issue Full Refund',
                              message: `Are you sure you want to issue a full refund of ${formatCurrency(order.total_price)} to ${order.buyer_name || 'buyer'}?`,
                              confirmText: 'Approve & Refund',
                              type: 'danger',
                              onConfirm: async () => {
                                const success = await dbService.processRefund(order.id, true);
                                if (success) {
                                  addToast(`Issued refund of ${formatCurrency(order.total_price)} for ${order.buyer_name || 'buyer'}`, 'success');
                                  loadTraderData();
                                }
                              }
                            });
                          }}
                          className="btn btn-text btn-sm"
                          style={{ color: '#DC2626', marginLeft: 'auto', fontWeight: '700', fontSize: '12px' }}
                        >
                          Issue Refund
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

      {/* NOTIFICATIONS DRAWER OVERLAY FOR SELLER */}
      {showNotifDrawer && (
        <div style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          maxWidth: '380px',
          backgroundColor: '#FFFFFF',
          boxShadow: '-4px 0 20px rgba(30, 64, 175, 0.1)',
          zIndex: 1500,
          display: 'flex',
          flexDirection: 'column',
          animation: 'drawerSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px', borderBottom: '1px solid #DBEAFE', backgroundColor: '#1E3A8A', color: '#FFFFFF' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bell size={20} />
              <h3 style={{ color: '#FFFFFF', fontSize: '18px', fontWeight: '700' }}>Seller Notifications</h3>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {notifications.some(n => !n.is_read) && (
                <button 
                  onClick={markAllNotificationsRead}
                  style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '12px',
                    color: '#FFFFFF',
                    fontSize: '11px',
                    fontWeight: '700',
                    padding: '4px 10px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  title="Mark all notifications as read"
                >
                  Mark all read
                </button>
              )}
              <button 
                onClick={() => setShowNotifDrawer(false)}
                style={{ background: 'none', border: 'none', color: '#FFFFFF', cursor: 'pointer' }}
              >
                <X size={22} />
              </button>
            </div>
          </div>

          {/* List */}
          <div style={{ overflowY: 'auto', flexGrow: 1, padding: '16px' }}>
            {notifications.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#475569' }}>
                <Bell size={32} style={{ color: '#94A3B8', marginBottom: '12px' }} />
                <p>No seller notifications yet.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {notifications.map((notif) => (
                  <div 
                    key={notif.id}
                    style={{ 
                      padding: '14px', 
                      borderRadius: '14px', 
                      backgroundColor: notif.is_read ? '#F5F5EB' : 'rgba(37, 99, 235, 0.04)',
                      border: '1px solid #DBEAFE',
                      borderLeft: notif.is_read ? '1px solid #DBEAFE' : '4px solid #2563EB',
                      position: 'relative',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                      <span style={{ fontWeight: '700', fontSize: '13px', color: '#0F172A' }}>{notif.title}</span>
                      {!notif.is_read && (
                        <button 
                          onClick={() => markNotificationRead(notif.id)}
                          style={{ background: 'none', border: 'none', color: '#2563EB', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}
                        >
                          Mark Read
                        </button>
                      )}
                    </div>
                    <p style={{ fontSize: '12px', color: '#475569', lineHeight: '1.4' }}>{notif.message}</p>
                    <span style={{ display: 'block', fontSize: '10px', color: '#94A3B8', marginTop: '8px' }}>
                      {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

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

      {/* KoboWise Confirmation Modal */}
      <KoboWiseModal 
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        type={confirmModal.type}
      />

    </div>
  );
};
