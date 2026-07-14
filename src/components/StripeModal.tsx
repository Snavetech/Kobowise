import React, { useState } from 'react';
import { CreditCard, X, Lock } from 'lucide-react';

interface StripeModalProps {
  isOpen: boolean;
  amount: number;
  email: string;
  onSuccess: (reference: string) => void;
  onCancel: () => void;
}

export const StripeModal: React.FC<StripeModalProps> = ({
  isOpen,
  amount,
  email,
  onSuccess,
  onCancel
}) => {
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242'); // Stripe standard test card
  const [expiry, setExpiry] = useState('12/28');
  const [cvc, setCvc] = useState('321');
  const [zip, setZip] = useState('10001');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handlePay = (simulateSuccess: boolean) => {
    setIsProcessing(true);
    setErrorMessage('');

    setTimeout(() => {
      setIsProcessing(false);
      if (simulateSuccess) {
        // Generate a random Stripe payment intent reference
        const reference = 'pi_' + Math.random().toString(36).substring(2, 15).toLowerCase();
        onSuccess(reference);
      } else {
        setErrorMessage('Your card was declined. Please check details or try a different card.');
      }
    }, 1800); // Realistic transaction wait
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '400px', border: '1px solid #E2E8F0', position: 'relative', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
        
        {/* Header */}
        <div style={{ backgroundColor: '#635BFF', color: '#FFFFFF', padding: '24px 20px', textAlign: 'center', position: 'relative' }}>
          <button 
            onClick={onCancel}
            style={{ 
              position: 'absolute', 
              top: '16px', 
              right: '16px', 
              background: 'none', 
              border: 'none', 
              color: 'rgba(255, 255, 255, 0.7)', 
              cursor: 'pointer' 
            }}
          >
            <X size={20} />
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', color: '#FFFFFF', padding: '3px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: '800', textTransform: 'uppercase' }}>
              Test Mode
            </span>
            <span style={{ fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', opacity: '0.8', fontWeight: '600' }}>
              Secure Checkout
            </span>
          </div>

          <h3 style={{ fontSize: '28px', color: '#FFFFFF', margin: '4px 0', fontFamily: 'var(--font-heading)', fontWeight: '800' }}>
            {formatCurrency(amount)}
          </h3>
          <p style={{ fontSize: '13px', opacity: '0.8' }}>{email}</p>
        </div>

        {/* Body */}
        <div style={{ padding: '24px', backgroundColor: '#FFFFFF' }}>
          
          {/* Card fields */}
          <div style={{ border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px', marginBottom: '20px', backgroundColor: '#F8FAFC' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '12px', color: '#475569', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Card Details</span>
              <CreditCard size={18} style={{ color: '#635BFF' }} />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '10px', color: '#64748B', fontWeight: '700', marginBottom: '4px', textTransform: 'uppercase' }}>
                Card Number
              </label>
              <input 
                type="text" 
                value={cardNumber} 
                onChange={(e) => setCardNumber(e.target.value)}
                style={{ width: '100%', border: 'none', borderBottom: '1px solid #E2E8F0', outline: 'none', fontSize: '15px', fontWeight: '600', color: '#1E293B', padding: '4px 0', backgroundColor: 'transparent' }} 
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '10px', color: '#64748B', fontWeight: '700', marginBottom: '4px', textTransform: 'uppercase' }}>
                  Expiry
                </label>
                <input 
                  type="text" 
                  value={expiry} 
                  onChange={(e) => setExpiry(e.target.value)}
                  placeholder="MM/YY"
                  style={{ width: '100%', border: 'none', borderBottom: '1px solid #E2E8F0', outline: 'none', fontSize: '14px', fontWeight: '600', color: '#1E293B', padding: '4px 0', backgroundColor: 'transparent' }} 
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '10px', color: '#64748B', fontWeight: '700', marginBottom: '4px', textTransform: 'uppercase' }}>
                  CVC
                </label>
                <input 
                  type="password" 
                  value={cvc} 
                  onChange={(e) => setCvc(e.target.value)}
                  placeholder="123"
                  style={{ width: '100%', border: 'none', borderBottom: '1px solid #E2E8F0', outline: 'none', fontSize: '14px', fontWeight: '600', color: '#1E293B', padding: '4px 0', backgroundColor: 'transparent' }} 
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '10px', color: '#64748B', fontWeight: '700', marginBottom: '4px', textTransform: 'uppercase' }}>
                  Postal Code
                </label>
                <input 
                  type="text" 
                  value={zip} 
                  onChange={(e) => setZip(e.target.value)}
                  placeholder="10001"
                  style={{ width: '100%', border: 'none', borderBottom: '1px solid #E2E8F0', outline: 'none', fontSize: '14px', fontWeight: '600', color: '#1E293B', padding: '4px 0', backgroundColor: 'transparent' }} 
                />
              </div>
            </div>
          </div>

          {errorMessage && (
            <div style={{ 
              backgroundColor: '#FEF2F2', 
              color: '#EF4444', 
              padding: '10px 14px', 
              borderRadius: '8px', 
              fontSize: '13px', 
              marginBottom: '16px',
              fontWeight: '600',
              border: '1px solid #FEE2E2'
            }}>
              {errorMessage}
            </div>
          )}

          {/* Simulate outcomes */}
          <div style={{ marginBottom: '24px' }}>
            <span style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748B', marginBottom: '10px', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Simulate Stripe Outcome
            </span>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                type="button" 
                onClick={() => handlePay(true)}
                disabled={isProcessing}
                style={{ 
                  flex: 1, 
                  backgroundColor: '#635BFF', 
                  color: '#FFFFFF',
                  height: '42px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  boxShadow: '0 4px 6px -1px rgba(99, 91, 255, 0.2)'
                }}
              >
                {isProcessing ? 'Authorizing...' : 'Pay Success'}
              </button>
              
              <button 
                type="button" 
                onClick={() => handlePay(false)}
                disabled={isProcessing}
                style={{ 
                  flex: 1, 
                  color: '#EF4444', 
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #FEE2E2',
                  height: '42px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                Declined Card
              </button>
            </div>
          </div>

          {/* Security details footer */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#94A3B8', fontSize: '11px', fontWeight: '600' }}>
            <Lock size={12} style={{ color: '#635BFF' }} />
            <span>SECURE PAYMENT BY</span>
            <span style={{ color: '#635BFF', fontWeight: '800', letterSpacing: '0.5px', textTransform: 'uppercase' }}>stripe</span>
          </div>

        </div>
      </div>
    </div>
  );
};
