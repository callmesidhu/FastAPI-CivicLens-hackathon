'use client';

import React from 'react';
import { Cpu, MapPin, Flame, Clock, Layers, CheckCircle2 } from 'lucide-react';

export default function WhyCivicLens() {
  const features = [
    {
      icon: <Cpu className="w-5 h-5 text-amber-600" />,
      iconBg: 'bg-amber-50 border-amber-100',
      title: 'Smart Photo Scan',
      description:
        'Our civic AI model quickly checks your uploaded photo to identify cleanliness, damage, or water point status automatically.',
      tag: 'Instant Recognition',
      tagColor: 'text-amber-700',
    },
    {
      icon: <MapPin className="w-5 h-5 text-blue-600" />,
      iconBg: 'bg-blue-50 border-blue-100',
      title: 'Direct Ward Routing',
      description:
        'Your pinned location is instantly matched with your local municipal ward office so the right field officer takes responsibility.',
      tag: 'Local Team Assigned',
      tagColor: 'text-blue-700',
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
      icon: <Clock className="w-5 h-5 text-amber-600" />,
      iconBg: 'bg-amber-50 border-amber-100',
      title: 'Clear Deadlines',
      description:
        'Teams work against prompt response timelines. If an issue is delayed, it automatically alerts senior municipal supervisors.',
      tag: 'Accountability Guaranteed',
      tagColor: 'text-amber-700',
    },
    {
      icon: <Layers className="w-5 h-5 text-purple-600" />,
      iconBg: 'bg-purple-50 border-purple-100',
      title: 'Amenity Hotspot Map',
      description:
        'Multiple reports in the same area highlight chronic breakdown zones so municipal authorities can upgrade entire public infrastructure corridors.',
      tag: 'Neighborhood Prevention',
      tagColor: 'text-purple-600',
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

  return (
    <section className="w-full py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
      {/* Badge */}
      <div className="inline-flex items-center space-x-1.5 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold px-4 py-1 rounded-full mb-3 uppercase tracking-wider shadow-2xs">
        <span>MUNICIPAL INNOVATION</span>
      </div>

      {/* Heading */}
      <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-3">
        Why CivicLens
      </h2>

      {/* Subtitle */}
      <p className="max-w-2xl mx-auto text-sm sm:text-base text-gray-500 font-medium mb-12">
        Built to keep our streets clear, amenities functioning, and ensure every report is resolved quickly.
      </p>

      {/* 6 Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
        {features.map((item, idx) => (
          <div
            key={idx}
            className="bg-white rounded-3xl border border-gray-200/80 shadow-xs hover:shadow-md p-6 flex flex-col justify-between transition-all group"
          >
            <div>
              {/* Icon Box */}
              <div
                className={`w-11 h-11 rounded-2xl border flex items-center justify-center mb-5 ${item.iconBg}`}
              >
                {item.icon}
              </div>

              {/* Title */}
              <h3 className="text-lg font-black text-gray-900 mb-2">
                {item.title}
              </h3>

              {/* Description */}
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
