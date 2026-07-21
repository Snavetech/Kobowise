import React from 'react';

interface LoadingSpinnerProps {
  text?: string;
  fullPage?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ text, fullPage = false }) => {
  const content = (
    <div style={{ textAlign: 'center', padding: '24px 0' }}>
      <div className="loading">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </div>
      {text && (
        <p style={{ marginTop: '12px', fontSize: '14px', fontWeight: '700', color: 'var(--text-secondary)' }}>
          {text}
        </p>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F8FAFC'
      }}>
        {content}
      </div>
    );
  }

  return content;
};
