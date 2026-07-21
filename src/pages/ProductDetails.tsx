import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { dbService, mockRealtime } from '../supabase';
import type { Product, GroupOrder, Review } from '../supabase';
import { ProgressBar } from '../components/ProgressBar';
import { ToastContainer, type ToastMessage } from '../components/Toast';
import { ProductCard } from '../components/ProductCard';
import { 
  Truck, 
  ShieldCheck, 
  Star, 
  Heart,
  Plus,
  Minus,
  MessageSquare,
  ShoppingCart,
  Share2,
  Check,
  User,
  MapPin,
  Package,
  Sparkles,
  ShoppingBag
} from 'lucide-react';

export const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartItems, addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const existingCartItem = product ? cartItems.find(c => c.product.id === product.id) : undefined;
  const isAlreadyInCart = !!existingCartItem;
  const [groupOrder, setGroupOrder] = useState<GroupOrder | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isWished, setIsWished] = useState(false);
  const [loading, setLoading] = useState(true);

  // Related products & Group orders for recommendations
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [allGroupOrders, setAllGroupOrders] = useState<GroupOrder[]>([]);

  // Selector states
  const [sharesCount, setSharesCount] = useState(1);

  useEffect(() => {
    if (product) {
      const inCart = cartItems.find(c => c.product.id === product.id);
      if (inCart) {
        setSharesCount(inCart.sharesBought);
      }
    }
  }, [product, cartItems]);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [reviewSubmitLoading, setReviewSubmitLoading] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (message: string, type: 'success' | 'warning' | 'info' = 'success') => {
    const toastId = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id: toastId, message, type }]);
  };

  const dismissToast = (toastId: string) => {
    setToasts(prev => prev.filter(t => t.id !== toastId));
  };

  const loadProductData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    const prod = await dbService.getProductById(id);
    
    if (prod) {
      setProduct(prod);
      const groups = await dbService.getGroupOrders();
      setAllGroupOrders(groups);
      const currentGroup = groups.find(g => g.product_id === prod.id && g.status === 'pending') || null;
      setGroupOrder(currentGroup);

      const allProds = await dbService.getProducts();
      const related = allProds
        .filter(p => p.id !== prod.id)
        .sort((a, _b) => (a.category_id === prod.category_id ? -1 : 1));
      setRelatedProducts(related.slice(0, 8));

      const revs = await dbService.getReviews(prod.id);
      setReviews(revs);

      if (user) {
        const wish = await dbService.getWishlist(user.id);
        setIsWished(wish.some(w => w.id === prod.id));
      }
    }
    setLoading(false);
  }, [id, user]);

  // Use a ref to track product ID for the realtime subscription (avoids infinite re-render loop)
  const productIdRef = React.useRef<string | null>(null);
  useEffect(() => {
    if (product) {
      productIdRef.current = product.id;
    }
  }, [product]);

  useEffect(() => {
    loadProductData();

    // Subscribe to mock real-time group order ticks
    const groupsSub = mockRealtime.subscribe('groups_updated', (updatedGroups: GroupOrder[]) => {
      const currentProductId = productIdRef.current;
      if (currentProductId) {
        const currentGroup = updatedGroups.find(g => g.product_id === currentProductId && g.status === 'pending') || null;
        setGroupOrder(currentGroup);
      }
    });

    return () => {
      groupsSub.unsubscribe();
    };
  }, [loadProductData]);

  const handleWishlistToggle = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (product) {
      const added = await dbService.toggleWishlist(user.id, product.id);
      setIsWished(added);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, sharesCount);
    addToast(`Added ${sharesCount} ${sharesCount === 1 ? 'share' : 'shares'} of "${product.name}" to cart! Payments can be made on the cart page.`, 'success');
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !product) {
      navigate('/login');
      return;
    }
    if (!newComment.trim()) return;

    setReviewSubmitLoading(true);
    const newRev = await dbService.addReview(
      product.id,
      user.id,
      user.full_name,
      newRating,
      newComment
    );

    if (newRev) {
      setReviews(prev => [newRev, ...prev]);
      setNewComment('');
      setNewRating(5);
    }
    setReviewSubmitLoading(false);
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <div style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-secondary)' }}>Loading product details...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <h3 style={{ fontSize: '22px', marginBottom: '12px' }}>Product Not Found</h3>
        <p style={{ color: 'var(--text-secondary)' }}>The product may have been removed or does not exist.</p>
        <Link to="/home" className="btn btn-primary btn-sm" style={{ marginTop: '16px' }}>Back to Home</Link>
      </div>
    );
  }

  const existingInCart = cartItems.find(item => item.product.id === product.id);
  const cartShares = existingInCart ? existingInCart.sharesBought : 0;
  const confirmedShares = groupOrder ? groupOrder.shares_purchased : 0;
  const sharesPurchased = Math.min(product.total_shares, confirmedShares + cartShares);
  const sharesLeft = Math.max(0, product.total_shares - sharesPurchased);
  
  // Cap selectable shares to total shares for this bulk product
  const maxAvailableShares = Math.max(1, product.total_shares);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div style={{ padding: '32px 0 60px 0', backgroundColor: '#F8FAFC', minHeight: '95vh' }}>
      <div className="container">
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
        
        {/* TOP BUNDLE DEALS BANNER */}
        <div style={{
          background: 'linear-gradient(90deg, #FEF08A 0%, #FDE047 100%)',
          padding: '18px 28px',
          borderRadius: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '24px',
          boxShadow: '0 4px 14px rgba(234, 179, 8, 0.15)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ 
              backgroundColor: '#EAB308', 
              color: '#FFFFFF', 
              padding: '6px 14px', 
              borderRadius: '10px', 
              fontWeight: '800', 
              fontSize: '14px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <Sparkles size={16} /> Bundle Deals
            </span>
            <span style={{ fontSize: '14px', fontWeight: '800', color: '#854D0E' }}>
              Co-op Group Split Price
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span style={{ fontSize: '28px', fontWeight: '900', color: '#0F172A' }}>
              {formatCurrency(product.price_per_share)}
            </span>
            <span style={{ fontSize: '15px', color: '#854D0E', textDecoration: 'line-through', fontWeight: '600' }}>
              {formatCurrency(product.total_price)}
            </span>
            <span style={{ 
              backgroundColor: '#EF4444', 
              color: '#FFFFFF', 
              padding: '3px 10px', 
              borderRadius: '8px', 
              fontSize: '12px', 
              fontWeight: '800' 
            }}>
              Save 75%
            </span>
          </div>
        </div>

        {/* Category Breadcrumbs (Screenshot 5) */}
        <div style={{ fontSize: '13px', color: '#94A3B8', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '500' }}>
          <Link to="/home" style={{ textDecoration: 'none', color: '#94A3B8' }}>Home</Link>
          <span>&gt;</span>
          <span style={{ cursor: 'pointer' }} onClick={() => navigate('/home')}>{product.category_id ? 'Food & Drinks' : 'Marketplace'}</span>
          <span>&gt;</span>
          <span style={{ color: '#475569', fontWeight: '700' }}>{product.name}</span>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr', 
          gap: '40px' 
        }} className="product-details-grid">
          
          {/* Column 1: Image Gallery & Description */}
          <div>
            <div style={{ 
              borderRadius: '24px', 
              overflow: 'hidden', 
              border: '1px solid #DBEAFE', 
              boxShadow: '0 8px 30px rgba(30, 64, 175, 0.04)',
              backgroundColor: '#FFFFFF',
              position: 'relative'
            }}>
              <img 
                src={product.image_url} 
                alt={product.name}
                style={{ width: '100%', height: 'auto', maxHeight: '420px', objectFit: 'cover', display: 'block' }} 
              />
              
              {/* Floating Spot Left Badge */}
              {sharesLeft > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '16px',
                  left: '16px',
                  backgroundColor: '#F97316',
                  color: '#FFFFFF',
                  padding: '6px 14px',
                  borderRadius: '30px',
                  fontSize: '11px',
                  fontWeight: '800',
                  boxShadow: '0 4px 10px rgba(249, 115, 22, 0.3)'
                }}>
                  {sharesLeft === 1 ? 'Last spot left! 🚨' : `${sharesLeft} spots left`}
                </div>
              )}

              <button 
                onClick={handleWishlistToggle}
                style={{ 
                  position: 'absolute', 
                  top: '16px', 
                  right: '16px', 
                  backgroundColor: '#FFFFFF', 
                  border: 'none', 
                  borderRadius: '50%', 
                  width: '40px', 
                  height: '40px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-md)'
                }}
              >
                <Heart size={20} fill={isWished ? '#E05353' : 'none'} stroke={isWished ? '#E05353' : '#94A3B8'} />
              </button>
            </div>

            {/* Thumbnail Gallery (Screenshot 5) */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '12px', overflow: 'hidden', border: '2px solid #2563EB', cursor: 'pointer' }}>
                <img src={product.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ width: '80px', height: '80px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #DBEAFE', cursor: 'pointer', opacity: 0.7 }}>
                <img src={product.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ width: '80px', height: '80px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #DBEAFE', cursor: 'pointer', opacity: 0.7 }}>
                <img src={product.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            </div>

            {/* Description */}
            <div style={{ marginTop: '32px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '12px', color: '#0F172A', fontFamily: 'var(--font-heading)' }}>Product Description</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', fontSize: '15px', marginBottom: '16px' }}>{product.description}</p>
              
              {product.shares_per_person && (
                <div style={{ 
                  backgroundColor: '#EFF6FF', 
                  border: '1px solid #DBEAFE', 
                  borderRadius: '16px', 
                  padding: '16px 20px', 
                  marginTop: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px'
                }}>
                  <div style={{ 
                    backgroundColor: '#3B82F6', 
                    borderRadius: '12px', 
                    width: '40px', 
                    height: '40px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    color: '#FFFFFF',
                    fontSize: '18px'
                  }}>
                    <i className="fa-solid fa-box"></i>
                  </div>
                  <div>
                    <span style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Portion Size per Share</span>
                    <span style={{ fontSize: '16px', fontWeight: '800', color: '#1E3A8A', marginTop: '2px', display: 'block' }}>{product.shares_per_person} per buyer</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Column 2: Booking Box */}
          <div>
            <div style={{ 
              backgroundColor: '#FFFFFF', 
              borderRadius: '24px', 
              border: '1px solid #DBEAFE', 
              padding: '32px',
              boxShadow: '0 8px 30px rgba(30, 64, 175, 0.04)',
              position: 'sticky',
              top: '90px'
            }}>
              {/* Category Badges Row */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                <span style={{ backgroundColor: '#EFF6FF', color: '#2563EB', fontSize: '11px', fontWeight: '800', padding: '4px 10px', borderRadius: '6px', textTransform: 'uppercase' }}>
                  Food & Drinks
                </span>
                <span style={{ backgroundColor: '#E0F2FE', color: '#0284C7', fontSize: '11px', fontWeight: '800', padding: '4px 10px', borderRadius: '6px', textTransform: 'uppercase' }}>
                  In-Group Buying
                </span>
              </div>

              {/* Title & Stars */}
              <h1 style={{ fontSize: '28px', color: '#0F172A', fontFamily: 'var(--font-heading)', fontWeight: '800', margin: '4px 0 10px 0', lineHeight: '1.25' }}>
                {product.name}
              </h1>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', gap: '2px' }}>
                  {[1, 2, 3, 4].map(s => <Star key={s} size={14} fill="#F59E0B" stroke="#F59E0B" />)}
                  <Star size={14} fill="none" stroke="#94A3B8" />
                </div>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#0F172A' }}>4.8</span>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>(24 reviews)</span>
              </div>

              {/* Sold By Box */}
              <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '14px 18px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Sold By:</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <strong style={{ fontSize: '14px', color: '#0F172A' }}>{product.trader_name || 'KoboWise Store'}</strong>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="12" fill="#2563EB"/>
                    <path d="M9.5 12.5L11 14L15 10" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>

              {/* Specifications Box */}
              <div style={{ 
                backgroundColor: '#EFF6FF', 
                border: '1px solid #BFDBFE', 
                borderRadius: '16px', 
                padding: '18px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                marginBottom: '24px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <span style={{ backgroundColor: '#2563EB', color: '#FFFFFF', padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '800' }}>
                    KoboWise Commitment
                  </span>
                  <span style={{ fontSize: '11px', color: sharesLeft === 1 ? '#D97706' : '#2563EB', fontWeight: '800', backgroundColor: '#FFFFFF', padding: '2px 8px', borderRadius: '6px' }}>
                    {sharesLeft === 1 ? '1 spot left! 🚨' : `${sharesLeft} spots left`}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: '#1E293B' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Truck size={18} style={{ color: '#2563EB', flexShrink: 0 }} />
                    <div>
                      <span style={{ color: '#64748B', fontWeight: '600' }}>Delivery: </span>
                      <strong style={{ color: '#0F172A' }}>{product.estimated_delivery || 'Same Day Delivery'}</strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <MapPin size={18} style={{ color: '#EF4444', flexShrink: 0 }} />
                    <div>
                      <span style={{ color: '#64748B', fontWeight: '600' }}>Pickup: </span>
                      <strong style={{ color: '#0F172A' }}>{product.pickup_location || 'DELSU Site II Gate Shop 1B'}</strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Package size={18} style={{ color: '#D97706', flexShrink: 0 }} />
                    <div>
                      <span style={{ color: '#64748B', fontWeight: '600' }}>Stock Left: </span>
                      <strong style={{ color: '#0F172A' }}>{product.stock_quantity ? `${product.stock_quantity} units` : '30 units'}</strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <User size={18} style={{ color: '#10B981', flexShrink: 0 }} />
                    <div>
                      <span style={{ color: '#64748B', fontWeight: '600' }}>Portion Size: </span>
                      <strong style={{ color: '#0F172A' }}>{product.shares_per_person || '4 Basket'}</strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderTop: '1px dashed #BFDBFE', paddingTop: '10px', marginTop: '4px' }}>
                    <ShieldCheck size={18} style={{ color: '#2563EB', flexShrink: 0 }} />
                    <span style={{ fontSize: '11px', color: '#475569' }}>
                      <strong>Security & Privacy:</strong> Money secure in escrow until pickup code verified.
                    </span>
                  </div>
                </div>
              </div>

              <div className="product-price-box" style={{ 
                backgroundColor: '#F8FAFC', 
                border: '1px solid #DBEAFE', 
                borderRadius: '16px', 
                padding: '20px', 
                marginBottom: '24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <span style={{ fontSize: '11px', color: '#94A3B8', display: 'block', fontWeight: '700', textTransform: 'uppercase' }}>Your Share Price</span>
                  <span style={{ display: 'block', fontSize: '28px', fontWeight: '800', color: '#2563EB', marginTop: '2px' }}>
                    {formatCurrency(product.price_per_share)}
                  </span>
                  {product.shares_per_person && (
                    <span style={{ fontSize: '12px', color: '#475569', fontWeight: '700', display: 'block', marginTop: '4px' }}>
                      Receive: {product.shares_per_person}
                    </span>
                  )}
                  <span style={{ fontSize: '11px', color: '#2563EB', fontWeight: '700', display: 'block', marginTop: '4px' }}>
                    Save {formatCurrency(product.total_price - product.price_per_share)} (75% off!)
                  </span>
                </div>
                <div className="product-price-right" style={{ textAlign: 'right', borderLeft: '1px dashed #DBEAFE', paddingLeft: '20px' }}>
                  <span style={{ fontSize: '11px', color: '#94A3B8', display: 'block', fontWeight: '700', textTransform: 'uppercase' }}>Full Price</span>
                  <span style={{ display: 'block', fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', textDecoration: 'line-through', marginTop: '6px' }}>
                    {formatCurrency(product.total_price)}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>({product.total_shares} portions)</span>
                </div>
              </div>

              {/* Progress Tracker (Checkmarks & Dashed Circle) */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>
                  <span>Split Progress</span>
                  <span style={{ color: '#2563EB' }}>{sharesPurchased} of {product.total_shares} buyers joined</span>
                </div>
                <ProgressBar purchased={sharesPurchased} needed={product.total_shares} />
                
                {/* Checkmark Circles list (Screenshot 5 style) */}
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '16px' }}>
                  {Array.from({ length: product.total_shares }).map((_, i) => {
                    const isJoined = i < sharesPurchased;
                    return (
                      <div 
                        key={i} 
                        style={{ 
                          width: '32px', 
                          height: '32px', 
                          borderRadius: '50%', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          backgroundColor: isJoined ? '#EFF6FF' : 'transparent',
                          border: isJoined ? '2px solid #2563EB' : '2px dashed #94A3B8',
                          color: isJoined ? '#2563EB' : '#94A3B8',
                          fontSize: '12px',
                          fontWeight: '800'
                        }}
                      >
                        {isJoined ? <Check size={16} strokeWidth={3} /> : '?'}
                      </div>
                    );
                  })}
                  
                  {sharesLeft > 0 && (
                    <span style={{ fontSize: '12px', color: '#E05353', fontWeight: '700', marginLeft: '6px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <i className="fa-regular fa-clock"></i> Closes in 2h 15m
                    </span>
                  )}
                </div>
              </div>

              {/* Quantity Selector */}
              {sharesLeft > 0 && (
                <div style={{ marginBottom: '24px' }}>
                  <label className="form-label" style={{ fontWeight: '700' }}>Choose shares quantity</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #DBEAFE', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#F8FAFC' }}>
                      <button 
                        type="button"
                        onClick={() => setSharesCount(prev => Math.max(1, prev - 1))}
                        disabled={sharesCount <= 1}
                        style={{ 
                          border: 'none', 
                          background: 'none', 
                          padding: '10px 16px', 
                          cursor: sharesCount <= 1 ? 'not-allowed' : 'pointer', 
                          color: '#475569',
                          opacity: sharesCount <= 1 ? 0.35 : 1,
                          transition: 'opacity 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        aria-label="Decrease shares"
                      >
                        <Minus size={14} style={{ pointerEvents: 'none' }} />
                      </button>
                      <span style={{ minWidth: '36px', textAlign: 'center', fontWeight: '800', fontSize: '15px', color: '#0F172A', userSelect: 'none' }}>
                        {sharesCount}
                      </span>
                      <button 
                        type="button"
                        onClick={() => setSharesCount(prev => Math.min(maxAvailableShares, prev + 1))}
                        disabled={sharesCount >= maxAvailableShares}
                        style={{ 
                          border: 'none', 
                          background: 'none', 
                          padding: '10px 16px', 
                          cursor: sharesCount >= maxAvailableShares ? 'not-allowed' : 'pointer', 
                          color: '#475569',
                          opacity: sharesCount >= maxAvailableShares ? 0.35 : 1,
                          transition: 'opacity 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        aria-label="Increase shares"
                      >
                        <Plus size={14} style={{ pointerEvents: 'none' }} />
                      </button>
                    </div>
                    
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                      Cost: <strong style={{ color: '#2563EB', fontSize: '15px' }}>{formatCurrency(sharesCount * product.price_per_share)}</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Booking Buttons */}
              {sharesLeft > 0 ? (
                <button 
                  onClick={handleAddToCart}
                  className="btn btn-secondary btn-full btn-lg"
                  style={{ 
                    display: 'flex', 
                    gap: '8px', 
                    justifyContent: 'center', 
                    height: '48px',
                    borderRadius: '14px',
                    background: 'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)',
                    fontWeight: '800',
                    fontSize: '15px',
                    boxShadow: '0 4px 14px rgba(37, 99, 235, 0.2)'
                  }}
                >
                  <ShoppingCart size={18} />
                  {isAlreadyInCart ? `Update Shares in Cart — Pay ${formatCurrency(sharesCount * product.price_per_share)}` : `Join Group — Pay ${formatCurrency(sharesCount * product.price_per_share)}`}
                </button>
              ) : (
                <button disabled className="btn btn-outline btn-full btn-lg" style={{ borderRadius: '14px', height: '48px' }}>
                  Group is Completed
                </button>
              )}

              {/* Secondary CTA buttons (Wishlist & Share) */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button 
                  onClick={handleWishlistToggle}
                  className="btn btn-outline btn-full"
                  style={{ display: 'flex', gap: '8px', flex: 1, height: '42px', borderRadius: '10px', fontSize: '12px', justifyContent: 'center' }}
                >
                  <Heart size={16} fill={isWished ? '#E05353' : 'none'} stroke={isWished ? '#E05353' : '#475569'} />
                  Wishlist
                </button>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    addToast('Deal link copied to clipboard! Share it with DELSU students.', 'success');
                  }}
                  className="btn btn-outline btn-full"
                  style={{ display: 'flex', gap: '8px', flex: 1, height: '42px', borderRadius: '10px', fontSize: '12px', justifyContent: 'center' }}
                >
                  <Share2 size={16} />
                  Share Deal
                </button>
              </div>

              {/* Guarantees trust row */}
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '8px', 
                marginTop: '24px', 
                borderTop: '1px solid #DBEAFE', 
                paddingTop: '18px',
                fontSize: '12px',
                color: 'var(--text-secondary)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={16} style={{ color: '#2563EB' }} />
                  <span>Escrow Protection: Money secure until pickup</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Truck size={16} style={{ color: '#2563EB' }} />
                  <span>Campus Fulfillment: Fast pickup or hostel delivery</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <User size={16} style={{ color: '#2563EB' }} />
                  <span>Verified Traders: Directly from Abraka Main Market</span>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* REVIEWS SECTION */}
        <section style={{ marginTop: '56px', borderTop: '1px solid var(--border-color)', paddingTop: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
            <MessageSquare size={22} style={{ color: 'var(--primary-navy)' }} />
            <h3 style={{ fontSize: '22px', fontWeight: '800' }}>Student Reviews ({reviews.length})</h3>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr', 
            gap: '32px' 
          }} className="reviews-grid">
            
            {/* Review Form */}
            {user ? (
              <form onSubmit={handleAddReview} style={{ 
                backgroundColor: '#FFFFFF', 
                border: '1px solid var(--border-color)', 
                borderRadius: 'var(--radius-lg)', 
                padding: '24px' 
              }}>
                <h4 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>Leave a Review</h4>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)' }}>Rating:</span>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button 
                      key={star} 
                      type="button"
                      onClick={() => setNewRating(star)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}
                    >
                      <Star size={20} fill={star <= newRating ? '#F59E0B' : 'none'} stroke={star <= newRating ? '#F59E0B' : 'var(--text-muted)'} />
                    </button>
                  ))}
                </div>

                <div className="form-group">
                  <label className="form-label">Review Comment</label>
                  <textarea 
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share your experience splitting this bulk product..."
                    rows={3}
                    className="form-control"
                    required
                  />
                </div>

                <button type="submit" disabled={reviewSubmitLoading} className="btn btn-primary btn-sm">
                  {reviewSubmitLoading ? 'Submitting...' : 'Post Review'}
                </button>
              </form>
            ) : (
              <div style={{ padding: '20px', backgroundColor: 'var(--neutral-surface-hover)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                  You must be logged in to leave reviews. <Link to="/login" style={{ color: 'var(--primary-navy)', fontWeight: '700' }}>Login here</Link>
                </p>
              </div>
            )}

            {/* Reviews List */}
            {reviews.length === 0 ? (
              <div style={{ padding: '20px 0', color: 'var(--text-muted)' }}>
                No reviews yet. Be the first to share your experience!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {reviews.map((rev) => (
                  <div 
                    key={rev.id}
                    style={{ 
                      backgroundColor: '#FFFFFF', 
                      border: '1px solid var(--border-color)', 
                      borderRadius: 'var(--radius-md)', 
                      padding: '20px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <div>
                        <span style={{ display: 'block', fontWeight: '700', fontSize: '14px' }}>{rev.buyer_name}</span>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {new Date(rev.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <div style={{ display: 'flex', gap: '2px' }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} size={14} fill={star <= rev.rating ? '#F59E0B' : 'none'} stroke={star <= rev.rating ? '#F59E0B' : 'var(--text-muted)'} />
                        ))}
                      </div>
                    </div>

                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{rev.comment}</p>
                  </div>
                ))}
              </div>
            )}

          </div>
        </section>

        {/* OTHER PRODUCTS TO SHOP (AliExpress / Marketplace Related Items) */}
        {relatedProducts.length > 0 && (
          <section style={{ marginTop: '56px', borderTop: '1px solid var(--border-color)', paddingTop: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShoppingBag size={22} style={{ color: '#2563EB' }} />
                  <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#0F172A', fontFamily: 'var(--font-heading)' }}>
                    Other Products to Shop
                  </h3>
                </div>
                <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0 0' }}>
                  Explore more group split deals & campus marketplace offers
                </p>
              </div>
              <Link 
                to="/home?tab=browse" 
                style={{ 
                  color: '#2563EB', 
                  fontSize: '13px', 
                  fontWeight: '700', 
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                View all products &rarr;
              </Link>
            </div>

            <div className="grid-responsive" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: '20px'
            }}>
              {relatedProducts.map(relProd => {
                const relGroup = allGroupOrders.find(g => g.product_id === relProd.id && g.status === 'pending');
                return (
                  <ProductCard 
                    key={relProd.id} 
                    product={relProd} 
                    groupOrder={relGroup} 
                  />
                );
              })}
            </div>
          </section>
        )}

      </div>

      <style>{`
        @media (min-width: 992px) {
          .product-details-grid {
            grid-template-columns: 1.2fr 0.8fr !important;
          }
          .highlights-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (max-width: 480px) {
          .product-price-box {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 16px !important;
          }
          .product-price-right {
            border-left: none !important;
            padding-left: 0 !important;
            border-top: 1px dashed #DBEAFE !important;
            padding-top: 14px !important;
            text-align: left !important;
          }
        }
      `}</style>
    </div>
  );
};
