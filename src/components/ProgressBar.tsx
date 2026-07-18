import React from 'react';

interface ProgressBarProps {
  purchased: number;
  needed: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ purchased, needed }) => {
  const percentage = Math.min(100, Math.max(0, (purchased / needed) * 100));
  const sharesLeft = needed - purchased;
  
  // Highlight urgency if only 1 share is remaining
  const isAlmostComplete = sharesLeft === 1;

  return (
    <div style={{ margin: '8px 0' }}>
      <div className="progress-container">
        <div 
          className={`progress-fill ${isAlmostComplete ? 'progress-fill-almost-complete' : ''}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="shares-indicator" style={{ marginTop: '4px' }}>
        <span>
          Joined: <strong>{purchased}</strong> / {needed} shares
        </span>
        {sharesLeft > 0 ? (
          <span className={isAlmostComplete ? 'shares-left-highlight' : ''}>
            {isAlmostComplete ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <i className="fa-solid fa-fire" style={{ color: 'var(--status-cancelled)' }}></i> Only 1 share left!
              </span>
            ) : `${sharesLeft} left`}
          </span>
        ) : (
          <span style={{ color: 'var(--secondary-emerald)', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <i className="fa-solid fa-circle-check"></i> Group Full!
          </span>
        )}
      </div>
    </div>
  );
};
