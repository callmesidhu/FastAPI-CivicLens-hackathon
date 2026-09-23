'use client';

import React, { useRef } from 'react';
import { useInView } from '@/hooks/useParallax';

export default function WhyCivicLens() {
  const headingRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const headingInView = useInView(headingRef, 0.2);
  const gridInView = useInView(gridRef, 0.08);

  const features = [
    {
      index: '01',
      title: 'Dynamic Confidence Score',
      description:
        'Every facility displays a real-time confidence score (0–100%) calculated dynamically from report freshness and community status updates.',
      tag: 'Reliability Metric',
      tagColor: 'text-[#3D1860]',
      meta: 'Decay & Freshness Algorithm',
    },
    {
      index: '02',
      title: 'Automated Municipal Routing',
      description:
        'Reports are automatically linked to the mapped Municipal Local Body and directed to the specific department (Water & Sanitation) without delay.',
      tag: 'Department Mapping',
      tagColor: 'text-[#643579]',
      meta: 'Automated Civic Dispatch',
    },
    {
      index: '03',
      title: '100% Anonymous & Private',
      description:
        'No user accounts, phone numbers, or emails required. CivicLens collects zero personal identifiers or movement history—civic participation with total privacy.',
      tag: 'Zero Personal Data',
      tagColor: 'text-[#3D1860]',
      meta: 'Privacy-First Architecture',
    },
    {
      index: '04',
      title: 'Offline-First & Auto Sync',
      description:
        'Full functionality when internet drops. Search cached facilities in IndexedDB, queue offline reports (OFF-XXXX), and auto-sync with idempotency upon reconnecting.',
      tag: 'Network Resilient',
      tagColor: 'text-[#643579]',
      meta: 'IndexedDB & Idempotency Key',
    },
  ];

  const delayClasses = [
    'reveal-delay-1',
    'reveal-delay-2',
    'reveal-delay-3',
    'reveal-delay-4',
  ];

  return (
    <section className="w-full py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
      {/* Badge + Heading — scroll reveal */}
      <div
        ref={headingRef}
        className={`reveal ${headingInView ? 'in-view' : ''}`}
      >
        <div className="inline-flex items-center space-x-1.5 bg-[#F5EDF7] border border-[#BB99CD] text-[#3D1860] text-xs font-extrabold px-4 py-1 rounded-full mb-3 uppercase tracking-wider shadow-2xs">
          <span>CIVIC ARCHITECTURE</span>
        </div>

        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-3">
          Why CivicLens
        </h2>

        <p className="max-w-2xl mx-auto text-sm sm:text-base text-gray-500 font-medium mb-12">
          Engineered for reliability, community accessibility, and resilient civic reporting across Kerala.
        </p>
      </div>

      {/* 4 Cards Grid — clean icon-free architectural cards */}
      <div
        ref={gridRef}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left"
      >
        {features.map((item, idx) => (
          <div
            key={item.index}
            className={`reveal ${delayClasses[idx]} ${
              gridInView ? 'in-view' : ''
            } bg-white rounded-3xl border border-gray-200/90 shadow-xs hover:shadow-lg hover:-translate-y-1 p-6 flex flex-col justify-between transition-all duration-300`}
          >
            <div>
              {/* Header: Numerical index & tag (No Icons) */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono font-black text-[#3D1860] bg-[#F5EDF7] border border-[#BB99CD]/50 px-2.5 py-1 rounded-lg">
                  {item.index}
                </span>
                <span
                  className={`text-[11px] font-black uppercase tracking-wider ${item.tagColor}`}
                >
                  {item.tag}
                </span>
              </div>

              <h3 className="text-lg font-black text-gray-900 mb-2">
                {item.title}
              </h3>

              <p className="text-xs sm:text-sm text-gray-500 font-normal leading-relaxed">
                {item.description}
              </p>
            </div>

            {/* Bottom Meta */}
            <div className="pt-4 mt-6 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400 font-mono">
              <span>{item.meta}</span>
              <span className="text-[#3D1860] font-bold">Active SLA</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
