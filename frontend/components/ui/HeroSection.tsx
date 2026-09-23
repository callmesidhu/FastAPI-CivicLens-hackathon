'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, MapPin, Flag } from 'lucide-react';
import { useScrollY } from '@/hooks/useParallax';

interface HeroSectionProps {
  onReportClick: () => void;
  onViewMapClick: () => void;
}

export default function HeroSection({ onReportClick }: HeroSectionProps) {
  const scrollY = useScrollY();

  // Parallax subtle shifts for foreground elements
  const logoOffset = scrollY * -0.08;
  const taglineOffset = scrollY * 0.12;
  const headingOffset = scrollY * 0.18;
  const textOffset = scrollY * 0.22;

  return (
    <section
      className="relative bg-[#3D1860] text-[#F5EDF7] pt-16 pb-28 px-4 sm:px-6 lg:px-8 overflow-hidden flex flex-col items-center justify-center text-center rounded-b-[48px] md:rounded-b-[60px] shadow-2xl"
      style={{ isolation: 'isolate' }}
    >
      {/* ── Content layers — Clean, Solid & Architectural (No Gradients) ── */}
      <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
        {/* ── Logo badge — floats against scroll ── */}
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

        {/* ── Tagline pill ── */}
        <div
          className="inline-flex items-center space-x-2 bg-[#643579] border border-[#BB99CD]/40 text-[#F5EDF7] text-xs sm:text-sm font-semibold px-4 py-1.5 rounded-full shadow-md mb-6"
          style={{
            transform: `translateY(${taglineOffset}px)`,
            willChange: 'transform',
          }}
        >
          <Sparkles className="w-3.5 h-3.5 text-[#BB99CD] fill-[#BB99CD]" />
          <span>A Keralam Municipal &amp; Civic Tech Initiative</span>
        </div>

        {/* ── 3D big heading ── */}
        <h1
          className="text-6xl sm:text-7xl md:text-8xl font-black tracking-tight hero-3d-title mb-4 select-none"
          style={{
            transform: `translateY(${headingOffset}px)`,
            willChange: 'transform',
          }}
        >
          CIVICLENS
        </h1>

        {/* ── Sub-content block (description + CTAs) ── */}
        <div
          style={{
            transform: `translateY(${textOffset}px)`,
            willChange: 'transform',
          }}
        >
          <p className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#BB99CD] tracking-wide mb-4">
            Find • Report • Improve
          </p>

          <p className="max-w-2xl text-sm sm:text-base text-[#F5EDF7]/90 font-normal leading-relaxed mb-8">
            Find nearby clean public toilets and verified drinking water points across Kerala with live status, or report facility issues in seconds. Every report is routed directly to local municipal ward teams with live tracking until resolved.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
            <button
              onClick={onReportClick}
              className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-[#F5EDF7] hover:bg-white text-[#3D1860] px-7 py-3.5 rounded-full font-black text-sm sm:text-base shadow-xl hover:shadow-2xl transition transform active:scale-95"
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
