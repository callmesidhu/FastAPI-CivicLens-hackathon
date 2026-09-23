'use client';

import React from 'react';
import Link from 'next/link';
import { MapPin, Flag } from 'lucide-react';
import { useScrollY } from '@/hooks/useParallax';

interface HeroSectionProps {
  onReportClick: () => void;
  onViewMapClick: () => void;
}

export default function HeroSection({ onReportClick }: HeroSectionProps) {
  const scrollY = useScrollY();

  // Multi-tier Parallax layer shifts (depth velocities)
  const bgWaveOffset = scrollY * 0.3;
  const logoOffset = scrollY * -0.1;
  const taglineOffset = scrollY * 0.08;
  const headingOffset = scrollY * 0.15;
  const textOffset = scrollY * 0.22;
  const ctaOffset = scrollY * 0.28;

  return (
    <section
      className="relative bg-[#3D1860] text-[#F5EDF7] pt-14 pb-28 px-4 sm:px-6 lg:px-8 overflow-hidden flex flex-col items-center justify-center text-center rounded-b-[48px] md:rounded-b-[60px] shadow-2xl"
      style={{ isolation: 'isolate' }}
    >
      {/* ── Background Water Waves (Parallax Depth Layer) ── */}
      <div
        className="absolute inset-0 pointer-events-none overflow-hidden select-none opacity-20"
        style={{
          transform: `translateY(${bgWaveOffset}px)`,
          willChange: 'transform',
        }}
      >
        <svg
          className="absolute bottom-0 left-0 right-0 w-full h-40 text-[#BB99CD]"
          viewBox="0 0 1440 320"
          fill="currentColor"
          preserveAspectRatio="none"
        >
          <path d="M0,192L48,197.3C96,203,192,213,288,192C384,171,480,117,576,117.3C672,117,768,171,864,186.7C960,203,1056,181,1152,165.3C1248,149,1344,139,1392,133.3L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" />
        </svg>
      </div>

      {/* ── Parallax Foreground Content (No Zoom) ── */}
      <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">

        {/* ── Central Logo Badge (Border preserved as instructed) ── */}
        <div
          className="float-gentle mb-4"
          style={{
            transform: `translateY(${logoOffset}px)`,
            willChange: 'transform',
          }}
        >
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white shadow-2xl flex items-center justify-center border-4 border-[#BB99CD] p-2.5 overflow-hidden hover:scale-105 transition-transform duration-300">
            <img src="/logo.png" alt="CivicLens Logo" className="w-full h-full object-contain" />
          </div>
        </div>

        {/* ── Tagline pill ── */}
        <div
          className="inline-flex items-center space-x-2 bg-[#643579] border border-[#BB99CD]/40 text-[#F5EDF7] text-xs sm:text-sm font-semibold px-4 py-1.5 rounded-full shadow-md mb-4"
          style={{
            transform: `translateY(${taglineOffset}px)`,
            willChange: 'transform',
          }}
        >
          <span>A Keralam Municipal &amp; Civic Tech Initiative</span>
        </div>

        {/* ── 3D big heading ── */}
        <h1
          className="text-6xl sm:text-7xl md:text-8xl font-black tracking-tight hero-3d-title mb-2 select-none"
          style={{
            transform: `translateY(${headingOffset}px)`,
            willChange: 'transform',
          }}
        >
          CIVICLENS
        </h1>

        {/* ── Sub-content block (tagline + description) ── */}
        <div
          style={{
            transform: `translateY(${textOffset}px)`,
            willChange: 'transform',
          }}
        >
          <p className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#BB99CD] tracking-wide mb-3">
            Find • Report • Improve
          </p>

          <p className="max-w-2xl text-xs sm:text-sm md:text-base text-[#F5EDF7]/90 font-normal leading-relaxed mb-6">
            Find nearby clean public toilets and verified drinking water points across Kerala with live status, or report facility issues in seconds. Every report is routed directly to local municipal ward teams with live tracking until resolved.
          </p>
        </div>

        {/* ── Badges & Action Buttons (Independent Parallax Velocity) ── */}
        <div
          style={{
            transform: `translateY(${ctaOffset}px)`,
            willChange: 'transform',
          }}
          className="flex flex-col items-center w-full"
        >
          {/* Quick Filter Badges */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="inline-flex items-center bg-[#4F2070] border border-[#BB99CD]/30 text-xs px-3.5 py-1 rounded-full text-[#F5EDF7] font-medium">
              Drinking Water
            </span>
            <span className="inline-flex items-center bg-[#4F2070] border border-[#BB99CD]/30 text-xs px-3.5 py-1 rounded-full text-[#F5EDF7] font-medium">
              Clean Toilets
            </span>
            <span className="inline-flex items-center bg-[#4F2070] border border-[#BB99CD]/30 text-xs px-3.5 py-1 rounded-full text-[#F5EDF7] font-medium">
              Offline Ready
            </span>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full sm:w-auto">
            <button
              onClick={onReportClick}
              className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-[#F5EDF7] hover:bg-white text-[#3D1860] px-7 py-3.5 rounded-full font-black text-sm sm:text-base shadow-xl hover:shadow-2xl transition transform active:scale-95 cursor-pointer"
            >
              <Flag className="w-4 h-4 text-[#3D1860]" />
              <span>Report Issue</span>
            </button>

            <Link
              href="/map"
              className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-[#643579] hover:bg-[#522964] border border-[#BB99CD]/50 text-[#F5EDF7] px-7 py-3.5 rounded-full font-bold text-sm sm:text-base shadow-lg hover:shadow-xl transition transform active:scale-95"
            >
              <MapPin className="w-4 h-4 text-[#BB99CD]" />
              <span>View Public Map</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
