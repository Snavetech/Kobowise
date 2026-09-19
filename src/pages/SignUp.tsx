import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { sendVerificationOTP } from '../services/emailService';
import { 
  User, Store, Smartphone, Mail, Lock, BookOpen, Clock, CheckCircle2, 
  Sparkles, Eye, EyeOff, ShieldCheck, ArrowRight, RotateCcw, ArrowLeft, KeyRound 
} from 'lucide-react';

export const SignUp: React.FC = () => {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState<'buyer' | 'trader'>('buyer');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [isWaitlisted, setIsWaitlisted] = useState(false);

  // OTP Verification state
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [activeOtp, setActiveOtp] = useState('');
  const [otpInput, setOtpInput] = useState<string[]>(['', '', '', '', '', '']);
  const [otpExpiry, setOtpExpiry] = useState<number>(0);
  const [resendCooldown, setResendCooldown] = useState<number>(0);
  const [otpError, setOtpError] = useState('');
  const [verifyingLoading, setVerifyingLoading] = useState(false);
  const [isVerifiedSuccess, setIsVerifiedSuccess] = useState(false);

  const digitInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Password requirements state
  const reqs = {
    hasMinLength: password.length >= 8,
    hasLowerCase: /[a-z]/.test(password),
    hasUpperCase: /[A-Z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[^A-Za-z0-9]/.test(password)
  };

  const isPasswordValid = reqs.hasMinLength && reqs.hasLowerCase && reqs.hasUpperCase && reqs.hasNumber && reqs.hasSpecialChar;

  // Countdown timer for Resend OTP
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Focus first OTP cell when entering verification view
  useEffect(() => {
    if (isVerifyingOtp && digitInputRefs.current[0]) {
      setTimeout(() => {
        digitInputRefs.current[0]?.focus();
      }, 150);
    }
  }, [isVerifyingOtp]);

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
      if (!isPasswordValid) {
        setErrorMsg('Password does not meet all security requirements.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match. Please check and try again.');
        return;
      }
      if (!studentId.trim()) {
        setErrorMsg('Please input your DELSU student matric number.');
        return;
      }
    }

    setLoading(true);
    setErrorMsg('');

    // --- TRADER WAITLIST FLOW ---
    if (role === 'trader') {
      const res = await signUp(
        email,
        password || 'waitlist-placeholder',
        role,
        fullName,
        phoneNumber
      );
      setLoading(false);

      if (res.success) {
        setIsWaitlisted(true);
      } else {
        setErrorMsg(res.error || 'Registration failed. Please check details and try again.');
      }
      return;
    }

    // --- BUYER 6-DIGIT OTP VERIFICATION FLOW ---
    const generated = Math.floor(100000 + Math.random() * 900000).toString();
    setActiveOtp(generated);
    setOtpExpiry(Date.now() + 10 * 60 * 1000); // 10 minutes expiry
    setResendCooldown(60); // 60 seconds cooldown
    setOtpInput(['', '', '', '', '', '']);
    setOtpError('');

    // Dispatch via EmailJS (gracefully simulated if keys are unconfigured)
    await sendVerificationOTP(email, fullName, generated);
    setLoading(false);
    setIsVerifyingOtp(true);
  };

  // OTP Input handlers
  const handleOtpDigitChange = (index: number, val: string) => {
    const char = val.slice(-1); // Take latest input
    if (char && !/^\d$/.test(char)) return; // Allow only numeric digits

    const nextDigits = [...otpInput];
    nextDigits[index] = char;
    setOtpInput(nextDigits);
    setOtpError('');

    if (char && index < 5) {
      digitInputRefs.current[index + 1]?.focus();
    }

    // Automatically trigger verification once all 6 digits are provided
    const fullCode = nextDigits.join('');
    if (fullCode.length === 6 && !nextDigits.includes('')) {
      handleVerifyOtp(fullCode);
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!otpInput[index] && index > 0) {
        digitInputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      digitInputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      digitInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;

    const nextDigits = ['', '', '', '', '', ''];
    for (let i = 0; i < pasted.length; i++) {
      nextDigits[i] = pasted[i];
    }
    setOtpInput(nextDigits);
    setOtpError('');

    const targetIndex = Math.min(pasted.length, 5);
    digitInputRefs.current[targetIndex]?.focus();

    if (pasted.length === 6) {
      handleVerifyOtp(pasted);
    }
  };

  const handleVerifyOtp = async (codeToVerify?: string) => {
    const code = codeToVerify || otpInput.join('');
    if (code.length < 6) {
      setOtpError('Please enter all 6 digits of your verification code.');
      return;
    }

    if (Date.now() > otpExpiry) {
      setOtpError('This verification code has expired. Please click "Resend Code" below.');
      return;
    }

    if (code !== activeOtp) {
      setOtpError('Incorrect verification code. Please check your email and try again.');
      return;
    }

    setVerifyingLoading(true);
    setOtpError('');

    const res = await signUp(
      email,
      password,
      'buyer',
      fullName,
      phoneNumber,
      studentId
    );

    setVerifyingLoading(false);

    if (res.success) {
      setIsVerifiedSuccess(true);
      setTimeout(() => {
        navigate('/home');
      }, 1200);
    } else {
      setOtpError(res.error || 'Failed to complete registration. Please try again.');
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    const generated = Math.floor(100000 + Math.random() * 900000).toString();
    setActiveOtp(generated);
    setOtpExpiry(Date.now() + 10 * 60 * 1000);
    setResendCooldown(60);
    setOtpInput(['', '', '', '', '', '']);
    setOtpError('');
    await sendVerificationOTP(email, fullName, generated);
  };

  const handleAutoFillDemo = () => {
    const digits = activeOtp.split('');
    setOtpInput(digits);
    setOtpError('');
    handleVerifyOtp(activeOtp);
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
  // 6-DIGIT OTP VERIFICATION SCREEN
  // ═══════════════════════════════════════════════
  if (isVerifyingOtp) {
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
          maxWidth: '490px', 
          backgroundColor: '#FFFFFF', 
          borderRadius: '24px', 
          border: '1px solid #DBEAFE', 
          padding: '40px 32px',
          boxShadow: '0 12px 40px rgba(30, 64, 175, 0.08)',
          textAlign: 'center'
        }}>
          {isVerifiedSuccess ? (
            <div style={{ padding: '24px 0', animation: 'waitlistFadeIn 0.4s ease-out' }}>
              <div style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                backgroundColor: '#DCFCE7',
                color: '#16A34A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px auto',
                boxShadow: '0 0 0 8px #F0FDF4'
              }}>
                <CheckCircle2 size={40} />
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0F172A', marginBottom: '8px' }}>
                Account Verified!
              </h2>
              <p style={{ color: '#64748B', fontSize: '15px' }}>
                Welcome to KoboWise, <strong>{fullName}</strong>! Taking you to the campus marketplace...
              </p>
            </div>
          ) : (
            <>
              {/* Shield Icon Header */}
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '20px',
                backgroundColor: '#EFF6FF',
                color: '#2563EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px auto',
                border: '1px solid #BFDBFE'
              }}>
                <ShieldCheck size={32} />
              </div>

              {/* Campus Badge */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: '#F1F5F9',
                border: '1px solid #E2E8F0',
                borderRadius: '20px',
                padding: '4px 12px',
                fontSize: '12px',
                fontWeight: '600',
                color: '#475569',
                marginBottom: '14px'
              }}>
                <KeyRound size={13} style={{ color: '#2563EB' }} />
                DELSU Student Verification
              </div>

              <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0F172A', marginBottom: '10px' }}>
                Enter 6-Digit Code
              </h2>

              <p style={{ color: '#475569', fontSize: '14px', lineHeight: '1.6', marginBottom: '8px' }}>
                We sent a one-time verification code to:
              </p>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: '#EFF6FF',
                padding: '6px 14px',
                borderRadius: '10px',
                marginBottom: '24px',
                border: '1px solid #DBEAFE'
              }}>
                <Mail size={14} style={{ color: '#2563EB' }} />
                <strong style={{ color: '#1E40AF', fontSize: '14px' }}>{email}</strong>
                <button
                  type="button"
                  onClick={() => setIsVerifyingOtp(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#64748B',
                    fontSize: '12px',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    padding: '0 4px'
                  }}
                  title="Edit email"
                >
                  Edit
                </button>
              </div>

              {/* 6 Digit Input Cells */}
              <div style={{
                display: 'flex',
                gap: '8px',
                justifyContent: 'center',
                marginBottom: '16px'
              }}>
                {otpInput.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => { digitInputRefs.current[idx] = el; }}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    onPaste={handleOtpPaste}
                    style={{
                      width: '50px',
                      height: '60px',
                      fontSize: '24px',
                      fontWeight: '800',
                      textAlign: 'center',
                      borderRadius: '12px',
                      border: digit ? '2px solid #2563EB' : '2px solid #CBD5E1',
                      backgroundColor: digit ? '#F0F9FF' : '#F8FAFC',
                      color: '#0F172A',
                      outline: 'none',
                      boxShadow: digit ? '0 0 0 3px rgba(37, 99, 235, 0.15)' : 'none',
                      transition: 'all 0.15s ease-in-out'
                    }}
                  />
                ))}
              </div>

              {otpError && (
                <div style={{
                  color: '#DC2626',
                  fontSize: '13px',
                  backgroundColor: '#FEF2F2',
                  border: '1px solid #FEE2E2',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  marginBottom: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}>
                  <span>⚠️</span> {otpError}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="button"
                onClick={() => handleVerifyOtp()}
                disabled={verifyingLoading || otpInput.some((d) => !d)}
                className="btn btn-primary btn-full"
                style={{
                  height: '50px',
                  borderRadius: '14px',
                  fontSize: '15px',
                  fontWeight: '700',
                  background: otpInput.every((d) => d)
                    ? 'linear-gradient(135deg, #2563EB, #1D4ED8)'
                    : '#CBD5E1',
                  border: 'none',
                  color: '#FFFFFF',
                  cursor: otpInput.every((d) => d) && !verifyingLoading ? 'pointer' : 'not-allowed',
                  boxShadow: otpInput.every((d) => d) ? '0 4px 14px rgba(37, 99, 235, 0.25)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  marginBottom: '20px',
                  transition: 'all 0.2s ease'
                }}
              >
                {verifyingLoading ? (
                  <>Verifying Code...</>
                ) : (
                  <>
                    Verify & Create Account <ArrowRight size={18} />
                  </>
                )}
              </button>

              {/* Resend Code Section */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontSize: '14px',
                color: '#64748B'
              }}>
                {resendCooldown > 0 ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={15} style={{ color: '#94A3B8' }} />
                    Resend code in <strong style={{ color: '#2563EB' }}>{resendCooldown}s</strong>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#2563EB',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '14px',
                      textDecoration: 'underline'
                    }}
                  >
                    <RotateCcw size={15} />
                    Resend Code
                  </button>
                )}
              </div>

              {/* Dev / Demo Helper Chip */}
              <div style={{
                marginTop: '28px',
                padding: '12px 16px',
                background: '#F8FAFC',
                borderRadius: '12px',
                border: '1px dashed #CBD5E1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '13px',
                color: '#475569'
              }}>
                <span>
                  💡 <strong>Demo Mode OTP:</strong>{' '}
                  <code style={{ color: '#2563EB', fontWeight: '800', fontSize: '15px', letterSpacing: '2px', marginLeft: '4px' }}>
                    {activeOtp}
                  </code>
                </span>
                <button
                  type="button"
                  onClick={handleAutoFillDemo}
                  style={{
                    background: '#EFF6FF',
                    border: '1px solid #BFDBFE',
                    color: '#1D4ED8',
                    borderRadius: '8px',
                    padding: '4px 10px',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  Auto-Fill
                </button>
              </div>

              {/* Back to details link */}
              <div style={{ marginTop: '20px' }}>
                <button
                  type="button"
                  onClick={() => setIsVerifyingOtp(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#64748B',
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <ArrowLeft size={14} /> Back to registration details
                </button>
              </div>
            </>
          )}
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
            <>
              {/* PASSWORD FIELD WITH EYE TOGGLE */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Password *</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '14px', color: 'var(--text-muted)' }} />
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    placeholder="Create a strong password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="form-control"
                    style={{ paddingLeft: '40px', paddingRight: '40px' }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#64748B',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '4px'
                    }}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {/* PASSWORD REQUIREMENTS STRIKE-OUT LIST */}
                <div style={{
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '12px',
                  padding: '12px 14px',
                  marginTop: '8px'
                }}>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Password Requirements:
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {[
                      { label: 'At least 8 characters long', met: reqs.hasMinLength },
                      { label: 'Contains a lowercase letter (a-z)', met: reqs.hasLowerCase },
                      { label: 'Contains a capital letter (A-Z)', met: reqs.hasUpperCase },
                      { label: 'Contains a number (0-9)', met: reqs.hasNumber },
                      { label: 'Contains a special character (!@#$%^&*)', met: reqs.hasSpecialChar },
                    ].map((req, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: req.met ? '#16A34A' : '#64748B', transition: 'all 0.2s ease' }}>
                        {req.met ? (
                          <CheckCircle2 size={14} style={{ color: '#16A34A', flexShrink: 0 }} />
                        ) : (
                          <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#94A3B8', marginLeft: '4px', marginRight: '4px', flexShrink: 0 }} />
                        )}
                        <span style={{
                          textDecoration: req.met ? 'line-through' : 'none',
                          fontWeight: req.met ? '700' : '500',
                          opacity: req.met ? 0.85 : 1
                        }}>
                          {req.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* CONFIRM PASSWORD FIELD WITH EYE TOGGLE */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Confirm Password *</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '14px', color: 'var(--text-muted)' }} />
                  <input 
                    type={showConfirmPassword ? 'text' : 'password'} 
                    placeholder="Re-enter your password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="form-control"
                    style={{
                      paddingLeft: '40px',
                      paddingRight: '40px',
                      borderColor: confirmPassword && confirmPassword !== password ? '#EF4444' : undefined
                    }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#64748B',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '4px'
                    }}
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {confirmPassword && confirmPassword !== password && (
                  <span style={{ fontSize: '11px', color: '#DC2626', fontWeight: '600', marginTop: '4px', display: 'block' }}>
                    ⚠️ Passwords do not match
                  </span>
                )}
                {confirmPassword && confirmPassword === password && (
                  <span style={{ fontSize: '11px', color: '#16A34A', fontWeight: '700', marginTop: '4px', display: 'block' }}>
                    ✓ Passwords match
                  </span>
                )}
              </div>
            </>
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
