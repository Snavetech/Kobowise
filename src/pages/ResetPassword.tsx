import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Lock, CheckCircle } from 'lucide-react';
import { mockRealtime } from '../supabase';

export const ResetPassword: React.FC = () => {

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setErrorMsg('');
    setSubmitted(true);
    mockRealtime.emit('toast', {
      message: 'Password reset successfully!',
      type: 'success'
    });
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 0', minHeight: '80vh' }}>
      <div style={{ 
        width: '100%', 
        maxWidth: '420px', 
        backgroundColor: '#FFFFFF', 
        borderRadius: 'var(--radius-lg)', 
        border: '1px solid var(--border-color)', 
        padding: '32px',
        boxShadow: 'var(--shadow-md)' 
      }}>
        
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
              <CheckCircle size={24} />
            </div>
            <h3 style={{ fontSize: '20px', color: 'var(--primary-navy)', marginBottom: '8px' }}>Password Reset Complete</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: '1.5', marginBottom: '24px' }}>
              Your password has been updated. You can now log in using your new credentials.
            </p>
            <Link to="/login" className="btn btn-primary btn-full">Login</Link>
          </div>
        ) : (
          <div>
            <h2 style={{ fontSize: '22px', color: 'var(--primary-navy)', marginBottom: '6px' }}>Reset Password</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '24px' }}>
              Enter a secure new password for your account below.
            </p>

            {errorMsg && (
              <div style={{ 
                backgroundColor: 'var(--status-cancelled-bg)', 
                color: 'var(--status-cancelled)', 
                padding: '10px 14px', 
                borderRadius: '6px', 
                fontSize: '13px', 
                marginBottom: '16px',
                fontWeight: '600'
              }}>
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">New Password</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '14px', color: 'var(--text-muted)' }} />
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="form-control"
                    style={{ paddingLeft: '40px' }}
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Confirm New Password</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '14px', color: 'var(--text-muted)' }} />
                  <input 
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
                    className="form-control"
                    style={{ paddingLeft: '40px' }}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-full" style={{ height: '46px' }}>
                Reset Password
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};
