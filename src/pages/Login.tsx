import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, ArrowRight, ShieldCheck, Users, ArrowDownRight } from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || 'home';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please input your email and password.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      navigate('/' + redirect);
    } else {
      setErrorMsg(res.error || 'Invalid credentials. Please try again.');
    }
  };

  // Demo helpers to prefill and log in instantly
  const handleQuickLogin = async (role: 'buyer' | 'trader') => {
    setLoading(true);
    setErrorMsg('');

    const testEmail = role === 'buyer' ? 'buyer@delsu.edu' : 'trader@delsu.edu';
    const res = await login(testEmail, 'password123');
    setLoading(false);

    if (res.success) {
      navigate(role === 'trader' ? '/trader-dashboard' : '/home');
    } else {
      setErrorMsg(res.error || 'Quick login failed.');
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      minHeight: '92vh',
      backgroundColor: '#FFFFFF'
    }} className="login-split-container">
      
      {/* Left panel: Benefits & Brand banner (Image 2) */}
      <div className="login-left-banner" style={{
        flex: '1 1 45%',
        background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)',
        padding: '60px 48px',
        color: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background graphic elements */}
        <div style={{ position: 'absolute', width: '250px', height: '250px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)', top: '-50px', left: '-50px' }} />
        <div style={{ position: 'absolute', width: '350px', height: '350px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 70%)', bottom: '-100px', right: '-100px' }} />

        {/* Brand logo header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', position: 'relative', zIndex: 5 }}>
          <div style={{ 
            backgroundColor: '#FFFFFF', 
            borderRadius: '50%', 
            width: '32px', 
            height: '32px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
          }}>
            <span style={{ color: '#2563EB', fontWeight: '900', fontSize: '18px' }}>#</span>
          </div>
          <span style={{ fontSize: '20px', fontWeight: '800', letterSpacing: '-0.5px' }}>KoboWise</span>
        </div>

        {/* Middle text & list details */}
        <div style={{ margin: '40px 0', position: 'relative', zIndex: 5 }}>
          <h1 style={{ 
            fontSize: '42px', 
            fontWeight: '900', 
            lineHeight: '1.2', 
            marginBottom: '16px',
            fontFamily: 'var(--font-heading)',
            color: '#FFFFFF'
          }}>
            Buy Together.<br />
            <span style={{ color: '#F97316' }}>Save Together.</span>
          </h1>
          <p style={{ 
            fontSize: '15px', 
            color: 'rgba(255, 255, 255, 0.85)', 
            lineHeight: '1.6', 
            marginBottom: '40px',
            maxWidth: '440px' 
          }}>
            Join the smartest DELSU students splitting costs on everyday essentials.
          </p>

          {/* Benefits list (Image 2 left panel) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            
            {/* Benefit 1 */}
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '50%', 
                backgroundColor: 'rgba(255, 255, 255, 0.1)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <ArrowDownRight size={20} style={{ color: '#60A5FA' }} />
              </div>
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: '700', margin: '0 0 4px 0', color: '#FFFFFF' }}>Save up to 75% on bulk products</h4>
                <p style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)', margin: 0 }}>Pay wholesale prices for retail quantities.</p>
              </div>
            </div>

            {/* Benefit 2 */}
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '50%', 
                backgroundColor: 'rgba(255, 255, 255, 0.1)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Users size={20} style={{ color: '#60A5FA' }} />
              </div>
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: '700', margin: '0 0 4px 0', color: '#FFFFFF' }}>Join 3,000+ DELSU students</h4>
                <p style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)', margin: 0 }}>A growing community saving daily on campus.</p>
              </div>
            </div>

            {/* Benefit 3 */}
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '50%', 
                backgroundColor: 'rgba(255, 255, 255, 0.1)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <ShieldCheck size={20} style={{ color: '#60A5FA' }} />
              </div>
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: '700', margin: '0 0 4px 0', color: '#FFFFFF' }}>Trusted campus traders only</h4>
                <p style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)', margin: 0 }}>Verified sellers with secure pickup locations.</p>
              </div>
            </div>

          </div>
        </div>

        {/* Floating preview card (Image 2 bottom left) */}
        <div style={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.08)', 
          backdropFilter: 'blur(12px)',
          borderRadius: '20px', 
          border: '1px solid rgba(255, 255, 255, 0.12)', 
          padding: '16px 20px',
          position: 'relative',
          zIndex: 5,
          maxWidth: '380px',
          marginTop: '20px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ backgroundColor: '#F97316', color: '#FFFFFF', fontSize: '9px', fontWeight: '800', padding: '3px 8px', borderRadius: '4px' }}>
              TRENDING
            </span>
            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)', fontWeight: '600' }}>
              12h left
            </span>
          </div>

          <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#FFFFFF', margin: '0 0 2px 0' }}>Indomie Hungry Man (Carton)</h4>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '12px' }}>
            <span style={{ fontSize: '16px', fontWeight: '800', color: '#F97316' }}>₦11,500</span>
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', textDecoration: 'line-through' }}>₦14,000</span>
          </div>

          {/* Progress bar inside left panel preview */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'rgba(255,255,255,0.8)', marginBottom: '4px', fontWeight: '600' }}>
              <span>3/4 Joined</span>
              <span>75%</span>
            </div>
            <div style={{ height: '5px', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: '75%', height: '100%', backgroundColor: '#F97316', borderRadius: '3px' }} />
            </div>
          </div>
        </div>

      </div>

      {/* Right panel: Form column */}
      <div className="login-right-form" style={{
        flex: '1 1 55%',
        padding: '60px 48px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF'
      }}>
        <div style={{ width: '100%', maxWidth: '440px' }}>
          
          {/* Tab selector (Image 2) */}
          <div style={{ 
            display: 'flex', 
            backgroundColor: '#F3F4F6', 
            borderRadius: '30px', 
            padding: '4px',
            marginBottom: '36px'
          }}>
            <button 
              type="button" 
              style={{
                flex: 1,
                border: 'none',
                backgroundColor: '#FFFFFF',
                color: '#111827',
                padding: '10px 0',
                borderRadius: '26px',
                fontSize: '13px',
                fontWeight: '700',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                cursor: 'pointer'
              }}
            >
              Sign In
            </button>
            <Link 
              to="/signup"
              style={{
                flex: 1,
                border: 'none',
                backgroundColor: 'transparent',
                color: '#6B7280',
                padding: '10px 0',
                borderRadius: '26px',
                fontSize: '13px',
                fontWeight: '700',
                textDecoration: 'none',
                textAlign: 'center',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              Create Account
            </Link>
          </div>

          {/* Heading */}
          <div style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '28px', color: '#111827', fontWeight: '800', margin: '0 0 6px 0', letterSpacing: '-0.5px' }}>
              Welcome back
            </h2>
            <p style={{ color: '#6B7280', fontSize: '14px', margin: 0 }}>
              Enter your details to access your account
            </p>
          </div>

          {errorMsg && (
            <div style={{ 
              backgroundColor: '#FEE2E2', 
              color: '#DC2626', 
              padding: '12px 14px', 
              borderRadius: '12px', 
              fontSize: '13px', 
              marginBottom: '24px',
              fontWeight: '600',
              border: '1px solid rgba(220, 38, 38, 0.1)'
            }}>
              {errorMsg}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontWeight: '600', color: '#374151', fontSize: '13px' }}>Email</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Mail size={16} style={{ position: 'absolute', left: '14px', color: '#9CA3AF' }} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@delsu.edu.ng"
                  className="form-control"
                  style={{ paddingLeft: '40px', borderRadius: '12px', height: '44px', border: '1px solid #D1D5DB' }}
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label className="form-label" style={{ fontWeight: '600', color: '#374151', fontSize: '13px', marginBottom: 0 }}>Password</label>
                <Link to="/forgot-password" style={{ fontSize: '12px', color: '#2563EB', fontWeight: '600', textDecoration: 'none' }}>Forgot password?</Link>
              </div>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Lock size={16} style={{ position: 'absolute', left: '14px', color: '#9CA3AF' }} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="form-control"
                  style={{ paddingLeft: '40px', borderRadius: '12px', height: '44px', border: '1px solid #D1D5DB' }}
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="btn btn-primary btn-full"
              style={{ 
                marginTop: '8px', 
                height: '44px', 
                borderRadius: '12px',
                backgroundColor: '#2563EB',
                border: 'none',
                fontSize: '14px',
                fontWeight: '700',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.15)'
              }}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          {/* Quick logins divider */}
          <div style={{ textAlign: 'center', margin: '24px 0', position: 'relative' }}>
            <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', borderTop: '1px solid #E5E7EB', zIndex: 1 }} />
            <span style={{ 
              backgroundColor: '#FFFFFF', 
              padding: '0 16px', 
              fontSize: '10px', 
              color: '#9CA3AF', 
              fontWeight: '700',
              letterSpacing: '0.5px',
              position: 'relative',
              zIndex: 2
            }}>
              QUICK DEMO ACCESS
            </span>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
            <button 
              type="button"
              onClick={() => handleQuickLogin('buyer')}
              className="btn-push"
              style={{
                flex: 1,
                height: '44px',
                borderRadius: '12px',
                border: '1px solid #E5E7EB',
                backgroundColor: '#FFFFFF',
                color: '#374151',
                fontWeight: '700',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
              }}
            >
              <span>Buyer Account</span>
              <ArrowRight size={14} style={{ color: '#2563EB' }} />
            </button>
            <button 
              type="button"
              onClick={() => handleQuickLogin('trader')}
              className="btn-push"
              style={{
                flex: 1,
                height: '44px',
                borderRadius: '12px',
                border: '1px solid #E5E7EB',
                backgroundColor: '#FFFFFF',
                color: '#374151',
                fontWeight: '700',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
              }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                Demo KoboWise Stores
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
                  <circle cx="12" cy="12" r="12" fill="#2563EB"/>
                  <path d="M9.5 12.5L11 14L15 10" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              <ArrowRight size={14} style={{ color: '#2563EB' }} />
            </button>
          </div>

          <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '12px', color: '#9CA3AF' }}>
            By continuing, you agree to our <Link to="/" style={{ color: '#6B7280', textDecoration: 'underline' }}>Terms of Service</Link> and <Link to="/" style={{ color: '#6B7280', textDecoration: 'underline' }}>Privacy Policy</Link>.
          </div>

        </div>
      </div>

      <style>{`
        @media (max-width: 991px) {
          .login-split-container {
            flex-direction: column !important;
          }
          .login-left-banner {
            padding: 40px 24px !important;
            flex: 1 1 auto !important;
          }
          .login-right-form {
            padding: 40px 24px !important;
            flex: 1 1 auto !important;
          }
        }
        @media (max-width: 767px) {
          .login-left-banner {
            display: none !important;
          }
          .login-right-form {
            padding: 32px 16px !important;
          }
        }
      `}</style>

    </div>
  );
};
