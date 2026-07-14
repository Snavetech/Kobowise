import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send } from 'lucide-react';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 16px', minHeight: '80vh', background: 'linear-gradient(180deg, #EFF6FF 0%, #F8FAFC 100%)' }}>
      <div style={{ 
        width: '100%', 
        maxWidth: '420px', 
        backgroundColor: '#FFFFFF', 
        borderRadius: '24px', 
        border: '1px solid #DBEAFE', 
        padding: '36px',
        boxShadow: '0 8px 32px rgba(30, 64, 175, 0.08)' 
      }}>
        
        <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#475569', marginBottom: '20px' }}>
          <ArrowLeft size={14} />
          Back to Login
        </Link>

        {submitted ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              backgroundColor: 'var(--status-completed-bg)', 
              color: 'var(--secondary-emerald)',
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto'
            }}>
              <Send size={24} />
            </div>
            <h3 style={{ fontSize: '20px', color: '#0F172A', marginBottom: '8px' }}>Reset Link Sent!</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: '1.5', marginBottom: '24px' }}>
              We have sent instructions to reset your password to <strong>{email}</strong>.
            </p>
            <Link to="/login" className="btn btn-primary btn-full">Return to Login</Link>
          </div>
        ) : (
          <div>
            <h2 style={{ fontSize: '22px', color: '#0F172A', marginBottom: '6px', fontFamily: 'var(--font-heading)' }}>Forgot Password?</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '24px', lineHeight: '1.4' }}>
              Enter your student or trader email address below, and we will send you a password reset link.
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Email Address</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '14px', color: 'var(--text-muted)' }} />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@delsu.edu"
                    className="form-control"
                    style={{ paddingLeft: '40px' }}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-full" style={{ height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg, #2563EB, #3B82F6)', fontWeight: '700', boxShadow: '0 4px 14px rgba(37, 99, 235, 0.2)' }}>
                Send Reset Link
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};
