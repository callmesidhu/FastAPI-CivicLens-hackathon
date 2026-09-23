'use client';

import React, { useRef } from 'react';
import { Cpu, MapPin, Flame, Clock, Layers, CheckCircle2 } from 'lucide-react';
import { useInView } from '@/hooks/useParallax';

export default function WhyCivicLens() {
  const headingRef = useRef<HTMLDivElement>(null);
  const gridRef    = useRef<HTMLDivElement>(null);

  const headingInView = useInView(headingRef, 0.2);
  const gridInView    = useInView(gridRef, 0.08);

  const features = [
    {
      icon: <Cpu className="w-5 h-5 text-[#3D1860]" />,
      iconBg: 'bg-[#F5EDF7] border-[#BB99CD]',
      title: 'Smart Photo Scan',
      description:
        'Our civic AI model quickly checks your uploaded photo to identify cleanliness, damage, or water point status automatically.',
      tag: 'Instant Recognition',
      tagColor: 'text-[#3D1860]',
    },
    {
      icon: <MapPin className="w-5 h-5 text-[#643579]" />,
      iconBg: 'bg-[#BB99CD]/20 border-[#BB99CD]/60',
      title: 'Direct Ward Routing',
      description:
        'Your pinned location is instantly matched with your local municipal ward office so the right field officer takes responsibility.',
      tag: 'Local Team Assigned',
      tagColor: 'text-[#643579]',
    },
    {
      icon: <Flame className="w-5 h-5 text-red-500" />,
      iconBg: 'bg-red-50 border-red-100',
      title: 'Fast Action Priority',
      description:
        'Facilities near transit hubs, hospitals, or high-footfall areas get high priority so teams can clear issues promptly before conditions deteriorate.',
      tag: 'Urgent Issues First',
      tagColor: 'text-red-500',
    },
    {
      icon: <Clock className="w-5 h-5 text-[#643579]" />,
      iconBg: 'bg-[#F5EDF7] border-[#BB99CD]',
      title: 'Clear Deadlines',
      description:
        'Teams work against prompt response timelines. If an issue is delayed, it automatically alerts senior municipal supervisors.',
      tag: 'Accountability Guaranteed',
      tagColor: 'text-[#643579]',
    },
    {
      icon: <Layers className="w-5 h-5 text-[#3D1860]" />,
      iconBg: 'bg-[#BB99CD]/20 border-[#BB99CD]/60',
      title: 'Amenity Hotspot Map',
      description:
        'Multiple reports in the same area highlight chronic breakdown zones so municipal authorities can upgrade entire public infrastructure corridors.',
      tag: 'Neighborhood Prevention',
      tagColor: 'text-[#3D1860]',
    },
    {
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
      iconBg: 'bg-emerald-50 border-emerald-100',
      title: 'Verified Photo Proof',
      description:
        'Crews upload photo proof once the amenity is cleaned or fixed. Citizens can inspect resolution evidence directly in My Reports.',
      tag: 'Photo Proof Verified',
      tagColor: 'text-emerald-600',
    },
  ];

  const delayClasses = [
    'reveal-delay-1',
    'reveal-delay-2',
    'reveal-delay-3',
    'reveal-delay-4',
    'reveal-delay-5',
    'reveal-delay-6',
  ];

  return (
    <section className="w-full py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">

      {/* Badge + Heading — scroll reveal */}
      <div
        ref={headingRef}
        className={`reveal ${headingInView ? 'in-view' : ''}`}
      >
        <div className="inline-flex items-center space-x-1.5 bg-[#F5EDF7] border border-[#BB99CD] text-[#3D1860] text-xs font-extrabold px-4 py-1 rounded-full mb-3 uppercase tracking-wider shadow-2xs">
          <span>MUNICIPAL INNOVATION</span>
        </div>

        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-3">
          Why CivicLens
        </h2>

        <p className="max-w-2xl mx-auto text-sm sm:text-base text-gray-500 font-medium mb-12">
          Built to keep our streets clear, amenities functioning, and ensure every report is resolved quickly.
        </p>
      </div>

      {/* 6 Cards Grid — staggered slide-up */}
      <div
        ref={gridRef}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-left"
      >
        {features.map((item, idx) => (
          <div
            key={idx}
            className={`reveal ${delayClasses[idx]} ${gridInView ? 'in-view' : ''} bg-white rounded-3xl border border-gray-200/80 shadow-xs hover:shadow-lg hover:-translate-y-1.5 p-6 flex flex-col justify-between transition-all duration-300 group`}
          >
            <div>
              {/* Icon Box */}
              <div
                className={`w-11 h-11 rounded-2xl border flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 ${item.iconBg}`}
              >
                {item.icon}
              </div>

              <h3 className="text-lg font-black text-gray-900 mb-2">{item.title}</h3>

              <p className="text-xs sm:text-sm text-gray-500 font-normal leading-relaxed">
                {item.description}
              </p>
            </div>

            {/* Bottom Tag */}
            <div className="pt-6 mt-6 border-t border-gray-100">
              <span className={`text-xs font-extrabold ${item.tagColor}`}>
                {item.tag}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
