'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { MapPin, ArrowRight, Droplet, Users, CheckCircle2, SlidersHorizontal, X } from 'lucide-react';
import { useInView } from '@/hooks/useParallax';
import MiniMapPreview from '@/components/map/MiniMapPreview';

export default function MapPreviewCta() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const pillsRef = useRef<HTMLDivElement>(null);

  const contentInView = useInView(contentRef, 0.15);
  const pillsInView = useInView(pillsRef, 0.1);

  const [isMounted, setIsMounted] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'water' | 'toilet'>('all');

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleCardClick = (type: 'water' | 'toilet') => {
    setActiveFilter((prev) => (prev === type ? 'all' : type));
  };

  const featureCards = [
    {
      id: 'water' as const,
      Icon: Droplet,
      label: 'Water Points',
      sub: 'Verified Safe Drinking Water',
      count: '18 Hubs Active',
      statusNote: '98% tested clean • 14 Districts',
      pips: [true, true, true],
      isActive: activeFilter === 'water',
    },
    {
      id: 'toilet' as const,
      Icon: Users,
      label: 'Public Toilets',
      sub: 'Accessible & Clean Sanitation',
      count: '24 Units Online',
      statusNote: '100% geo-tagged • All Genders',
      pips: [true, true, true],
      isActive: activeFilter === 'toilet',
    },
  ];

  return (
    <section ref={sectionRef} className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Flat architectural card container — no glow or blur */}
      <div className="relative rounded-3xl bg-[#341452] text-white p-6 sm:p-10 lg:p-12 border border-[#BB99CD]/35">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          
          {/* ── Left Column: Content & 2 Interactive Telemetry Cards ── */}
          <div className="lg:col-span-6 xl:col-span-5 flex flex-col justify-between">
            <div
              ref={contentRef}
              className={`reveal ${contentInView ? 'in-view' : ''}`}
            >
              {/* Header pill without any green dot */}
              <div className="inline-flex items-center bg-[#481B72] border border-[#BB99CD]/40 text-[#F5EDF7] text-xs font-bold px-3.5 py-1.5 rounded-full mb-4">
                <span className="tracking-wider uppercase">LIVE CIVIC INFRASTRUCTURE MAP</span>
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight mb-3 text-white leading-tight">
                Explore Keralam&apos;s Public Infrastructure Map
              </h2>

              <p className="text-sm sm:text-base text-[#F5EDF7]/85 font-normal leading-relaxed mb-6">
                Locate verified drinking water points and sanitation amenities with high-resolution satellite telemetry across all 14 districts of Kerala.
              </p>
            </div>

            {/* ── Active Filter Feedback Strip ── */}
            <div className="mb-3 flex items-center justify-between text-xs font-mono text-[#BB99CD]">
              <span className="flex items-center space-x-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#BB99CD]" />
                <span className="text-[11px] font-bold uppercase tracking-wider">
                  Select Amenity to Filter Kerala Map
                </span>
              </span>
              {activeFilter !== 'all' && (
                <button
                  type="button"
                  onClick={() => setActiveFilter('all')}
                  className="flex items-center space-x-1 text-xs text-[#F5EDF7] hover:text-white bg-[#240D37] border border-[#BB99CD]/50 px-2 py-0.5 rounded transition"
                >
                  <span>Show All</span>
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* ── The Two Cards: Water Points & Public Toilets (No Hotspots / Satellite Cards) ── */}
            <div
              ref={pillsRef}
              className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-8"
            >
              {featureCards.map((card, idx) => {
                const { Icon, label, sub, count, statusNote, pips, isActive, id } = card;
                const delay = `reveal-delay-${idx + 1}`;

                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => handleCardClick(id)}
                    className={`reveal ${delay} ${pillsInView ? 'in-view' : ''} text-left p-4 rounded-xl border transition-all duration-150 cursor-pointer relative overflow-hidden group ${
                      isActive
                        ? 'bg-[#290E3F] border-2 border-[#BB99CD] text-white'
                        : 'bg-[#240D37] border border-[#522378] hover:bg-[#2C1043] hover:border-[#7A36A8]'
                    }`}
                  >
                    {/* Top status indicator tab */}
                    {isActive && (
                      <div className="absolute top-0 left-0 right-0 h-1 bg-[#BB99CD]" />
                    )}

                    {/* Top row: Icon + live counter badge */}
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="flex items-center space-x-2">
                        <Icon
                          className={`w-4 h-4 ${
                            isActive ? 'text-white' : 'text-[#BB99CD]'
                          }`}
                        />
                        {/* 3-segment readiness pips */}
                        <div className="flex space-x-0.5">
                          {pips.map((pipActive, pipIdx) => (
                            <span
                              key={pipIdx}
                              className={`w-1 h-2 rounded-xs ${
                                pipActive
                                  ? isActive
                                    ? 'bg-[#BB99CD]'
                                    : 'bg-[#643579]'
                                  : 'bg-[#180825]'
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-mono font-bold tracking-tight px-1.5 py-0.5 rounded border ${
                          isActive
                            ? 'bg-[#3D1860] border-[#BB99CD] text-white'
                            : 'bg-[#180825] border-[#522378] text-[#BB99CD]'
                        }`}
                      >
                        {count}
                      </span>
                    </div>

                    {/* Middle: Label & Subtext */}
                    <div className="text-xs sm:text-sm font-bold text-white mb-0.5 flex items-center justify-between">
                      <span>{label}</span>
                      {isActive && <CheckCircle2 className="w-3.5 h-3.5 text-[#BB99CD]" />}
                    </div>
                    <div className="text-[11px] text-[#BB99CD]/80 mb-3">
                      {sub}
                    </div>

                    {/* Dynamic Status / Interactive Insight Drawer */}
                    <div className="pt-2 border-t border-[#3E165E] flex items-center justify-between text-[10px] font-mono">
                      <span className="text-[#BB99CD]/70 truncate">
                        {statusNote}
                      </span>
                      <span className="text-[#BB99CD] font-bold shrink-0 ml-1">
                        {isActive ? 'ACTIVE' : 'FILTER'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Action Button & Subtext */}
            <div className={`reveal reveal-delay-3 ${pillsInView ? 'in-view' : ''} flex flex-col sm:flex-row items-start sm:items-center gap-4`}>
              <Link
                href="/map"
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-[#F5EDF7] hover:bg-white text-[#3D1860] font-black text-sm px-6 py-3.5 rounded-xl transition transform active:scale-95"
              >
                <MapPin className="w-4 h-4 text-[#3D1860]" />
                <span>Open Fullscreen Map</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>

              <span className="text-xs text-[#BB99CD] font-medium">
                Keralam Municipal GIS • High-Resolution Satellite
              </span>
            </div>
          </div>

          {/* ── Right Column: Interactive Kerala Satellite Map Console ── */}
          <div className="lg:col-span-6 xl:col-span-7 h-[420px] sm:h-[460px] w-full">
            {isMounted ? (
              <MiniMapPreview activeFilter={activeFilter} />
            ) : (
              <div className="w-full h-full bg-[#240D37] rounded-2xl border border-[#BB99CD]/30 flex flex-col items-center justify-center p-6 text-center text-[#BB99CD]">
                <div className="w-8 h-8 rounded-full border-2 border-[#BB99CD] border-t-transparent animate-spin mb-3" />
                <span className="text-xs font-mono font-bold">Initializing Keralam Satellite Map...</span>
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
