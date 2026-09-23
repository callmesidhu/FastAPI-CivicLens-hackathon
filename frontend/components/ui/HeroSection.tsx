'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { Sparkles, MapPin, Flag } from 'lucide-react';
import { useScrollY } from '@/hooks/useParallax';

interface HeroSectionProps {
  onReportClick: () => void;
  onViewMapClick: () => void;
}

export default function HeroSection({ onReportClick, onViewMapClick }: HeroSectionProps) {
  const scrollY = useScrollY();

  // Parallax speeds: lower = slower (background), higher = faster (foreground floats)
  const bgGridOffset  = scrollY * 0.35;   // grid drifts up slowly
  const blobOffset    = scrollY * 0.20;   // ambient glow blob
  const logoOffset    = scrollY * -0.08;  // logo bobs slightly against scroll
  const taglineOffset = scrollY * 0.12;   // tagline pill rises gently
  const headingOffset = scrollY * 0.18;   // heading has moderate depth
  const textOffset    = scrollY * 0.22;   // description & CTAs move faster

  return (
    <section
      className="relative bg-[#3D1860] text-[#F5EDF7] pt-16 pb-28 px-4 sm:px-6 lg:px-8 overflow-hidden flex flex-col items-center justify-center text-center rounded-b-[48px] md:rounded-b-[60px] shadow-2xl"
      style={{ isolation: 'isolate' }}
    >
      {/* ── Layer 1: Background dot grid — moves slowest ── */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, #BB99CD 1px, transparent 0)',
          backgroundSize: '24px 24px',
          transform: `translateY(${bgGridOffset}px)`,
          willChange: 'transform',
        }}
      />

      {/* ── Layer 2: Large ambient glow blob — drifts very slowly ── */}
      <div
        className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full pointer-events-none drift-slow"
        style={{
          background: 'radial-gradient(circle, rgba(187,153,205,0.18) 0%, transparent 70%)',
          transform: `translateY(${blobOffset}px)`,
          willChange: 'transform',
        }}
      />
      <div
        className="absolute -bottom-20 -left-24 w-80 h-80 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(100,53,121,0.25) 0%, transparent 70%)',
          transform: `translateY(${-blobOffset * 0.7}px)`,
          willChange: 'transform',
        }}
      />

      {/* ── Content layers ── */}
      <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">

        {/* ── Layer 3: Logo badge — floats against scroll (depth pop) ── */}
        <div
          className="float-gentle mb-6"
          style={{
            transform: `translateY(${logoOffset}px)`,
            willChange: 'transform',
          }}
        >
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white shadow-2xl flex items-center justify-center border-4 border-[#BB99CD] p-2.5 overflow-hidden hover:scale-105 transition-transform duration-300">
            <img src="/logo.png" alt="CivicLens Logo" className="w-full h-full object-contain" />
          </div>
        </div>

        {/* ── Layer 4: Tagline pill ── */}
        <div
          className="inline-flex items-center space-x-2 bg-[#643579] border border-[#BB99CD]/40 text-[#F5EDF7] text-xs sm:text-sm font-semibold px-4 py-1.5 rounded-full shadow-md mb-6 backdrop-blur-xs"
          style={{
            transform: `translateY(${taglineOffset}px)`,
            willChange: 'transform',
          }}
        >
          <Sparkles className="w-3.5 h-3.5 text-[#BB99CD] fill-[#BB99CD]" />
          <span>A Keralam Municipal &amp; Civic Tech Initiative</span>
        </div>

        {/* ── Layer 5: 3D big heading ── */}
        <h1
          className="text-6xl sm:text-7xl md:text-8xl font-black tracking-tight hero-3d-title mb-4 select-none"
          style={{
            transform: `translateY(${headingOffset}px)`,
            willChange: 'transform',
          }}
        >
          CIVICLENS
        </h1>

        {/* ── Layer 6: Sub-content block (description + CTAs) ── */}
        <div
          style={{
            transform: `translateY(${textOffset}px)`,
            willChange: 'transform',
          }}
        >
          <p className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#BB99CD] mb-4">
            From a reported issue to a smarter city.
          </p>

          <p className="max-w-2xl text-sm sm:text-base text-[#F5EDF7]/90 font-normal leading-relaxed mb-8">
            Report public facilities, water points, and sanitation issues in seconds. Your report is automatically sent to the local municipal ward team with live progress tracking until it is cleared.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto mb-10">
            <button
              onClick={onReportClick}
              className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-[#F5EDF7] hover:bg-white text-[#3D1860] px-7 py-3.5 rounded-full font-black text-sm sm:text-base shadow-xl hover:shadow-2xl transition transform active:scale-95"
            >
              <Flag className="w-4 h-4 text-[#3D1860]" />
              <span>Report Issue</span>
            </button>

            <Link
              href="/map"
              className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-[#643579]/60 hover:bg-[#643579] border border-[#BB99CD]/50 text-[#F5EDF7] px-7 py-3.5 rounded-full font-bold text-sm sm:text-base shadow-lg hover:shadow-xl transition transform active:scale-95"
            >
              <MapPin className="w-4 h-4 text-[#BB99CD]" />
              <span>View Public Map</span>
            </Link>
          </div>

          {/* Highlight Banners */}
          <div className="flex flex-col items-center space-y-2.5">
            <div className="bg-[#643579] hover:bg-[#643579]/90 border border-[#BB99CD]/30 text-[#F5EDF7] font-extrabold text-sm sm:text-base px-8 py-2.5 rounded-2xl shadow-lg transition">
              Clean Kochi • 100% Verified Amenities
            </div>
            <div className="bg-[#1f0b33] border border-[#BB99CD]/20 text-[#BB99CD] text-xs sm:text-sm font-medium px-5 py-1 rounded-full shadow-md flex items-center space-x-2">
              <span>Monsoon Readiness • 24/7 Municipal Response</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
