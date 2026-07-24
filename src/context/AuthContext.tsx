/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isDemoMode, isSupabaseConfigured, dbService, type Profile, initializeMockDb } from '../supabase';

interface AuthContextType {
  user: Profile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (
    email: string,
    password: string,
    role: 'buyer' | 'trader',
    fullName: string,
    phoneNumber: string,
    studentId?: string
  ) => Promise<{ success: boolean; error?: string; waitlisted?: boolean }>;
  logout: () => Promise<void>;
  switchRole: (role: 'buyer' | 'trader') => void;
  updateUserProfile: (updates: Partial<Profile>) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const formatAuthError = (err: any): string => {
  console.error('Auth error details:', err);
  if (!err) return 'An unexpected error occurred.';
  if (typeof err === 'string') return err;
  if (typeof err.message === 'string') return err.message;
  if (err.message && typeof err.message === 'object') {
    return JSON.stringify(err.message);
  }
  if (typeof err.error_description === 'string') return err.error_description;
  if (typeof err.error === 'string') return err.error;
  
  try {
    const str = JSON.stringify(err);
    if (str && str !== '{}') return str;
  } catch {}
  
  return err.toString() || 'An unexpected error occurred.';
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const initializeAuth = async () => {
      // Check stored session user
      const storedUserId = localStorage.getItem('kobowise_session_user');
      
      if (storedUserId) {
        const profile = await dbService.getProfile(storedUserId);
        if (profile) {
          setUser(profile);
        }
      }

      // Supabase auth state listener
      if (!isDemoMode && supabase) {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (session?.user) {
            const profile = await dbService.getProfile(session.user.id);
            if (profile) {
              setUser({ ...profile, email: profile.email || session.user.email });
            }
          } else if (event === 'SIGNED_OUT') {
            setUser(null);
            localStorage.removeItem('kobowise_session_user');
          }
        });

        return () => {
          subscription.unsubscribe();
        };
      }

      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const isDemoEmail = email.includes('buyer@delsu.edu') || email.includes('trader@delsu.edu');
      
      if (isDemoMode || isDemoEmail) {
        if (isDemoEmail && !isSupabaseConfigured) {
          localStorage.setItem('kobowise_use_demo_mode', 'true');
        }
        // Ensure mock database is seeded in localStorage
        initializeMockDb();

        const profiles = JSON.parse(localStorage.getItem('kobowise_profiles') || '[]');
        let profile = null;

        const cleanEmail = email.trim().toLowerCase();
        if (cleanEmail === 'trader@delsu.edu') {
          profile = profiles.find((p: any) => p.role === 'trader');
        } else if (cleanEmail === 'buyer@delsu.edu') {
          profile = profiles.find((p: any) => p.id === 'buyer-1') || profiles.find((p: any) => p.role === 'buyer');
        } else {
          // Search by email match
          profile = profiles.find((p: any) => p.email && p.email.toLowerCase() === cleanEmail) || null;
        }

        if (profile) {
          setUser(profile);
          localStorage.setItem('kobowise_session_user', profile.id);
          
          if (isDemoEmail) {
            const targetRole = profile.role;
            window.location.hash = targetRole === 'trader' ? '#/trader-dashboard' : '#/home';
            setTimeout(() => {
              window.location.reload();
            }, 100);
          }
          return { success: true };
        }
        return { success: false, error: 'User profile not found. Please create an account.' };
      } else {
        const { data, error } = await supabase!.auth.signInWithPassword({ email, password });
        if (error) throw error;
        
        if (data.user) {
          const profile = await dbService.getProfile(data.user.id);
          if (profile) {
            setUser({ ...profile, email: profile.email || data.user.email });
          }
          return { success: true };
        }
        return { success: false, error: 'Sign in failed.' };
      }
    } catch (err: any) {
      return { success: false, error: formatAuthError(err) };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (
    email: string,
    password: string,
    role: 'buyer' | 'trader',
    fullName: string,
    phoneNumber: string,
    studentId?: string
  ): Promise<{ success: boolean; error?: string; waitlisted?: boolean }> => {
    setLoading(true);
    try {
      // --- TRADER WAITLIST FLOW ---
      if (role === 'trader') {
        // Store trader details in waitlist (both demo & live mode)
        const waitlistResult = await dbService.addToTraderWaitlist(
          fullName,
          email,
          phoneNumber
        );

        if (!waitlistResult.success) {
          return { success: false, error: waitlistResult.error };
        }

        // In live mode, send a confirmation email via Supabase Auth
        if (!isDemoMode && supabase) {
          try {
            await supabase.auth.signUp({
              email,
              password: password && password !== 'waitlist-placeholder' ? password : `KbW-Waitlist#${Date.now()}`,
              options: {
                emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
                data: {
                  full_name: fullName,
                  phone_number: phoneNumber,
                  role: 'trader',
                  is_waitlisted: true
                }
              }
            });
          } catch (emailErr) {
            console.warn('Supabase auth email trigger warning:', emailErr);
          }
        }

        return { success: true, waitlisted: true };
      }

      // --- BUYER SIGNUP FLOW ---
      if (isDemoMode) {
        const profiles = JSON.parse(localStorage.getItem('kobowise_profiles') || '[]');
        const newId = `user-${Date.now()}`;
        const newProfile: Profile = {
          id: newId,
          role,
          full_name: fullName,
          email: email,
          phone_number: phoneNumber,
          student_id: role === 'buyer' ? studentId : undefined,
          avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName)}`
        };

        profiles.push(newProfile);
        localStorage.setItem('kobowise_profiles', JSON.stringify(profiles));
        setUser(newProfile);
        localStorage.setItem('kobowise_session_user', newId);

        // Add welcome notification
        const notifications = JSON.parse(localStorage.getItem('kobowise_notifications') || '[]');
        notifications.push({
          id: `notif-${Date.now()}`,
          user_id: newId,
          title: 'Account Created!',
          message: `Welcome to KoboWise, ${fullName}! You are registered as a ${role}.`,
          is_read: false,
          created_at: new Date().toISOString()
        });
        localStorage.setItem('kobowise_notifications', JSON.stringify(notifications));

        return { success: true };
      } else {
        const { data, error } = await supabase!.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
            data: {
              role,
              full_name: fullName,
              phone_number: phoneNumber,
              student_id: studentId,
              avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName)}`
            }
          }
        });
        
        if (error) throw error;
        
        if (data.user) {
          // In Supabase, the trigger will create the profile automatically.
          // Wait 1.5 seconds for trigger to execute, then retrieve profile.
          await new Promise(resolve => setTimeout(resolve, 1500));
          const profile = await dbService.getProfile(data.user.id);
          setUser(profile);
          return { success: true };
        }
        return { success: false, error: 'Registration succeeded, check your email for verification.' };
      }
    } catch (err: any) {
      return { success: false, error: formatAuthError(err) };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      const wasDemoModeForced = localStorage.getItem('kobowise_use_demo_mode') === 'true';
      localStorage.removeItem('kobowise_session_user');
      localStorage.removeItem('kobowise_use_demo_mode');
      
      if (isDemoMode || wasDemoModeForced) {
        setUser(null);
        window.location.hash = '#/login';
        setTimeout(() => {
          window.location.reload();
        }, 100);
      } else {
        await supabase!.auth.signOut();
        setUser(null);
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Demo helper: allows switching roles instantly to inspect both layouts
  const switchRole = (role: 'buyer' | 'trader') => {
    if (!user) return;
    if (isDemoMode) {
      const profiles = JSON.parse(localStorage.getItem('kobowise_profiles') || '[]');
      // Find or create a matching profile
      let targetProfile = profiles.find((p: any) => p.role === role);
      if (!targetProfile) {
        // Fallback to updating the current user role directly
        const updatedUser = { ...user, role };
        const updatedProfiles = profiles.map((p: any) => p.id === user.id ? updatedUser : p);
        localStorage.setItem('kobowise_profiles', JSON.stringify(updatedProfiles));
        setUser(updatedUser);
      } else {
        setUser(targetProfile);
        localStorage.setItem('kobowise_session_user', targetProfile.id);
      }
    } else {
      // In live mode, we just update local state (temp override for visual checking)
      setUser({ ...user, role });
    }
  };

  const updateUserProfile = async (updates: Partial<Profile>): Promise<boolean> => {
    if (!user) return false;
    const updated = await dbService.updateProfile(user.id, updates);
    if (updated) {
      setUser(updated);
      return true;
    }
    return false;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signUp, logout, switchRole, updateUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
