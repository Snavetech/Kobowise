import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Users, TrendingUp, MapPin, X, ChevronLeft, ChevronRight } from 'lucide-react';

export const UserGuideTour: React.FC = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Automatically trigger for logged-in buyers who haven't completed it
    if (user && user.role === 'buyer') {
      const completed = localStorage.getItem('kobowise_tour_completed');
      if (!completed) {
        setIsOpen(true);
      }
    }

    const handleStartTour = () => {
      setCurrentStep(0);
      setIsOpen(true);
    };

    window.addEventListener('start_user_tour', handleStartTour);
    return () => {
      window.removeEventListener('start_user_tour', handleStartTour);
    };
  }, [user]);

  if (!isOpen || !user || user.role !== 'buyer') return null;

  const steps = [
    {
      title: "Welcome to KoboWise!",
      headline: "Buy Together, Save Together",
      description: "KoboWise is a social commerce platform designed for DELSU Abraka students. We group students together to buy food staples, groceries, and cleaning items in bulk—helping you save up to 40% compared to local retail prices!",
      icon: <Sparkles size={40} />,
      color: "linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)",
      iconColor: "#FDD835"
    },
    {
      title: "How Portion Splitting Works",
      headline: "Split Bulk Items into Affordable Portions",
      description: "Instead of buying a massive quantity you don't need or can't afford, split it! For example, a 50kg bag of rice is split into 4 portions. You only join and pay for your share (e.g. ₦8k instead of ₦32k).",
      icon: <Users size={40} />,
      color: "linear-gradient(135deg, #0D9488 0%, #14B8A6 100%)",
      iconColor: "#67e8f9"
    },
    {
      title: "Watch the Progress Bars",
      headline: "Group Orders Completed in Real-Time",
      description: "On each product card, you'll see a group progress bar. It shows how many shares have been joined (e.g., 2/4). When the group fills up completely (4/4), the order is sealed and processed!",
      icon: <TrendingUp size={40} />,
      color: "linear-gradient(135deg, #7C3AED 0%, #8B5CF6 100%)",
      iconColor: "#c084fc"
    },
    {
      title: "Campus Pickup Locations",
      headline: "Fast & Convenient Collection Points",
      description: "Once your group order is filled and processed, pick up your portion from our secure student hubs: DELSU Site II Gate Shop 1B or Site III Gate Shop 1A. Quick, easy, and right near your lectures!",
      icon: <MapPin size={40} />,
      color: "linear-gradient(135deg, #EA580C 0%, #F97316 100%)",
      iconColor: "#fde047"
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    localStorage.setItem('kobowise_tour_completed', 'true');
    setIsOpen(false);
  };

  const step = steps[currentStep];

  return (
    <div className="tour-overlay">
      <div className="tour-card">
        {/* Header Section with Dynamic Gradient */}
        <div className="tour-header" style={{ background: step.color }}>
          <button className="tour-close-btn" onClick={handleClose} aria-label="Close guide">
            <X size={20} />
          </button>
          <div className="tour-icon-container" style={{ color: step.iconColor }}>
            {step.icon}
          </div>
          <span style={{ fontSize: '11px', fontWeight: '800', letterSpacing: '1.5px', textTransform: 'uppercase', opacity: 0.85, color: '#EFF6FF', marginBottom: '4px' }}>
            Step {currentStep + 1} of {steps.length}
          </span>
          <h2 style={{ fontSize: '26px', fontWeight: '800', margin: 0, color: '#FFFFFF', fontFamily: 'var(--font-heading)', letterSpacing: '-0.5px' }}>
            {step.title}
          </h2>
        </div>

        {/* Content Section */}
        <div className="tour-content">
          <h3 className="tour-headline">
            {step.headline}
          </h3>
          <p className="tour-description">
            {step.description}
          </p>
        </div>

        {/* Footer Section */}
        <div className="tour-footer">
          {/* Skip Button (Only show if not on last step, otherwise it's redundant) */}
          {currentStep < steps.length - 1 ? (
            <button className="btn-tour-text" onClick={handleClose}>
              Skip
            </button>
          ) : (
            <div style={{ width: '40px' }} /> /* spacer to preserve alignment */
          )}

          {/* Dots Indicator */}
          <div className="tour-dots">
            {steps.map((_, idx) => (
              <div 
                key={idx} 
                className={`tour-dot ${idx === currentStep ? 'active' : ''}`}
                onClick={() => setCurrentStep(idx)}
                style={{ cursor: 'pointer' }}
              />
            ))}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {currentStep > 0 && (
              <button className="btn-tour-nav" onClick={handleBack} aria-label="Previous step">
                <ChevronLeft size={18} />
              </button>
            )}
            <button 
              className={`btn ${currentStep === steps.length - 1 ? 'btn-primary' : 'btn-tour-nav-next'}`} 
              onClick={handleNext}
              style={{
                borderRadius: currentStep === steps.length - 1 ? 'var(--radius-md)' : '50%',
                width: currentStep === steps.length - 1 ? 'auto' : '40px',
                height: '40px',
                padding: currentStep === steps.length - 1 ? '0 16px' : 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: '700'
              }}
            >
              {currentStep === steps.length - 1 ? (
                "Get Started"
              ) : (
                <ChevronRight size={18} />
              )}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .tour-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(15, 23, 42, 0.75);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          z-index: 99999;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          animation: tourFadeIn 0.3s forwards ease;
        }

        @keyframes tourFadeIn {
          to { opacity: 1; }
        }

        .tour-card {
          width: 90%;
          max-width: 500px;
          background-color: var(--neutral-surface);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-xl);
          overflow: hidden;
          border: 1px solid var(--border-color);
          transform: scale(0.9);
          animation: tourScaleUp 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          display: flex;
          flex-direction: column;
        }

        @keyframes tourScaleUp {
          to { transform: scale(1); }
        }

        .tour-header {
          padding: 36px 24px 24px 24px;
          text-align: center;
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          transition: background 0.3s ease;
        }

        .tour-close-btn {
          position: absolute;
          top: 16px;
          right: 16px;
          background: rgba(255, 255, 255, 0.15);
          border: none;
          color: #FFFFFF;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }

        .tour-close-btn:hover {
          background: rgba(255, 255, 255, 0.25);
          transform: rotate(90deg);
        }

        .tour-icon-container {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.18);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: var(--space-3);
          border: 1px solid rgba(255, 255, 255, 0.3);
          box-shadow: 0 8px 24px rgba(30, 64, 175, 0.15);
          animation: floatIcon 3s ease-in-out infinite;
        }

        @keyframes floatIcon {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }

        .tour-content {
          padding: 28px 28px 20px 28px;
          text-align: center;
          min-height: 180px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .tour-headline {
          font-family: var(--font-heading);
          font-size: 19px;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 12px;
          line-height: 1.35;
        }

        .tour-description {
          font-family: var(--font-body);
          font-size: 14.5px;
          color: var(--text-secondary);
          line-height: 1.6;
          margin: 0;
        }

        .tour-footer {
          padding: 16px 28px;
          border-top: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: space-between;
          background-color: var(--neutral-cream);
        }

        .tour-dots {
          display: flex;
          gap: 6px;
        }

        .tour-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: #CBD5E1;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .tour-dot.active {
          width: 20px;
          border-radius: 4px;
          background-color: var(--primary-green);
        }

        .btn-tour-text {
          background: none;
          border: none;
          color: var(--text-secondary);
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          padding: 8px 12px;
          border-radius: var(--radius-sm);
          transition: all 0.2s;
        }

        .btn-tour-text:hover {
          color: var(--primary-green);
          background-color: rgba(37, 99, 235, 0.05);
        }

        .btn-tour-nav {
          background: #FFFFFF;
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-tour-nav:hover {
          border-color: var(--primary-green-soft);
          color: var(--primary-green);
          background-color: var(--neutral-surface-hover);
        }

        .btn-tour-nav-next {
          background: var(--primary-green);
          border: none;
          color: #FFFFFF;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-tour-nav-next:hover {
          background: var(--primary-green-light);
          transform: scale(1.05);
          box-shadow: var(--shadow-green-glow);
        }
      `}</style>
    </div>
  );
};
