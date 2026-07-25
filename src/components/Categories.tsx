'use client';

import React from 'react';

export default function Categories() {
  const categories = [
    { name: 'Technology', emoji: '💻', count: '120+ Projects', color: 'from-blue-500 to-indigo-600' },
    { name: 'Eco-Friendly', emoji: '🌱', count: '85+ Projects', color: 'from-emerald-500 to-teal-600' },
    { name: 'Gaming', emoji: '🎮', count: '95+ Projects', color: 'from-purple-500 to-pink-600' },
    { name: 'Art & Design', emoji: '🎨', count: '64+ Projects', color: 'from-amber-500 to-orange-600' },
    { name: 'Health & Wellness', emoji: '🧘', count: '45+ Projects', color: 'from-rose-500 to-red-600' },
    { name: 'Community Causes', emoji: '🤝', count: '110+ Projects', color: 'from-cyan-500 to-blue-600' },
  ];

  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-900/50 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Explore by Category
          </h2>
          <p className="mt-3 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Discover innovations across a wide variety of domains.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
          {categories.map((cat, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 text-center border border-gray-100 dark:border-gray-700 shadow-md hover:shadow-xl transition transform hover:-translate-y-1.5 cursor-pointer group flex flex-col items-center justify-between"
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${cat.color} text-white flex items-center justify-center text-2xl shadow-md group-hover:scale-110 transition-transform duration-300`}>
                {cat.emoji}
              </div>
              <h3 className="mt-4 text-base font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                {cat.name}
              </h3>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 font-medium">
                {cat.count}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
