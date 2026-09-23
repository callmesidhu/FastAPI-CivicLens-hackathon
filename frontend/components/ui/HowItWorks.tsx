'use client';

import React, { useRef } from 'react';
import { MapPin, ShieldCheck, Camera, Ticket } from 'lucide-react';
import { useInView } from '@/hooks/useParallax';

export default function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const gridRef    = useRef<HTMLDivElement>(null);

  const headingInView = useInView(headingRef, 0.2);
  const gridInView    = useInView(gridRef, 0.1);

  const steps = [
    {
      num: 1,
      numBg: 'bg-[#F5EDF7] text-[#3D1860] border border-[#BB99CD]',
      title: '1. Find Nearby Amenities',
      description:
        'Locate nearby public toilets and drinking-water points on the map with real-time GPS distance, operating hours, and wheelchair accessibility filters.',
      footerIcon: <MapPin className="w-3.5 h-3.5 text-[#643579]" />,
      footerText: 'Geospatial GPS Search',
      footerColor: 'text-[#643579]',
    },
    {
      num: 2,
      numBg: 'bg-[#BB99CD]/25 text-[#3D1860] border border-[#BB99CD]',
      title: '2. Check Status & Confidence',
      description:
        'Inspect real-time facility conditions (clean, broken, locked, dry) and dynamic Confidence Scores (0–100%) before traveling to avoid wasted trips.',
      footerIcon: <ShieldCheck className="w-3.5 h-3.5 text-[#3D1860]" />,
      footerText: 'Live Confidence Score',
      footerColor: 'text-[#3D1860]',
    },
    {
      num: 3,
      numBg: 'bg-[#643579]/15 text-[#3D1860] border border-[#643579]/30',
      title: '3. Report Issues Anonymously',
      description:
        'Found a broken tap or locked restroom? Submit an instant report with optional photo proof in one tap. No login, phone number, or account required.',
      footerIcon: <Camera className="w-3.5 h-3.5 text-[#643579]" />,
      footerText: 'Zero-Login Anonymous Report',
      footerColor: 'text-[#643579]',
    },
    {
      num: 4,
      numBg: 'bg-[#BB99CD]/25 text-[#3D1860] border border-[#BB99CD]',
      title: '4. Track Ticket & Civic Routing',
      description:
        'Generates an official trackable ticket (CF-XXXX) automatically routed to the responsible Municipal Local Body and Department with status updates.',
      footerIcon: <Ticket className="w-3.5 h-3.5 text-[#643579]" />,
      footerText: 'Trackable Ticket (CF-XXXX)',
      footerColor: 'text-[#643579]',
    },
  ];

  const delayClass = ['reveal-delay-1', 'reveal-delay-2', 'reveal-delay-3', 'reveal-delay-4'];

  return (
    <section ref={sectionRef} className="w-full py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">

      {/* Badge + Heading — slide up when section enters view */}
      <div
        ref={headingRef}
        className={`reveal ${headingInView ? 'in-view' : ''}`}
      >
        <div className="inline-flex items-center space-x-1.5 bg-[#F5EDF7] border border-[#BB99CD] text-[#3D1860] text-xs font-extrabold px-3.5 py-1 rounded-full mb-3 uppercase tracking-wider shadow-2xs">
          <span>SIMPLE 4-STEP PROCESS</span>
        </div>

        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-3">
          How CivicLens Works
        </h2>

        <p className="max-w-2xl mx-auto text-sm sm:text-base text-gray-500 font-medium mb-12">
          From your quick photo report to confirmed clearance, here is how issues get resolved.
        </p>
      </div>

      {/* 4 Cards — staggered slide-up */}
      <div
        ref={gridRef}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left"
      >
        {steps.map((step, idx) => (
          <div
            key={step.num}
            className={`reveal ${delayClass[idx]} ${gridInView ? 'in-view' : ''} bg-white rounded-3xl border border-gray-200/80 shadow-xs hover:shadow-lg hover:-translate-y-1 p-6 flex flex-col justify-between transition-all duration-300 group`}
          >
            <div>
              {/* Step Number Badge */}
              <div
                className={`w-9 h-9 rounded-2xl flex items-center justify-center font-black text-sm mb-5 ${step.numBg}`}
              >
                {step.num}
              </div>

              <h3 className="text-lg font-black text-gray-900 mb-2">{step.title}</h3>

              <p className="text-xs sm:text-sm text-gray-500 font-normal leading-relaxed">
                {step.description}
              </p>
            </div>

            {/* Bottom Footer Tag */}
            <div className="flex items-center space-x-1.5 pt-6 mt-6 border-t border-gray-100">
              {step.footerIcon}
              <span className={`text-xs font-bold ${step.footerColor}`}>
                {step.footerText}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
