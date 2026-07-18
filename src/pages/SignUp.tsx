import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Store, Smartphone, Mail, Lock, BookOpen, Clock, CheckCircle2, Sparkles } from 'lucide-react';

export const SignUp: React.FC = () => {
  const { signUp, user } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState<'buyer' | 'trader'>('buyer');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isWaitlisted, setIsWaitlisted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !phoneNumber.trim()) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }
    // Only buyers need password and student ID
    if (role === 'buyer') {
      if (!password.trim()) {
        setErrorMsg('Please enter a password.');
        return;
      }
      if (!studentId.trim()) {
        setErrorMsg('Please input your DELSU student matric number.');
        return;
      }
    }

    setLoading(true);
    setErrorMsg('');
    const res = await signUp(
      email,
      password || 'waitlist-placeholder', // Traders don't need a real password
      role,
      fullName,
      phoneNumber,
      role === 'buyer' ? studentId : undefined
    );
    setLoading(false);

    if (res.success) {
      if (res.waitlisted) {
        setIsWaitlisted(true);
      } else {
        setIsRegistered(true);
      }
    } else {
      setErrorMsg(res.error || 'Registration failed. Please check details and try again.');
    }
  };

  // ═══════════════════════════════════════════════
  // TRADER WAITLIST CONFIRMATION SCREEN
  // ═══════════════════════════════════════════════
  if (isWaitlisted) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: '40px 16px',
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #FFF7ED 0%, #FEF3C7 30%, #FFFBEB 100%)'
      }}>
        <style>{`
          @keyframes waitlistPulse {
            0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.4); }
            50% { transform: scale(1.05); box-shadow: 0 0 0 20px rgba(245, 158, 11, 0); }
          }
          @keyframes waitlistFadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes waitlistShimmer {
            0% { background-position: -200% center; }
            100% { background-position: 200% center; }
          }
          @keyframes waitlistFloat {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-6px); }
          }
          @keyframes confettiDrift {
            0% { transform: translateY(-10px) rotate(0deg); opacity: 0; }
            20% { opacity: 1; }
            100% { transform: translateY(40px) rotate(360deg); opacity: 0; }
          }
        `}</style>
        
        <div style={{ 
          width: '100%', 
          maxWidth: '520px', 
          backgroundColor: '#FFFFFF', 
          borderRadius: '28px', 
          border: '1px solid #FDE68A', 
          padding: '48px 36px',
          boxShadow: '0 12px 48px rgba(245, 158, 11, 0.12), 0 4px 16px rgba(0,0,0,0.04)',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          animation: 'waitlistFadeIn 0.6s ease-out'
        }}>
          {/* Decorative confetti dots */}
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{
              position: 'absolute',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: ['#F59E0B', '#2563EB', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'][i],
              top: `${10 + i * 12}%`,
              left: i % 2 === 0 ? `${8 + i * 5}%` : `${72 + i * 4}%`,
              animation: `confettiDrift ${2 + i * 0.5}s ease-in-out ${i * 0.3}s infinite`,
              opacity: 0.6
            }} />
          ))}
          
          {/* Animated icon */}
          <div style={{
            width: '88px',
            height: '88px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #FEF3C7, #FDE68A)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 28px auto',
            animation: 'waitlistPulse 2s ease-in-out infinite',
            position: 'relative'
          }}>
            <Clock size={40} style={{ color: '#D97706' }} />
            <div style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              backgroundColor: '#10B981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '3px solid #FFFFFF',
              animation: 'waitlistFloat 2s ease-in-out infinite'
            }}>
              <CheckCircle2 size={14} style={{ color: '#FFFFFF' }} />
            </div>
          </div>

          {/* Title with shimmer */}
          <h2 style={{ 
            fontSize: '26px', 
            color: '#92400E', 
            marginBottom: '8px', 
            fontFamily: 'var(--font-heading)', 
            fontWeight: '800',
            background: 'linear-gradient(90deg, #92400E, #D97706, #92400E)',
            backgroundSize: '200% auto',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            animation: 'waitlistShimmer 3s linear infinite'
          }}>
            You're on the Waitlist! <i className="fa-solid fa-trophy" style={{ color: '#D97706', fontSize: '24px', marginLeft: '6px' }}></i>
          </h2>

          <p style={{ 
            color: '#78350F', 
            fontSize: '15px', 
            lineHeight: '1.7', 
            marginBottom: '24px',
            fontWeight: '500'
          }}>
            Thanks for signing up, <strong style={{ color: '#92400E' }}>{fullName}</strong>!
          </p>

          {/* Info card */}
          <div style={{
            backgroundColor: '#FFFBEB',
            border: '1px solid #FDE68A',
            borderRadius: '16px',
            padding: '20px 24px',
            marginBottom: '24px',
            textAlign: 'left'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '16px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: '#FEF3C7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Store size={18} style={{ color: '#D97706' }} />
              </div>
              <div>
                <strong style={{ color: '#92400E', fontSize: '14px', display: 'block', marginBottom: '4px' }}>
                  Campus Trading is Coming Soon
                </strong>
                <p style={{ color: '#78350F', fontSize: '13px', lineHeight: '1.6', margin: 0, opacity: 0.85 }}>
                  We're building something special for campus traders at DELSU. Your details have been saved and you've been added to our exclusive early access list.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: '#DBEAFE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Mail size={18} style={{ color: '#2563EB' }} />
              </div>
              <div>
                <strong style={{ color: '#1E40AF', fontSize: '14px', display: 'block', marginBottom: '4px' }}>
                  We'll Email You
                </strong>
                <p style={{ color: '#1E3A5F', fontSize: '13px', lineHeight: '1.6', margin: 0, opacity: 0.85 }}>
                  You'll receive an email at <strong>{email}</strong> as soon as campus trading goes live. Be among the first traders on KoboWise!
                </p>
              </div>
            </div>
          </div>

          {/* Status badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#F0FDF4',
            border: '1px solid #BBF7D0',
            borderRadius: '100px',
            padding: '8px 20px',
            marginBottom: '28px'
          }}>
            <Sparkles size={14} style={{ color: '#16A34A' }} />
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#15803D', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              Details saved successfully
            </span>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button 
              onClick={() => navigate('/')}
              className="btn btn-full"
              style={{ 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '48px', 
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #D97706, #F59E0B)',
                fontSize: '15px',
                fontWeight: '700',
                border: 'none',
                cursor: 'pointer',
                color: '#FFFFFF',
                boxShadow: '0 4px 14px rgba(217, 119, 6, 0.25)',
                transition: 'all 0.2s ease'
              }}
            >
              Back to Home
            </button>
            <button 
              onClick={() => {
                setIsWaitlisted(false);
                setRole('buyer');
                setFullName('');
                setEmail('');
                setPhoneNumber('');
                setPassword('');
                setStudentId('');
              }}
              style={{ 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '44px', 
                borderRadius: '14px',
                background: 'transparent',
                fontSize: '13px',
                fontWeight: '600',
                border: '1px solid #FDE68A',
                cursor: 'pointer',
                color: '#92400E',
                transition: 'all 0.2s ease'
              }}
            >
              Sign up as a Student Buyer instead
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════
  // BUYER EMAIL CONFIRMATION SCREEN (unchanged)
  // ═══════════════════════════════════════════════
  if (isRegistered) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: '40px 16px',
        minHeight: '90vh',
        background: 'linear-gradient(180deg, #EFF6FF 0%, #F8FAFC 100%)'
      }}>
        <div style={{ 
          width: '100%', 
          maxWidth: '480px', 
          backgroundColor: '#FFFFFF', 
          borderRadius: '24px', 
          border: '1px solid #DBEAFE', 
          padding: '40px 36px',
          boxShadow: '0 8px 32px rgba(30, 64, 175, 0.08)',
          textAlign: 'center'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: '#EFF6FF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px auto',
            color: '#2563EB'
          }}>
            <Mail size={32} />
          </div>
          <h2 style={{ fontSize: '24px', color: '#0F172A', marginBottom: '12px', fontFamily: 'var(--font-heading)', fontWeight: '800' }}>
            Confirm Your Email
          </h2>
          <p style={{ color: '#475569', fontSize: '14px', lineHeight: '1.6', marginBottom: '24px' }}>
            We've sent a verification link to <strong style={{ color: '#0F172A' }}>{email}</strong>. 
            Please check your inbox (and spam folder) and click the link to confirm your account.
          </p>
          <button 
            onClick={() => {
              if (user) {
                navigate(user.role === 'trader' ? '/trader-dashboard' : '/home');
              } else {
                navigate('/login');
              }
            }}
            className="btn btn-secondary btn-full"
            style={{ 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '48px', 
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #2563EB, #3B82F6)',
              fontSize: '15px',
              fontWeight: '700',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.2)'
            }}
          >
            {user ? 'Continue to App' : 'Go to Login'}
          </button>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════
  // SIGNUP FORM
  // ═══════════════════════════════════════════════
  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '40px 16px',
      minHeight: '90vh',
      background: 'linear-gradient(180deg, #EFF6FF 0%, #F8FAFC 100%)'
    }}>
      <div style={{ 
        width: '100%', 
        maxWidth: '480px', 
        backgroundColor: '#FFFFFF', 
        borderRadius: '24px', 
        border: '1px solid #DBEAFE', 
        padding: '36px',
        boxShadow: '0 8px 32px rgba(30, 64, 175, 0.08)' 
      }}>
        
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '24px', color: '#0F172A', marginBottom: '4px', fontFamily: 'var(--font-heading)' }}>Create Account</h2>
          <p style={{ color: '#475569', fontSize: '13px' }}>Join the KoboWise group buying community</p>
        </div>

        {errorMsg && (
          <div style={{ 
            backgroundColor: 'var(--status-cancelled-bg)', 
            color: 'var(--status-cancelled)', 
            padding: '10px 14px', 
            borderRadius: '6px', 
            fontSize: '13px', 
            marginBottom: '20px',
            fontWeight: '600'
          }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Role Picker badges */}
          <div style={{ marginBottom: '8px' }}>
            <span className="form-label" style={{ textAlign: 'center', display: 'block', marginBottom: '10px' }}>
              Choose Your Account Type
            </span>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div 
                onClick={() => setRole('buyer')}
                style={{
                  flex: 1,
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  border: `2px solid ${role === 'buyer' ? '#2563EB' : '#DBEAFE'}`,
                  backgroundColor: role === 'buyer' ? '#EFF6FF' : 'transparent',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <User size={24} style={{ color: role === 'buyer' ? '#2563EB' : '#94A3B8', marginBottom: '6px' }} />
                <strong style={{ display: 'block', fontSize: '14px', color: '#0F172A' }}>Student Buyer</strong>
                <span style={{ fontSize: '10px', color: '#475569' }}>Split bulk items & save</span>
              </div>

              <div 
                onClick={() => setRole('trader')}
                style={{
                  flex: 1,
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  border: `2px solid ${role === 'trader' ? '#D97706' : '#DBEAFE'}`,
                  backgroundColor: role === 'trader' ? '#FFFBEB' : 'transparent',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <Store size={24} style={{ color: role === 'trader' ? '#D97706' : '#94A3B8', marginBottom: '6px' }} />
                <strong style={{ display: 'block', fontSize: '14px', color: '#0F172A' }}>Campus Trader</strong>
                <span style={{ fontSize: '10px', color: '#475569' }}>Sell bulk inventory faster</span>
              </div>
            </div>
          </div>

          {/* Trader waitlist notice banner */}
          {role === 'trader' && (
            <div style={{
              backgroundColor: '#FFFBEB',
              border: '1px solid #FDE68A',
              borderRadius: '12px',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px'
            }}>
              <Clock size={16} style={{ color: '#D97706', marginTop: '2px', flexShrink: 0 }} />
              <p style={{ margin: 0, fontSize: '12px', color: '#92400E', lineHeight: '1.5' }}>
                <strong>Trader accounts are on waitlist.</strong> Campus trading is launching soon! 
                Sign up now to be first in line — we'll email you when it's live.
              </p>
            </div>
          )}

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Full Name *</label>
            <input 
              type="text" 
              placeholder="e.g. Ismail Delta" 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="form-control"
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Email Address *</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Mail size={16} style={{ position: 'absolute', left: '14px', color: 'var(--text-muted)' }} />
              <input 
                type="email" 
                placeholder="student@delsu.edu" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-control"
                style={{ paddingLeft: '40px' }}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Phone Number *</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Smartphone size={16} style={{ position: 'absolute', left: '14px', color: 'var(--text-muted)' }} />
              <input 
                type="tel" 
                placeholder="e.g. 08123456789" 
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="form-control"
                style={{ paddingLeft: '40px' }}
                required
              />
            </div>
          </div>

          {role === 'buyer' && (
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">DELSU Matric Number *</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <BookOpen size={16} style={{ position: 'absolute', left: '14px', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  placeholder="e.g. FOS/22/23/267776" 
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="form-control"
                  style={{ paddingLeft: '40px' }}
                  required
                />
              </div>
            </div>
          )}

          {role === 'buyer' && (
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Password *</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Lock size={16} style={{ position: 'absolute', left: '14px', color: 'var(--text-muted)' }} />
                <input 
                  type="password" 
                  placeholder="Minimum 6 characters" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-control"
                  style={{ paddingLeft: '40px' }}
                  required
                />
              </div>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="btn btn-secondary btn-full"
            style={{ 
              marginTop: '8px', 
              height: '48px', 
              borderRadius: '14px',
              background: role === 'trader' 
                ? 'linear-gradient(135deg, #D97706, #F59E0B)' 
                : 'linear-gradient(135deg, #2563EB, #3B82F6)',
              fontSize: '15px',
              fontWeight: '700',
              boxShadow: role === 'trader'
                ? '0 4px 14px rgba(217, 119, 6, 0.2)'
                : '0 4px 14px rgba(37, 99, 235, 0.2)',
              transition: 'all 0.2s ease'
            }}
          >
            {loading 
              ? (role === 'trader' ? 'Joining Waitlist...' : 'Creating Account...') 
              : (role === 'trader' ? 'Join the Waitlist' : 'Sign Up')
            }
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: 'var(--text-secondary)' }}>
          Already have an account? <Link to="/login" style={{ color: '#2563EB', fontWeight: '700' }}>Login here</Link>
        </div>

      </div>
    </div>
  );
};
