import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { dbService, mockRealtime } from '../supabase';
import type { Product, Category, GroupOrder } from '../supabase';
import { ProductCard } from '../components/ProductCard';
import { ToastContainer, type ToastMessage } from '../components/Toast';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { 
  Search, 
  Flame, 
  Sparkles, 
  Clock, 
  TrendingUp, 
  X,
  Bell,
  Shield,
  Tag,
  Headphones,
  Users
} from 'lucide-react';

export const Home: React.FC = () => {
  const { user } = useAuth();
  const { cartItems } = useCart();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isBrowseTab = searchParams.get('tab') === 'browse';
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [groupOrders, setGroupOrders] = useState<GroupOrder[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [localSearchText, setLocalSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedBuyerSize, setSelectedBuyerSize] = useState<number | null>(null);
  const [showBuyerFilter, setShowBuyerFilter] = useState(false);
  const groupByMode = 'status';
  const [sortBy, setSortBy] = useState('recommended');
  
  // Real-time alerts and notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifDrawer, setShowNotifDrawer] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    const prods = await dbService.getProducts();
    const cats = await dbService.getCategories();
    const groups = await dbService.getGroupOrders();
    
    setProducts(prods);
    setCategories(cats);
    setGroupOrders(groups);

    if (user) {
      const notifs = await dbService.getNotifications(user.id);
      setNotifications(notifs);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadData();

    // Subscribe to mock real-time events
    const toastSub = mockRealtime.subscribe('toast', (toast: any) => {
      addToast(toast.message, toast.type || 'info');
    });

    const groupsSub = mockRealtime.subscribe('groups_updated', (updatedGroups: any) => {
      setGroupOrders(updatedGroups);
      // Reload products to refresh list details
      dbService.getProducts().then(setProducts);
    });

    const notifsSub = mockRealtime.subscribe('notifications_updated', () => {
      if (user) {
        dbService.getNotifications(user.id).then(setNotifications);
      }
    });

    const toggleDrawerSub = mockRealtime.subscribe('toggle_notif_drawer', () => {
      setShowNotifDrawer(prev => !prev);
    });

    // Global search listener from Navbar
    const handleGlobalSearch = (e: Event) => {
      setSearchQuery((e as CustomEvent).detail || '');
    };
    window.addEventListener('globalSearch', handleGlobalSearch);

    return () => {
      toastSub.unsubscribe();
      groupsSub.unsubscribe();
      notifsSub.unsubscribe();
      toggleDrawerSub.unsubscribe();
      window.removeEventListener('globalSearch', handleGlobalSearch);
    };
  }, [user, loadData]);

  const addToast = (message: string, type: ToastMessage['type'] = 'info') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const markNotificationRead = async (id: string) => {
    await dbService.markNotificationAsRead(id);
    if (user) {
      const notifs = await dbService.getNotifications(user.id);
      setNotifications(notifs);
    }
  };

  useEffect(() => {
    setLocalSearchText(searchQuery);
  }, [searchQuery]);

  const showBrowseView = isBrowseTab || searchQuery.length > 0 || selectedCategory !== null;

  // Helper matching product and group order
  const getProductGroup = (productId: string) => {
    return groupOrders.find(g => g.product_id === productId && g.status === 'pending');
  };

  const getEffectiveSharesPurchased = (productId: string, totalShares: number) => {
    const g = getProductGroup(productId);
    const confirmedShares = g ? g.shares_purchased : 0;
    const cartItem = cartItems.find(item => item.product.id === productId);
    const cartShares = cartItem ? cartItem.sharesBought : 0;
    return Math.min(totalShares, confirmedShares + cartShares);
  };

  // Filtering products
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (p.trader_name && p.trader_name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory ? p.category_id === selectedCategory : true;
    const matchesBuyerSize = selectedBuyerSize !== null ? p.total_shares === selectedBuyerSize : true;
    return matchesSearch && matchesCategory && matchesBuyerSize;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price_asc') {
      return a.price_per_share - b.price_per_share;
    }
    if (sortBy === 'price_desc') {
      return b.price_per_share - a.price_per_share;
    }
    // Default: recommended (higher group progress first)
    const progressA = getEffectiveSharesPurchased(a.id, a.total_shares) / a.total_shares;
    const progressB = getEffectiveSharesPurchased(b.id, b.total_shares) / b.total_shares;
    return progressB - progressA;
  });

  // Groupings for home layout (Status based)
  const almostCompleteProducts = sortedProducts.filter(p => {
    const effectiveShares = getEffectiveSharesPurchased(p.id, p.total_shares);
    return (p.total_shares - effectiveShares) === 1;
  });

  const nearlyFullProducts = sortedProducts.filter(p => {
    const effectiveShares = getEffectiveSharesPurchased(p.id, p.total_shares);
    return (p.total_shares - effectiveShares) === 2;
  });

  const halfwayThereProducts = sortedProducts.filter(p => {
    const effectiveShares = getEffectiveSharesPurchased(p.id, p.total_shares);
    const left = p.total_shares - effectiveShares;
    return left >= 3 && effectiveShares > 0;
  });

  const newlyListedProducts = sortedProducts.filter(p => {
    const effectiveShares = getEffectiveSharesPurchased(p.id, p.total_shares);
    return effectiveShares === 0;
  });

  // Groupings by split size (1, 2, 3, 4 buyers)
  const oneBuyerProducts = sortedProducts.filter(p => p.total_shares === 1);
  const twoBuyerProducts = sortedProducts.filter(p => p.total_shares === 2);
  const threeBuyerProducts = sortedProducts.filter(p => p.total_shares === 3);
  const fourBuyerProducts = sortedProducts.filter(p => p.total_shares === 4);

  // Compute available buyer sizes with counts (from unfiltered products for the dropdown)
  const buyerSizeCounts = products.reduce<Record<number, number>>((acc, p) => {
    acc[p.total_shares] = (acc[p.total_shares] || 0) + 1;
    return acc;
  }, {});
  const availableBuyerSizes = Object.keys(buyerSizeCounts)
    .map(Number)
    .sort((a, b) => a - b);
  return (
    <div style={{ paddingBottom: 0, backgroundColor: '#F8FAFC', minHeight: '95vh' }}>
      
      {/* Dynamic Toast Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* DYNAMIC HERO BANNER */}
      {!showBrowseView && (
        <section style={{ 
          padding: '32px 0 24px 0',
        }}>
          <div className="container">
            <div style={{
              background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)',
              borderRadius: '24px',
              padding: '40px 48px',
              color: '#FFFFFF',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-lg)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '40px',
              flexWrap: 'wrap'
            }} className="hero-banner-card">
              
              {/* Background elements */}
              <div style={{ position: 'absolute', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(96, 165, 250, 0.15) 0%, transparent 70%)', top: '-100px', right: '10%' }} />
              <div style={{ position: 'absolute', top: '24px', right: '35%', fontSize: '32px', opacity: 0.1, transform: 'rotate(15deg)' }}>🌿</div>
              
              {/* Left Content Column */}
              <div style={{ flex: '1 1 400px', maxWidth: '580px', position: 'relative', zIndex: 5 }}>
                {/* Badge */}
                <span style={{ 
                  display: 'inline-block', 
                  backgroundColor: 'rgba(255, 255, 255, 0.12)', 
                  color: '#EFF6FF', 
                  padding: '6px 14px', 
                  borderRadius: 'var(--radius-full)', 
                  fontSize: '11px', 
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: '16px'
                }}>
                  🎓 DELSU Abraka Student Co-op
                </span>
                
                <h1 style={{ 
                  fontSize: '44px', 
                  fontWeight: '800', 
                  fontFamily: 'var(--font-heading)',
                  lineHeight: '1.15',
                  marginBottom: '18px',
                  letterSpacing: '-0.5px',
                  color: '#FFFFFF'
                }} className="hero-banner-title">
                  Buy Together. <br />
                  <span style={{ color: '#93C5FD' }}>Save Together.</span>
                </h1>
                
                <p style={{ 
                  fontSize: '15px', 
                  color: 'rgba(255, 255, 255, 0.85)', 
                  lineHeight: '1.6', 
                  marginBottom: '28px',
                  maxWidth: '480px'
                }}>
                  Split the cost of expensive bulk products with other students. Why pay retail when you can share the wholesale price?
                </p>
                
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <button 
                    onClick={() => {
                      const el = document.getElementById('marketplace-heading');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="btn btn-lg" 
                    style={{ 
                      backgroundColor: '#FFFFFF', 
                      color: '#1E3A8A', 
                      border: 'none', 
                      borderRadius: 'var(--radius-full)',
                      fontWeight: '800',
                      fontSize: '14px',
                      padding: '12px 28px',
                      boxShadow: '0 4px 14px rgba(0,0,0,0.1)'
                    }}
                  >
                    Start Saving Now
                  </button>
                  <button 
                    onClick={() => {
                      addToast("How KoboWise Works: 1. Choose a split deal. 2. Buy your shares. 3. Once group is 100% full, collect on campus or get it delivered!", "info");
                    }}
                    className="btn btn-lg btn-outline" 
                    style={{ 
                      borderColor: 'rgba(255, 255, 255, 0.3)', 
                      color: '#FFFFFF',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '14px',
                      padding: '12px 28px'
                    }}
                  >
                    How it works
                  </button>
                </div>
              </div>

              {/* Right Hot Deal Card Column */}
              <div style={{ 
                flex: '1 1 300px', 
                maxWidth: '340px',
                backgroundColor: '#FFFFFF',
                borderRadius: '20px',
                border: '1px solid #DBEAFE',
                padding: '24px',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
                position: 'relative',
                zIndex: 5,
                color: '#0F172A'
              }} className="hero-deal-card">
                {/* Badge header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <span style={{ backgroundColor: '#FFF3C4', color: '#D97706', fontSize: '11px', fontWeight: '800', padding: '4px 8px', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    Hot Deal <i className="fa-solid fa-fire"></i>
                  </span>
                  <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <i className="fa-regular fa-clock"></i> Ends in 2h
                  </span>
                </div>

                <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A', marginBottom: '4px' }}>Carton of Indomie</h4>
                <span style={{ fontSize: '12px', color: '#94A3B8', display: 'block', marginBottom: '16px' }}>
                  ₦24,000 Total • Split 4 ways
                </span>

                <div style={{ marginBottom: '16px' }}>
                  <span style={{ fontSize: '11px', color: '#94A3B8', display: 'block', textTransform: 'uppercase', fontWeight: '700' }}>Your Share</span>
                  <span style={{ fontSize: '26px', fontWeight: '800', color: '#2563EB', lineHeight: '1' }}>₦6,000</span>
                </div>

                {/* Progress bar */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
                    <span>Progress</span>
                    <span style={{ color: '#2563EB' }}>3/4 Joined</span>
                  </div>
                  <div style={{ height: '6px', backgroundColor: '#EFF6FF', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: '75%', height: '100%', backgroundColor: '#2563EB', borderRadius: '3px' }} />
                  </div>
                  <span style={{ display: 'block', fontSize: '11px', color: '#E05353', fontWeight: '700', marginTop: '6px' }}>
                    Just 1 spot left to complete order!
                  </span>
                </div>

                <button 
                  onClick={() => {
                    const indomie = products.find(p => p.name.toLowerCase().includes('indomie'));
                    if (indomie) navigate(`/product/${indomie.id}`);
                    else addToast("Indomie deal is loading...", "info");
                  }}
                  className="btn btn-full"
                  style={{
                    backgroundColor: '#F97316',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '11px',
                    fontWeight: '700',
                    fontSize: '13px',
                    boxShadow: '0 4px 12px rgba(249, 115, 22, 0.25)'
                  }}
                >
                  Join for ₦6,000
                </button>
              </div>

            </div>
          </div>
        </section>
      )}

      {/* Browse page heading */}
      {showBrowseView && (
        <div className="container" style={{ padding: '32px 0 12px 0' }}>
          <h1 style={{ fontSize: '32px', color: '#0F172A', fontWeight: '800', fontFamily: 'var(--font-heading)', margin: '0 0 6px 0' }}>
            Browse Products
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', margin: 0 }}>
            Find ongoing group purchases and start saving.
          </p>

          {/* Large search bar inside body (Image 5) */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              setSearchQuery(localSearchText);
            }} 
            style={{ 
              position: 'relative', 
              display: 'flex', 
              gap: '12px', 
              margin: '24px 0 16px 0' 
            }}
          >
            <div style={{ position: 'relative', flexGrow: 1 }}>
              <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
              <input 
                type="text" 
                value={localSearchText} 
                onChange={(e) => setLocalSearchText(e.target.value)}
                placeholder="Search products, groups, or campus traders..." 
                style={{
                  width: '100%',
                  height: '46px',
                  borderRadius: '30px',
                  border: '1px solid #DBEAFE',
                  padding: '0 20px 0 48px',
                  fontSize: '14px',
                  backgroundColor: '#FFFFFF',
                  outline: 'none',
                  boxShadow: '0 2px 8px rgba(30, 64, 175, 0.01)'
                }}
              />
            </div>
            <button 
              type="submit" 
              style={{
                backgroundColor: '#2563EB',
                color: '#FFFFFF',
                fontWeight: '700',
                padding: '0 28px',
                borderRadius: '30px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                boxShadow: '0 2px 8px rgba(37, 99, 235, 0.15)'
              }}
            >
              Search
            </button>
          </form>
        </div>
      )}

      {/* SHOP BY CATEGORY SECTION */}
      <section style={{ margin: '24px 0 12px 0' }}>
        <div className="container">
          
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            flexWrap: 'wrap', 
            gap: '16px',
            marginBottom: '16px'
          }} className="category-filter-header">
            {/* Horizontal Scroll pills (Image 5) */}
            <div style={{ 
              display: 'flex', 
              gap: '10px', 
              overflowX: 'auto', 
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              flexGrow: 1
            }} className="category-scroll">
              <button 
                type="button" 
                onClick={() => setSelectedCategory(null)}
                style={{
                  borderRadius: '20px',
                  padding: '8px 20px',
                  fontSize: '13px',
                  fontWeight: '700',
                  border: 'none',
                  backgroundColor: !selectedCategory ? '#2563EB' : '#EFF6FF',
                  color: !selectedCategory ? '#FFFFFF' : '#475569',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s'
                }}
              >
                All
              </button>
              {categories.map((cat) => {
                const isActive = selectedCategory === cat.id;
                return (
                  <button 
                    key={cat.id} 
                    type="button" 
                    onClick={() => setSelectedCategory(cat.id)}
                    style={{
                      borderRadius: '20px',
                      padding: '8px 20px',
                      fontSize: '13px',
                      fontWeight: '700',
                      border: 'none',
                      backgroundColor: isActive ? '#2563EB' : '#EFF6FF',
                      color: isActive ? '#FFFFFF' : '#475569',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.2s'
                    }}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>

            {/* Sort & Filters selector row (Image 5) */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  borderRadius: '20px',
                  border: '1px solid #DBEAFE',
                  padding: '8px 16px',
                  fontSize: '13px',
                  fontWeight: '700',
                  backgroundColor: '#FFFFFF',
                  color: '#475569',
                  outline: 'none',
                  cursor: 'pointer',
                  height: '38px'
                }}
              >
                <option value="recommended">Sort: Recommended</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>

              {/* Buyer Size Filter Dropdown */}
              <div style={{ position: 'relative' }}>
                <button 
                  type="button"
                  onClick={() => setShowBuyerFilter(!showBuyerFilter)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    borderRadius: '20px',
                    border: selectedBuyerSize ? '1.5px solid #2563EB' : '1px solid #DBEAFE',
                    padding: '8px 16px',
                    fontSize: '13px',
                    fontWeight: '700',
                    backgroundColor: selectedBuyerSize ? '#EFF6FF' : '#FFFFFF',
                    color: selectedBuyerSize ? '#2563EB' : '#475569',
                    cursor: 'pointer',
                    height: '38px',
                    transition: 'all 0.2s'
                  }}
                >
                  <Users size={14} />
                  <span>{selectedBuyerSize ? `${selectedBuyerSize} Buyer${selectedBuyerSize > 1 ? 's' : ''}` : 'Buyers'}</span>
                  <span style={{
                    fontSize: '10px',
                    transition: 'transform 0.2s',
                    transform: showBuyerFilter ? 'rotate(180deg)' : 'rotate(0deg)'
                  }}>▼</span>
                </button>

                {showBuyerFilter && (
                  <>
                    {/* Backdrop to close dropdown */}
                    <div 
                      onClick={() => setShowBuyerFilter(false)} 
                      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99 }} 
                    />
                    <div style={{
                      position: 'absolute',
                      top: 'calc(100% + 8px)',
                      right: 0,
                      backgroundColor: '#FFFFFF',
                      borderRadius: '16px',
                      border: '1px solid #DBEAFE',
                      boxShadow: '0 8px 30px rgba(30, 64, 175, 0.12)',
                      padding: '8px',
                      minWidth: '200px',
                      zIndex: 100,
                      animation: 'filterDropIn 0.2s ease-out'
                    }}>
                      <div style={{ padding: '8px 12px', fontSize: '11px', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Filter by Buyers
                      </div>
                      {/* All option */}
                      <button
                        type="button"
                        onClick={() => { setSelectedBuyerSize(null); setShowBuyerFilter(false); }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          width: '100%',
                          padding: '10px 12px',
                          border: 'none',
                          borderRadius: '10px',
                          backgroundColor: selectedBuyerSize === null ? '#EFF6FF' : 'transparent',
                          color: selectedBuyerSize === null ? '#2563EB' : '#334155',
                          fontWeight: selectedBuyerSize === null ? '700' : '600',
                          fontSize: '13px',
                          cursor: 'pointer',
                          transition: 'background-color 0.15s'
                        }}
                      >
                        <span>All Sizes</span>
                        <span style={{ fontSize: '12px', color: '#94A3B8', fontWeight: '600' }}>{products.length}</span>
                      </button>
                      {/* Each buyer size */}
                      {availableBuyerSizes.map(size => {
                        const label = size === 1 ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <i className="fa-solid fa-user" style={{ fontSize: '12px' }}></i> Solo (1 Buyer)
                          </span>
                        ) : (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <i className="fa-solid fa-users" style={{ fontSize: '12px' }}></i> {size === 2 ? 'Pair (2 Buyers)' : size === 3 ? 'Trio (3 Buyers)' : `Quad (${size} Buyers)`}
                          </span>
                        );
                        const isActive = selectedBuyerSize === size;
                        return (
                          <button
                            key={size}
                            type="button"
                            onClick={() => { setSelectedBuyerSize(size); setShowBuyerFilter(false); }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              width: '100%',
                              padding: '10px 12px',
                              border: 'none',
                              borderRadius: '10px',
                              backgroundColor: isActive ? '#EFF6FF' : 'transparent',
                              color: isActive ? '#2563EB' : '#334155',
                              fontWeight: isActive ? '700' : '600',
                              fontSize: '13px',
                              cursor: 'pointer',
                              transition: 'background-color 0.15s'
                            }}
                          >
                            <span>{label}</span>
                            <span style={{
                              fontSize: '11px',
                              fontWeight: '700',
                              color: isActive ? '#2563EB' : '#94A3B8',
                              backgroundColor: isActive ? '#DBEAFE' : '#F1F5F9',
                              borderRadius: '10px',
                              padding: '2px 8px'
                            }}>
                              {buyerSizeCounts[size]}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Active Filters Row (Image 5) */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            flexWrap: 'wrap', 
            gap: '12px', 
            borderTop: '1px solid #DBEAFE', 
            paddingTop: '16px', 
            marginBottom: '24px' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '600' }}>Active filters:</span>
              
              {selectedCategory && (
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #DBEAFE',
                  borderRadius: '20px',
                  padding: '4px 12px',
                  fontSize: '12px',
                  color: '#0F172A',
                  fontWeight: '700'
                }}>
                  {categories.find(c => c.id === selectedCategory)?.name}
                  <button type="button" onClick={() => setSelectedCategory(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94A3B8', padding: 0, fontSize: '14px', lineHeight: 1 }}>&times;</button>
                </span>
              )}

              {selectedBuyerSize && (
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #DBEAFE',
                  borderRadius: '20px',
                  padding: '4px 12px',
                  fontSize: '12px',
                  color: '#0F172A',
                  fontWeight: '700'
                }}>
                  {selectedBuyerSize}-Buyer Splits
                  <button type="button" onClick={() => setSelectedBuyerSize(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94A3B8', padding: 0, fontSize: '14px', lineHeight: 1 }}>&times;</button>
                </span>
              )}

              {searchQuery && (
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #DBEAFE',
                  borderRadius: '20px',
                  padding: '4px 12px',
                  fontSize: '12px',
                  color: '#0F172A',
                  fontWeight: '700'
                }}>
                  Search: "{searchQuery}"
                  <button type="button" onClick={() => setSearchQuery('')} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94A3B8', padding: 0, fontSize: '14px', lineHeight: 1 }}>&times;</button>
                </span>
              )}

              {(selectedCategory || selectedBuyerSize || searchQuery) && (
                <button 
                  type="button" 
                  onClick={() => { setSelectedCategory(null); setSelectedBuyerSize(null); setSearchQuery(''); }} 
                  style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#2563EB', fontSize: '12px', fontWeight: '800' }}
                >
                  Clear all
                </button>
              )}
            </div>

            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '700' }}>
              Showing {sortedProducts.length} results
            </span>
          </div>

        </div>
      </section>

      {/* MAIN PRODUCTS SECTION */}
      <main className="container" style={{ display: 'flex', flexDirection: 'column', gap: '48px', marginTop: '20px' }}>
        
        {loading ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
              <Clock size={22} style={{ color: '#2563EB' }} />
              <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0F172A' }}>Loading Active Group Deals...</h2>
            </div>
            <div className="grid-responsive">
              <SkeletonLoader type="card" count={4} />
            </div>
          </div>
        ) : (
          <>
            {/* Empty State */}
            {filteredProducts.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px var(--space-4)', backgroundColor: '#FFFFFF', borderRadius: '20px', border: '1px solid #DBEAFE' }}>
            <Search size={48} style={{ color: '#94A3B8', marginBottom: '16px' }} />
            <h3 style={{ fontSize: '20px', marginBottom: '8px', color: '#0F172A' }}>No Products Found</h3>
            <p style={{ color: '#475569' }}>We couldn't find any products matching your search criteria, selected category, or buyer size filter.</p>
            <button 
              onClick={() => { setSearchQuery(''); setSelectedCategory(null); setSelectedBuyerSize(null); }} 
              className="btn btn-primary btn-sm" 
              style={{ marginTop: '16px', borderRadius: 'var(--radius-full)' }}
            >
              Reset Filters
            </button>
          </div>
        )}

        {groupByMode === 'status' ? (
          <>
            {/* 1. Almost Complete Section */}
            {almostCompleteProducts.length > 0 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <Flame size={22} style={{ color: '#E05353' }} />
                  <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0F172A' }}>Almost Complete</h2>
                  <span className="badge badge-pending" style={{ marginLeft: '8px' }}>1 share needed</span>
                </div>
                <div className="grid-responsive">
                  {almostCompleteProducts.map(p => (
                    <ProductCard 
                      key={p.id} 
                      product={p} 
                      groupOrder={getProductGroup(p.id)} 
                    />
                  ))}
                </div>
              </div>
            )}

            {/* 2. Nearly Full Section */}
            {nearlyFullProducts.length > 0 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <Sparkles size={22} style={{ color: '#F59E0B' }} />
                  <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0F172A' }}>Nearly Full</h2>
                  <span className="badge badge-shares" style={{ marginLeft: '8px' }}>2 shares needed</span>
                </div>
                <div className="grid-responsive">
                  {nearlyFullProducts.map(p => (
                    <ProductCard 
                      key={p.id} 
                      product={p} 
                      groupOrder={getProductGroup(p.id)} 
                    />
                  ))}
                </div>
              </div>
            )}

            {/* 3. Halfway There Section */}
            {halfwayThereProducts.length > 0 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <TrendingUp size={22} style={{ color: '#2563EB' }} />
                  <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0F172A' }}>Halfway There</h2>
                </div>
                <div className="grid-responsive">
                  {halfwayThereProducts.map(p => (
                    <ProductCard 
                      key={p.id} 
                      product={p} 
                      groupOrder={getProductGroup(p.id)} 
                    />
                  ))}
                </div>
              </div>
            )}

            {/* 4. Newly Listed Section */}
            {newlyListedProducts.length > 0 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <Clock size={22} style={{ color: '#1E3A8A' }} />
                  <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0F172A' }}>Newly Listed</h2>
                </div>
                <div className="grid-responsive">
                  {newlyListedProducts.map(p => (
                    <ProductCard 
                      key={p.id} 
                      product={p} 
                      groupOrder={getProductGroup(p.id)} 
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            {/* 1-Buyer Deals */}
            {oneBuyerProducts.length > 0 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <i className="fa-solid fa-user" style={{ fontSize: '20px', color: '#2563EB' }}></i>
                  <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0F172A' }}>Solo Deals (1 Buyer)</h2>
                  <span className="badge" style={{ backgroundColor: '#EFF6FF', color: '#2563EB', marginLeft: '8px' }}>Immediate checkout</span>
                </div>
                <div className="grid-responsive">
                  {oneBuyerProducts.map(p => (
                    <ProductCard 
                      key={p.id} 
                      product={p} 
                      groupOrder={getProductGroup(p.id)} 
                    />
                  ))}
                </div>
              </div>
            )}

            {/* 2-Buyer Deals */}
            {twoBuyerProducts.length > 0 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <i className="fa-solid fa-users" style={{ fontSize: '20px', color: '#2563EB' }}></i>
                  <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0F172A' }}>Pair Splits (2 Buyers)</h2>
                  <span className="badge badge-shares" style={{ marginLeft: '8px' }}>Half-price splits</span>
                </div>
                <div className="grid-responsive">
                  {twoBuyerProducts.map(p => (
                    <ProductCard 
                      key={p.id} 
                      product={p} 
                      groupOrder={getProductGroup(p.id)} 
                    />
                  ))}
                </div>
              </div>
            )}

            {/* 3-Buyer Deals */}
            {threeBuyerProducts.length > 0 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <i className="fa-solid fa-users" style={{ fontSize: '20px', color: '#2563EB' }}></i>
                  <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0F172A' }}>Trio Splits (3 Buyers)</h2>
                  <span className="badge badge-shares" style={{ marginLeft: '8px' }}>Third-price splits</span>
                </div>
                <div className="grid-responsive">
                  {threeBuyerProducts.map(p => (
                    <ProductCard 
                      key={p.id} 
                      product={p} 
                      groupOrder={getProductGroup(p.id)} 
                    />
                  ))}
                </div>
              </div>
            )}

            {/* 4-Buyer Deals */}
            {fourBuyerProducts.length > 0 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <i className="fa-solid fa-users" style={{ fontSize: '20px', color: '#2563EB' }}></i>
                  <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0F172A' }}>Quad Splits (4 Buyers)</h2>
                  <span className="badge" style={{ backgroundColor: '#EFF6FF', color: '#2563EB', marginLeft: '8px' }}>Quarter-price splits</span>
                </div>
                <div className="grid-responsive">
                  {fourBuyerProducts.map(p => (
                    <ProductCard 
                      key={p.id} 
                      product={p} 
                      groupOrder={getProductGroup(p.id)} 
                    />
                  ))}
                </div>
              </div>
            )}

          </>
        )}
          </>
        )}
      </main>

      {/* FOOTER PILLARS BAR */}
      <section style={{ 
        backgroundColor: '#EFF6FF', 
        borderTop: '1px solid #DBEAFE',
        padding: '44px 0',
        marginTop: '60px'
      }}>
        <div className="container">
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
            gap: '30px'
          }} className="pillars-grid">
            
            {[
              { icon: <Shield size={20} />, title: 'Secure Payments', desc: 'Your payments are safe with us' },
              { icon: <Users size={20} />, title: 'Trusted Community', desc: 'Buy with verified members' },
              { icon: <Tag size={20} />, title: 'Best Prices', desc: 'Group buying saves you more' },
              { icon: <Headphones size={20} />, title: '24/7 Support', desc: "We're here to help anytime" },
            ].map((pillar, i) => (
              <div key={i} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <div style={{
                  color: '#2563EB',
                  background: 'linear-gradient(135deg, #EFF6FF, #BFDBFE)',
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {pillar.icon}
                </div>
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#0F172A', margin: '0 0 4px 0' }}>{pillar.title}</h4>
                  <p style={{ fontSize: '12px', color: '#475569', margin: 0, lineHeight: '1.4' }}>{pillar.desc}</p>
                </div>
              </div>
            ))}

          </div>
        </div>
      </section>

      {/* NOTIFICATIONS DRAWER OVERLAY */}
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
              <h3 style={{ color: '#FFFFFF', fontSize: '18px', fontWeight: '700' }}>Notifications</h3>
            </div>
            <button 
              onClick={() => setShowNotifDrawer(false)}
              style={{ background: 'none', border: 'none', color: '#FFFFFF', cursor: 'pointer' }}
            >
              <X size={22} />
            </button>
          </div>

          {/* List */}
          <div style={{ overflowY: 'auto', flexGrow: 1, padding: '16px' }}>
            {notifications.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#475569' }}>
                <Bell size={32} style={{ color: '#94A3B8', marginBottom: '12px' }} />
                <p>No notifications yet.</p>
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

      {/* Global CSS for Drawer */}
      <style>{`
        @keyframes drawerSlideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @keyframes filterDropIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .category-scroll::-webkit-scrollbar {
          display: none;
        }
        @media (min-width: 992px) {
          .hero-flex-container {
            flex-direction: row !important;
            flex-wrap: nowrap !important;
          }
          .hero-text {
            flex: 0 0 45% !important;
          }
          .hero-cards-flex {
            flex: 0 0 55% !important;
            flex-wrap: nowrap !important;
          }
        }
        @media (max-width: 991px) {
          .hero-flex-container {
            flex-direction: column !important;
          }
          .hero-text {
            max-width: 100% !important;
            text-align: center !important;
          }
          .hero-text button {
            margin: 0 auto;
          }
          .hero-cards-flex {
            width: 100% !important;
            justify-content: center !important;
          }
        }
      `}</style>
    </div>
  );
};
