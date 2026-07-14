import React from 'react';
import { HelpCircle, ShieldCheck, Heart, MapPin, Leaf } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer style={{ 
      backgroundColor: '#1E3A8A', 
      color: '#DBEAFE', 
      padding: '56px 0 28px 0',
      marginTop: 'auto',
      borderTop: '4px solid #60A5FA'
    }}>
      <div className="container">
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '36px',
          paddingBottom: '36px',
          borderBottom: '1px solid rgba(255,255,255,0.12)'
        }}>
          {/* Brand Info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Leaf size={20} style={{ color: '#60A5FA' }} />
              </div>
              <h3 style={{ 
                color: '#FFFFFF', 
                fontFamily: 'var(--font-heading)', 
                fontWeight: '800', 
                fontSize: '24px', 
                margin: 0 
              }}>
                KoboWise
              </h3>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', marginBottom: '16px', lineHeight: '1.7' }}>
              Buy together, save together. Empowering Delta State University (DELSU) students to split bulk food, cleaning items, and electronics into affordable shares.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#60A5FA', fontSize: '13px', fontWeight: '700' }}>
              <MapPin size={16} />
              <span>Abraka Campus, Delta State, Nigeria</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ color: '#FFFFFF', fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>Quick Links</h4>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
              <li>
                <a href="#almost-complete" style={{ color: 'rgba(255,255,255,0.7)', transition: 'color 0.15s' }} onMouseOver={e => e.currentTarget.style.color = '#60A5FA'} onMouseOut={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}>
                  🔥 Almost Complete
                </a>
              </li>
              <li>
                <a href="#newly-listed" style={{ color: 'rgba(255,255,255,0.7)', transition: 'color 0.15s' }} onMouseOver={e => e.currentTarget.style.color = '#60A5FA'} onMouseOut={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}>
                  🆕 Newly Listed Products
                </a>
              </li>
              <li>
                <a href="#popular-products" style={{ color: 'rgba(255,255,255,0.7)', transition: 'color 0.15s' }} onMouseOver={e => e.currentTarget.style.color = '#60A5FA'} onMouseOut={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}>
                  ⭐ Popular Purchases
                </a>
              </li>
            </ul>
          </div>

          {/* Core Values */}
          <div>
            <h4 style={{ color: '#FFFFFF', fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>Student Trust</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <ShieldCheck size={20} style={{ color: '#60A5FA', flexShrink: 0 }} />
                <div style={{ fontSize: '13px' }}>
                  <span style={{ display: 'block', fontWeight: '700', color: '#FFFFFF' }}>Safe Escrow</span>
                  <span style={{ color: 'rgba(255,255,255,0.6)' }}>Traders are paid only after all buyers confirm pickup.</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <HelpCircle size={20} style={{ color: '#60A5FA', flexShrink: 0 }} />
                <div style={{ fontSize: '13px' }}>
                  <span style={{ display: 'block', fontWeight: '700', color: '#FFFFFF' }}>No Waste</span>
                  <span style={{ color: 'rgba(255,255,255,0.6)' }}>Uncompleted group buys are fully refunded to your account.</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'space-between',
          paddingTop: '24px',
          fontSize: '13px',
          color: 'rgba(255,255,255,0.45)',
          gap: '12px'
        }} className="footer-bottom-row">
          <p>&copy; {new Date().getFullYear()} KoboWise. Built for DELSU Students.</p>
          <p style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            Made with <Heart size={14} style={{ color: '#60A5FA' }} /> in Delta State
          </p>
        </div>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .footer-bottom-row {
            flex-direction: row !important;
            gap: 0 !important;
          }
        }
      `}</style>
    </footer>
  );
};
