import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Trash2, ArrowLeft, ArrowRight, MapPin, Truck } from 'lucide-react';

export const Cart: React.FC = () => {
  const { 
    cartItems, 
    removeFromCart, 
    cartSubtotal, 
    deliveryType, 
    setDeliveryType,
    deliveryFee, 
    platformFee, 
    cartTotal 
  } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCheckoutRedirect = () => {
    if (!user) {
      navigate('/login?redirect=checkout');
    } else {
      navigate('/checkout');
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0
    }).format(val);
  };

  if (cartItems.length === 0) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <h3 style={{ fontSize: '22px', marginBottom: '12px' }}>Your Shopping Cart is Empty</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>You haven't joined any group buys yet.</p>
        <Link to="/home" className="btn btn-primary" style={{ display: 'inline-flex', gap: '8px' }}>
          <ArrowLeft size={16} />
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div style={{ padding: '32px 0 60px 0' }}>
      <div className="container">
        <h1 style={{ fontSize: '28px', color: 'var(--primary-navy)', marginBottom: '28px', fontFamily: 'var(--font-heading)' }}>
          Shopping Cart
        </h1>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr', 
          gap: '32px' 
        }} className="cart-grid">
          
          {/* Items Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {cartItems.map((item) => (
              <div 
                key={item.product.id}
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '16px',
                  backgroundColor: '#FFFFFF', 
                  borderRadius: 'var(--radius-lg)', 
                  border: '1px solid var(--border-color)', 
                  padding: '20px',
                  boxShadow: 'var(--shadow-sm)',
                  position: 'relative'
                }}
                className="cart-item-row"
              >
                <div style={{ display: 'flex', gap: '16px', flexGrow: 1 }} className="cart-item-info">
                  <img 
                    src={item.product.image_url} 
                    alt={item.product.name} 
                    style={{ width: '80px', height: '80px', borderRadius: 'var(--radius-md)', objectFit: 'cover' }} 
                  />
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      Sold by {item.product.trader_name}
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
                        <circle cx="12" cy="12" r="12" fill="#2563EB"/>
                        <path d="M9.5 12.5L11 14L15 10" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>
                    <h4 style={{ fontSize: '16px', fontWeight: '700', margin: '2px 0 4px 0', color: 'var(--primary-navy)' }}>
                      <Link to={`/product/${item.product.id}`}>{item.product.name}</Link>
                    </h4>
                    <p style={{ 
                      fontSize: '12px', 
                      color: 'var(--text-secondary)', 
                      margin: '0 0 8px 0', 
                      lineHeight: '1.4', 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis', 
                      display: '-webkit-box', 
                      WebkitLineClamp: 1, 
                      WebkitBoxOrient: 'vertical' 
                    }}>
                      {item.product.description}
                    </p>
                    
                    <div style={{ display: 'flex', gap: '12px', fontSize: '13px', color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
                      <span>Share Price: <strong>{formatCurrency(item.product.price_per_share)}</strong></span>
                      {item.product.shares_per_person && (
                        <span>Portion: <strong>{item.product.shares_per_person}</strong></span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Controls */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  borderTop: '1px solid var(--border-color)', 
                  paddingTop: '14px',
                  marginTop: '4px' 
                }} className="cart-item-controls">
                  <span style={{ 
                    fontSize: '13px', 
                    fontWeight: '600', 
                    color: 'var(--primary-navy)', 
                    backgroundColor: 'rgba(11, 37, 69, 0.06)', 
                    padding: '6px 14px', 
                    borderRadius: 'var(--radius-md)' 
                  }}>
                    {item.sharesBought} {item.sharesBought === 1 ? 'share' : 'shares'}
                  </span>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span style={{ fontSize: '16px', fontWeight: '700', color: 'var(--primary-navy)' }}>
                      {formatCurrency(item.sharesBought * item.product.price_per_share)}
                    </span>
                    
                    <button 
                      onClick={() => removeFromCart(item.product.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}
                      onMouseOver={e => e.currentTarget.style.color = 'var(--status-cancelled)'}
                      onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Checkout Column */}
          <div>
            <div style={{ 
              backgroundColor: '#FFFFFF', 
              borderRadius: 'var(--radius-lg)', 
              border: '1px solid var(--border-color)', 
              padding: '24px',
              boxShadow: 'var(--shadow-md)',
              position: 'sticky',
              top: '90px'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>Order Summary</h3>

              {/* Delivery Choice */}
              <div style={{ marginBottom: '24px' }}>
                <span className="form-label">Delivery Preferences</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <label style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px', 
                    padding: '12px', 
                    borderRadius: 'var(--radius-md)', 
                    border: `1px solid ${deliveryType === 'pickup' ? 'var(--primary-navy)' : 'var(--border-color)'}`,
                    backgroundColor: deliveryType === 'pickup' ? 'rgba(11, 37, 69, 0.02)' : 'transparent',
                    cursor: 'pointer'
                  }}>
                    <input 
                      type="radio" 
                      name="deliveryType" 
                      checked={deliveryType === 'pickup'}
                      onChange={() => setDeliveryType('pickup')}
                      style={{ accentColor: 'var(--primary-navy)' }}
                    />
                    <MapPin size={18} style={{ color: 'var(--primary-navy)' }} />
                    <div style={{ fontSize: '13px' }}>
                      <strong style={{ display: 'block' }}>Campus Pickup</strong>
                      <span style={{ color: 'var(--text-secondary)' }}>Free pickup at trader's designated stall</span>
                    </div>
                  </label>

                  <label style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px', 
                    padding: '12px', 
                    borderRadius: 'var(--radius-md)', 
                    border: `1px solid ${deliveryType === 'delivery' ? 'var(--primary-navy)' : 'var(--border-color)'}`,
                    backgroundColor: deliveryType === 'delivery' ? 'rgba(11, 37, 69, 0.02)' : 'transparent',
                    cursor: 'pointer'
                  }}>
                    <input 
                      type="radio" 
                      name="deliveryType" 
                      checked={deliveryType === 'delivery'}
                      onChange={() => setDeliveryType('delivery')}
                      style={{ accentColor: 'var(--primary-navy)' }}
                    />
                    <Truck size={18} style={{ color: 'var(--primary-navy)' }} />
                    <div style={{ fontSize: '13px' }}>
                      <strong style={{ display: 'block' }}>Hostel Delivery (+₦500)</strong>
                      <span style={{ color: 'var(--text-secondary)' }}>Dispatched directly to your campus hostel door</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Price Calculation details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'var(--text-secondary)' }}>
                  <span>Subtotal</span>
                  <span>{formatCurrency(cartSubtotal)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'var(--text-secondary)' }}>
                  <span>Platform Fee</span>
                  <span>{formatCurrency(platformFee)}</span>
                </div>
                {deliveryType === 'delivery' && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'var(--text-secondary)' }}>
                    <span>Delivery Fee</span>
                    <span>{formatCurrency(deliveryFee)}</span>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: '800', color: 'var(--primary-navy)', marginBottom: '24px' }}>
                <span>Total Amount</span>
                <span>{formatCurrency(cartTotal)}</span>
              </div>

              <button 
                onClick={handleCheckoutRedirect}
                className="btn btn-secondary btn-full btn-lg"
                style={{ display: 'flex', gap: '8px' }}
              >
                Proceed to Checkout
                <ArrowRight size={18} />
              </button>

            </div>
          </div>

        </div>

      </div>

      <style>{`
        @media (min-width: 992px) {
          .cart-grid {
            grid-template-columns: 1.2fr 0.8fr !important;
          }
          .cart-item-row {
            flex-direction: row !important;
            align-items: center !important;
            justify-content: space-between !important;
          }
          .cart-item-controls {
            border-top: none !important;
            padding-top: 0 !important;
            margin-top: 0 !important;
            flex-direction: row !important;
            gap: 24px !important;
          }
        }
      `}</style>
    </div>
  );
};
