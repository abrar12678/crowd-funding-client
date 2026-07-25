'use client';

import React from 'react';

export interface Campaign {
  id: string;
  title: string;
  creatorName: string;
  raisedAmount: number;
  targetAmount: number;
  image: string;
  category: string;
}

export default function TopCampaigns() {
  const campaigns: Campaign[] = [
    {
      id: '1',
      title: 'EcoSolar: Next-Gen Portable Solar Generator',
      creatorName: 'Alex Rivera',
      raisedAmount: 18450,
      targetAmount: 20000,
      image: 'https://picsum.photos/seed/solar/600/400',
      category: 'Technology',
    },
    {
      id: '2',
      title: 'Urban VertiFarm: Smart Indoor Hydroponics',
      creatorName: 'Elena Rostova',
      raisedAmount: 34200,
      targetAmount: 35000,
      image: 'https://picsum.photos/seed/farm/600/400',
      category: 'Eco-Friendly',
    },
    {
      id: '3',
      title: 'MindFlow: AI-Powered Productivity App',
      creatorName: 'Marcus Vance',
      raisedAmount: 12800,
      targetAmount: 15000,
      image: 'https://picsum.photos/seed/app/600/400',
      category: 'Software',
    },
    {
      id: '4',
      title: 'AuraSound: True Wireless Lossless Headphones',
      creatorName: 'Sophia Chen',
      raisedAmount: 48900,
      targetAmount: 50000,
      image: 'https://picsum.photos/seed/audio/600/400',
      category: 'Gadgets',
    },
    {
      id: '5',
      title: 'Chronos RPG: Immersive Fantasy Board Game',
      creatorName: 'David Sterling',
      raisedAmount: 27500,
      targetAmount: 30000,
      image: 'https://picsum.photos/seed/game/600/400',
      category: 'Gaming',
    },
    {
      id: '6',
      title: 'CleanOcean: Autonomous Marine Trash Collector',
      creatorName: 'Maya Lin',
      raisedAmount: 62000,
      targetAmount: 70000,
      image: 'https://picsum.photos/seed/ocean/600/400',
      category: 'Environment',
    },
  ];

  return (
    <section id="top-campaigns" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Top Funded Campaigns
        </h2>
        <p className="mt-3 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Explore the highest-performing projects backed by our passionate community.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {campaigns.map((campaign) => {
          const progressPercentage = Math.min(
            Math.round((campaign.raisedAmount / campaign.targetAmount) * 100),
            100
          );

          return (
            <div
              key={campaign.id}
              className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg border border-gray-100 dark:border-gray-700 transition transform hover:-translate-y-1 hover:shadow-2xl flex flex-col group cursor-pointer"
            >
              <div className="relative h-48 w-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                <img
                  src={campaign.image}
                  alt={campaign.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute top-3 left-3 bg-gray-900/80 backdrop-blur-md text-white text-xs font-semibold px-3 py-1 rounded-full border border-white/20">
                  {campaign.category}
                </span>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                    {campaign.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    by <span className="font-medium text-gray-700 dark:text-gray-300">{campaign.creatorName}</span>
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm font-semibold">
                    <span className="text-emerald-600 dark:text-emerald-400">
                      ${campaign.raisedAmount.toLocaleString()} credits raised
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">{progressPercentage}%</span>
                  </div>

                  <div className="w-full bg-gray-100 dark:bg-gray-700 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-700"
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
