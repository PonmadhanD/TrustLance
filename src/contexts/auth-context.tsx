"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  username: string;
  balance: number;
  currency: string;
  wallet_address?: string;
  avatar_url?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (firstName: string, lastName: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  linkWallet: (address: string) => Promise<{ success: boolean; error?: string }>;
  authChecked: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Generate unique username from email
async function generateUsername(email: string): Promise<string> {
  const baseUsername = email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '_');

  // Check if base username exists
  const { data: existingUsers } = await supabase
    .from('users')
    .select('username')
    .eq('username', baseUsername);

  if (!existingUsers || existingUsers.length === 0) {
    return baseUsername;
  }

  // Find unique username with suffix
  let suffix = 2;
  let username = `${baseUsername}_${suffix}`;

  while (true) {
    const { data } = await supabase
      .from('users')
      .select('username')
      .eq('username', username);

    if (!data || data.length === 0) {
      return username;
    }

    suffix++;
    username = `${baseUsername}_${suffix}`;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const router = useRouter();

  // Check auth state on mount
  useEffect(() => {
    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        await loadUserProfile(session.user);
        setAuthChecked(true);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsAuthenticated(false);
        setAuthChecked(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function checkUser() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await loadUserProfile(session.user);
      }
    } catch (error) {
      console.error('Error checking auth:', error);
    } finally {
      setLoading(false);
      setAuthChecked(true);
    }
  }

  async function loadUserProfile(authUser: SupabaseUser) {
    try {
      // Get user profile from database
      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error) throw error;

      if (profile) {
        setUser({
          id: profile.id,
          name: profile.name,
          email: profile.email,
          role: profile.role,
          username: profile.username,
          balance: profile.balance || 0,
          currency: profile.currency || 'INR',
          wallet_address: profile.wallet_address,
          avatar_url: profile.avatar_url
        });
        setIsAuthenticated(true);
        setAuthChecked(true);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  }

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        await loadUserProfile(data.user);
        router.push('/dashboard');
        return { success: true };
      }

      return { success: false, error: 'Login failed' };
    } catch (error: any) {
      return { success: false, error: error.message || 'An error occurred' };
    }
  };

  const signup = async (
    firstName: string,
    lastName: string,
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: `${firstName} ${lastName}`,
          }
        }
      });

      if (authError) {
        return { success: false, error: authError.message };
      }

      if (authData.user) {
        // Generate unique username
        const username = await generateUsername(email);

        // Create user profile in database
        const { error: profileError } = await supabase.from('users').insert({
          id: authData.user.id,
          email: email,
          name: `${firstName} ${lastName}`,
          username: username,
          role: 'freelancer',
          membership_tier: 'free',
          balance: 0,
          currency: 'INR',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

        if (profileError) {
          console.error('Profile creation error:', profileError);
          return { success: false, error: 'Failed to create user profile' };
        }

        await loadUserProfile(authData.user);
        router.push('/dashboard');
        return { success: true };
      }

      return { success: false, error: 'Signup failed' };
    } catch (error: any) {
      return { success: false, error: error.message || 'An error occurred' };
    }
  };

  const signInWithGoogle = async (): Promise<void> => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });

      if (error) {
        console.error('Google sign-in error:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setUser(null);
    router.push('/login');
  };

  const linkWallet = async (walletAddress: string): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'No user logged in' };
    }

    const normalizedAddress = walletAddress.toLowerCase();

    try {
      // Check if wallet already linked to another user
      const { data: existingWallet } = await supabase
        .from('users')
        .select('id, username')
        .eq('wallet_address', normalizedAddress)
        .single();

      if (existingWallet && existingWallet.id !== user.id) {
        return {
          success: false,
          error: `This wallet is already linked to user @${existingWallet.username}`
        };
      }

      // Check if user already has a wallet
      if (user.wallet_address && user.wallet_address !== normalizedAddress) {
        return {
          success: false,
          error: 'You have already linked a wallet. Wallet binding is permanent and cannot be changed.'
        };
      }

      // Link wallet to current user
      const { error } = await supabase
        .from('users')
        .update({ wallet_address: normalizedAddress })
        .eq('id', user.id);

      if (error) {
        return { success: false, error: error.message };
      }

      // Update local user state
      setUser({ ...user, wallet_address: normalizedAddress });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to link wallet' };
    }
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      user,
      loading,
      authChecked,
      login,
      signup,
      signInWithGoogle,
      logout,
      linkWallet
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}