'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, MapPin, Flag, ArrowRight, ShieldCheck, Flame } from 'lucide-react';

interface HeroSectionProps {
  onReportClick: () => void;
  onViewMapClick: () => void;
}

export default function HeroSection({ onReportClick, onViewMapClick }: HeroSectionProps) {
  return (
    <section className="relative bg-[#fbbf24] text-gray-900 pt-16 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden flex flex-col items-center justify-center text-center rounded-b-[48px] md:rounded-b-[60px] shadow-xl">
      {/* Background Decorative Grid */}
      <div 
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, #1e3a8a 1px, transparent 0)',
          backgroundSize: '24px 24px'
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
        {/* Circular Logo Badge */}
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white shadow-2xl flex items-center justify-center border-4 border-yellow-200 mb-6 p-2.5 transform hover:scale-105 transition overflow-hidden">
          <img src="/logo.png" alt="CivicLens Logo" className="w-full h-full object-contain" />
        </div>

        {/* Tagline Pill */}
        <div className="inline-flex items-center space-x-2 bg-blue-900 text-white text-xs sm:text-sm font-semibold px-4 py-1.5 rounded-full shadow-md mb-6">
          <Sparkles className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
          <span>A Keralam Municipal &amp; Civic Tech Initiative</span>
        </div>

        {/* 3D Big Heading */}
        <h1 className="text-6xl sm:text-7xl md:text-8xl font-black tracking-tight hero-3d-title mb-4 select-none">
          CIVICLENS
        </h1>

        {/* Subtitle */}
        <p className="text-xl sm:text-2xl md:text-3xl font-extrabold text-blue-900 mb-4">
          From a reported issue to a smarter city.
        </p>

        {/* Description */}
        <p className="max-w-2xl text-sm sm:text-base text-blue-950 font-medium leading-relaxed mb-8">
          Report public facilities, water points, and sanitation issues in seconds. Your report is automatically sent to the local municipal ward team with live progress tracking until it is cleared.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto mb-10">
          <button
            onClick={onReportClick}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-7 py-3.5 rounded-full font-bold text-sm sm:text-base shadow-xl hover:shadow-2xl transition transform active:scale-95"
          >
            <Flag className="w-4 h-4 text-white" />
            <span>Report Issue</span>
          </button>

          <Link
            href="/map"
            className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-white hover:bg-gray-50 border border-blue-200 text-blue-900 px-7 py-3.5 rounded-full font-bold text-sm sm:text-base shadow-lg hover:shadow-xl transition transform active:scale-95"
          >
            <MapPin className="w-4 h-4 text-blue-600" />
            <span>View Public Map</span>
          </Link>
        </div>

        {/* Highlight Banner Badges */}
        <div className="flex flex-col items-center space-y-2.5">
          <div className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm sm:text-base px-8 py-2.5 rounded-2xl shadow-lg transition">
            Clean Kochi • 100% Verified Amenities
          </div>

          <div className="bg-gray-900 text-white text-xs sm:text-sm font-medium px-5 py-1 rounded-full shadow-md flex items-center space-x-2">
            <span>Monsoon Readiness • 24/7 Municipal Response</span>
          </div>
        </div>
      </div>
    </section>
  );
}
