import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { dbService } from '../supabase';
import { PaystackModal } from '../components/PaystackModal';
import { StripeModal } from '../components/StripeModal';
import { 
  ArrowLeft, 
  Phone, 
  Check, 
  Copy, 
  Truck, 
  ShieldAlert
} from 'lucide-react';
import { ProgressBar } from '../components/ProgressBar';

export const Checkout: React.FC = () => {
  const { cartItems, cartTotal, deliveryType, clearCart } = useCart();
  const { user } = useAuth();

  // User input states
  const [phoneNumber, setPhoneNumber] = useState(user?.phone_number || '');
  const [hostelName, setHostelName] = useState('');
  
  // Payment states
  const [paymentMethod, setPaymentMethod] = useState<'bank_transfer' | 'stripe'>('bank_transfer');
  const [isPaystackOpen, setIsPaystackOpen] = useState(false);
  const [isStripeOpen, setIsStripeOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [lastPaymentRef, setLastPaymentRef] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [placingOrder, setPlacingOrder] = useState(false);
  
  // Promo code
  const [promoCode, setPromoCode] = useState('');

  const getPortionDetail = (name: string) => {
    if (name.includes('Rice')) return '1 share of 10 — 5kg';
    if (name.includes('Indomie')) return '1 share of 4 — 10 packs';
    if (name.includes('Notebook')) return '1 share of 4 — 10 books';
    return '1 share portion';
  };

  const handleProceedToPay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim()) {
      setErrorMsg('Please input a valid phone number for trader contact.');
      return;
    }
    if (deliveryType === 'delivery' && !hostelName.trim()) {
      setErrorMsg('Please input your hostel name for delivery.');
      return;
    }
    setErrorMsg('');
    if (paymentMethod === 'stripe') {
      setIsStripeOpen(true);
    } else {
      setIsPaystackOpen(true);
    }
  };

  const handlePaymentSuccess = async (reference: string) => {
    setIsPaystackOpen(false);
    setIsStripeOpen(false);
    setPlacingOrder(true);
    setErrorMsg('');

    try {
      if (!user) throw new Error('User not logged in');

      // Place each group buy order sequentially
      for (const item of cartItems) {
        await dbService.joinGroupOrder(
          user.id,
          item.product.id,
          item.sharesBought,
          'Paystack',
          reference + '_' + item.product.id
        );
      }

      setLastPaymentRef(reference);
      setIsSuccess(true);
      clearCart();
    } catch (err: any) {
      console.error('Checkout creation error:', err);
      setErrorMsg(err.message || 'An error occurred during order creation. Please try again.');
    } finally {
      setPlacingOrder(false);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0
    }).format(val);
  };

  const handleCopyAccount = () => {
    navigator.clipboard.writeText('0123456789');
    // Add small visual alert
    alert('Account number 0123456789 copied to clipboard!');
  };

  if (cartItems.length === 0 && !isSuccess) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <h3 style={{ fontSize: '22px', marginBottom: '12px' }}>Checkout</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Your cart is empty. Nothing to checkout.</p>
        <Link to="/home" className="btn btn-secondary btn-sm">Browse Products</Link>
      </div>
    );
  }

  // Image 1: You're In success screen
  if (isSuccess) {
    const purchasedItem = cartItems[0] || { product: { name: 'Indomie Onion Chicken (Carton)', price_per_share: 6000, total_shares: 4, image_url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500&auto=format&fit=crop&q=60' }, sharesBought: 1 };
    
    return (
      <div style={{ padding: '40px 0 80px 0', backgroundColor: '#F8FAFC', minHeight: '95vh', display: 'flex', alignItems: 'center' }}>
        <div className="container" style={{ maxWidth: '540px', textAlign: 'center' }}>
          
          {/* Animated checkmark icon (Image 1) */}
          <div style={{ 
            width: '80px', 
            height: '80px', 
            borderRadius: '50%', 
            backgroundColor: '#EFF6FF', 
            color: '#2563EB',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            margin: '0 auto 16px auto',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.1)'
          }}>
            <Check size={44} strokeWidth={3} />
          </div>

          <h1 style={{ fontSize: '36px', color: '#0F172A', fontFamily: 'var(--font-heading)', fontWeight: '800', margin: '0 0 6px 0' }}>
            You're In!
          </h1>
          <p style={{ color: '#94A3B8', fontSize: '15px', fontWeight: '600', marginBottom: '32px' }}>
            Your spot has been reserved in the group.
          </p>

          {/* Group details card (Image 1 center card) */}
          <div style={{ 
            backgroundColor: '#FFFFFF', 
            borderRadius: '24px', 
            border: '1px solid #DBEAFE', 
            padding: '24px',
            boxShadow: '0 8px 30px rgba(30, 64, 175, 0.04)',
            textAlign: 'left',
            marginBottom: '32px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', borderBottom: '1px solid #F8FAFC', paddingBottom: '12px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700' }}>
                ORDER ID: {lastPaymentRef ? lastPaymentRef.substring(0, 10).toUpperCase() : 'KBW-2041'}
              </span>
              <span style={{ backgroundColor: '#EFF6FF', color: '#2563EB', fontSize: '11px', fontWeight: '800', padding: '4px 10px', borderRadius: '6px' }}>
                Payment Received
              </span>
            </div>

            {/* Product description block */}
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '20px' }}>
              <img 
                src={purchasedItem.product.image_url} 
                alt="" 
                style={{ width: '64px', height: '64px', borderRadius: '12px', objectFit: 'cover', border: '1px solid #DBEAFE' }} 
              />
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A', margin: '0 0 4px 0' }}>
                  {purchasedItem.product.name}
                </h4>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Your share: <strong style={{ color: '#2563EB' }}>{formatCurrency(purchasedItem.product.price_per_share)}</strong>
                  {purchasedItem.product.shares_per_person && (
                    <span style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Portion: <strong>{purchasedItem.product.shares_per_person}</strong>
                    </span>
                  )}
                </span>
              </div>
            </div>

            {/* Progress tracker inside success card */}
            <div style={{ backgroundColor: '#F8FAFC', padding: '16px', borderRadius: '16px', border: '1px solid #DBEAFE', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>
                <span>Group Progress</span>
                <span style={{ color: '#2563EB' }}>75% Filled</span>
              </div>
              <ProgressBar purchased={3} needed={4} />
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                {/* Overlapping avatars */}
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {['👩‍🎓', '👨‍🎓', '🧑‍🎓'].map((avatar, idx) => (
                    <div 
                      key={idx}
                      style={{ 
                        width: '28px', 
                        height: '28px', 
                        borderRadius: '50%', 
                        backgroundColor: '#FFFFFF', 
                        border: '1px solid #DBEAFE', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        fontSize: '14px',
                        marginLeft: idx > 0 ? '-8px' : '0',
                        zIndex: 10 - idx
                      }}
                    >
                      {avatar}
                    </div>
                  ))}
                  <div style={{ 
                    width: '28px', 
                    height: '28px', 
                    borderRadius: '50%', 
                    backgroundColor: '#F8FAFC', 
                    border: '1px dashed #94A3B8', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontSize: '10px',
                    fontWeight: '800',
                    color: '#94A3B8',
                    marginLeft: '-8px',
                    zIndex: 5
                  }}>
                    +1
                  </div>
                </div>

                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700' }}>
                  Awaiting 1 more
                </span>
              </div>
            </div>

            {/* Delivery Info banner */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '14px', backgroundColor: '#E3F2FD', color: '#0D47A1', borderRadius: '14px', fontSize: '12px', fontWeight: '600' }}>
              <Truck size={18} style={{ flexShrink: 0 }} />
              <span>Estimated delivery: <strong>3-5 days</strong> after group completes.</span>
            </div>

          </div>

          {/* CTA Buttons (Image 1) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button 
              onClick={() => alert('Share link copied to clipboard! Send to your DELSU classmates.')}
              className="btn btn-secondary" 
              style={{ 
                height: '48px', 
                borderRadius: '30px', 
                backgroundColor: '#E65100', 
                border: 'none', 
                color: '#FFFFFF', 
                fontWeight: '800', 
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(230, 81, 0, 0.15)'
              }}
            >
              Share this deal
            </button>
            
            <Link 
              to="/home" 
              className="btn btn-outline" 
              style={{ 
                height: '48px', 
                borderRadius: '30px', 
                borderColor: '#2563EB', 
                color: '#2563EB', 
                fontWeight: '800', 
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              Browse More Deals
            </Link>
          </div>

        </div>
      </div>
    );
  }

  // Image 4: Redesigned Checkout Page
  return (
    <div style={{ padding: '32px 0 60px 0', backgroundColor: '#F8FAFC', minHeight: '95vh' }}>
      <div className="container">
        
        {/* Back Link */}
        <Link to="/cart" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontWeight: '700', color: '#475569', marginBottom: '24px', textDecoration: 'none' }}>
          <ArrowLeft size={16} />
          Back to Cart
        </Link>

        <h1 style={{ fontSize: '32px', color: '#0F172A', marginBottom: '24px', fontWeight: '800', fontFamily: 'var(--font-heading)' }}>
          Checkout
        </h1>

        {errorMsg && (
          <div style={{ 
            backgroundColor: 'rgba(239, 68, 68, 0.05)', 
            color: 'var(--status-cancelled)', 
            padding: '12px 16px', 
            borderRadius: '12px', 
            fontSize: '14px',
            fontWeight: '600',
            marginBottom: '24px',
            border: '1px solid rgba(239, 68, 68, 0.15)'
          }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleProceedToPay} style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr', 
          gap: '32px' 
        }} className="checkout-two-col">
          
          {/* Column 1: Left Cart items summary */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A', marginBottom: '4px' }}>Your Cart</h3>
            
            {/* List Cart items in separate premium cards (Image 4) */}
            {cartItems.map((item) => (
              <div 
                key={item.product.id}
                style={{ 
                  backgroundColor: '#FFFFFF', 
                  border: '1px solid #DBEAFE', 
                  borderRadius: '20px', 
                  padding: '20px', 
                  boxShadow: '0 2px 8px rgba(30, 64, 175, 0.02)',
                  display: 'flex',
                  gap: '16px',
                  position: 'relative'
                }}
              >
                <img 
                  src={item.product.image_url} 
                  alt="" 
                  style={{ width: '64px', height: '64px', borderRadius: '12px', objectFit: 'cover', border: '1px solid #DBEAFE' }} 
                />
                
                <div style={{ flexGrow: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#0F172A', margin: '0 0 2px 0' }}>
                        {item.product.name}
                      </h4>
                      <p style={{ 
                        fontSize: '12px', 
                        color: 'var(--text-secondary)', 
                        margin: '0 0 6px 0', 
                        lineHeight: '1.4', 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis', 
                        display: '-webkit-box', 
                        WebkitLineClamp: 1, 
                        WebkitBoxOrient: 'vertical' 
                      }}>
                        {item.product.description}
                      </p>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', fontWeight: '600' }}>
                        {item.product.shares_per_person ? `${item.sharesBought} share${item.sharesBought > 1 ? 's' : ''} — ${item.product.shares_per_person} each` : getPortionDetail(item.product.name)}
                      </span>
                    </div>

                    <span style={{ fontSize: '15px', fontWeight: '800', color: '#2563EB' }}>
                      {formatCurrency(item.sharesBought * item.product.price_per_share)}
                    </span>
                  </div>

                  {/* Progress tracker under product summary */}
                  <div style={{ marginTop: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: '700', color: '#94A3B8', marginBottom: '4px' }}>
                      <span>3/4 joined</span>
                      <span style={{ color: '#F97316' }}>1 spot left!</span>
                    </div>
                    <ProgressBar purchased={3} needed={4} />
                  </div>
                </div>
              </div>
            ))}

            {/* Promo Code Input (Image 4) */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
              <input 
                type="text" 
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder="Enter promo code"
                style={{ 
                  flexGrow: 1, 
                  height: '42px',
                  borderRadius: '10px',
                  border: '1px solid #DBEAFE',
                  padding: '0 16px',
                  fontSize: '13px',
                  backgroundColor: '#FFFFFF'
                }}
              />
              <button 
                type="button" 
                onClick={() => {
                  alert('Promo code successfully applied!');
                }}
                className="btn btn-outline"
                style={{ height: '42px', padding: '0 20px', borderRadius: '10px', fontSize: '13px' }}
              >
                Apply
              </button>
            </div>

            {/* Subtotal summary section */}
            <div style={{ borderTop: '1px dashed #DBEAFE', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'var(--text-secondary)', fontWeight: '600' }}>
                <span>Subtotal</span>
                <span>{formatCurrency(cartTotal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'var(--text-secondary)', fontWeight: '600' }}>
                <span>Platform Fee</span>
                <span>{formatCurrency(150)}</span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', color: '#0F172A', fontWeight: '800', marginTop: '8px', borderTop: '1px solid #DBEAFE', paddingTop: '12px' }}>
                <span>Grand Total</span>
                <span style={{ color: '#2563EB' }}>{formatCurrency(cartTotal + 150)}</span>
              </div>
            </div>

            {/* Contact details */}
            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #DBEAFE', borderRadius: '20px', padding: '20px', marginTop: '12px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#0F172A', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Phone size={16} /> Contact Details
              </h4>
              <div className="form-group" style={{ marginBottom: deliveryType === 'delivery' ? '12px' : 0 }}>
                <label className="form-label" style={{ fontSize: '11px', textTransform: 'uppercase' }}>Phone Number *</label>
                <input 
                  type="tel" 
                  value={phoneNumber} 
                  onChange={(e) => setPhoneNumber(e.target.value)} 
                  placeholder="e.g. 08012345678" 
                  className="form-control"
                  style={{ borderRadius: '10px', height: '40px' }}
                  required
                />
              </div>
              {deliveryType === 'delivery' && (
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '11px', textTransform: 'uppercase' }}>Hostel Name & Room Number *</label>
                  <input 
                    type="text" 
                    value={hostelName} 
                    onChange={(e) => setHostelName(e.target.value)} 
                    placeholder="e.g. Edo Hostel, Block C, Room 12" 
                    className="form-control"
                    style={{ borderRadius: '10px', height: '40px' }}
                    required
                  />
                </div>
              )}
            </div>
          </div>

          {/* Column 2: Right payment section */}
          <div>
            <div style={{ 
              backgroundColor: '#FFFFFF', 
              borderRadius: '24px', 
              border: '1px solid #DBEAFE', 
              padding: '24px',
              boxShadow: '0 8px 30px rgba(30, 64, 175, 0.04)'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A', marginBottom: '20px' }}>
                Complete Your Order
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                
                {/* Method 1: Bank Transfer */}
                <div style={{ 
                  border: paymentMethod === 'bank_transfer' ? '2px solid #2563EB' : '1px solid #DBEAFE', 
                  borderRadius: '16px', 
                  padding: '16px',
                  backgroundColor: paymentMethod === 'bank_transfer' ? '#F8FAFC' : '#FFFFFF' 
                }}>
                  <label style={{ display: 'flex', gap: '10px', alignItems: 'center', cursor: 'pointer', fontWeight: '700', fontSize: '14px', color: '#0F172A' }}>
                    <input 
                      type="radio" 
                      name="payment_method" 
                      checked={paymentMethod === 'bank_transfer'} 
                      onChange={() => setPaymentMethod('bank_transfer')}
                      style={{ accentColor: '#2563EB' }} 
                    />
                    Bank Transfer
                  </label>

                  {/* Bank detail details box */}
                  {paymentMethod === 'bank_transfer' && (
                    <div style={{ 
                      marginTop: '14px', 
                      padding: '14px', 
                      borderRadius: '12px', 
                      backgroundColor: '#FFFFFF', 
                      border: '1px solid #DBEAFE',
                      fontSize: '13px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Bank Name</span>
                        <strong style={{ color: '#0F172A' }}>Access Bank</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Account Number</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <strong style={{ color: '#0F172A', fontSize: '14px', fontFamily: 'monospace' }}>0123456789</strong>
                          <button type="button" onClick={handleCopyAccount} style={{ border: 'none', background: 'none', cursor: 'pointer', display: 'flex', color: '#2563EB' }}>
                            <Copy size={14} />
                          </button>
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Account Name</span>
                        <strong style={{ color: '#0F172A' }}>KoboWise Escrow</strong>
                      </div>

                      {/* Escrow warning banner */}
                      <div style={{ 
                        display: 'flex', 
                        gap: '8px', 
                        padding: '10px 12px', 
                        backgroundColor: '#FFF3E0', 
                        border: '1px solid #FFE0B2', 
                        borderRadius: '8px', 
                        color: '#E65100', 
                        fontSize: '11px', 
                        fontWeight: '600',
                        lineHeight: '1.4'
                      }}>
                        <ShieldAlert size={16} style={{ flexShrink: 0 }} />
                        <span>Payment held in escrow until all shares are filled. Full refund if group is incomplete.</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Method 2: Stripe */}
                <div style={{ 
                  border: paymentMethod === 'stripe' ? '2px solid #635BFF' : '1px solid #DBEAFE', 
                  borderRadius: '16px', 
                  padding: '16px',
                  backgroundColor: paymentMethod === 'stripe' ? '#F9F8FF' : '#FFFFFF' 
                }}>
                  <label style={{ display: 'flex', gap: '10px', alignItems: 'center', cursor: 'pointer', fontWeight: '700', fontSize: '14px', color: '#0F172A' }}>
                    <input 
                      type="radio" 
                      name="payment_method" 
                      checked={paymentMethod === 'stripe'} 
                      onChange={() => setPaymentMethod('stripe')}
                      style={{ accentColor: '#635BFF' }} 
                    />
                    Debit Card (Stripe)
                  </label>
                  {paymentMethod === 'stripe' && (
                    <div style={{ marginTop: '10px', fontSize: '12px', color: '#635BFF', fontWeight: '600' }}>
                      💳 Secure international card payments powered by Stripe.
                    </div>
                  )}
                </div>

                {/* Method 3: USSD (disabled) */}
                <div style={{ 
                  border: '1px solid #DBEAFE', 
                  borderRadius: '16px', 
                  padding: '16px',
                  backgroundColor: '#FFFFFF',
                  opacity: 0.5
                }}>
                  <label style={{ display: 'flex', gap: '10px', alignItems: 'center', cursor: 'pointer', fontWeight: '700', fontSize: '14px', color: '#94A3B8' }}>
                    <input type="radio" name="payment_method" disabled style={{ accentColor: '#2563EB' }} />
                    USSD (Unavailable)
                  </label>
                </div>

              </div>

              {/* Pay trigger */}
              <button 
                type="submit" 
                disabled={placingOrder}
                className="btn btn-secondary btn-full btn-lg"
                style={{ 
                  background: 'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)', 
                  border: 'none', 
                  fontWeight: '800', 
                  fontSize: '15px',
                  height: '48px',
                  borderRadius: '14px',
                  boxShadow: '0 4px 14px rgba(37, 99, 235, 0.2)'
                }}
              >
                {placingOrder ? 'Confirming...' : `Confirm & Pay ${formatCurrency(cartTotal + 150)}`}
              </button>

            </div>
          </div>

        </form>
      </div>

      {/* Simulation modals */}
      <PaystackModal 
        isOpen={isPaystackOpen}
        amount={cartTotal + 150}
        email={user?.phone_number ? `${user.phone_number}@delsu.edu` : 'buyer@delsu.edu'} 
        onSuccess={handlePaymentSuccess}
        onCancel={() => setIsPaystackOpen(false)}
      />

      <StripeModal 
        isOpen={isStripeOpen}
        amount={cartTotal + 150}
        email={user?.phone_number ? `${user.phone_number}@delsu.edu` : 'buyer@delsu.edu'} 
        onSuccess={handlePaymentSuccess}
        onCancel={() => setIsStripeOpen(false)}
      />

      <style>{`
        @media (min-width: 768px) {
          .checkout-two-col {
            grid-template-columns: 1.2fr 0.8fr !important;
          }
        }
      `}</style>
    </div>
  );
};
