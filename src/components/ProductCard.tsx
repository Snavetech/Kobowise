import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { Product, GroupOrder } from '../supabase';
import { dbService } from '../supabase';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Heart, ShoppingCart, Lock, Check, Users } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  groupOrder?: GroupOrder;
}

export const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  groupOrder,
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartItems, addToCart } = useCart();
  const existingCartItem = cartItems.find(item => item.product.id === product.id);
  const isAlreadyInCart = !!existingCartItem;
  const [isWished, setIsWished] = useState(false);

  useEffect(() => {
    const checkWishlist = async () => {
      if (user) {
        const wish = await dbService.getWishlist(user.id);
        setIsWished(wish.some(w => w.id === product.id));
      }
    };
    checkWishlist();
  }, [user, product.id]);

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    const added = await dbService.toggleWishlist(user.id, product.id);
    setIsWished(added);
  };
  const isOutOfStock = product.stock_quantity !== undefined && product.stock_quantity <= 0;
  const activeGroup = (groupOrder && groupOrder.status === 'pending' && groupOrder.shares_purchased < product.total_shares) ? groupOrder : null;
  const confirmedShares = activeGroup ? activeGroup.shares_purchased : 0;
  const cartShares = existingCartItem ? existingCartItem.sharesBought : 0;
  const sharesPurchased = Math.min(product.total_shares, confirmedShares + cartShares);
  const totalShares = product.total_shares;
  const sharesLeft = Math.max(0, totalShares - sharesPurchased);
  const isComplete = isOutOfStock;

  const percentage = Math.min(100, Math.max(0, (sharesPurchased / totalShares) * 100));
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getCategoryName = (catId: string) => {
    if (catId === 'cat-1') return 'Food Staples';
    if (catId === 'cat-2') return 'Cooking Essentials';
    if (catId === 'cat-8') return 'Personal Care';
    if (catId === 'cat-10') return 'Student Essentials';
    return 'General';
  };

  return (
    <div 
      className="product-card hover-lift" 
      onClick={() => {
        navigate(`/product/${product.id}`);
      }}
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '20px',
        border: '1px solid #DBEAFE',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(30, 64, 175, 0.05)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        cursor: 'pointer'
      }}
    >
      
      {/* CARD IMAGE & BADGES */}
      <div style={{ position: 'relative', width: '100%', height: '190px', overflow: 'hidden' }}>
        <Link to={`/product/${product.id}`} style={{ display: 'block', width: '100%', height: '100%' }} onClick={(e) => e.stopPropagation()}>
          <img 
            src={product.image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=60'} 
            alt={product.name}
            className="hover-zoom-img"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => {
              e.currentTarget.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=60';
            }}
          />
        </Link>

        {/* Heart Wishlist Overlay */}
        <button 
          type="button"
          onClick={handleWishlistToggle}
          className="glass-badge"
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            border: 'none',
            borderRadius: '50%',
            width: '34px',
            height: '34px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
            zIndex: 5,
            transition: 'all 0.2s ease',
            backgroundColor: isWished ? '#FFF5F5' : 'rgba(255, 255, 255, 0.9)'
          }}
          title={isWished ? "Remove from Wishlist" : "Add to Wishlist"}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <Heart size={16} fill={isWished ? '#EF4444' : 'none'} style={{ color: isWished ? '#EF4444' : '#94A3B8' }} />
        </button>

        {/* Category or Out of Stock Badge Overlay */}
        {isOutOfStock ? (
          <span className="glass-badge" style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            color: '#EF4444',
            backgroundColor: '#FEF2F2',
            padding: '5px 12px',
            borderRadius: '8px',
            fontSize: '11px',
            fontWeight: '800',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            zIndex: 5
          }}>
            <Lock size={12} />
            Out of Stock
          </span>
        ) : (
          <span className="glass-badge" style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            color: '#2563EB',
            padding: '5px 12px',
            borderRadius: '8px',
            fontSize: '11px',
            fontWeight: '800',
            zIndex: 5
          }}>
            {getCategoryName(product.category_id)}
          </span>
        )}

        {/* Spots Left Overlay */}
        {!isComplete && (
          <span className="glass-badge" style={{
            position: 'absolute',
            bottom: '12px',
            left: '12px',
            color: sharesLeft === 1 ? '#D97706' : '#1E40AF',
            backgroundColor: sharesLeft === 1 ? 'rgba(254, 243, 199, 0.85)' : 'rgba(239, 246, 255, 0.85)',
            padding: '5px 12px',
            borderRadius: '8px',
            fontSize: '11px',
            fontWeight: '800',
            zIndex: 5
          }}>
            {sharesLeft} {sharesLeft === 1 ? 'spot left' : 'spots left'}
          </span>
        )}
      </div>

      {/* CARD CONTENT */}
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <h4 style={{ 
          fontSize: '16px', 
          fontWeight: '700', 
          margin: '0 0 6px 0', 
          height: '44px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          color: '#0F172A',
          lineHeight: '1.4'
        }}>
          <Link to={`/product/${product.id}`} style={{ color: 'inherit', textDecoration: 'none' }} onClick={(e) => e.stopPropagation()}>
            {product.name}
          </Link>
        </h4>

        {/* Product Short Description */}
        <p style={{
          fontSize: '12px',
          color: '#64748B',
          margin: '0 0 12px 0',
          height: '34px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          lineHeight: '1.4'
        }}>
          {product.description}
        </p>

        {/* Trader Name with Verification */}
        {product.trader_name && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '600' }}>
              {product.trader_name}
            </span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
              <circle cx="12" cy="12" r="12" fill="#2563EB"/>
              <path d="M9.5 12.5L11 14L15 10" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        )}

        {/* Price Elements */}
        <div style={{ margin: '4px 0 12px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '20px', fontWeight: '800', color: '#2563EB' }}>
              {formatCurrency(product.price_per_share)}
            </span>
            <span style={{ fontSize: '13px', color: '#94A3B8', fontWeight: '600' }}>/ share</span>
            {product.shares_per_person && (
              <span style={{ 
                fontSize: '11px', 
                color: '#1E40AF', 
                fontWeight: '700', 
                backgroundColor: '#EFF6FF', 
                padding: '2px 8px', 
                borderRadius: '6px',
                border: '1px solid #DBEAFE',
                marginLeft: '4px',
                display: 'inline-block'
              }}>
                {product.shares_per_person}
              </span>
            )}
          </div>
          <div style={{ fontSize: '12px', color: '#94A3B8', fontWeight: '600', marginTop: '2px', textDecoration: 'line-through' }}>
            Total: {formatCurrency(product.total_price)}
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ margin: '14px 0 16px 0' }}>
          <div style={{ 
            height: '7px', 
            backgroundColor: '#DBEAFE', 
            borderRadius: '4px', 
            overflow: 'hidden',
            marginBottom: '10px'
          }}>
            <div style={{
              height: '100%',
              width: `${percentage}%`,
              background: isComplete 
                ? 'linear-gradient(90deg, #2563EB, #60A5FA)' 
                : 'linear-gradient(90deg, #2563EB, #3B82F6)',
              borderRadius: '4px',
              transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
            }} />
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: '#475569', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700' }}>
              <Users size={14} style={{ color: isComplete ? '#2563EB' : '#3B82F6' }} />
              {sharesPurchased} of {totalShares} buyers joined
            </span>
            <span style={{ 
              fontSize: '11px', 
              fontWeight: '800', 
              color: isComplete ? '#1E40AF' : '#2563EB',
              backgroundColor: isComplete ? '#BFDBFE' : '#EFF6FF',
              padding: '2px 8px',
              borderRadius: '6px'
            }}>
              {Math.round(percentage)}%
            </span>
          </div>
        </div>

        {/* Action Button */}
        <div style={{ marginTop: 'auto' }}>
          {isComplete ? (
            <button 
              disabled 
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                backgroundColor: '#EFF6FF',
                border: '1px solid #60A5FA',
                color: '#2563EB',
                padding: '11px',
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'default'
              }}
            >
              <Check size={16} />
              Deal Completed
            </button>
          ) : isAlreadyInCart ? (
            <button 
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                navigate('/cart');
              }}
              className="btn-push"
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #059669, #10B981)',
                border: 'none',
                color: '#FFFFFF',
                padding: '11px',
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                boxShadow: '0 2px 8px rgba(16, 185, 129, 0.2)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(16, 185, 129, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(16, 185, 129, 0.2)';
              }}
            >
              <Check size={16} />
              Joined ({existingCartItem.sharesBought} {existingCartItem.sharesBought === 1 ? 'share' : 'shares'}) — View Cart
            </button>
          ) : (
            <button 
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                addToCart(product, 1);
              }}
              className="btn-push"
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #2563EB, #3B82F6)',
                border: 'none',
                color: '#FFFFFF',
                padding: '11px',
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                boxShadow: '0 2px 8px rgba(37, 99, 235, 0.15)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(37, 99, 235, 0.25)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(37, 99, 235, 0.15)';
              }}
            >
              <ShoppingCart size={16} />
              Join Group Buy
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
