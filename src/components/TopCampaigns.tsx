'use client';

import React, { useState, useEffect } from 'react';
import { API_BASE } from '@/lib/api';

interface Campaign {
  _id: string;
  title: string;
  creatorName: string;
  creatorEmail: string;
  raisedAmount: number;
  fundingGoal: number;
  campaignImageUrl: string;
  category: string;
  status: string;
  deadline: string;
  createdAt: string;
}

export default function TopCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchTopCampaigns = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE}/api/campaigns/top`);

        if (!response.ok) {
          throw new Error('Failed to fetch campaigns');
        }

        const data = await response.json();
        if (Array.isArray(data)) {
          setCampaigns(data);
        }
      } catch (err: any) {
        console.error('Error fetching top campaigns:', err);
        setError('Unable to load top campaigns right now.');
      } finally {
        setLoading(false);
      }
    };

    fetchTopCampaigns();
  }, []);

  // Loading state
  if (loading) {
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
        <div className="flex justify-center items-center py-12">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </section>
    );
  }

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

      {/* Error State */}
      {error ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 text-lg">{error}</p>
        </div>
      ) : campaigns.length === 0 ? (
        /* Empty State */
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 text-lg">No campaigns yet. Be the first to create one!</p>
        </div>
      ) : (
        /* Campaign Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {campaigns.map((campaign) => {
            const progressPercentage = Math.min(
              Math.round((campaign.raisedAmount / campaign.fundingGoal) * 100),
              100
            );

            return (
              <div
                key={campaign._id}
                className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg border border-gray-100 dark:border-gray-700 transition transform hover:-translate-y-1 hover:shadow-2xl flex flex-col group cursor-pointer"
              >
                <div className="relative h-48 w-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                  <img
                    src={campaign.campaignImageUrl}
                    alt={campaign.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/' + campaign._id + '/600/400';
                    }}
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
                        {campaign.raisedAmount.toLocaleString()} credits raised
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
      )}
    </section>
  );
}
