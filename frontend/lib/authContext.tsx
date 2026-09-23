'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'citizen' | 'admin';

export interface AuthUser {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  ward?: string;
  department?: string;
  title: string;
}

export const DUMMY_CITIZEN: AuthUser = {
  id: 'user_cit_001',
  name: 'Arun Kumar',
  role: 'citizen',
  email: 'arun.citizen@kerala.gov.in',
  ward: 'Ward 14 (Fort Kochi)',
  title: 'Active Citizen Reporter',
};

export const DUMMY_ADMIN: AuthUser = {
  id: 'user_adm_001',
  name: 'Kochi Municipal Authority',
  role: 'admin',
  email: 'sanitation.officer@kochicity.gov.in',
  department: 'Health & Municipal Sanitation Dept',
  ward: 'Wards 1-25 (Central Zone)',
  title: 'Municipal Sanitation Inspector',
};

interface AuthContextType {
  user: AuthUser | null;
  loginAs: (role: UserRole, customName?: string) => void;
  logout: () => void;
  isLoginModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('civiclens_auth_user');
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load user from localStorage', e);
    }
  }, []);

  const loginAs = (role: UserRole, customName?: string) => {
    let selectedUser = role === 'admin' ? { ...DUMMY_ADMIN } : { ...DUMMY_CITIZEN };
    if (customName && customName.trim()) {
      selectedUser.name = customName.trim();
    }
    setUser(selectedUser);
    try {
      localStorage.setItem('civiclens_auth_user', JSON.stringify(selectedUser));
    } catch (e) {}
    setIsLoginModalOpen(false);
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem('civiclens_auth_user');
    } catch (e) {}
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loginAs,
        logout,
        isLoginModalOpen,
        openLoginModal: () => setIsLoginModalOpen(true),
        closeLoginModal: () => setIsLoginModalOpen(false),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
