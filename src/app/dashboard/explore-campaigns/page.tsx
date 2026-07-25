'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export interface Campaign {
  _id: string;
  title: string;
  creatorName: string;
  creatorEmail: string;
  category: string;
  fundingGoal: number;
  raisedAmount: number;
  minimumContribution?: number;
  deadline: string;
  campaignImageUrl: string;
  story?: string;
  rewardInfo?: string;
}

export default function ExploreCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    const fetchApprovedCampaigns = async () => {
      const token = localStorage.getItem('access-token');

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('http://localhost:5000/api/campaigns/approved', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token,
          },
        });

        const data = await response.json();

        if (response.ok) {
          setCampaigns(Array.isArray(data) ? data : []);
        } else {
          setErrorMsg(data.error || 'Failed to fetch campaigns.');
        }
      } catch (err: any) {
        console.error('Error fetching approved campaigns:', err);
        setErrorMsg('Error connecting to backend server.');
      } finally {
        setLoading(false);
      }
    };

    fetchApprovedCampaigns();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-600 dark:text-gray-400 font-medium">Loading approved campaigns...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
          Explore Campaigns
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 max-w-2xl">
          Discover groundbreaking projects, back visionary creators, and earn rewards with your credits.
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm font-medium">
          {errorMsg}
        </div>
      )}

      {campaigns.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center shadow-md border border-gray-100 dark:border-gray-700 space-y-3">
          <span className="text-4xl">🌟</span>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">No Approved Campaigns Found</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Check back soon for new projects launching on FundVerse.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {campaigns.map((campaign) => {
            const raised = campaign.raisedAmount ?? 0;
            const goal = campaign.fundingGoal || 1;
            const progress = Math.min(Math.round((raised / goal) * 100), 100);

            return (
              <div
                key={campaign._id}
                className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg border border-gray-100 dark:border-gray-700 flex flex-col justify-between transform hover:-translate-y-1 hover:shadow-2xl transition group"
              >
                {/* Image & Category */}
                <div className="relative h-48 w-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                  {campaign.campaignImageUrl ? (
                    <img
                      src={campaign.campaignImageUrl}
                      alt={campaign.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-500 font-bold text-lg">
                      {campaign.title}
                    </div>
                  )}
                  <span className="absolute top-3 left-3 bg-gray-900/80 backdrop-blur-md text-white text-xs font-semibold px-3 py-1 rounded-full border border-white/20">
                    {campaign.category}
                  </span>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                      {campaign.title}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      by <span className="font-semibold text-gray-700 dark:text-gray-300">{campaign.creatorName}</span>
                    </p>
                  </div>

                  {/* Funding Goal & Raised */}
                  <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span className="text-gray-600 dark:text-gray-400">
                        Goal: <span className="font-bold text-gray-900 dark:text-white">${goal.toLocaleString()}</span>
                      </span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                        Raised: ${raised.toLocaleString()} ({progress}%)
                      </span>
                    </div>

                    <div className="w-full bg-gray-100 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* View Details Action */}
                  <div className="pt-2">
                    <Link
                      href={`/dashboard/explore-campaigns/${campaign._id}`}
                      className="block w-full text-center py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow transition"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
