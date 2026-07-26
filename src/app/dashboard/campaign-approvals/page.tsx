'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { API_BASE } from '@/lib/api';

export interface PendingCampaign {
  _id: string;
  title: string;
  category: string;
  fundingGoal: number;
  minimumContribution?: number;
  story?: string;
  rewardInfo?: string;
  creatorName?: string;
  creatorEmail?: string;
  campaignImageUrl?: string;
  deadline?: string;
  status?: string;
  createdAt?: string;
}

export default function CampaignApprovalsPage() {
  const { user, loading: authLoading } = useAuth();
  const [campaigns, setCampaigns] = useState<PendingCampaign[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [detailModal, setDetailModal] = useState<PendingCampaign | null>(null);

  const fetchPendingCampaigns = async () => {
    const token = localStorage.getItem('access-token');
    if (!token) { setLoading(false); return; }
    try {
      const response = await fetch(`${API_BASE}/api/admin/pending-campaigns`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
      });
      const data = await response.json();
      if (response.ok) {
        setCampaigns(Array.isArray(data) ? data : []);
      } else {
        console.error('Failed to fetch pending campaigns:', data);
      }
    } catch (err) {
      console.error('Error fetching pending campaigns:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'Admin') {
      fetchPendingCampaigns();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (!authLoading && user?.role !== 'Admin') {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 text-center">
        <div className="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-2xl p-8 space-y-3">
          <span className="text-4xl">🚫</span>
          <h2 className="text-xl font-bold text-red-700 dark:text-red-300">Access Denied</h2>
          <p className="text-sm text-red-600 dark:text-red-400">Admins only. You do not have permission to approve campaigns.</p>
        </div>
      </div>
    );
  }

  const handleApprove = async (id: string) => {
    const confirmed = window.confirm('Approve this campaign? It will go live immediately.');
    if (!confirmed) return;
    const token = localStorage.getItem('access-token');
    if (!token) return;
    setActionLoadingId(id);
    try {
      const response = await fetch(`${API_BASE}/api/admin/approve-campaign/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
      });
      const data = await response.json();
      if (response.ok) {
        setCampaigns((prev) => prev.filter((c) => c._id !== id));
      } else {
        alert(data.error || 'Failed to approve campaign.');
      }
    } catch (err) {
      alert('Network error while approving campaign.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (id: string) => {
    const confirmed = window.confirm('Reject this campaign? The creator will be notified.');
    if (!confirmed) return;
    const token = localStorage.getItem('access-token');
    if (!token) return;
    setActionLoadingId(id);
    try {
      const response = await fetch(`${API_BASE}/api/admin/reject-campaign/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
      });
      const data = await response.json();
      if (response.ok) {
        setCampaigns((prev) => prev.filter((c) => c._id !== id));
      } else {
        alert(data.error || 'Failed to reject campaign.');
      }
    } catch (err) {
      alert('Network error while rejecting campaign.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    try { return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }); } catch { return dateStr; }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Campaign Approvals</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Review pending campaigns and approve or reject them.</p>
        </div>
        <div className="px-4 py-2 bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 rounded-full text-xs font-bold border border-amber-200 dark:border-amber-800">
          Pending: {campaigns.length}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-3 bg-white dark:bg-gray-800 rounded-2xl shadow-md p-8 border border-gray-100 dark:border-gray-700">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">Loading...</p>
        </div>
      ) : campaigns.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 p-8 space-y-3">
          <span className="text-4xl">✅</span>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">No pending campaigns to review.</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">All campaigns have been reviewed.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 text-xs font-bold uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
                  <th className="py-4 px-6">Campaign Title</th>
                  <th className="py-4 px-6">Creator</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6">Goal</th>
                  <th className="py-4 px-6">Deadline</th>
                  <th className="py-4 px-6">Created</th>
                  <th className="py-4 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                {campaigns.map((c) => (
                  <tr key={c._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
                    <td className="py-4 px-6 font-semibold text-gray-900 dark:text-white max-w-xs truncate">
                      <div className="flex items-center space-x-3">
                        {c.campaignImageUrl ? (
                          <img src={c.campaignImageUrl} alt={c.title} className="w-10 h-10 rounded-lg object-cover border border-gray-200 dark:border-gray-600 flex-shrink-0" onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xs flex-shrink-0">NEW</div>
                        )}
                        <div className="flex flex-col">
                          <span className="truncate" title={c.title}>{c.title}</span>
                          <button onClick={() => setDetailModal(c)} className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline text-left cursor-pointer">View Details</button>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-600 dark:text-gray-300">
                      <p className="font-medium">{c.creatorName || 'Unknown'}</p>
                      <p className="text-xs text-gray-400">{c.creatorEmail}</p>
                    </td>
                    <td className="py-4 px-6 text-gray-600 dark:text-gray-300">
                      <span className="px-2.5 py-1 bg-gray-100 dark:bg-gray-700 rounded-md text-xs font-medium">{c.category}</span>
                    </td>
                    <td className="py-4 px-6 font-medium text-gray-900 dark:text-white">{c.fundingGoal?.toLocaleString()}</td>
                    <td className="py-4 px-6 text-gray-500 dark:text-gray-400 whitespace-nowrap">{formatDate(c.deadline)}</td>
                    <td className="py-4 px-6 text-gray-500 dark:text-gray-400 whitespace-nowrap">{formatDate(c.createdAt)}</td>
                    <td className="py-4 px-6 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleApprove(c._id)}
                          disabled={actionLoadingId === c._id}
                          className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg shadow transition disabled:opacity-50 cursor-pointer"
                        >
                          {actionLoadingId === c._id ? '...' : 'Approve'}
                        </button>
                        <button
                          onClick={() => handleReject(c._id)}
                          disabled={actionLoadingId === c._id}
                          className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs rounded-lg shadow transition disabled:opacity-50 cursor-pointer"
                        >
                          {actionLoadingId === c._id ? '...' : 'Reject'}
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

      {/* Campaign Detail Modal */}
      {detailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setDetailModal(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-2xl max-h-[85vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Campaign Details</h2>
              <button onClick={() => setDetailModal(null)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 transition cursor-pointer">✕</button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh] space-y-5">
              {detailModal.campaignImageUrl && (
                <img src={detailModal.campaignImageUrl} alt={detailModal.title} className="w-full h-48 object-cover rounded-xl" onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Title</p>
                  <p className="font-bold text-gray-900 dark:text-white mt-0.5">{detailModal.title}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</p>
                  <p className="font-medium text-gray-900 dark:text-white mt-0.5">{detailModal.category}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Funding Goal</p>
                  <p className="font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">{detailModal.fundingGoal?.toLocaleString()} credits</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Minimum Contribution</p>
                  <p className="font-medium text-gray-900 dark:text-white mt-0.5">{detailModal.minimumContribution?.toLocaleString() || 'N/A'} credits</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Deadline</p>
                  <p className="font-medium text-gray-900 dark:text-white mt-0.5">{formatDate(detailModal.deadline)}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Creator</p>
                  <p className="font-medium text-gray-900 dark:text-white mt-0.5">{detailModal.creatorName || 'Unknown'} ({detailModal.creatorEmail})</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Story</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-0.5 whitespace-pre-wrap leading-relaxed">{detailModal.story || 'No story provided.'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Reward Info</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-0.5">{detailModal.rewardInfo || 'No reward info.'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => { handleApprove(detailModal._id); setDetailModal(null); }}
                  disabled={actionLoadingId === detailModal._id}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow transition disabled:opacity-50 cursor-pointer"
                >
                  {actionLoadingId === detailModal._id ? 'Approving...' : 'Approve Campaign'}
                </button>
                <button
                  onClick={() => { handleReject(detailModal._id); setDetailModal(null); }}
                  disabled={actionLoadingId === detailModal._id}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow transition disabled:opacity-50 cursor-pointer"
                >
                  {actionLoadingId === detailModal._id ? 'Rejecting...' : 'Reject Campaign'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
