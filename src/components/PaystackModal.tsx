import React, { useState } from 'react';
import { Shield, CreditCard, X } from 'lucide-react';

interface PaystackModalProps {
  isOpen: boolean;
  amount: number;
  email: string;
  onSuccess: (reference: string) => void;
  onCancel: () => void;
}

export const PaystackModal: React.FC<PaystackModalProps> = ({
  isOpen,
  amount,
  email,
  onSuccess,
  onCancel
}) => {
  const [cardNumber, setCardNumber] = useState('4081 2234 5678 9012');
  const [expiry, setExpiry] = useState('12/28');
  const [cvv, setCvv] = useState('321');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handlePay = (simulateSuccess: boolean) => {
    setIsProcessing(true);
    setErrorMessage('');

    setTimeout(() => {
      setIsProcessing(false);
      if (simulateSuccess) {
        // Generate a random Paystack reference
        const reference = 'PAY_' + Math.random().toString(36).substring(2, 15).toUpperCase();
        onSuccess(reference);
      } else {
        setErrorMessage('Transaction declined by issuer. Please try another card.');
      }
    }, 1800); // Realistic payment gateway processing wait
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
      <div className="modal-content" style={{ maxWidth: '400px', border: '1px solid var(--border-color)', position: 'relative' }}>
        {/* Header */}
        <div style={{ backgroundColor: '#0B2545', color: '#FFFFFF', padding: '24px 20px', textAlign: 'center', position: 'relative' }}>
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
            <span style={{ backgroundColor: '#09A5DB', color: '#FFFFFF', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '800' }}>
              TEST
            </span>
            <span style={{ fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', opacity: '0.8' }}>
              Secured Payment Gateway
            </span>
          </div>

          <h3 style={{ fontSize: '28px', color: '#FFFFFF', margin: '4px 0', fontFamily: 'var(--font-heading)' }}>
            {formatCurrency(amount)}
          </h3>
          <p style={{ fontSize: '13px', opacity: '0.7' }}>{email}</p>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 24px', backgroundColor: '#FFFFFF' }}>
          
          {/* Card fields */}
          <div style={{ border: '1px solid #CBD5E1', borderRadius: '8px', padding: '16px', marginBottom: '20px', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '13px', color: '#64748B', fontWeight: '600' }}>CARD PAYMENT</span>
              <CreditCard size={18} style={{ color: '#09A5DB' }} />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '10px', color: '#94A3B8', fontWeight: '700', marginBottom: '4px' }}>
                CARD NUMBER
              </label>
              <input 
                type="text" 
                value={cardNumber} 
                onChange={(e) => setCardNumber(e.target.value)}
                style={{ width: '100%', border: 'none', outline: 'none', fontSize: '16px', fontWeight: '600', color: '#334155' }} 
              />
            </div>

            <div style={{ display: 'flex', gap: '20px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '10px', color: '#94A3B8', fontWeight: '700', marginBottom: '4px' }}>
                  CARD EXPIRY
                </label>
                <input 
                  type="text" 
                  value={expiry} 
                  onChange={(e) => setExpiry(e.target.value)}
                  placeholder="MM/YY"
                  style={{ width: '100%', border: 'none', outline: 'none', fontSize: '15px', fontWeight: '600', color: '#334155' }} 
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '10px', color: '#94A3B8', fontWeight: '700', marginBottom: '4px' }}>
                  CVV
                </label>
                <input 
                  type="password" 
                  value={cvv} 
                  onChange={(e) => setCvv(e.target.value)}
                  placeholder="123"
                  style={{ width: '100%', border: 'none', outline: 'none', fontSize: '15px', fontWeight: '600', color: '#334155' }} 
                />
              </div>
            </div>
          </div>

          {errorMessage && (
            <div style={{ 
              backgroundColor: 'var(--status-cancelled-bg)', 
              color: 'var(--status-cancelled)', 
              padding: '10px 14px', 
              borderRadius: '6px', 
              fontSize: '13px', 
              marginBottom: '16px',
              fontWeight: '500'
            }}>
              {errorMessage}
            </div>
          )}

          {/* Paystack Test Triggers */}
          <div style={{ marginBottom: '24px' }}>
            <span style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#64748B', marginBottom: '10px', textAlign: 'center' }}>
              SIMULATE TRANSACTION OUTCOME
            </span>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                type="button" 
                onClick={() => handlePay(true)}
                disabled={isProcessing}
                className="btn btn-secondary btn-sm"
                style={{ 
                  flex: 1, 
                  backgroundColor: '#09A5DB', 
                  color: '#FFFFFF',
                  height: '44px',
                  borderRadius: '6px'
                }}
              >
                {isProcessing ? 'Processing...' : 'Simulate Success'}
              </button>
              
              <button 
                type="button" 
                onClick={() => handlePay(false)}
                disabled={isProcessing}
                className="btn btn-outline btn-sm"
                style={{ 
                  flex: 1, 
                  color: 'var(--status-cancelled)', 
                  borderColor: 'var(--status-cancelled)',
                  height: '44px',
                  borderRadius: '6px'
                }}
              >
                Simulate Decline
              </button>
            </div>
          </div>

          {/* Footer security logos */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#94A3B8', fontSize: '11px', fontWeight: '600' }}>
            <Shield size={14} style={{ color: '#09A5DB' }} />
            <span>SECURED BY</span>
            <span style={{ color: '#09A5DB', fontWeight: '800', letterSpacing: '0.5px' }}>paystack</span>
          </div>

        </div>
      </div>
    </div>
  );
};
