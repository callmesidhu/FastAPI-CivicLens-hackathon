'use client';

import React from 'react';
import Link from 'next/link';
import { MapPin, Navigation, ArrowRight, ShieldCheck, Flame, Layers, Droplet, Users, Satellite } from 'lucide-react';

export default function MapPreviewCta() {
  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="relative rounded-3xl bg-gradient-to-br from-[#3D1860] via-[#643579] to-[#1f0b33] text-white overflow-hidden shadow-2xl p-8 sm:p-12 md:p-16 border border-[#BB99CD]/40">
        {/* Decorative Grid & Glow */}
        <div 
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, #BB99CD 1px, transparent 0)',
            backgroundSize: '24px 24px'
          }}
        />
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#BB99CD]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 bg-[#BB99CD]/20 border border-[#BB99CD]/40 text-[#F5EDF7] text-xs font-bold px-4 py-1.5 rounded-full mb-6 backdrop-blur-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>LIVE INTERACTIVE CIVIC MAP</span>
          </div>

          {/* Heading */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-4 text-white leading-tight">
            Explore Keralam&apos;s Public Infrastructure Map
          </h2>

          {/* Description */}
          <p className="text-base sm:text-lg text-[#F5EDF7]/90 font-normal leading-relaxed mb-8 max-w-2xl">
            Locate nearby verified drinking water points, clean sanitation amenities, active crew maintenance dispatches, and chronic hotspot zones with high-resolution satellite imagery.
          </p>

          {/* Features Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
            <div className="bg-white/10 backdrop-blur-xs border border-white/10 rounded-2xl p-3 text-center flex flex-col items-center">
              <Droplet className="w-5 h-5 text-[#BB99CD] mb-1 fill-[#BB99CD]" />
              <div className="text-xs font-bold text-white">Water Points</div>
              <div className="text-[10px] text-[#BB99CD]">Verified Safe</div>
            </div>
            <div className="bg-white/10 backdrop-blur-xs border border-white/10 rounded-2xl p-3 text-center flex flex-col items-center">
              <Users className="w-5 h-5 text-[#F5EDF7] mb-1" />
              <div className="text-xs font-bold text-white">Public Toilets</div>
              <div className="text-[10px] text-[#BB99CD]">Accessible &amp; Clean</div>
            </div>
            <div className="bg-white/10 backdrop-blur-xs border border-white/10 rounded-2xl p-3 text-center flex flex-col items-center">
              <Satellite className="w-5 h-5 text-[#BB99CD] mb-1" />
              <div className="text-xs font-bold text-white">Satellite View</div>
              <div className="text-[10px] text-[#BB99CD]">Esri World Imagery</div>
            </div>
            <div className="bg-white/10 backdrop-blur-xs border border-white/10 rounded-2xl p-3 text-center flex flex-col items-center">
              <Flame className="w-5 h-5 text-[#F5EDF7] mb-1" />
              <div className="text-xs font-bold text-white">Hotspots</div>
              <div className="text-[10px] text-[#BB99CD]">Real-time Detection</div>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link
              href="/map"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2.5 bg-[#F5EDF7] hover:bg-white text-[#3D1860] font-black text-sm sm:text-base px-8 py-4 rounded-full shadow-xl hover:shadow-2xl transition transform active:scale-95"
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
