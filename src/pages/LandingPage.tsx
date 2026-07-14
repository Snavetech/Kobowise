import React from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingDown, 
  ChevronRight, 
  ShieldCheck, 
  Truck,
  Leaf,
  Users,
  Award,
  Clock,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { Footer } from '../components/Footer';

export const LandingPage: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      
      {/* NAVBAR for Landing */}
      <nav style={{ 
        position: 'sticky', 
        top: 0, 
        zIndex: 1000, 
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(219, 234, 254, 0.6)',
        padding: '0 16px'
      }}>
        <div className="container" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          height: '70px' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              backgroundColor: '#2563EB',
              color: '#FFFFFF',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
            }}>
              <Leaf size={22} />
            </div>
            <span style={{ 
              fontFamily: 'var(--font-heading)', 
              fontWeight: '800', 
              fontSize: '22px', 
              color: '#1E3A8A', 
              letterSpacing: '-0.5px' 
            }}>
              KoboWise
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link to="/login" style={{ fontWeight: '700', color: '#1E3A8A', fontSize: '14px', textDecoration: 'none' }}>Login</Link>
            <Link to="/signup" className="btn btn-secondary btn-sm" style={{ fontWeight: '700', borderRadius: 'var(--radius-full)', padding: '8px 20px' }}>
              Get Started
              <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section style={{ 
        background: 'linear-gradient(160deg, #EFF6FF 0%, #DBEAFE 25%, #F0F9FF 55%, #F8FAFC 100%)',
        padding: '80px 0 100px 0',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative floating elements */}
        <div style={{ 
          position: 'absolute', 
          width: '400px', 
          height: '400px', 
          borderRadius: '50%', 
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.12) 0%, transparent 70%)', 
          top: '-80px', 
          right: '-80px',
        }} />
        <div style={{ 
          position: 'absolute', 
          width: '300px', 
          height: '300px', 
          borderRadius: '50%', 
          background: 'radial-gradient(circle, rgba(96, 165, 250, 0.1) 0%, transparent 70%)', 
          bottom: '-60px', 
          left: '-40px',
        }} />
        {/* Decorations */}
        <div style={{ position: 'absolute', top: '60px', right: '10%', fontSize: '48px', opacity: 0.12, transform: 'rotate(25deg)' }}>💎</div>
        <div style={{ position: 'absolute', bottom: '80px', left: '8%', fontSize: '36px', opacity: 0.1, transform: 'rotate(-15deg)' }}>✨</div>

        <div className="container" style={{ position: 'relative', zIndex: 5 }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr', 
            gap: '40px',
            alignItems: 'center'
          }} className="hero-grid">
            
            <div style={{ textAlign: 'center', maxWidth: '820px', margin: '0 auto' }}>
              {/* Badge */}
              <div style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '8px', 
                backgroundColor: 'rgba(37, 99, 235, 0.08)', 
                padding: '8px 16px', 
                borderRadius: 'var(--radius-full)', 
                fontSize: '13px', 
                fontWeight: '700',
                color: '#2563EB',
                border: '1px solid rgba(37, 99, 235, 0.15)',
                marginBottom: '28px'
              }}>
                <span>🎓 DELSU Abraka Student Edition</span>
              </div>

              {/* Script-Style Tagline */}
              <p style={{
                fontFamily: 'var(--font-display)',
                fontSize: '22px',
                fontStyle: 'italic',
                color: '#3B82F6',
                marginBottom: '8px',
                fontWeight: '500',
                letterSpacing: '0.5px'
              }}>
                Smart Shopping for Students
              </p>

              <h1 style={{ 
                fontSize: '52px', 
                color: '#0F172A',
                lineHeight: '1.1',
                letterSpacing: '-0.03em',
                marginBottom: '20px',
                fontFamily: 'var(--font-heading)',
                fontWeight: '800'
              }} className="hero-title">
                Buy Together.<br />
                <span style={{ color: '#2563EB' }}>Save Big Together.</span>
              </h1>

              <p style={{ 
                fontSize: '18px', 
                color: '#475569',
                marginBottom: '36px',
                lineHeight: '1.7',
                maxWidth: '580px',
                marginRight: 'auto',
                marginLeft: 'auto'
              }}>
                Split the high cost of bulk foods and student essentials with other DELSU students. Get wholesale prices without buying the whole carton.
              </p>

              <div style={{ 
                display: 'flex', 
                gap: '16px', 
                justifyContent: 'center',
                flexWrap: 'wrap'
              }}>
                <Link to="/signup" className="btn btn-lg" style={{ 
                  background: 'linear-gradient(135deg, #2563EB, #3B82F6)',
                  color: '#FFFFFF',
                  borderRadius: 'var(--radius-full)',
                  minWidth: '200px',
                  boxShadow: '0 4px 16px rgba(37, 99, 235, 0.25)',
                  fontWeight: '700',
                  border: 'none',
                  transition: 'all 0.3s ease'
                }}>
                  Start Saving Now
                  <ArrowRight size={20} />
                </Link>
                <Link to="/login" className="btn btn-lg" style={{ 
                  color: '#1E3A8A', 
                  borderColor: '#2563EB',
                  border: '2px solid #2563EB',
                  backgroundColor: 'rgba(37, 99, 235, 0.04)',
                  borderRadius: 'var(--radius-full)',
                  minWidth: '180px',
                  fontWeight: '700'
                }}>
                  Login
                </Link>
              </div>
            </div>

          </div>
        </div>

        {/* Trust Bar (below hero, inside gradient) */}
        <div className="container" style={{ marginTop: '56px', position: 'relative', zIndex: 5 }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            flexWrap: 'wrap', 
            gap: '28px',
            padding: '20px 0'
          }} className="trust-items-row">
            {[
              { icon: <CheckCircle2 size={18} />, label: 'Verified Traders', sub: 'Campus-Trusted' },
              { icon: <Truck size={18} />, label: 'Campus Pickup', sub: 'At Your Gate' },
              { icon: <ShieldCheck size={18} />, label: 'Secure Payments', sub: 'Escrow Protected' },
            ].map((item, i) => (
              <div key={i} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px',
                padding: '10px 16px',
                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                borderRadius: 'var(--radius-full)',
                border: '1px solid rgba(37, 99, 235, 0.1)'
              }}>
                <div style={{ 
                  color: '#2563EB', 
                  display: 'flex', 
                  alignItems: 'center'
                }}>
                  {item.icon}
                </div>
                <div>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: '#0F172A', display: 'block', lineHeight: '1.2' }}>{item.label}</span>
                  <span style={{ fontSize: '11px', color: '#475569' }}>{item.sub}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* METRICS / STATS BAR */}
      <section style={{ 
        background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)',
        padding: '36px 0',
        color: '#FFFFFF'
      }}>
        <div className="container">
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
            gap: '20px',
            textAlign: 'center'
          }} className="metrics-grid">
            <div>
              <span style={{ display: 'block', fontSize: '34px', fontWeight: '800', color: '#FFFFFF', textShadow: '0 0 20px rgba(96, 165, 250, 0.5)' }}>₦450k+</span>
              <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.75)', fontWeight: '600' }}>Student Savings</span>
            </div>
            <div style={{ borderLeft: '1px solid rgba(255,255,255,0.15)', borderRight: '1px solid rgba(255,255,255,0.15)' }}>
              <span style={{ display: 'block', fontSize: '34px', fontWeight: '800', color: '#60A5FA', textShadow: '0 0 20px rgba(96, 165, 250, 0.4)' }}>120+</span>
              <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.75)', fontWeight: '600' }}>Completed Groups</span>
            </div>
            <div>
              <span style={{ display: 'block', fontSize: '34px', fontWeight: '800', color: '#FDD835', textShadow: '0 0 20px rgba(253, 216, 53, 0.3)' }}>15+</span>
              <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.75)', fontWeight: '600' }}>Active Campus Traders</span>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding: '88px 0', backgroundColor: '#FFFFFF' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: '18px',
              fontStyle: 'italic',
              color: '#3B82F6',
              display: 'block',
              marginBottom: '8px'
            }}>Simple & Easy</span>
            <h2 style={{ fontSize: '38px', color: '#0F172A', marginBottom: '16px', fontFamily: 'var(--font-heading)' }}>
              How KoboWise Works
            </h2>
            <p style={{ color: '#475569', maxWidth: '560px', margin: '0 auto', lineHeight: '1.6' }}>
              No need to buy a full carton of noodles or a bag of rice alone. Follow these simple steps.
            </p>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
            gap: '24px' 
          }} className="steps-grid">
            
            {[
              { num: 1, title: 'Browse Bulk Items', desc: 'Select a bulk product listed by trusted DELSU campus traders, divided into equal affordable shares.', color: '#1E3A8A' },
              { num: 2, title: 'Buy Your Portions', desc: 'Pay securely for the shares you want (e.g. 1 share of Indomie = 10 packs) using Paystack checkout.', color: '#2563EB' },
              { num: 3, title: 'Real-time Group Lock', desc: 'Track the progress bar. As other students buy the remaining shares, the group fills and locks.', color: '#3B82F6' },
              { num: 4, title: 'Collect on Campus', desc: 'Receive a completion alert, go to the pickup point (e.g. Site II Gate), collect your share, and enjoy!', color: '#60A5FA' },
            ].map((step) => (
              <div key={step.num} className="step-card" style={{
                textAlign: 'center',
                padding: '32px 24px',
                borderRadius: '20px',
                backgroundColor: '#F8FAFC',
                border: '1px solid #DBEAFE',
                transition: 'all 0.3s ease'
              }}>
                <div style={{ 
                  width: '56px', 
                  height: '56px', 
                  borderRadius: '50%', 
                  background: `linear-gradient(135deg, ${step.color}, ${step.color}dd)`,
                  color: '#FFFFFF',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  margin: '0 auto 20px auto',
                  fontSize: '22px',
                  fontWeight: '800',
                  boxShadow: `0 4px 14px ${step.color}40`
                }}>
                  {step.num}
                </div>
                <h3 style={{ fontSize: '17px', marginBottom: '10px', color: '#0F172A' }}>{step.title}</h3>
                <p style={{ color: '#475569', fontSize: '14px', lineHeight: '1.65' }}>
                  {step.desc}
                </p>
              </div>
            ))}

          </div>
        </div>
      </section>

      {/* WHY CHOOSE KOBOWISE */}
      <section style={{ padding: '88px 0', backgroundColor: '#F8FAFC' }}>
        <div className="container">
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr', 
            gap: '50px',
            alignItems: 'center',
            maxWidth: '720px',
            margin: '0 auto'
          }} className="features-grid-landing">
            
            <div>
              <span style={{
                fontFamily: 'var(--font-display)',
                fontSize: '18px',
                fontStyle: 'italic',
                color: '#3B82F6',
                display: 'block',
                marginBottom: '8px'
              }}>Why Students Love Us</span>
              <h2 style={{ fontSize: '36px', color: '#0F172A', marginBottom: '32px', fontFamily: 'var(--font-heading)' }}>
                Tailored for the DELSU Student Lifestyle
              </h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {[
                  {
                    icon: <TrendingDown size={22} />,
                    title: 'Halve Your Food Expenses',
                    desc: 'Hostel cooking shouldn\'t be expensive. Split bags of rice, basins of garri, or frozen chicken to pay a fraction of the cost.',
                    gradient: 'linear-gradient(135deg, #EFF6FF, #BFDBFE)'
                  },
                  {
                    icon: <ShieldCheck size={22} />,
                    title: 'Safe, Verified Campus Traders',
                    desc: 'All vendors are verified campus or local Abraka traders, ensuring high-quality produce and secure collections.',
                    gradient: 'linear-gradient(135deg, #EFF6FF, #93C5FD)'
                  },
                  {
                    icon: <Truck size={22} />,
                    title: 'Pickup Points at Your Doorstep',
                    desc: 'Pick up your portion at Site II Gate, Site III Co-operative, or opt for cheap direct hostel delivery.',
                    gradient: 'linear-gradient(135deg, #F0F9FF, #BAE6FD)'
                  }
                ].map((feature, i) => (
                  <div key={i} style={{ display: 'flex', gap: '16px', padding: '20px', borderRadius: '16px', backgroundColor: '#FFFFFF', border: '1px solid #DBEAFE', transition: 'all 0.25s ease', boxShadow: '0 1px 4px rgba(30, 64, 175, 0.04)' }}>
                    <div style={{ 
                      flexShrink: 0, 
                      width: '48px', 
                      height: '48px', 
                      borderRadius: '14px', 
                      background: feature.gradient,
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      color: '#2563EB'
                    }}>
                      {feature.icon}
                    </div>
                    <div>
                      <h4 style={{ fontSize: '16px', marginBottom: '4px', color: '#0F172A' }}>{feature.title}</h4>
                      <p style={{ color: '#475569', fontSize: '14px', lineHeight: '1.6' }}>
                        {feature.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section style={{ 
        background: 'linear-gradient(135deg, #2563EB 0%, #1E3A8A 100%)', 
        color: '#FFFFFF',
        padding: '72px 0', 
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative glow */}
        <div style={{ position: 'absolute', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(96, 165, 250, 0.2) 0%, transparent 70%)', top: '-100px', right: '10%' }} />

        <div className="container" style={{ position: 'relative', zIndex: 5 }}>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: '20px',
            fontStyle: 'italic',
            color: '#93C5FD',
            display: 'block',
            marginBottom: '8px'
          }}>Ready to start?</span>
          <h2 style={{ color: '#FFFFFF', fontSize: '36px', marginBottom: '16px', fontFamily: 'var(--font-heading)', fontWeight: '800' }}>
            Cut Your Cooking & Living Expenses
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '32px', maxWidth: '500px', margin: '0 auto 32px auto', lineHeight: '1.6' }}>
            Create a student account in 1 minute, join active buying groups, and collect your items today.
          </p>
          <Link to="/signup" className="btn btn-lg" style={{
            backgroundColor: '#FFFFFF',
            color: '#1E3A8A',
            borderRadius: 'var(--radius-full)',
            fontWeight: '800',
            padding: '16px 36px',
            border: 'none',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            transition: 'all 0.3s ease'
          }}>
            Create Free Account
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* STATS TRUST FOOTER BAR */}
      <section style={{
        backgroundColor: '#0F172A',
        padding: '32px 0'
      }}>
        <div className="container">
          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: '12px', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '20px' }}>
            Trusted by Thousands of Happy Students
          </p>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '24px',
            textAlign: 'center'
          }} className="bottom-stats-grid">
            {[
              { icon: <Users size={20} />, num: '500+', label: 'Happy Students' },
              { icon: <Award size={20} />, num: '120+', label: 'Group Orders' },
              { icon: <Leaf size={20} />, num: '15+', label: 'Campus Traders' },
              { icon: <Clock size={20} />, num: '99%', label: 'Satisfaction Rate' },
            ].map((stat, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <div style={{ color: '#60A5FA' }}>{stat.icon}</div>
                <span style={{ fontSize: '24px', fontWeight: '800', color: '#FFFFFF' }}>{stat.num}</span>
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', fontWeight: '600' }}>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />

      {styleElement}
    </div>
  );
};

const styleElement = (
  <style>{`
    @media (min-width: 768px) {
      .hero-grid {
        grid-template-columns: 1fr !important;
      }
      .hero-title {
        font-size: 60px !important;
      }
      .metrics-grid {
        gap: 40px !important;
      }
      .steps-grid {
        grid-template-columns: repeat(4, 1fr) !important;
      }
      .features-grid-landing {
        grid-template-columns: 1fr !important;
      }
    }
    @media (max-width: 767px) {
      .hero-title {
        font-size: 36px !important;
      }
      .trust-items-row {
        gap: 12px !important;
      }
      .bottom-stats-grid {
        grid-template-columns: repeat(2, 1fr) !important;
      }
    }
  `}</style>
);
