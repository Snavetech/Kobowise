import React from 'react';
import { X, Headphones, Leaf, CheckCircle, Copy, Phone, MessageSquare, AlertTriangle, Trash2 } from 'lucide-react';

export interface KoboWiseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'support' | 'info' | 'success' | 'confirm' | 'danger';
}

export const KoboWiseModal: React.FC<KoboWiseModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'KoboWise Support',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'support'
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const handleCopyNumber = () => {
    navigator.clipboard.writeText('08123456789');
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const isDanger = type === 'danger';
  const isConfirm = type === 'confirm' || isDanger;

  const headerBg = isDanger
    ? 'linear-gradient(135deg, #991B1B 0%, #DC2626 100%)'
    : 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)';

  const getHeaderIcon = () => {
    if (isDanger) return <Trash2 size={22} />;
    if (type === 'support') return <Headphones size={22} />;
    if (type === 'confirm') return <AlertTriangle size={22} />;
    return <Leaf size={22} />;
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2500,
      padding: '20px',
      animation: 'fadeIn 0.2s ease-in-out'
    }}>
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '24px',
        maxWidth: '440px',
        width: '100%',
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(30, 64, 175, 0.25)',
        border: '1px solid #DBEAFE'
      }}>
        {/* Header with KoboWise Branding */}
        <div style={{
          background: headerBg,
          color: '#FFFFFF',
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.18)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF'
            }}>
              {getHeaderIcon()}
            </div>
            <div>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.6px', color: isDanger ? '#FECACA' : '#93C5FD', fontWeight: '800', display: 'block' }}>
                {isConfirm ? 'KoboWise Confirmation' : 'KoboWise Campus Official'}
              </span>
              <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#FFFFFF', margin: 0 }}>
                {title}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: 'none',
              color: '#FFFFFF',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body Content */}
        <div style={{ padding: '24px' }}>
          {type === 'support' ? (
            <div>
              <p style={{ fontSize: '13px', color: '#475569', marginBottom: '16px', lineHeight: '1.5' }}>
                Need quick assistance with your group order splits, trader listings, or pickup at DELSU Abraka? Contact our dedicated support team below:
              </p>

              <div style={{
                backgroundColor: '#F8FAFC',
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                marginBottom: '20px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Phone size={20} />
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748B', display: 'block', fontWeight: '700' }}>Call / WhatsApp Line</span>
                    <strong style={{ fontSize: '16px', color: '#0F172A', fontWeight: '800' }}>08123456789</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderTop: '1px dashed #E2E8F0', paddingTop: '10px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <MessageSquare size={20} />
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748B', display: 'block', fontWeight: '700' }}>Campus Pickup Hub</span>
                    <strong style={{ fontSize: '13px', color: '#0F172A', fontWeight: '700' }}>DELSU Site II Gate Shop 1B</strong>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ padding: '8px 0 16px 0' }}>
              <p style={{ fontSize: '14px', color: '#334155', lineHeight: '1.6', margin: 0, fontWeight: '600' }}>
                {message}
              </p>
            </div>
          )}

          {/* Action Footer */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', alignItems: 'center' }}>
            {type === 'support' && (
              <button
                onClick={handleCopyNumber}
                className="btn btn-outline"
                style={{ borderRadius: '12px', fontSize: '13px', fontWeight: '700', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                {copied ? <CheckCircle size={15} style={{ color: '#10B981' }} /> : <Copy size={15} />}
                {copied ? 'Copied!' : 'Copy Number'}
              </button>
            )}

            {isConfirm ? (
              <>
                <button
                  onClick={onClose}
                  className="btn btn-outline"
                  style={{
                    borderRadius: '12px',
                    fontSize: '13px',
                    fontWeight: '700',
                    padding: '10px 20px',
                    cursor: 'pointer'
                  }}
                >
                  {cancelText}
                </button>
                <button
                  onClick={() => {
                    if (onConfirm) onConfirm();
                    onClose();
                  }}
                  className="btn"
                  style={{
                    borderRadius: '12px',
                    fontSize: '13px',
                    fontWeight: '800',
                    padding: '10px 24px',
                    background: isDanger ? 'linear-gradient(135deg, #DC2626 0%, #EF4444 100%)' : 'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)',
                    border: 'none',
                    color: '#FFFFFF',
                    cursor: 'pointer'
                  }}
                >
                  {confirmText}
                </button>
              </>
            ) : (
              <button
                onClick={onClose}
                className="btn btn-primary"
                style={{
                  borderRadius: '12px',
                  fontSize: '13px',
                  fontWeight: '800',
                  padding: '10px 26px',
                  background: 'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)',
                  border: 'none',
                  color: '#FFFFFF',
                  cursor: 'pointer'
                }}
              >
                OK
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
