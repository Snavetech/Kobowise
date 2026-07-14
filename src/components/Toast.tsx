import React, { useEffect } from 'react';
import { Bell, CheckCircle, AlertCircle, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning';
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 2000,
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      maxWidth: '350px',
      width: '100%'
    }}>
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({ 
  toast, 
  onDismiss 
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 5000); // Auto-dismiss after 5s

    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle size={18} style={{ color: 'var(--secondary-emerald)' }} />;
      case 'warning':
        return <AlertCircle size={18} style={{ color: 'var(--accent-coral)' }} />;
      default:
        return <Bell size={18} style={{ color: 'var(--primary-navy)' }} />;
    }
  };

  const getBorderColor = () => {
    switch (toast.type) {
      case 'success':
        return 'var(--secondary-emerald)';
      case 'warning':
        return 'var(--accent-coral)';
      default:
        return 'var(--primary-navy)';
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      backgroundColor: 'var(--neutral-surface)',
      borderLeft: `4px solid ${getBorderColor()}`,
      borderRadius: 'var(--radius-md)',
      boxShadow: 'var(--shadow-lg)',
      padding: '12px 16px',
      animation: 'toastSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      position: 'relative',
      border: '1px solid var(--border-color)',
      borderLeftWidth: '4px'
    }}>
      <div style={{ flexShrink: 0 }}>
        {getIcon()}
      </div>
      <div style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)', flexGrow: 1, paddingRight: '8px' }}>
        {toast.message}
      </div>
      <button 
        onClick={() => onDismiss(toast.id)}
        style={{ 
          background: 'none', 
          border: 'none', 
          cursor: 'pointer', 
          color: 'var(--text-muted)',
          display: 'flex',
          padding: '2px'
        }}
      >
        <X size={14} />
      </button>

      <style>{`
        @keyframes toastSlideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};
