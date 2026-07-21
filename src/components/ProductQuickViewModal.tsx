import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Product, GroupOrder, Review } from '../supabase';
import { dbService } from '../supabase';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { 
  X, 
  Star, 
  Truck, 
  MapPin, 
  Package, 
  Box, 
  ShieldCheck, 
  ShoppingCart, 
  Plus, 
  Minus,
  MessageSquare,
  Sparkles,
  Users
} from 'lucide-react';

interface ProductQuickViewModalProps {
  product: Product | null;
  groupOrder?: GroupOrder;
  onClose: () => void;
  addToast?: (msg: string, type?: 'success' | 'warning' | 'info') => void;
}

export const ProductQuickViewModal: React.FC<ProductQuickViewModalProps> = ({
  product,
  groupOrder,
  onClose,
  addToast
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartItems, addToCart } = useCart();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [sharesCount, setSharesCount] = useState<number>(1);
  const [activeImage, setActiveImage] = useState<string>('');
  const [newRating, setNewRating] = useState<number>(5);
  const [newComment, setNewComment] = useState<string>('');
  const [submittingReview, setSubmittingReview] = useState<boolean>(false);

  useEffect(() => {
    if (product) {
      setActiveImage(product.image_url);
      // If item is already in cart, initialize with existing shares
      const existingInCart = cartItems.find(item => item.product.id === product.id);
      if (existingInCart) {
        setSharesCount(existingInCart.sharesBought);
      } else {
        setSharesCount(1);
      }

      // Fetch reviews
      dbService.getReviews(product.id).then(setReviews);
    }
  }, [product, cartItems]);

  if (!product) return null;

  const activeGroup = (groupOrder && groupOrder.status === 'pending') ? groupOrder : null;
  const confirmedShares = activeGroup ? activeGroup.shares_purchased : 0;
  const existingCartItem = cartItems.find(item => item.product.id === product.id);
  const isAlreadyInCart = !!existingCartItem;
  const cartShares = (existingCartItem && confirmedShares > 0) ? existingCartItem.sharesBought : 0;
  const sharesPurchased = Math.min(product.total_shares, confirmedShares + cartShares);
  const sharesLeft = Math.max(0, product.total_shares - sharesPurchased);
  const maxAvailableShares = Math.max(1, product.total_shares);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0
    }).format(val);
  };

  const handleAddToCartAndCheckout = () => {
    addToCart(product, sharesCount);
    if (addToast) {
      addToast(`Added ${sharesCount} ${sharesCount === 1 ? 'share' : 'shares'} of "${product.name}" to cart! Payments can be made on the cart page.`, 'success');
    }
    onClose();
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onClose();
      navigate('/login');
      return;
    }
    if (!newComment.trim()) return;

    setSubmittingReview(true);
    const newRev = await dbService.addReview(
      product.id,
      user.id,
      user.full_name || 'DELSU Student',
      newRating,
      newComment
    );

    if (newRev) {
      setReviews(prev => [newRev, ...prev]);
      setNewComment('');
      setNewRating(5);
      if (addToast) addToast('Thank you for your review!', 'success');
    }
    setSubmittingReview(false);
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          maxWidth: '1020px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          position: 'relative',
          border: '1px solid #DBEAFE',
          animation: 'modalSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            backgroundColor: '#F1F5F9',
            border: 'none',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 10,
            color: '#64748B',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#E2E8F0';
            e.currentTarget.style.color = '#0F172A';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#F1F5F9';
            e.currentTarget.style.color = '#64748B';
          }}
        >
          <X size={20} />
        </button>

        {/* TOP BUNDLE DEALS BANNER (AliExpress Inspired Header) */}
        <div style={{
          background: 'linear-gradient(90deg, #FEF08A 0%, #FDE047 100%)',
          padding: '16px 28px',
          borderTopLeftRadius: '24px',
          borderTopRightRadius: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ 
              backgroundColor: '#EAB308', 
              color: '#FFFFFF', 
              padding: '6px 12px', 
              borderRadius: '8px', 
              fontWeight: '800', 
              fontSize: '13px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <Sparkles size={16} /> Bundle Deals
            </span>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#854D0E' }}>
              Co-op Group Split Price
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '26px', fontWeight: '900', color: '#0F172A' }}>
              {formatCurrency(product.price_per_share)}
            </span>
            <span style={{ fontSize: '14px', color: '#854D0E', textDecoration: 'line-through', fontWeight: '600' }}>
              {formatCurrency(product.total_price)}
            </span>
            <span style={{ 
              backgroundColor: '#EF4444', 
              color: '#FFFFFF', 
              padding: '2px 8px', 
              borderRadius: '6px', 
              fontSize: '11px', 
              fontWeight: '800' 
            }}>
              Save 75%
            </span>
          </div>
        </div>

        {/* MAIN MODAL BODY GRID */}
        <div style={{ padding: '28px', display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '32px' }} className="modal-content-grid">
          
          {/* LEFT COLUMN: Gallery & Description & Reviews */}
          <div>
            {/* Gallery Preview */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
              {/* Thumbnails list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[product.image_url, product.image_url, product.image_url].map((img, idx) => (
                  <div 
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      border: activeImage === img ? '2px solid #2563EB' : '1px solid #E2E8F0',
                      cursor: 'pointer',
                      opacity: activeImage === img ? 1 : 0.65,
                      transition: 'all 0.2s'
                    }}
                  >
                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>

              {/* Main Image */}
              <div style={{ flexGrow: 1, borderRadius: '16px', overflow: 'hidden', border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC', maxHeight: '340px' }}>
                <img 
                  src={activeImage || product.image_url} 
                  alt={product.name} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </div>
            </div>

            {/* Full Product Description */}
            <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '20px', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A', marginBottom: '8px' }}>
                Product Description
              </h3>
              <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6' }}>
                {product.description}
              </p>
            </div>

            {/* Customer Reviews Section */}
            <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MessageSquare size={18} style={{ color: '#2563EB' }} />
                  Customer Reviews ({reviews.length || 24})
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Star size={16} fill="#F59E0B" stroke="#F59E0B" />
                  <span style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A' }}>4.8</span>
                  <span style={{ fontSize: '12px', color: '#94A3B8' }}>(Verified DELSU buyers)</span>
                </div>
              </div>

              {/* Add Review Form */}
              {user ? (
                <form onSubmit={handleAddReview} style={{ backgroundColor: '#F8FAFC', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#0F172A' }}>Leave a review:</span>
                    <div style={{ display: 'flex', gap: '2px' }}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button key={s} type="button" onClick={() => setNewRating(s)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                          <Star size={14} fill={s <= newRating ? '#F59E0B' : 'none'} stroke={s <= newRating ? '#F59E0B' : '#CBD5E1'} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input 
                      type="text" 
                      value={newComment} 
                      onChange={(e) => setNewComment(e.target.value)} 
                      placeholder="Share your experience..." 
                      style={{ flexGrow: 1, border: '1px solid #CBD5E1', borderRadius: '8px', padding: '6px 10px', fontSize: '12px', outline: 'none' }}
                      required
                    />
                    <button type="submit" disabled={submittingReview} style={{ backgroundColor: '#2563EB', color: '#FFFFFF', border: 'none', borderRadius: '8px', padding: '6px 12px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>
                      {submittingReview ? 'Posting...' : 'Post'}
                    </button>
                  </div>
                </form>
              ) : null}

              {/* Reviews List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '180px', overflowY: 'auto' }}>
                {reviews.length === 0 ? (
                  <div style={{ fontSize: '13px', color: '#64748B', backgroundColor: '#F8FAFC', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
                    Be the first student to review this group deal!
                  </div>
                ) : (
                  reviews.map((rev) => (
                    <div key={rev.id} style={{ backgroundColor: '#F8FAFC', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontSize: '13px', fontWeight: '700', color: '#0F172A' }}>{rev.buyer_name}</span>
                        <div style={{ display: 'flex', gap: '2px' }}>
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} size={12} fill={s <= rev.rating ? '#F59E0B' : 'none'} stroke={s <= rev.rating ? '#F59E0B' : '#CBD5E1'} />
                          ))}
                        </div>
                      </div>
                      <p style={{ fontSize: '12px', color: '#475569', margin: 0 }}>{rev.comment}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Sidebar (Trader, Delivery, Pickup, Stock, Portion, Stepper, Add to Cart) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Title & Trader Info Box */}
            <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '20px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0F172A', margin: '0 0 10px 0', lineHeight: '1.3' }}>
                {product.name}
              </h2>
              
              <div style={{ fontSize: '13px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>Sold By:</span>
                <strong style={{ color: '#0F172A' }}>{product.trader_name || 'Shop110360264... (Trader)'}</strong>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="12" fill="#2563EB"/>
                  <path d="M9.5 12.5L11 14L15 10" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>

            {/* Key Delivery & Product Specifications (AliExpress Choice Box) */}
            <div style={{ 
              backgroundColor: '#EFF6FF', 
              border: '1px solid #BFDBFE', 
              borderRadius: '16px', 
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                <span style={{ backgroundColor: '#2563EB', color: '#FFFFFF', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '800' }}>
                  KoboWise Commitment
                </span>
                <span style={{ fontSize: '11px', color: sharesLeft === 1 ? '#D97706' : '#2563EB', fontWeight: '800', backgroundColor: '#FFFFFF', padding: '2px 8px', borderRadius: '6px' }}>
                  <Users size={12} style={{ display: 'inline', marginRight: '4px' }} />
                  {sharesLeft === 1 ? '1 spot left! 🚨' : `${sharesLeft} spots left`}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: '#1E293B' }}>
                
                {/* Delivery */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Truck size={18} style={{ color: '#2563EB', flexShrink: 0 }} />
                  <div>
                    <span style={{ color: '#64748B', fontWeight: '600' }}>Delivery: </span>
                    <strong style={{ color: '#0F172A' }}>{product.estimated_delivery || 'Same Day Pickup'}</strong>
                  </div>
                </div>

                {/* Pickup */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <MapPin size={18} style={{ color: '#EF4444', flexShrink: 0 }} />
                  <div>
                    <span style={{ color: '#64748B', fontWeight: '600' }}>Pickup: </span>
                    <strong style={{ color: '#0F172A' }}>{product.pickup_location || 'DELSU Site II Gate Shop 1B'}</strong>
                  </div>
                </div>

                {/* Stock Left */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Package size={18} style={{ color: '#D97706', flexShrink: 0 }} />
                  <div>
                    <span style={{ color: '#64748B', fontWeight: '600' }}>Stock Left: </span>
                    <strong style={{ color: '#0F172A' }}>{product.stock_quantity ? `${product.stock_quantity} units` : '30 units'}</strong>
                  </div>
                </div>

                {/* Portion Size */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Box size={18} style={{ color: '#10B981', flexShrink: 0 }} />
                  <div>
                    <span style={{ color: '#64748B', fontWeight: '600' }}>Portion Size: </span>
                    <strong style={{ color: '#0F172A' }}>{product.shares_per_person || 'Family Size Bread'}</strong>
                  </div>
                </div>

                {/* Security & Escrow */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderTop: '1px dashed #BFDBFE', paddingTop: '10px', marginTop: '4px' }}>
                  <ShieldCheck size={18} style={{ color: '#2563EB', flexShrink: 0 }} />
                  <span style={{ fontSize: '11px', color: '#475569' }}>
                    <strong>Security & Privacy:</strong> Money secure in escrow until pickup code verified.
                  </span>
                </div>

              </div>
            </div>

            {/* Quantity Stepper Section */}
            <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '14px', fontWeight: '700', color: '#0F172A' }}>Quantity (Shares)</span>
                <span style={{ fontSize: '12px', color: '#64748B' }}>Max {maxAvailableShares} shares/buyer</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #CBD5E1', borderRadius: '12px', backgroundColor: '#FFFFFF', overflow: 'hidden' }}>
                  <button 
                    type="button"
                    onClick={() => setSharesCount(prev => Math.max(1, prev - 1))}
                    disabled={sharesCount <= 1}
                    style={{
                      border: 'none',
                      backgroundColor: 'transparent',
                      padding: '10px 16px',
                      cursor: sharesCount <= 1 ? 'not-allowed' : 'pointer',
                      opacity: sharesCount <= 1 ? 0.35 : 1,
                      color: '#0F172A'
                    }}
                  >
                    <Minus size={14} style={{ pointerEvents: 'none' }} />
                  </button>
                  <span style={{ minWidth: '40px', textAlign: 'center', fontWeight: '800', fontSize: '16px', color: '#0F172A' }}>
                    {sharesCount}
                  </span>
                  <button 
                    type="button"
                    onClick={() => setSharesCount(prev => Math.min(maxAvailableShares, prev + 1))}
                    disabled={sharesCount >= maxAvailableShares}
                    style={{
                      border: 'none',
                      backgroundColor: 'transparent',
                      padding: '10px 16px',
                      cursor: sharesCount >= maxAvailableShares ? 'not-allowed' : 'pointer',
                      opacity: sharesCount >= maxAvailableShares ? 0.35 : 1,
                      color: '#0F172A'
                    }}
                  >
                    <Plus size={14} style={{ pointerEvents: 'none' }} />
                  </button>
                </div>

                <div>
                  <span style={{ fontSize: '11px', color: '#64748B', display: 'block' }}>Total Share Price</span>
                  <strong style={{ fontSize: '18px', color: '#2563EB', fontWeight: '800' }}>
                    {formatCurrency(sharesCount * product.price_per_share)}
                  </strong>
                </div>
              </div>
            </div>

            {/* Primary Action Button: Add to Cart / Join Group */}
            <button 
              type="button"
              onClick={handleAddToCartAndCheckout}
              style={{
                width: '100%',
                backgroundColor: '#DC2626',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '14px',
                padding: '14px',
                fontSize: '16px',
                fontWeight: '800',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(220, 38, 38, 0.3)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#B91C1C';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#DC2626';
              }}
            >
              <ShoppingCart size={20} />
              {isAlreadyInCart ? `Update Cart — Pay ${formatCurrency(sharesCount * product.price_per_share)}` : `Add to Cart — Pay ${formatCurrency(sharesCount * product.price_per_share)}`}
            </button>

          </div>

        </div>

      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modalSlideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @media (max-width: 768px) {
          .modal-content-grid {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
        }
      `}</style>
    </div>
  );
};
