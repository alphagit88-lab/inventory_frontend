'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, User } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, tenantId?: string, locationId?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refreshUser = async () => {
    try {
      const response = await api.getProfile();
      setUser(response.user);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string, tenantId?: string, locationId?: string) => {
    const response = await api.login(email, password, tenantId, locationId);
    setUser(response.user);
    router.push(getDashboardPath(response.user.role));
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (error) {
      // Ignore errors on logout
    }
    setUser(null);
    router.push('/login');
  };

  const getDashboardPath = (role: string) => {
    switch (role) {
      case 'super_admin':
        return '/dashboard/super-admin';
      case 'store_admin':
        return '/dashboard/store-admin';
      case 'location_user':
        return '/dashboard/location-user';
      default:
        return '/dashboard';
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
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

