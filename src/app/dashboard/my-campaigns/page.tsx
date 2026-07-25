'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export interface CampaignItem {
  _id: string;
  title: string;
  category: string;
  fundingGoal: number;
  raisedAmount: number;
  status: 'pending' | 'approved' | 'rejected' | string;
  deadline: string;
  campaignImageUrl?: string;
}

export default function MyCampaignsPage() {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchMyCampaigns = async () => {
      const token = localStorage.getItem('access-token');

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('http://localhost:5000/api/campaigns/my-campaigns', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token,
          },
        });

        const data = await response.json();

        if (response.ok) {
          setCampaigns(Array.isArray(data) ? data : data.campaigns || []);
        } else {
          console.error('Failed to fetch campaigns:', data);
        }
      } catch (error) {
        console.error('Error fetching my campaigns:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyCampaigns();
  }, []);

  const getStatusBadge = (status: string) => {
    const s = (status || '').toLowerCase();
    if (s === 'approved') {
      return (
        <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold text-xs rounded-full border border-emerald-200 dark:border-emerald-800">
          Approved
        </span>
      );
    } else if (s === 'pending') {
      return (
        <span className="px-3 py-1 bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-semibold text-xs rounded-full border border-amber-200 dark:border-amber-800">
          Pending
        </span>
      );
    } else if (s === 'rejected') {
      return (
        <span className="px-3 py-1 bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 font-semibold text-xs rounded-full border border-red-200 dark:border-red-800">
          Rejected
        </span>
      );
    } else {
      return (
        <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold text-xs rounded-full">
          {status}
        </span>
      );
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
            My Campaigns
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage your created campaigns, monitor funding goals, and check approval statuses.
          </p>
        </div>

        <Link
          href="/dashboard/add-campaign"
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow transition whitespace-nowrap"
        >
          + Add New Campaign
        </Link>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-3 bg-white dark:bg-gray-800 rounded-2xl shadow-md p-8 border border-gray-100 dark:border-gray-700">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">Loading campaigns...</p>
        </div>
      ) : campaigns.length === 0 ? (
        /* Empty state */
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 p-8 space-y-4">
          <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center text-3xl mx-auto">
            🚀
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            You haven't created any campaigns yet.
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            Start a new crowdfunding campaign today and bring your innovative ideas to life with community support.
          </p>
          <div className="pt-2">
            <Link
              href="/dashboard/add-campaign"
              className="inline-block px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow transition"
            >
              Create Your First Campaign
            </Link>
          </div>
        </div>
      ) : (
        /* Responsive Table Container */
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 text-xs font-bold uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
                  <th className="py-4 px-6">Campaign Title</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6">Funding Goal</th>
                  <th className="py-4 px-6">Raised</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Deadline</th>
                  <th className="py-4 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                {campaigns.map((campaign) => (
                  <tr
                    key={campaign._id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors"
                  >
                    {/* Title & Image */}
                    <td className="py-4 px-6 font-semibold text-gray-900 dark:text-white max-w-xs truncate">
                      <div className="flex items-center space-x-3">
                        {campaign.campaignImageUrl ? (
                          <img
                            src={campaign.campaignImageUrl}
                            alt={campaign.title}
                            className="w-10 h-10 rounded-lg object-cover border border-gray-200 dark:border-gray-600 flex-shrink-0"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs flex-shrink-0">
                            PROJ
                          </div>
                        )}
                        <span className="truncate" title={campaign.title}>
                          {campaign.title}
                        </span>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-4 px-6 text-gray-600 dark:text-gray-300">
                      <span className="px-2.5 py-1 bg-gray-100 dark:bg-gray-700 rounded-md text-xs font-medium">
                        {campaign.category}
                      </span>
                    </td>

                    {/* Funding Goal */}
                    <td className="py-4 px-6 font-medium text-gray-900 dark:text-white">
                      ${campaign.fundingGoal?.toLocaleString()}
                    </td>

                    {/* Raised */}
                    <td className="py-4 px-6 font-bold text-emerald-600 dark:text-emerald-400">
                      ${(campaign.raisedAmount ?? 0).toLocaleString()}
                    </td>

                    {/* Status */}
                    <td className="py-4 px-6">
                      {getStatusBadge(campaign.status)}
                    </td>

                    {/* Deadline */}
                    <td className="py-4 px-6 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {formatDate(campaign.deadline)}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => console.log('Update clicked for campaign:', campaign._id)}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-lg shadow transition cursor-pointer"
                        >
                          Update
                        </button>
                        <button
                          onClick={() => console.log('Delete clicked for campaign:', campaign._id)}
                          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-medium text-xs rounded-lg shadow transition cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
