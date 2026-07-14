import React from 'react';

interface SkeletonLoaderProps {
  type: 'card' | 'profile' | 'stats' | 'text';
  count?: number;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ type, count = 1 }) => {
  const renderSkeleton = (index: number) => {
    if (type === 'card') {
      return (
        <div
          key={index}
          className="glass-panel"
          style={{
            borderRadius: '20px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            height: '380px',
            border: '1px solid #DBEAFE'
          }}
        >
          <div className="skeleton-box" style={{ width: '100%', height: '190px' }} />
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flexGrow: 1, gap: '12px' }}>
            <div className="skeleton-box" style={{ width: '80%', height: '18px' }} />
            <div className="skeleton-box" style={{ width: '50%', height: '14px' }} />
            <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
              <div className="skeleton-box" style={{ width: '60%', height: '36px', borderRadius: '12px' }} />
              <div className="skeleton-box" style={{ width: '40%', height: '36px', borderRadius: '12px' }} />
            </div>
          </div>
        </div>
      );
    }

    if (type === 'stats') {
      return (
        <div
          key={index}
          className="glass-panel"
          style={{
            padding: '20px',
            borderRadius: '16px',
            border: '1px solid #DBEAFE',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            height: '92px'
          }}
        >
          <div className="skeleton-box skeleton-circle" style={{ width: '40px', height: '40px', flexShrink: 0 }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexGrow: 1 }}>
            <div className="skeleton-box" style={{ width: '40%', height: '10px' }} />
            <div className="skeleton-box" style={{ width: '60%', height: '18px' }} />
          </div>
        </div>
      );
    }

    if (type === 'profile') {
      return (
        <div
          key={index}
          className="glass-panel"
          style={{
            borderRadius: '24px',
            border: '1px solid #DBEAFE',
            overflow: 'hidden',
            padding: '32px'
          }}
        >
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <div className="skeleton-box skeleton-circle" style={{ width: '100px', height: '100px', flexShrink: 0 }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flexGrow: 1 }}>
              <div className="skeleton-box" style={{ width: '50%', height: '24px' }} />
              <div className="skeleton-box" style={{ width: '30%', height: '14px' }} />
              <div className="skeleton-box" style={{ width: '40%', height: '14px' }} />
            </div>
          </div>
        </div>
      );
    }

    // Default: 'text'
    return (
      <div key={index} style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: '8px 0' }}>
        <div className="skeleton-box" style={{ width: '100%', height: '14px' }} />
      </div>
    );
  };

  return (
    <>
      {Array.from({ length: count }).map((_, i) => renderSkeleton(i))}
    </>
  );
};
