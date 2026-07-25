'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { API_BASE } from '@/lib/api';

export interface CampaignDetail {
  _id: string;
  title: string;
  story: string;
  category: string;
  fundingGoal: number;
  minimumContribution: number;
  deadline: string;
  rewardInfo: string;
  campaignImageUrl: string;
  creatorEmail: string;
  creatorName: string;
  raisedAmount: number;
  status: string;
}

export default function CampaignDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const campaignId = resolvedParams.id;

  const { user } = useAuth();
  const [campaign, setCampaign] = useState<CampaignDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [amount, setAmount] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  const [successMsg, setSuccessMsg] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const fetchCampaign = async () => {
    const token = localStorage.getItem('access-token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/campaigns/approved`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token,
        },
      });

      const data = await response.json();

      if (response.ok && Array.isArray(data)) {
        const found = data.find((c: CampaignDetail) => c._id === campaignId);
        setCampaign(found || null);
      } else {
        setErrorMsg('Failed to load campaign details.');
      }
    } catch (err: any) {
      console.error('Error fetching campaign details:', err);
      setErrorMsg('Network error while loading campaign.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaign();
  }, [campaignId]);

  const handleContribute = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!campaign) return;

    const contributionNum = Number(amount);
    if (isNaN(contributionNum) || contributionNum <= 0) {
      setErrorMsg('Please enter a valid positive credit amount.');
      return;
    }

    if (campaign.minimumContribution && contributionNum < campaign.minimumContribution) {
      setErrorMsg(`Minimum contribution for this campaign is ${campaign.minimumContribution} credits.`);
      return;
    }

    const token = localStorage.getItem('access-token');
    if (!token) {
      setErrorMsg('You must be logged in to contribute.');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`${API_BASE}/api/contributions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token,
        },
        body: JSON.stringify({
          campaignId: campaign._id,
          campaignTitle: campaign.title,
          amount: contributionNum,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMsg('Contribution Successful! Your contribution has been submitted.');
        alert('Contribution Successful!');
        setAmount('');
        // Refresh campaign details
        fetchCampaign();
      } else {
        setErrorMsg(data.error || data.message || 'Contribution failed.');
      }
    } catch (err: any) {
      console.error('Error submitting contribution:', err);
      setErrorMsg('An unexpected error occurred during contribution.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReport = async () => {
    if (!campaign || !user) return;

    const enteredReason = window.prompt('Enter your reason for reporting:');
    if (!enteredReason || !enteredReason.trim()) return;

    const token = localStorage.getItem('access-token');
    if (!token) {
      alert('You must be logged in to report a campaign.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/admin/report-campaign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token,
        },
        body: JSON.stringify({
          supporterEmail: user.email,
          supporterName: user.name,
          campaignId: campaign._id,
          campaignTitle: campaign.title,
          reason: enteredReason.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Report submitted successfully!');
      } else {
        alert(data.error || 'Failed to submit report.');
      }
    } catch (err) {
      console.error('Error submitting campaign report:', err);
      alert('Network error while submitting campaign report.');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-600 dark:text-gray-400 font-medium">Loading campaign details...</p>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 p-8 space-y-4">
        <span className="text-5xl">🔍</span>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Campaign Not Found</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          The requested campaign could not be located or may no longer be active.
        </p>
        <div className="pt-2">
          <Link
            href="/dashboard/explore-campaigns"
            className="inline-block px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow transition"
          >
            Back to Explore Campaigns
          </Link>
        </div>
      </div>
    );
  }

  const raised = campaign.raisedAmount ?? 0;
  const goal = campaign.fundingGoal || 1;
  const progress = Math.min(Math.round((raised / goal) * 100), 100);

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      {/* Back Link */}
      <Link
        href="/dashboard/explore-campaigns"
        className="inline-flex items-center space-x-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
      >
        <span>&larr; Back to Explore Campaigns</span>
      </Link>

      {/* Main Details Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        {/* Cover Image */}
        <div className="relative h-64 sm:h-96 w-full bg-gray-200 dark:bg-gray-700">
          {campaign.campaignImageUrl ? (
            <img
              src={campaign.campaignImageUrl}
              alt={campaign.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="w-full h-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-500 font-bold text-2xl">
              {campaign.title}
            </div>
          )}
          <span className="absolute top-4 left-4 bg-gray-900/80 backdrop-blur-md text-white text-xs font-semibold px-4 py-1.5 rounded-full border border-white/20">
            {campaign.category}
          </span>
        </div>

        {/* Content Details */}
        <div className="p-6 sm:p-10 space-y-8">
          <div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">
              {campaign.title}
            </h1>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Created by <span className="font-semibold text-gray-800 dark:text-gray-200">{campaign.creatorName}</span> ({campaign.creatorEmail})
            </p>
          </div>

          {/* Funding Overview Bar */}
          <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-center sm:text-left">
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Funding Goal</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">${goal.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Raised Amount</p>
                <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">${raised.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Deadline</p>
                <p className="text-sm font-bold text-gray-800 dark:text-gray-200 mt-1">
                  {new Date(campaign.deadline).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>

            <div className="space-y-1 pt-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-gray-600 dark:text-gray-400">Progress</span>
                <span className="text-indigo-600 dark:text-indigo-400">{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-600 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Campaign Story */}
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Campaign Story</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line text-base">
              {campaign.story}
            </p>
          </div>

          {/* Reward Info */}
          {campaign.rewardInfo && (
            <div className="bg-indigo-50 dark:bg-indigo-950/40 p-6 rounded-2xl border border-indigo-200 dark:border-indigo-800 space-y-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 flex items-center space-x-2">
                <span>🎁 Backer Reward Info</span>
              </h3>
              <p className="text-sm text-indigo-900 dark:text-indigo-200 font-medium">
                {campaign.rewardInfo}
              </p>
            </div>
          )}

          {/* Contribution Form */}
          <div className="pt-6 border-t border-gray-200 dark:border-gray-700 space-y-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Contribute to this Campaign
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Your credits will be held for this campaign. Minimum contribution: <span className="font-semibold text-gray-700 dark:text-gray-300">{campaign.minimumContribution || 1} credits</span>.
              </p>
            </div>

            {successMsg && (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-700 dark:text-emerald-300 text-sm font-medium">
                {successMsg}
              </div>
            )}

            {errorMsg && (
              <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-sm font-medium">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleContribute} className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
              <div className="flex-1">
                <input
                  type="number"
                  min={campaign.minimumContribution || 1}
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={`Amount in credits (min: ${campaign.minimumContribution || 1})`}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="py-3 px-8 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg transition disabled:opacity-50 cursor-pointer whitespace-nowrap"
              >
                {submitting ? 'Processing...' : 'Contribute Now'}
              </button>
            </form>

            {/* Report Suspicious Campaign Link */}
            <div className="pt-2 text-right">
              <button
                type="button"
                onClick={handleReport}
                className="text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-semibold underline cursor-pointer"
              >
                🚩 Report this campaign as suspicious
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
