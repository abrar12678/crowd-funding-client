'use client';

import React from 'react';

export default function PlatformImpact() {
  const stats = [
    { label: 'Successful Campaigns', value: '500+', sub: 'Projects fully funded' },
    { label: 'Global Supporters', value: '10,000+', sub: 'Active community members' },
    { label: 'Total Credits Raised', value: '$1M+', sub: 'Disbursed to creators' },
  ];

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-2xl p-8 sm:p-12">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-64 h-64 rounded-full bg-black/10 blur-2xl pointer-events-none"></div>

        <div className="relative z-10 text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Platform Impact in Numbers
          </h2>
          <p className="mt-3 text-lg text-white/90 max-w-2xl mx-auto">
            Together, our ecosystem continues to break boundaries and fund remarkable dreams.
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-2xl flex flex-col justify-center transform hover:scale-105 transition duration-300 shadow-lg"
            >
              <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                {stat.value}
              </span>
              <span className="mt-2 text-lg font-bold text-white/90">
                {stat.label}
              </span>
              <span className="mt-1 text-xs text-white/70">
                {stat.sub}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
