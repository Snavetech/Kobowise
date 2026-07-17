import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Store, Smartphone, Mail, Lock, BookOpen } from 'lucide-react';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !password.trim() || !phoneNumber.trim()) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }
    if (role === 'buyer' && !studentId.trim()) {
      setErrorMsg('Please input your DELSU student matric number.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    const res = await signUp(
      email,
      password,
      role,
      fullName,
      phoneNumber,
      role === 'buyer' ? studentId : undefined
    );
    setLoading(false);

    if (res.success) {
      setIsRegistered(true);
    } else {
      setErrorMsg(res.error || 'Registration failed. Please check details and try again.');
    }
  };

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
                  border: `2px solid ${role === 'trader' ? '#2563EB' : '#DBEAFE'}`,
                  backgroundColor: role === 'trader' ? '#EFF6FF' : 'transparent',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <Store size={24} style={{ color: role === 'trader' ? '#2563EB' : '#94A3B8', marginBottom: '6px' }} />
                <strong style={{ display: 'block', fontSize: '14px', color: '#0F172A' }}>Campus Trader</strong>
                <span style={{ fontSize: '10px', color: '#475569' }}>Sell bulk inventory faster</span>
              </div>
            </div>
          </div>

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

          <button 
            type="submit" 
            disabled={loading}
            className="btn btn-secondary btn-full"
            style={{ 
              marginTop: '8px', 
              height: '48px', 
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #2563EB, #3B82F6)',
              fontSize: '15px',
              fontWeight: '700',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.2)'
            }}
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: 'var(--text-secondary)' }}>
          Already have an account? <Link to="/login" style={{ color: '#2563EB', fontWeight: '700' }}>Login here</Link>
        </div>

      </div>
    </div>
  );
};
