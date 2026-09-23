'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/authContext';
import AdminPortalModal from '@/components/admin/AdminPortalModal';
import { Ticket, Flag, MapPin, User, Building2, LogOut, ChevronDown, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  onOpenTrackTicket: () => void;
  onOpenReport?: () => void;
}

export default function Navbar({ onOpenTrackTicket, onOpenReport }: NavbarProps) {
  const { user, logout, openLoginModal, loginAs } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isAdminPortalOpen, setIsAdminPortalOpen] = useState(false);

  const isAdmin = user?.role === 'admin';

  return (
    <>
      <nav className="w-full bg-white border-b border-gray-100 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand */}
          <Link href="/" className="flex items-center space-x-3 hover:opacity-90 transition">
            <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center shadow-xs overflow-hidden">
              <img src="/logo.png" alt="CivicLens Logo" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center space-x-1.5">
                <span className="text-xl font-black tracking-tight text-gray-900">CIVICLENS</span>
              </div>
              <span className="text-xs text-gray-500 font-medium hidden sm:inline-block">
                Neighborhood Intelligence &amp; Response Assistant
              </span>
            </div>
          </Link>

          {/* Right CTA Group */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Map Link */}
            <Link
              href="/map"
              className="flex items-center space-x-1.5 text-sm font-semibold text-gray-700 hover:text-amber-600 px-3 py-1.5 rounded-lg transition"
            >
              <MapPin className="w-4 h-4 text-amber-500" />
              <span className="hidden sm:inline">Public Map</span>
            </Link>

            {/* Track Ticket */}
            <button
              onClick={onOpenTrackTicket}
              className="hidden md:flex items-center space-x-1.5 text-sm font-semibold text-gray-700 hover:text-amber-600 px-3 py-1.5 rounded-lg transition"
            >
              <Ticket className="w-4 h-4 text-amber-500" />
              <span>Track Ticket</span>
            </button>

            {/* Admin Portal Shortcut (visible when Admin is logged in) */}
            {isAdmin && (
              <button
                onClick={() => setIsAdminPortalOpen(true)}
                className="flex items-center space-x-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs sm:text-sm font-bold px-3 py-1.5 rounded-full transition shadow-2xs"
              >
                <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                <span>Admin Portal</span>
              </button>
            )}

            {/* User Profile / Dummy Login Trigger */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition shadow-2xs ${
                    isAdmin
                      ? 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700'
                      : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                  }`}
                >
                  {isAdmin ? <Building2 className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                  <span className="max-w-[120px] truncate">{user.name}</span>
                  <ChevronDown className="w-3 h-3 opacity-75" />
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-xs font-bold text-gray-900">{user.name}</p>
                      <p className="text-[11px] text-gray-500 truncate">{user.email}</p>
                      <div className="mt-1">
                        <span className={`inline-block text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                          isAdmin ? 'bg-indigo-100 text-indigo-800' : 'bg-amber-100 text-amber-900'
                        }`}>
                          {isAdmin ? 'Municipal Authority (Admin)' : 'Citizen Reporter'}
                        </span>
                      </div>
                    </div>

                    <div className="p-2 space-y-1">
                      {isAdmin ? (
                        <button
                          onClick={() => {
                            setIsAdminPortalOpen(true);
                            setShowUserMenu(false);
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-indigo-700 hover:bg-indigo-50 flex items-center space-x-2"
                        >
                          <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Open Municipal Portal</span>
                        </button>
                      ) : null}

                      <button
                        onClick={() => {
                          loginAs(isAdmin ? 'citizen' : 'admin');
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                        <span>Switch to {isAdmin ? 'Citizen Reporter' : 'Municipal Admin'}</span>
                      </button>

                      <button
                        onClick={() => {
                          logout();
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center space-x-2"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={openLoginModal}
                className="flex items-center space-x-1.5 text-xs sm:text-sm font-bold text-gray-700 hover:text-amber-600 bg-gray-100 hover:bg-gray-200 px-3.5 py-1.5 rounded-full transition shadow-2xs"
              >
                <User className="w-3.5 h-3.5 text-gray-600" />
                <span>Sign In / Role</span>
              </button>
            )}

            {/* Primary Action: Report Issue */}
            <button
              onClick={onOpenReport || onOpenTrackTicket}
              className="flex items-center space-x-1.5 bg-amber-400 hover:bg-amber-500 text-gray-950 text-xs sm:text-sm font-black px-4 py-2 rounded-full shadow-sm hover:shadow transition transform active:scale-95"
            >
              <Flag className="w-3.5 h-3.5" />
              <span>Report Issue</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Admin Portal Slide-Over / Modal */}
      <AdminPortalModal
        isOpen={isAdminPortalOpen}
        onClose={() => setIsAdminPortalOpen(false)}
      />
    </>
  );
}
