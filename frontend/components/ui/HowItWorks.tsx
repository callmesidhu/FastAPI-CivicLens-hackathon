'use client';

import React from 'react';
import { Camera, MapPin, Truck, CheckCircle2 } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      num: 1,
      numBg: 'bg-blue-50 text-blue-600 border border-blue-200',
      title: '1. Take a Photo',
      description:
        'Snap or upload a picture of the amenity or issue. Your phone GPS marks the location automatically.',
      footerIcon: <Camera className="w-3.5 h-3.5 text-blue-600" />,
      footerText: 'Camera & Location',
      footerColor: 'text-blue-600',
    },
    {
      num: 2,
      numBg: 'bg-amber-50 text-amber-600 border border-amber-200',
      title: '2. Ward Assigned',
      description:
        'CivicLens automatically links your report to the correct city ward and assigns it to the local municipal supervisor.',
      footerIcon: <MapPin className="w-3.5 h-3.5 text-amber-600" />,
      footerText: 'Automatic Ward Routing',
      footerColor: 'text-amber-600',
    },
    {
      num: 3,
      numBg: 'bg-indigo-50 text-indigo-600 border border-indigo-200',
      title: '3. Crew Dispatched',
      description:
        'Field response sanitation and plumbing crews are sent promptly to clean or repair the facility before problems escalate.',
      footerIcon: <Truck className="w-3.5 h-3.5 text-indigo-600" />,
      footerText: 'Fast Response Timelines',
      footerColor: 'text-indigo-600',
    },
    {
      num: 4,
      numBg: 'bg-emerald-50 text-emerald-600 border border-emerald-200',
      title: '4. Verified Cleaned',
      description:
        'Crews upload photo proof once the facility is cleaned or restored. Citizens can inspect resolution evidence in real time.',
      footerIcon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />,
      footerText: 'Photo Proof Verified',
      footerColor: 'text-emerald-600',
    },
  ];

  return (
    <section className="w-full py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
      {/* Badge */}
      <div className="inline-flex items-center space-x-1.5 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold px-3.5 py-1 rounded-full mb-3 uppercase tracking-wider shadow-2xs">
        <span>SIMPLE 4-STEP PROCESS</span>
      </div>

      {/* Heading */}
      <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-3">
        How CivicLens Works
      </h2>

      {/* Subtitle */}
      <p className="max-w-2xl mx-auto text-sm sm:text-base text-gray-500 font-medium mb-12">
        From your quick photo report to confirmed clearance, here is how issues get resolved.
      </p>

      {/* 4 Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
        {steps.map((step) => (
          <div
            key={step.num}
            className="bg-white rounded-3xl border border-gray-200/80 shadow-xs hover:shadow-md p-6 flex flex-col justify-between transition-all group"
          >
            <div>
              {/* Step Number Badge */}
              <div
                className={`w-9 h-9 rounded-2xl flex items-center justify-center font-black text-sm mb-5 ${step.numBg}`}
              >
                {step.num}
              </div>

              {/* Title */}
              <h3 className="text-lg font-black text-gray-900 mb-2">
                {step.title}
              </h3>

              {/* Description */}
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
