'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { API_BASE } from '@/lib/api';

export interface CampaignItem {
  _id: string;
  title: string;
  category: string;
  fundingGoal: number;
  raisedAmount: number;
  status: 'pending' | 'approved' | 'rejected' | string;
  deadline: string;
  campaignImageUrl?: string;
  story?: string;
  rewardInfo?: string;
}

export default function MyCampaignsPage() {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Modal states
  const [viewModal, setViewModal] = useState<CampaignItem | null>(null);
  const [viewContributions, setViewContributions] = useState<any[]>([]);
  const [viewContributionsLoading, setViewContributionsLoading] = useState(false);

  // Update modal states
  const [updateModal, setUpdateModal] = useState<CampaignItem | null>(null);
  const [updateTitle, setUpdateTitle] = useState('');
  const [updateStory, setUpdateStory] = useState('');
  const [updateRewardInfo, setUpdateRewardInfo] = useState('');
  const [updateSubmitting, setUpdateSubmitting] = useState(false);
  const [updateError, setUpdateError] = useState('');

  const fetchMyCampaigns = useCallback(async () => {
    const token = localStorage.getItem('access-token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const response = await fetch(`${API_BASE}/api/campaigns/my-campaigns`, {
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
  }, []);

  useEffect(() => {
    fetchMyCampaigns();
  }, [fetchMyCampaigns]);

  // --- View Contribution Detail Modal ---
  const handleViewContributions = async (campaign: CampaignItem) => {
    setViewModal(campaign);
    setViewContributionsLoading(true);
    setViewContributions([]);
    const token = localStorage.getItem('access-token');
    if (!token) { setViewContributionsLoading(false); return; }
    try {
      const response = await fetch(`${API_BASE}/api/contributions/campaign/${campaign._id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token,
        },
      });
      const data = await response.json();
      if (response.ok && Array.isArray(data)) {
        setViewContributions(data);
      }
    } catch (err) {
      console.error('Error fetching campaign contributions:', err);
    } finally {
      setViewContributionsLoading(false);
    }
  };

  // --- Update Campaign ---
  const handleOpenUpdate = (campaign: CampaignItem) => {
    setUpdateModal(campaign);
    setUpdateTitle(campaign.title);
    setUpdateStory(campaign.story || '');
    setUpdateRewardInfo(campaign.rewardInfo || '');
    setUpdateError('');
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updateModal) return;
    setUpdateError('');
    setUpdateSubmitting(true);
    const token = localStorage.getItem('access-token');
    if (!token) { setUpdateError('Not authenticated.'); setUpdateSubmitting(false); return; }

    try {
      const response = await fetch(`${API_BASE}/api/campaigns/update/${updateModal._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token,
        },
        body: JSON.stringify({ title: updateTitle, story: updateStory, rewardInfo: updateRewardInfo }),
      });
      const data = await response.json();
      if (response.ok) {
        setUpdateModal(null);
        fetchMyCampaigns();
      } else {
        setUpdateError(data.error || 'Failed to update campaign.');
      }
    } catch (err) {
      setUpdateError('Network error while updating campaign.');
    } finally {
      setUpdateSubmitting(false);
    }
  };

  // --- Delete Campaign ---
  const handleDelete = async (campaignId: string) => {
    const confirmed = window.confirm('Deleting this campaign will refund all approved supporters. Are you sure?');
    if (!confirmed) return;

    const token = localStorage.getItem('access-token');
    if (!token) return;

    setActionLoadingId(campaignId);
    try {
      const response = await fetch(`${API_BASE}/api/campaigns/delete/${campaignId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setCampaigns((prev) => prev.filter((c) => c._id !== campaignId));
      } else {
        alert(data.error || 'Failed to delete campaign.');
      }
    } catch (err) {
      alert('Network error while deleting campaign.');
    } finally {
      setActionLoadingId(null);
    }
  };

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

  const getContributionStatusBadge = (status: string) => {
    const s = (status || '').toLowerCase();
    if (s === 'approved') return <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold text-xs rounded-full">Approved</span>;
    if (s === 'rejected') return <span className="px-2.5 py-1 bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 font-semibold text-xs rounded-full">Rejected</span>;
    return <span className="px-2.5 py-1 bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-semibold text-xs rounded-full">Pending</span>;
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
                        {/* #14: View Contributions Button */}
                        <button
                          onClick={() => handleViewContributions(campaign)}
                          className="px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white font-medium text-xs rounded-lg shadow transition cursor-pointer"
                          title="View Contributions"
                        >
                          View
                        </button>
                        {/* #17: Update Button */}
                        <button
                          onClick={() => handleOpenUpdate(campaign)}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-lg shadow transition cursor-pointer"
                        >
                          Update
                        </button>
                        {/* #18: Delete Button */}
                        <button
                          onClick={() => handleDelete(campaign._id)}
                          disabled={actionLoadingId === campaign._id}
                          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-medium text-xs rounded-lg shadow transition disabled:opacity-50 cursor-pointer"
                        >
                          {actionLoadingId === campaign._id ? '...' : 'Delete'}
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

      {/* #14: View Contribution Detail Modal */}
      {viewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setViewModal(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-2xl max-h-[85vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Campaign Contributions</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{viewModal.title}</p>
              </div>
              <button onClick={() => setViewModal(null)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 transition cursor-pointer">
                ✕
              </button>
            </div>
            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {viewContributionsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : viewContributions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400 text-sm">No contributions found for this campaign.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {viewContributions.map((c: any) => (
                    <div key={c._id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/40 rounded-xl border border-gray-100 dark:border-gray-600">
                      <div className="space-y-1">
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">{c.supporterName || 'Anonymous'}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{c.supporterEmail}</p>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">{c.amount?.toLocaleString()} credits</p>
                        {getContributionStatusBadge(c.status)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* #17: Update Campaign Modal */}
      {updateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setUpdateModal(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-xl max-h-[85vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Update Campaign</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Editing: {updateModal.title}</p>
              </div>
              <button onClick={() => setUpdateModal(null)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 transition cursor-pointer">
                ✕
              </button>
            </div>
            {/* Modal Body */}
            <form onSubmit={handleUpdateSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[60vh]">
              {updateError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-sm font-medium text-center">
                  {updateError}
                </div>
              )}

              <div>
                <label htmlFor="updateTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Campaign Title *
                </label>
                <input
                  id="updateTitle"
                  type="text"
                  required
                  value={updateTitle}
                  onChange={(e) => setUpdateTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                />
              </div>

              <div>
                <label htmlFor="updateStory" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Campaign Story *
                </label>
                <textarea
                  id="updateStory"
                  rows={4}
                  required
                  value={updateStory}
                  onChange={(e) => setUpdateStory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                />
              </div>

              <div>
                <label htmlFor="updateReward" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Reward Info *
                </label>
                <input
                  id="updateReward"
                  type="text"
                  required
                  value={updateRewardInfo}
                  onChange={(e) => setUpdateRewardInfo(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                />
              </div>

              <button
                type="submit"
                disabled={updateSubmitting}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg transition disabled:opacity-50 cursor-pointer"
              >
                {updateSubmitting ? 'Updating...' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
