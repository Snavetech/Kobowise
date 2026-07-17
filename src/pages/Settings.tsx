import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dbService, mockRealtime } from '../supabase';
import { Save, User, ShieldCheck, Mail, Phone, MapPin, Bell, Edit } from 'lucide-react';

export const Settings: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Profile fields
  const [fullName, setFullName] = useState(user?.full_name || 'Chioma Obi');
  const [phoneNumber, setPhoneNumber] = useState(user?.phone_number || '08012345678');
  const [studentId, setStudentId] = useState(user?.student_id || 'FOS/22/23/267776');
  const [email, setEmail] = useState((user as any)?.email || 'chioma.obi@student.delsu.edu.ng');
  const [pickupPoint, setPickupPoint] = useState('DELSU Site II Gate Shop 1B');
  
  // Notifications toggles (Image 2)
  const [groupUpdates, setGroupUpdates] = useState(true);
  const [orderAlerts, setOrderAlerts] = useState(true);
  const [promotions, setPromotions] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    setSaveSuccess(false);

    const updated = await dbService.updateProfile(user.id, {
      full_name: fullName,
      phone_number: phoneNumber,
      student_id: user.role === 'buyer' ? studentId : undefined
    });

    if (updated) {
      setSaveSuccess(true);
      mockRealtime.emit('toast', {
        message: 'Profile settings updated successfully!',
        type: 'success'
      });
      setTimeout(() => setSaveSuccess(false), 3000);
    }
    setIsSaving(false);
  };

  return (
    <div style={{ padding: '32px 0 60px 0', backgroundColor: '#F8FAFC', minHeight: '95vh' }}>
      <div className="container" style={{ maxWidth: '960px' }}>
        
        <h1 style={{ fontSize: '32px', color: '#0F172A', marginBottom: '28px', fontWeight: '800', fontFamily: 'var(--font-heading)' }}>
          Profile & Settings
        </h1>

        {saveSuccess && (
          <div style={{ 
            backgroundColor: 'var(--status-completed-bg)', 
            color: 'var(--status-completed)', 
            padding: '12px 16px', 
            borderRadius: '12px', 
            fontSize: '14px', 
            marginBottom: '24px',
            fontWeight: '600',
            border: '1px solid var(--secondary-emerald)'
          }}>
            Your profile settings have been saved successfully!
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* Profile Card Header (Image 2 details) */}
          <div style={{ 
            backgroundColor: '#FFFFFF', 
            borderRadius: '24px', 
            border: '1px solid #DBEAFE', 
            overflow: 'hidden',
            boxShadow: '0 8px 30px rgba(30, 64, 175, 0.03)'
          }}>
            {/* Banner half */}
            <div style={{ 
              height: '140px', 
              background: 'linear-gradient(135deg, #0891B2 0%, #2563EB 100%)',
              position: 'relative'
            }} />

            {/* Avatar & details half */}
            <div style={{ padding: '24px 32px 32px 32px', position: 'relative' }}>
              
              {/* Floating Avatar */}
              <div style={{ 
                position: 'absolute', 
                top: '-70px', 
                left: '32px',
                width: '120px', 
                height: '120px', 
                borderRadius: '50%', 
                border: '4px solid #FFFFFF',
                backgroundColor: '#F5F5EB',
                overflow: 'hidden',
                boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
              }}>
                <img 
                  src={user?.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=60"} 
                  alt="" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              </div>

              {/* User text and action row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', paddingLeft: '144px', minHeight: '60px', marginBottom: '24px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h2 style={{ fontSize: '24px', color: '#0F172A', fontWeight: '800', margin: 0 }}>
                      {fullName}
                    </h2>
                    <span className="badge" style={{ backgroundColor: '#EFF6FF', color: '#2563EB', fontSize: '10px', fontWeight: '800', textTransform: 'none', padding: '2px 8px', borderRadius: '4px' }}>
                      DELSU
                    </span>
                  </div>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'block', marginTop: '2px', fontWeight: '600' }}>
                    Student ID: {studentId}
                  </span>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'block', marginTop: '2px' }}>
                    {email}
                  </span>
                </div>

                <button type="button" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', padding: '8px 16px', borderRadius: '20px' }}>
                  <Edit size={14} />
                  Edit Profile
                </button>
              </div>

              {/* Stats sub-row (Image 2 stats) */}
              <div style={{ 
                borderTop: '1px solid #F8FAFC', 
                paddingTop: '24px', 
                display: 'grid', 
                gridTemplateColumns: 'repeat(4, 1fr)', 
                textAlign: 'center', 
                gap: '16px' 
              }}>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: '700' }}>🛒 Orders</span>
                  <strong style={{ fontSize: '20px', color: '#0F172A', display: 'block', marginTop: '4px', fontWeight: '800' }}>12</strong>
                </div>
                <div style={{ borderLeft: '1px solid #DBEAFE' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: '700' }}>💸 Saved</span>
                  <strong style={{ fontSize: '20px', color: '#2563EB', display: 'block', marginTop: '4px', fontWeight: '800' }}>₦54k</strong>
                </div>
                <div style={{ borderLeft: '1px solid #DBEAFE' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: '700' }}>❤️ Wishlisted</span>
                  <strong style={{ fontSize: '20px', color: '#0F172A', display: 'block', marginTop: '4px', fontWeight: '800' }}>4</strong>
                </div>
                <div style={{ borderLeft: '1px solid #DBEAFE' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: '700' }}>⭐️ Rating</span>
                  <strong style={{ fontSize: '20px', color: '#0F172A', display: 'block', marginTop: '4px', fontWeight: '800' }}>4.9</strong>
                </div>
              </div>

            </div>
          </div>

          {/* Form details & Notifications layout (Image 2 columns) */}
          <form onSubmit={handleSave} style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr', 
            gap: '24px' 
          }} className="settings-grid">
            
            {/* Column 1: Personal Details */}
            <div style={{ 
              backgroundColor: '#FFFFFF', 
              border: '1px solid #DBEAFE', 
              borderRadius: '24px', 
              padding: '28px',
              boxShadow: '0 8px 30px rgba(30, 64, 175, 0.03)'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={18} style={{ color: '#2563EB' }} />
                Personal Details
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Full Name</label>
                  <input 
                    type="text" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="form-control"
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Student ID</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <input 
                      type="text" 
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      className="form-control"
                      style={{ paddingRight: '90px' }}
                      required
                    />
                    <span style={{ 
                      position: 'absolute', 
                      right: '12px', 
                      backgroundColor: '#EFF6FF', 
                      color: '#2563EB', 
                      fontSize: '11px', 
                      fontWeight: '800', 
                      padding: '2px 8px', 
                      borderRadius: '4px' 
                    }}>
                      Verified
                    </span>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Email Address</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <Mail size={16} style={{ position: 'absolute', left: '14px', color: 'var(--text-muted)' }} />
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="form-control"
                      style={{ paddingLeft: '40px' }}
                      required
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Phone Number</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <Phone size={16} style={{ position: 'absolute', left: '14px', color: 'var(--text-muted)' }} />
                    <input 
                      type="tel" 
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="form-control"
                      style={{ paddingLeft: '40px' }}
                      required
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Default Campus Pickup Location</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <MapPin size={16} style={{ position: 'absolute', left: '14px', color: 'var(--text-muted)' }} />
                    <select 
                      value={pickupPoint} 
                      onChange={(e) => setPickupPoint(e.target.value)} 
                      className="form-control"
                      style={{ paddingLeft: '40px' }}
                    >
                      <option value="DELSU Site II Gate Shop 1B">DELSU Site II Gate Shop 1B</option>
                      <option value="DELSU Site III Gate Shop 1A">DELSU Site III Gate Shop 1A</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 2: Notifications */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ 
                backgroundColor: '#FFFFFF', 
                border: '1px solid #DBEAFE', 
                borderRadius: '24px', 
                padding: '28px',
                boxShadow: '0 8px 30px rgba(30, 64, 175, 0.03)'
              }}>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Bell size={18} style={{ color: '#2563EB' }} />
                  Notifications
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  
                  {/* Toggle 1: Group Updates */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ display: 'block', fontSize: '14px', color: '#0F172A' }}>Group Updates</strong>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>When someone joins your group</span>
                    </div>
                    <label className="switch">
                      <input type="checkbox" checked={groupUpdates} onChange={(e) => setGroupUpdates(e.target.checked)} />
                      <span className="slider round" />
                    </label>
                  </div>

                  {/* Toggle 2: Order Alerts */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F8FAFC', paddingTop: '16px' }}>
                    <div>
                      <strong style={{ display: 'block', fontSize: '14px', color: '#0F172A' }}>Order Alerts</strong>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Delivery and status changes</span>
                    </div>
                    <label className="switch">
                      <input type="checkbox" checked={orderAlerts} onChange={(e) => setOrderAlerts(e.target.checked)} />
                      <span className="slider round" />
                    </label>
                  </div>

                  {/* Toggle 3: Promotions */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F8FAFC', paddingTop: '16px' }}>
                    <div>
                      <strong style={{ display: 'block', fontSize: '14px', color: '#0F172A' }}>Promotions</strong>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>New deals and discounts</span>
                    </div>
                    <label className="switch">
                      <input type="checkbox" checked={promotions} onChange={(e) => setPromotions(e.target.checked)} />
                      <span className="slider round" />
                    </label>
                  </div>

                </div>
              </div>

              {/* Theme Settings card */}
              <div style={{ 
                backgroundColor: '#FFFFFF', 
                border: '1px solid #DBEAFE', 
                borderRadius: '24px', 
                padding: '24px',
                boxShadow: '0 8px 30px rgba(30, 64, 175, 0.03)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <strong style={{ display: 'block', fontSize: '14px', color: '#0F172A' }}>Security Escrow Shield</strong>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>identity protection active</span>
                </div>
                <ShieldCheck size={28} style={{ color: '#2563EB' }} />
              </div>

              {/* Submit CTA */}
              <button 
                type="submit" 
                disabled={isSaving}
                className="btn btn-secondary btn-full btn-lg"
                style={{ 
                  background: 'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)', 
                  border: 'none', 
                  fontWeight: '800', 
                  fontSize: '15px',
                  height: '48px',
                  borderRadius: '14px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(37, 99, 235, 0.15)'
                }}
              >
                <Save size={18} />
                {isSaving ? 'Saving Changes...' : 'Save Settings'}
              </button>

            </div>

          </form>

        </div>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .settings-grid {
            grid-template-columns: 1.2fr 0.8fr !important;
          }
        }
        
        /* Premium custom switch styling */
        .switch {
          position: relative;
          display: inline-block;
          width: 44px;
          height: 24px;
        }
        .switch input { 
          opacity: 0;
          width: 0;
          height: 0;
        }
        .slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #DBEAFE;
          transition: .3s;
          border-radius: 24px;
        }
        .slider:before {
          position: absolute;
          content: "";
          height: 18px;
          width: 18px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: .3s;
          border-radius: 50%;
        }
        input:checked + .slider {
          background-color: #2563EB;
        }
        input:checked + .slider:before {
          transform: translateX(20px);
        }
      `}</style>
    </div>
  );
};
