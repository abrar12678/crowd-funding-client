'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

export interface CampaignItem {
  _id: string;
  title: string;
  creatorName?: string;
  creatorEmail?: string;
  category: string;
  fundingGoal: number;
  raisedAmount?: number;
  status?: string;
}

export default function ManageCampaignsPage() {
  const { user, loading: authLoading } = useAuth();
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchCampaigns = async () => {
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
          console.error('Failed to fetch campaigns:', data);
        }
      } catch (err) {
        console.error('Error fetching campaigns for admin:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === 'Admin') {
      fetchCampaigns();
    } else {
      setLoading(false);
    }
  }, [user]);

  // Security check: Admins only
  if (!authLoading && user?.role !== 'Admin') {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 text-center">
        <div className="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-2xl p-8 space-y-3">
          <span className="text-4xl">🚫</span>
          <h2 className="text-xl font-bold text-red-700 dark:text-red-300">Access Denied</h2>
          <p className="text-sm text-red-600 dark:text-red-400">
            Admins only. You do not have permission to manage campaigns.
          </p>
        </div>
      </div>
    );
  }

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm('Deleting this will refund all supporters. Are you sure?');
    if (!confirmed) return;

    const token = localStorage.getItem('access-token');
    if (!token) return;

    setDeletingId(id);

    try {
      const response = await fetch(`http://localhost:5000/api/admin/delete-campaign/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token,
        },
      });

      const data = await response.json();

      if (response.ok) {
        // Filter out deleted campaign from local state
        setCampaigns((prev) => prev.filter((item) => item._id !== id));
      } else {
        alert(data.error || 'Failed to delete campaign.');
      }
    } catch (err) {
      console.error('Error deleting campaign:', err);
      alert('Network error while deleting campaign.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
            Manage Campaigns
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Overview of live campaigns. Deleting a campaign automatically refunds all backer credits.
          </p>
        </div>

        <div className="px-4 py-2 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-bold border border-indigo-200 dark:border-indigo-800">
          Active Campaigns: {campaigns.length}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-3 bg-white dark:bg-gray-800 rounded-2xl shadow-md p-8 border border-gray-100 dark:border-gray-700">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">Loading...</p>
        </div>
      ) : campaigns.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 p-8 space-y-3">
          <span className="text-4xl">🚀</span>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">No campaigns found.</h3>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 text-xs font-bold uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
                  <th className="py-4 px-6">Title</th>
                  <th className="py-4 px-6">Creator</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Raised</th>
                  <th className="py-4 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                {campaigns.map((item) => (
                  <tr
                    key={item._id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors"
                  >
                    <td className="py-4 px-6 font-semibold text-gray-900 dark:text-white max-w-xs truncate">
                      {item.title}
                    </td>

                    <td className="py-4 px-6 text-gray-600 dark:text-gray-300">
                      {item.creatorName || item.creatorEmail || 'Unknown'}
                    </td>

                    <td className="py-4 px-6">
                      <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded-full border border-emerald-200 dark:border-emerald-800">
                        {item.status || 'Approved'}
                      </span>
                    </td>

                    <td className="py-4 px-6 font-extrabold text-emerald-600 dark:text-emerald-400">
                      ${(item.raisedAmount ?? 0).toLocaleString()} / ${item.fundingGoal?.toLocaleString()}
                    </td>

                    <td className="py-4 px-6 text-center whitespace-nowrap">
                      <button
                        onClick={() => handleDelete(item._id)}
                        disabled={deletingId === item._id}
                        className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white font-medium text-xs rounded-lg shadow transition disabled:opacity-50 cursor-pointer"
                      >
                        {deletingId === item._id ? 'Deleting...' : 'Delete Campaign'}
                      </button>
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
