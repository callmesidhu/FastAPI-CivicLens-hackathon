'use client';

import React from 'react';

export default function Footer() {
  return (
    <footer className="w-full bg-white border-t border-gray-200/80 py-8 px-4 sm:px-6 lg:px-8 mt-12">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500 font-medium">
        {/* Brand */}
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-lg bg-white border border-gray-200 flex items-center justify-center shadow-2xs overflow-hidden p-0.5">
            <img src="/logo.png" alt="CivicLens" className="w-full h-full object-contain" />
          </div>
          <span className="font-extrabold text-gray-800">
            CIVICLENS
          </span>
          <span className="text-gray-400">—</span>
          <span>Neighborhood Intelligence &amp; Response Assistant</span>
        </div>

        {/* Copyright */}
        <div>
          <span>
            &copy; {new Date().getFullYear()} CivicLens Keralam. Civic Tech Infrastructure &amp; Municipal Operations Platform.
          </span>
        </div>
      </div>
    </footer>
  );
}
