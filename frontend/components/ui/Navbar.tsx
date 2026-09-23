'use client';

import React from 'react';
import { Ticket, LogIn, Sparkles, MapPin } from 'lucide-react';

interface NavbarProps {
  onOpenTrackTicket: () => void;
  onOpenReport?: () => void;
}

export default function Navbar({ onOpenTrackTicket, onOpenReport }: NavbarProps) {
  return (
    <nav className="w-full bg-white border-b border-gray-100 sticky top-0 z-50 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shadow-xs">
            <span className="text-xl">🏛️</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center space-x-1.5">
              <span className="text-xl font-black tracking-tight text-gray-900">CIVICLENS</span>
            </div>
            <span className="text-xs text-gray-500 font-medium hidden sm:inline-block">
              Neighborhood Intelligence & Response Assistant
            </span>
          </div>
        </div>

        {/* Right CTA */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onOpenTrackTicket}
            className="flex items-center space-x-2 text-sm font-semibold text-gray-700 hover:text-blue-600 px-3 py-1.5 rounded-lg transition"
          >
            <Ticket className="w-4 h-4 text-blue-600" />
            <span className="hidden sm:inline">Track Ticket</span>
          </button>

          <button
            onClick={onOpenTrackTicket}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2 rounded-full shadow-sm hover:shadow transition transform active:scale-95"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
