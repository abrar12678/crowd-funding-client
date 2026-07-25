'use client';

import React from 'react';

export default function HowItWorks() {
  const steps = [
    {
      step: '1',
      emoji: '👤',
      title: 'Register an Account',
      description: 'Sign up as a Supporter or Creator in seconds and receive your initial credits.',
    },
    {
      step: '2',
      emoji: '🔍',
      title: 'Find a Campaign',
      description: 'Explore tech, art, and eco-friendly projects curated by creative visionaries.',
    },
    {
      step: '3',
      emoji: '💎',
      title: 'Contribute Credits',
      description: 'Back your favorite campaigns with credits and help bring ideas to market.',
    },
  ];

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          How It Works
        </h2>
        <p className="mt-3 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Getting started on FundVerse is fast, secure, and intuitive.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {steps.map((item) => (
          <div
            key={item.step}
            className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 text-center flex flex-col items-center space-y-4 hover:border-indigo-500/50 hover:shadow-xl transition transform hover:-translate-y-1"
          >
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-3xl font-extrabold shadow-inner">
              {item.emoji}
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-full">
              Step {item.step}
            </span>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {item.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
