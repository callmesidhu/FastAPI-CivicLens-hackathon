'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { MapPin, ArrowRight, Flame, Layers, Droplet, Users, Satellite } from 'lucide-react';
import { useScrollY, useInView } from '@/hooks/useParallax';

export default function MapPreviewCta() {
  const sectionRef   = useRef<HTMLElement>(null);
  const contentRef   = useRef<HTMLDivElement>(null);
  const pillsRef     = useRef<HTMLDivElement>(null);

  const contentInView = useInView(contentRef, 0.15);
  const pillsInView   = useInView(pillsRef, 0.1);

  const scrollY = useScrollY();

  // Parallax: the decorative glow blob drifts at a different rate than content
  const blobParallax = scrollY * 0.08;

  return (
    <section ref={sectionRef} className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="relative rounded-3xl bg-gradient-to-br from-[#3D1860] via-[#643579] to-[#1f0b33] text-white overflow-hidden shadow-2xl p-8 sm:p-12 md:p-16 border border-[#BB99CD]/40">

        {/* ── Decorative Grid ── */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, #BB99CD 1px, transparent 0)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* ── Ambient Glow Blob — parallax drift ── */}
        <div
          className="absolute top-0 right-0 w-96 h-96 bg-[#BB99CD]/20 rounded-full blur-3xl pointer-events-none drift-slow"
          style={{
            transform: `translateY(${blobParallax}px)`,
            willChange: 'transform',
          }}
        />
        <div
          className="absolute -bottom-12 -left-12 w-64 h-64 bg-[#3D1860]/60 rounded-full blur-2xl pointer-events-none"
          style={{
            transform: `translateY(${-blobParallax * 0.6}px)`,
            willChange: 'transform',
          }}
        />

        <div className="relative z-10 max-w-3xl">

          {/* Badge + Heading + Description — scroll reveal */}
          <div
            ref={contentRef}
            className={`reveal ${contentInView ? 'in-view' : ''}`}
          >
            <div className="inline-flex items-center space-x-2 bg-[#BB99CD]/20 border border-[#BB99CD]/40 text-[#F5EDF7] text-xs font-bold px-4 py-1.5 rounded-full mb-6 backdrop-blur-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>LIVE INTERACTIVE CIVIC MAP</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-4 text-white leading-tight">
              Explore Keralam&apos;s Public Infrastructure Map
            </h2>

            <p className="text-base sm:text-lg text-[#F5EDF7]/90 font-normal leading-relaxed mb-8 max-w-2xl">
              Locate nearby verified drinking water points, clean sanitation amenities, active crew maintenance dispatches, and chronic hotspot zones with high-resolution satellite imagery.
            </p>
          </div>

          {/* Feature Pills — staggered reveal */}
          <div
            ref={pillsRef}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10"
          >
            {[
              { Icon: Droplet, label: 'Water Points',   sub: 'Verified Safe',        fillClass: 'fill-[#BB99CD]', colorClass: 'text-[#BB99CD]', delay: 'reveal-delay-1' },
              { Icon: Users,   label: 'Public Toilets', sub: 'Accessible & Clean',   fillClass: '',              colorClass: 'text-[#F5EDF7]', delay: 'reveal-delay-2' },
              { Icon: Satellite, label: 'Satellite View', sub: 'Esri World Imagery', fillClass: '',              colorClass: 'text-[#BB99CD]', delay: 'reveal-delay-3' },
              { Icon: Flame,   label: 'Hotspots',       sub: 'Real-time Detection',  fillClass: '',              colorClass: 'text-[#F5EDF7]', delay: 'reveal-delay-4' },
            ].map(({ Icon, label, sub, fillClass, colorClass, delay }) => (
              <div
                key={label}
                className={`reveal ${delay} ${pillsInView ? 'in-view' : ''} bg-white/10 backdrop-blur-xs border border-white/10 rounded-2xl p-3 text-center flex flex-col items-center hover:bg-white/20 hover:scale-105 transition-all duration-300`}
              >
                <Icon className={`w-5 h-5 ${colorClass} ${fillClass} mb-1`} />
                <div className="text-xs font-bold text-white">{label}</div>
                <div className="text-[10px] text-[#BB99CD]">{sub}</div>
              </div>
            ))}
          </div>

          {/* Action Button */}
          <div className={`reveal reveal-delay-5 ${pillsInView ? 'in-view' : ''} flex flex-col sm:flex-row items-center gap-4`}>
            <Link
              href="/map"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2.5 bg-[#F5EDF7] hover:bg-white text-[#3D1860] font-black text-sm sm:text-base px-8 py-4 rounded-full shadow-xl hover:shadow-2xl transition transform active:scale-95 hover:-translate-y-0.5"
            >
              <MapPin className="w-5 h-5 text-[#3D1860]" />
              <span>Open Public Infrastructure Map</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>

            <span className="text-xs text-[#BB99CD]/90 font-medium">
              Free &amp; Open Public Civic Data • No Login Required
            </span>
          </div>

        </div>
      </div>
    </section>
  );
}
