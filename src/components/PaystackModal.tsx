import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  CreditCard, 
  X, 
  Building2, 
  Smartphone, 
  Landmark, 
  Copy, 
  Check, 
  Clock, 
  ArrowRight,
  RefreshCw,
  Lock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface PaystackModalProps {
  isOpen: boolean;
  amount: number;
  email: string;
  onSuccess: (reference: string) => void;
  onCancel: () => void;
}

type PaystackChannel = 'card' | 'transfer' | 'ussd' | 'bank_account';
type TestOutcome = 'success' | 'decline';

interface BankUSSD {
  id: string;
  name: string;
  code: string;
  prefix: string;
}

const USSD_BANKS: BankUSSD[] = [
  { id: 'gtb', name: 'GTBank', code: '*737*', prefix: '*737*33*' },
  { id: 'zenith', name: 'Zenith Bank', code: '*966*', prefix: '*966*000*' },
  { id: 'access', name: 'Access Bank', code: '*901*', prefix: '*901*000*' },
  { id: 'uba', name: 'UBA', code: '*919*', prefix: '*919*00*' },
  { id: 'firstbank', name: 'First Bank', code: '*894*', prefix: '*894*00*' },
  { id: 'sterling', name: 'Sterling Bank', code: '*822*', prefix: '*822*00*' },
];

const DIRECT_BANKS = [
  { id: 'gtb', name: 'Guaranty Trust Bank' },
  { id: 'kuda', name: 'Kuda Microfinance Bank' },
  { id: 'zenith', name: 'Zenith Bank' },
  { id: 'firstbank', name: 'First Bank of Nigeria' },
  { id: 'access', name: 'Access Bank' }
];

export const PaystackModal: React.FC<PaystackModalProps> = ({
  isOpen,
  amount,
  email,
  onSuccess,
  onCancel
}) => {
  const [activeChannel, setActiveChannel] = useState<PaystackChannel>('card');
  const [testOutcome, setTestOutcome] = useState<TestOutcome>('success');

  // Card channel state
  const [cardNumber, setCardNumber] = useState('4081 2234 5678 9012');
  const [expiry, setExpiry] = useState('12/28');
  const [cvv, setCvv] = useState('321');

  // Transfer channel state
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(1790); // 29:50 live countdown timer
  const virtualAccountNo = '9920148291';
  const virtualBankName = 'Wema Bank / Paystack';

  useEffect(() => {
    if (!isOpen) {
      setTimeLeftSeconds(1790);
      return;
    }

    const interval = setInterval(() => {
      setTimeLeftSeconds(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // USSD channel state
  const [selectedUssdBank, setSelectedUssdBank] = useState<string>('gtb');
  const [copiedUssd, setCopiedUssd] = useState(false);

  // Bank Account channel state
  const [selectedDirectBank, setSelectedDirectBank] = useState<string>('gtb');
  const [accountNumber, setAccountNumber] = useState('0123456789');

  // OTP / 3DS Modal Step state
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState('123456');

  // Status & processing
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0
    }).format(val);
  };

  const copyToClipboard = (text: string, type: 'account' | 'ussd') => {
    navigator.clipboard.writeText(text);
    if (type === 'account') {
      setCopiedAccount(true);
      setTimeout(() => setCopiedAccount(false), 2000);
    } else {
      setCopiedUssd(true);
      setTimeout(() => setCopiedUssd(false), 2000);
    }
  };

  // Main pay trigger per channel
  const handleInitiatePay = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (activeChannel === 'card' || activeChannel === 'bank_account') {
      // Prompt 3DS OTP modal authentication step
      setShowOtpModal(true);
    } else {
      // Direct transfer / USSD verification loader
      executePaymentVerification();
    }
  };

  const executePaymentVerification = () => {
    setIsProcessing(true);
    setShowOtpModal(false);

    if (activeChannel === 'transfer') {
      setStatusMessage('Verifying transfer with Wema Bank...');
    } else if (activeChannel === 'ussd') {
      setStatusMessage('Awaiting network confirmation from bank...');
    } else if (activeChannel === 'card') {
      setStatusMessage('Authenticating 3D-Secure with card issuer...');
    } else {
      setStatusMessage('Verifying bank account authorization...');
    }

    setTimeout(() => {
      setIsProcessing(false);
      setStatusMessage('');

      if (testOutcome === 'success') {
        const reference = 'PAY_' + Math.random().toString(36).substring(2, 15).toUpperCase();
        onSuccess(reference);
      } else {
        if (activeChannel === 'card') {
          setErrorMessage('Transaction declined: Insufficient funds or invalid card details.');
        } else if (activeChannel === 'transfer') {
          setErrorMessage('Transfer not found. Please ensure payment was sent to the exact account number displayed.');
        } else if (activeChannel === 'ussd') {
          setErrorMessage('USSD session expired or authorization failed.');
        } else {
          setErrorMessage('Bank authorization failed. Please check account details or try another bank.');
        }
      }
    }, 2200);
  };

  const currentUssdBank = USSD_BANKS.find(b => b.id === selectedUssdBank) || USSD_BANKS[0];
  const ussdCodeString = `${currentUssdBank.prefix}${Math.floor(amount)}*8492#`;

  return (
    <div className="modal-overlay" style={{ zIndex: 1100, backgroundColor: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)' }}>
      
      {/* 3D-SECURE / OTP VERIFICATION MODAL OVERLAY */}
      {showOtpModal && (
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(11, 37, 69, 0.85)',
          zIndex: 1200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            maxWidth: '360px',
            width: '100%',
            padding: '24px',
            textAlign: 'center',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: '#E0F2FE',
              color: '#09A5DB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto'
            }}>
              <Lock size={24} />
            </div>

            <h4 style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A', margin: '0 0 6px 0' }}>
              3D Secure Authentication
            </h4>
            <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 20px 0', lineHeight: '1.4' }}>
              Enter the 6-digit OTP code sent to your registered phone number for {formatCurrency(amount)}.
            </p>

            <div style={{ marginBottom: '20px' }}>
              <input 
                type="text" 
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                maxLength={6}
                placeholder="123456"
                style={{
                  width: '180px',
                  height: '48px',
                  textAlign: 'center',
                  fontSize: '22px',
                  fontWeight: '800',
                  letterSpacing: '8px',
                  borderRadius: '10px',
                  border: '2px solid #09A5DB',
                  outline: 'none',
                  color: '#0F172A',
                  backgroundColor: '#F8FAFC'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setShowOtpModal(false)}
                style={{
                  flex: 1,
                  height: '42px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  backgroundColor: '#FFFFFF',
                  color: '#64748B',
                  fontWeight: '700',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executePaymentVerification}
                style={{
                  flex: 1,
                  height: '42px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#09A5DB',
                  color: '#FFFFFF',
                  fontWeight: '800',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Authorize
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="modal-content" style={{ maxWidth: '440px', border: '1px solid #CBD5E1', borderRadius: '16px', overflow: 'hidden', padding: 0, position: 'relative', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
        
        {/* Paystack Header */}
        <div style={{ backgroundColor: '#0B2545', color: '#FFFFFF', padding: '20px 24px', textAlign: 'center', position: 'relative' }}>
          
          <button 
            onClick={onCancel}
            type="button"
            style={{ 
              position: 'absolute', 
              top: '16px', 
              right: '16px', 
              background: 'rgba(255, 255, 255, 0.1)', 
              border: 'none', 
              borderRadius: '50%',
              width: '28px',
              height: '28px',
              color: '#FFFFFF', 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer' 
            }}
          >
            <X size={16} />
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', letterSpacing: '0.8px', textTransform: 'uppercase', opacity: '0.8', fontWeight: '700' }}>
              Paystack Secured
            </span>

            {/* Subtle Test Simulation Outcome Switch */}
            <select
              value={testOutcome}
              onChange={(e) => setTestOutcome(e.target.value as TestOutcome)}
              style={{
                backgroundColor: 'rgba(9, 165, 219, 0.25)',
                color: '#38BDF8',
                border: '1px solid rgba(56, 189, 248, 0.4)',
                borderRadius: '6px',
                fontSize: '10px',
                fontWeight: '800',
                padding: '2px 6px',
                outline: 'none',
                cursor: 'pointer'
              }}
              title="Test mode outcome toggle"
            >
              <option value="success" style={{ color: '#0F172A', backgroundColor: '#FFFFFF' }}>[Test Mode: Success]</option>
              <option value="decline" style={{ color: '#0F172A', backgroundColor: '#FFFFFF' }}>[Test Mode: Decline]</option>
            </select>
          </div>

          <h3 style={{ fontSize: '28px', color: '#FFFFFF', margin: '2px 0 4px 0', fontFamily: 'var(--font-heading)', fontWeight: '800' }}>
            {formatCurrency(amount)}
          </h3>
          <p style={{ fontSize: '12px', color: '#94A3B8', margin: 0 }}>{email}</p>
        </div>

        {/* Multi-Channel Navigation Tabs */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(4, 1fr)', 
          backgroundColor: '#F1F5F9', 
          borderBottom: '1px solid #E2E8F0',
          padding: '4px'
        }}>
          <button
            type="button"
            onClick={() => { setActiveChannel('card'); setErrorMessage(''); }}
            style={{
              padding: '10px 4px',
              border: 'none',
              background: activeChannel === 'card' ? '#FFFFFF' : 'transparent',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              boxShadow: activeChannel === 'card' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <CreditCard size={18} style={{ color: activeChannel === 'card' ? '#09A5DB' : '#64748B' }} />
            <span style={{ fontSize: '10px', fontWeight: '700', color: activeChannel === 'card' ? '#0F172A' : '#64748B' }}>
              Card
            </span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveChannel('transfer'); setErrorMessage(''); }}
            style={{
              padding: '10px 4px',
              border: 'none',
              background: activeChannel === 'transfer' ? '#FFFFFF' : 'transparent',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              boxShadow: activeChannel === 'transfer' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <Building2 size={18} style={{ color: activeChannel === 'transfer' ? '#09A5DB' : '#64748B' }} />
            <span style={{ fontSize: '10px', fontWeight: '700', color: activeChannel === 'transfer' ? '#0F172A' : '#64748B' }}>
              Transfer
            </span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveChannel('ussd'); setErrorMessage(''); }}
            style={{
              padding: '10px 4px',
              border: 'none',
              background: activeChannel === 'ussd' ? '#FFFFFF' : 'transparent',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              boxShadow: activeChannel === 'ussd' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <Smartphone size={18} style={{ color: activeChannel === 'ussd' ? '#09A5DB' : '#64748B' }} />
            <span style={{ fontSize: '10px', fontWeight: '700', color: activeChannel === 'ussd' ? '#0F172A' : '#64748B' }}>
              USSD
            </span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveChannel('bank_account'); setErrorMessage(''); }}
            style={{
              padding: '10px 4px',
              border: 'none',
              background: activeChannel === 'bank_account' ? '#FFFFFF' : 'transparent',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              boxShadow: activeChannel === 'bank_account' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <Landmark size={18} style={{ color: activeChannel === 'bank_account' ? '#09A5DB' : '#64748B' }} />
            <span style={{ fontSize: '10px', fontWeight: '700', color: activeChannel === 'bank_account' ? '#0F172A' : '#64748B' }}>
              Bank Account
            </span>
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleInitiatePay} style={{ padding: '20px 24px', backgroundColor: '#FFFFFF' }}>

          {/* Processing Spinner Banner */}
          {isProcessing && (
            <div style={{
              backgroundColor: '#F0F9FF',
              border: '1px solid #BAE6FD',
              borderRadius: '10px',
              padding: '16px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              color: '#0369A1'
            }}>
              <RefreshCw size={20} className="animate-spin" />
              <span style={{ fontSize: '13px', fontWeight: '700' }}>{statusMessage}</span>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div style={{ 
              backgroundColor: '#FEF2F2', 
              color: '#DC2626', 
              padding: '12px 14px', 
              borderRadius: '10px', 
              fontSize: '12px', 
              marginBottom: '20px',
              fontWeight: '600',
              border: '1px solid #FCA5A5',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* CHANNEL 1: CARD */}
          {activeChannel === 'card' && (
            <div>
              <div style={{ border: '1px solid #CBD5E1', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '800', letterSpacing: '0.5px' }}>CARD DETAILS</span>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <span style={{ fontSize: '10px', fontWeight: '800', backgroundColor: '#E2E8F0', padding: '2px 6px', borderRadius: '4px', color: '#334155' }}>VISA</span>
                    <span style={{ fontSize: '10px', fontWeight: '800', backgroundColor: '#E2E8F0', padding: '2px 6px', borderRadius: '4px', color: '#334155' }}>MASTERCARD</span>
                    <span style={{ fontSize: '10px', fontWeight: '800', backgroundColor: '#E2E8F0', padding: '2px 6px', borderRadius: '4px', color: '#334155' }}>VERVE</span>
                  </div>
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '10px', color: '#94A3B8', fontWeight: '700', marginBottom: '4px' }}>
                    CARD NUMBER
                  </label>
                  <input 
                    type="text" 
                    value={cardNumber} 
                    onChange={(e) => setCardNumber(e.target.value)}
                    style={{ width: '100%', border: 'none', borderBottom: '1px solid #E2E8F0', outline: 'none', fontSize: '15px', fontWeight: '600', color: '#1E293B', padding: '4px 0' }} 
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
                      style={{ width: '100%', border: 'none', borderBottom: '1px solid #E2E8F0', outline: 'none', fontSize: '14px', fontWeight: '600', color: '#1E293B', padding: '4px 0' }} 
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
                      maxLength={4}
                      style={{ width: '100%', border: 'none', borderBottom: '1px solid #E2E8F0', outline: 'none', fontSize: '14px', fontWeight: '600', color: '#1E293B', padding: '4px 0' }} 
                    />
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                disabled={isProcessing}
                style={{ 
                  width: '100%', 
                  backgroundColor: '#09A5DB', 
                  color: '#FFFFFF',
                  height: '46px',
                  borderRadius: '10px',
                  fontWeight: '800',
                  fontSize: '15px',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(9, 165, 219, 0.25)',
                  marginBottom: '16px'
                }}
              >
                {isProcessing ? 'Processing Payment...' : `Pay ${formatCurrency(amount)}`}
              </button>
            </div>
          )}

          {/* CHANNEL 2: BANK TRANSFER */}
          {activeChannel === 'transfer' && (
            <div>
              <div style={{ 
                backgroundColor: '#F8FAFC', 
                border: '1px solid #E2E8F0', 
                borderRadius: '12px', 
                padding: '16px', 
                marginBottom: '20px',
                textAlign: 'center'
              }}>
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Transfer exact amount to:
                </span>

                <div style={{ margin: '12px 0' }}>
                  <div style={{ fontSize: '12px', color: '#94A3B8', fontWeight: '600' }}>Bank Name</div>
                  <div style={{ fontSize: '15px', fontWeight: '800', color: '#0F172A' }}>{virtualBankName}</div>
                </div>

                <div style={{ backgroundColor: '#FFFFFF', border: '1px dashed #09A5DB', borderRadius: '10px', padding: '12px', margin: '12px 0' }}>
                  <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '600' }}>Account Number</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '2px' }}>
                    <span style={{ fontSize: '22px', fontWeight: '900', color: '#09A5DB', fontFamily: 'monospace', letterSpacing: '1px' }}>
                      {virtualAccountNo}
                    </span>
                    <button 
                      type="button" 
                      onClick={() => copyToClipboard(virtualAccountNo, 'account')}
                      style={{ border: 'none', background: '#E0F2FE', color: '#0369A1', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: '700' }}
                    >
                      {copiedAccount ? <Check size={14} /> : <Copy size={14} />}
                      {copiedAccount ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '11px', color: '#EA580C', fontWeight: '600', marginTop: '8px' }}>
                  <Clock size={14} />
                  <span>Account expires in <strong>{formatTimer(timeLeftSeconds)}</strong> minutes</span>
                </div>
              </div>

              <button 
                type="submit"
                disabled={isProcessing}
                style={{ 
                  width: '100%', 
                  backgroundColor: '#09A5DB', 
                  color: '#FFFFFF',
                  height: '46px',
                  borderRadius: '10px',
                  fontWeight: '800',
                  fontSize: '15px',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(9, 165, 219, 0.25)',
                  marginBottom: '16px'
                }}
              >
                {isProcessing ? 'Verifying Transfer...' : `I've Sent the Money`}
              </button>
            </div>
          )}

          {/* CHANNEL 3: USSD */}
          {activeChannel === 'ussd' && (
            <div>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748B', marginBottom: '6px' }}>
                  CHOOSE YOUR BANK
                </label>
                <select 
                  value={selectedUssdBank} 
                  onChange={(e) => setSelectedUssdBank(e.target.value)}
                  style={{ 
                    width: '100%', 
                    height: '42px', 
                    borderRadius: '8px', 
                    border: '1px solid #CBD5E1', 
                    padding: '0 12px', 
                    fontSize: '14px', 
                    fontWeight: '600',
                    color: '#0F172A',
                    backgroundColor: '#FFFFFF'
                  }}
                >
                  {USSD_BANKS.map(bank => (
                    <option key={bank.id} value={bank.id}>
                      {bank.name} ({bank.code})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ 
                backgroundColor: '#F8FAFC', 
                border: '1px solid #E2E8F0', 
                borderRadius: '12px', 
                padding: '16px', 
                marginBottom: '20px',
                textAlign: 'center'
              }}>
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748B' }}>
                  DIAL THIS CODE ON YOUR PHONE
                </span>

                <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '12px', margin: '12px 0' }}>
                  <div style={{ fontSize: '18px', fontWeight: '900', color: '#0B2545', fontFamily: 'monospace', letterSpacing: '0.5px', marginBottom: '8px' }}>
                    {ussdCodeString}
                  </div>
                  
                  <button 
                    type="button" 
                    onClick={() => copyToClipboard(ussdCodeString, 'ussd')}
                    style={{ border: 'none', background: '#09A5DB', color: '#FFFFFF', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '700' }}
                  >
                    {copiedUssd ? <Check size={14} /> : <Copy size={14} />}
                    {copiedUssd ? 'Code Copied!' : 'Copy USSD Code'}
                  </button>
                </div>
              </div>

              <button 
                type="submit"
                disabled={isProcessing}
                style={{ 
                  width: '100%', 
                  backgroundColor: '#09A5DB', 
                  color: '#FFFFFF',
                  height: '46px',
                  borderRadius: '10px',
                  fontWeight: '800',
                  fontSize: '15px',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(9, 165, 219, 0.25)',
                  marginBottom: '16px'
                }}
              >
                {isProcessing ? 'Verifying USSD Session...' : `I've Completed the Payment`}
              </button>
            </div>
          )}

          {/* CHANNEL 4: BANK ACCOUNT */}
          {activeChannel === 'bank_account' && (
            <div>
              <div style={{ border: '1px solid #CBD5E1', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '10px', color: '#94A3B8', fontWeight: '700', marginBottom: '4px' }}>
                    SELECT BANK
                  </label>
                  <select 
                    value={selectedDirectBank} 
                    onChange={(e) => setSelectedDirectBank(e.target.value)}
                    style={{ 
                      width: '100%', 
                      height: '38px', 
                      borderRadius: '6px', 
                      border: '1px solid #CBD5E1', 
                      padding: '0 10px', 
                      fontSize: '13px', 
                      fontWeight: '600',
                      color: '#0F172A',
                      backgroundColor: '#FFFFFF'
                    }}
                  >
                    {DIRECT_BANKS.map(bank => (
                      <option key={bank.id} value={bank.id}>{bank.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '10px', color: '#94A3B8', fontWeight: '700', marginBottom: '4px' }}>
                    ACCOUNT NUMBER
                  </label>
                  <input 
                    type="text" 
                    value={accountNumber} 
                    onChange={(e) => setAccountNumber(e.target.value)}
                    maxLength={10}
                    style={{ width: '100%', border: 'none', borderBottom: '1px solid #E2E8F0', outline: 'none', fontSize: '15px', fontWeight: '600', color: '#1E293B', padding: '4px 0' }} 
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={isProcessing}
                style={{ 
                  width: '100%', 
                  backgroundColor: '#09A5DB', 
                  color: '#FFFFFF',
                  height: '46px',
                  borderRadius: '10px',
                  fontWeight: '800',
                  fontSize: '15px',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(9, 165, 219, 0.25)',
                  marginBottom: '16px'
                }}
              >
                {isProcessing ? 'Authorizing Account...' : `Authorize Payment`}
              </button>
            </div>
          )}

          {/* Paystack Secured Footer */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#94A3B8', fontSize: '11px', fontWeight: '600' }}>
            <Shield size={14} style={{ color: '#09A5DB' }} />
            <span>SECURED BY</span>
            <span style={{ color: '#09A5DB', fontWeight: '800', letterSpacing: '0.5px' }}>paystack</span>
          </div>

        </form>
      </div>
    </div>
  );
};
