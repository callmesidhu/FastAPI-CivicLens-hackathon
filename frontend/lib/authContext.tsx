'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loginUser, fetchUserTickets, claimTicket as apiClaimTicket } from './api';

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

export interface TrackedTicket {
  ticketNumber: string;
  facilityName?: string;
  department?: string;
  localBodyName?: string;
  status: string;
  priority?: string;
  createdAt: string;
  expectedResponse?: string;
  imageUrl?: string;
  resolutionNotes?: string;
  resolvedImageUrl?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  resolvedByName?: string;
  userEmail?: string;
  updatedAt?: string;
}

export const DUMMY_CITIZEN: AuthUser = {
  id: 'user_cit_001',
  name: 'Citizen Reporter',
  role: 'citizen',
  email: 'user@civiclens.com',
  ward: 'Ward 14 (Fort Kochi)',
  title: 'Active Citizen Reporter',
};

export const DUMMY_ADMIN: AuthUser = {
  id: 'user_adm_001',
  name: 'Kochi Municipal Authority',
  role: 'admin',
  email: 'admin@civiclens.com',
  department: 'Health & Municipal Sanitation Dept',
  ward: 'Wards 1-25 (Central Zone)',
  title: 'Municipal Sanitation Inspector',
};

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<AuthUser>;
  loginAs: (role: UserRole, customName?: string) => Promise<void>;
  logout: () => void;
  isLoginModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  trackedTickets: TrackedTicket[];
  saveUserTicket: (ticket: any) => void;
  refreshTickets: () => Promise<void>;
  claimTicketNumber: (ticketNumber: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [trackedTickets, setTrackedTickets] = useState<TrackedTicket[]>([]);

  // 1. Initial load of user and tickets from localStorage
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('civiclens_auth_user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error('Failed to load user from localStorage', e);
    }

    try {
      const storedTickets = localStorage.getItem('civiclens_user_tickets');
      if (storedTickets) {
        setTrackedTickets(JSON.parse(storedTickets));
      }
    } catch (e) {
      console.error('Failed to load tickets from localStorage', e);
    }
  }, []);

  // 2. Fetch/sync tickets for user strictly from backend
  const refreshTickets = useCallback(async () => {
    try {
      const isAdmin = user?.role === 'admin';
      const backendTickets = await fetchUserTickets(
        isAdmin ? undefined : user?.email,
        undefined
      );

      if (Array.isArray(backendTickets)) {
        const mapped: TrackedTicket[] = backendTickets.map((bt: any) => ({
          ticketNumber: bt.ticketNumber,
          facilityName: bt.facilityName,
          department: bt.department,
          localBodyName: bt.localBodyName,
          status: bt.status,
          priority: bt.priority,
          createdAt: bt.createdAt,
          expectedResponse: bt.expectedResponse,
          imageUrl: bt.imageUrl,
          resolutionNotes: bt.resolutionNotes,
          resolvedImageUrl: bt.resolvedImageUrl,
          resolvedAt: bt.resolvedAt,
          resolvedBy: bt.resolvedBy,
          resolvedByName: bt.resolvedByName,
          userEmail: bt.userEmail,
          updatedAt: bt.updatedAt,
        }));

        mapped.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        setTrackedTickets(mapped);
        try {
          localStorage.setItem('civiclens_user_tickets', JSON.stringify(mapped));
        } catch {}
      }
    } catch (e) {
      console.warn('Could not sync tickets with backend', e);
    }
  }, [user?.email, user?.role]);

  useEffect(() => {
    if (user?.email) {
      refreshTickets();
    }
  }, [user?.email, refreshTickets]);

  // 3. Save a ticket locally and sync to state
  const saveUserTicket = useCallback(
    (ticket: any) => {
      if (!ticket || !ticket.ticketNumber) return;

      const newTicket: TrackedTicket = {
        ticketNumber: ticket.ticketNumber,
        facilityName: ticket.facilityName || ticket.facility?.name || 'Reported Facility',
        department: ticket.department,
        localBodyName: ticket.localBody,
        status: ticket.status || 'submitted',
        priority: ticket.priority,
        createdAt: ticket.createdAt || new Date().toISOString(),
        expectedResponse: ticket.expectedResponse,
        imageUrl: ticket.imageUrl,
        resolutionNotes: ticket.resolutionNotes,
        resolvedImageUrl: ticket.resolvedImageUrl,
        resolvedAt: ticket.resolvedAt,
        updatedAt: ticket.updatedAt,
      };

      setTrackedTickets((prev) => {
        const filtered = prev.filter((t) => t.ticketNumber !== newTicket.ticketNumber);
        const updated = [newTicket, ...filtered];
        try {
          localStorage.setItem('civiclens_user_tickets', JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });

      // Claim ticket on backend if user is logged in
      if (user?.email) {
        apiClaimTicket(newTicket.ticketNumber, user.email).catch(() => {});
      }
    },
    [user?.email]
  );

  // 4. Claim ticket by ticket number
  const claimTicketNumber = useCallback(
    async (ticketNumber: string) => {
      const cleanNum = ticketNumber.trim().toUpperCase();
      if (!cleanNum) return;

      if (user?.email) {
        try {
          const res = await apiClaimTicket(cleanNum, user.email);
          saveUserTicket(res);
          return;
        } catch (e) {}
      }

      // Fallback: save ticket stub into state and local storage
      saveUserTicket({
        ticketNumber: cleanNum,
        status: 'submitted',
        createdAt: new Date().toISOString(),
      });
      await refreshTickets();
    },
    [user?.email, saveUserTicket, refreshTickets]
  );

  // 5. Normal login using email & password
  const login = async (email: string, pass: string): Promise<AuthUser> => {
    try {
      const data = await loginUser(email, pass);
      const authUser: AuthUser = {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role as UserRole,
        title: data.title || (data.role === 'admin' ? 'Municipal Officer' : 'Active Citizen Reporter'),
        ward: data.ward,
        department: data.department,
      };

      setUser(authUser);
      localStorage.setItem('civiclens_auth_user', JSON.stringify(authUser));
      setIsLoginModalOpen(false);
      return authUser;
    } catch (err: any) {
      // Offline fallback: if backend is unreachable and credentials match default demo users
      const cleanEmail = email.trim().toLowerCase();
      if (cleanEmail === 'user@civiclens.com' && pass === 'password123') {
        const authUser = { ...DUMMY_CITIZEN };
        setUser(authUser);
        localStorage.setItem('civiclens_auth_user', JSON.stringify(authUser));
        setIsLoginModalOpen(false);
        return authUser;
      } else if (cleanEmail === 'admin@civiclens.com' && pass === 'admin123') {
        const authUser = { ...DUMMY_ADMIN };
        setUser(authUser);
        localStorage.setItem('civiclens_auth_user', JSON.stringify(authUser));
        setIsLoginModalOpen(false);
        return authUser;
      }
      throw err;
    }
  };

  // 6. Quick demo login
  const loginAs = async (role: UserRole, customName?: string) => {
    const email = role === 'admin' ? 'admin@civiclens.com' : 'user@civiclens.com';
    const pass = role === 'admin' ? 'admin123' : 'password123';

    try {
      const logged = await login(email, pass);
      if (customName && customName.trim()) {
        const modified = { ...logged, name: customName.trim() };
        setUser(modified);
        localStorage.setItem('civiclens_auth_user', JSON.stringify(modified));
      }
    } catch {
      // Fallback
      let selectedUser = role === 'admin' ? { ...DUMMY_ADMIN } : { ...DUMMY_CITIZEN };
      if (customName && customName.trim()) {
        selectedUser.name = customName.trim();
      }
      setUser(selectedUser);
      localStorage.setItem('civiclens_auth_user', JSON.stringify(selectedUser));
      setIsLoginModalOpen(false);
    }
  };

  // 7. Logout
  const logout = () => {
    setUser(null);
    setTrackedTickets([]);
    try {
      localStorage.removeItem('civiclens_auth_user');
      localStorage.removeItem('civiclens_user_tickets');
    } catch (e) {}
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        loginAs,
        logout,
        isLoginModalOpen,
        openLoginModal: () => setIsLoginModalOpen(true),
        closeLoginModal: () => setIsLoginModalOpen(false),
        trackedTickets,
        saveUserTicket,
        refreshTickets,
        claimTicketNumber,
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
