'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { API_BASE } from '@/lib/api';

export interface PendingContribution {
  _id: string;
  supporterName?: string;
  supporterEmail: string;
  campaignTitle?: string;
  title?: string;
  amount: number;
  status: string;
  date?: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [pendingContributions, setPendingContributions] = useState<PendingContribution[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchStats = async (token: string) => {
    try {
      const response = await fetch(`${API_BASE}/api/dashboard/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setStats(data.stats || data);
      } else {
        setErrorMsg(data.error || 'Failed to load stats');
      }
    } catch (err: any) {
      console.error('Error fetching dashboard stats:', err);
      setErrorMsg('Error connecting to backend server');
    }
  };

  const fetchPendingContributions = async (token: string) => {
    try {
      const response = await fetch(`${API_BASE}/api/contributions/pending-for-me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setPendingContributions(Array.isArray(data) ? data : []);
      } else {
        console.error('Failed to fetch pending contributions:', data);
      }
    } catch (err: any) {
      console.error('Error fetching pending contributions:', err);
    }
  };

  useEffect(() => {
    const loadDashboardData = async () => {
      const token = localStorage.getItem('access-token');

      if (!token) {
        setLoading(false);
        return;
      }

      await fetchStats(token);

      if (user?.role === 'Creator') {
        await fetchPendingContributions(token);
      }

      setLoading(false);
    };

    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const handleApprove = async (id: string) => {
    const token = localStorage.getItem('access-token');
    if (!token) return;

    setActionLoadingId(id);
    try {
      const response = await fetch(`${API_BASE}/api/contributions/approve/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token,
        },
      });

      const data = await response.json();

      if (response.ok) {
        // UI Update Trick: Filter out approved item from state
        setPendingContributions((prev) => prev.filter((item) => item._id !== id));
        // Refresh stats
        fetchStats(token);
      } else {
        alert(data.error || 'Failed to approve contribution.');
      }
    } catch (err: any) {
      console.error('Error approving contribution:', err);
      alert('Network error while approving contribution.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (id: string) => {
    const token = localStorage.getItem('access-token');
    if (!token) return;

    setActionLoadingId(id);
    try {
      const response = await fetch(`${API_BASE}/api/contributions/reject/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token,
        },
      });

      const data = await response.json();

      if (response.ok) {
        // UI Update Trick: Filter out rejected item from state
        setPendingContributions((prev) => prev.filter((item) => item._id !== id));
      } else {
        alert(data.error || 'Failed to reject contribution.');
      }
    } catch (err: any) {
      console.error('Error rejecting contribution:', err);
      alert('Network error while rejecting contribution.');
    } finally {
      setActionLoadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-600 dark:text-gray-400 font-medium">Loading stats...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-8 text-center text-gray-500 dark:text-gray-400">
        Please log in to view your dashboard.
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            {user.profilepictureurl ? (
              <img
                src={user.profilepictureurl}
                alt={user.name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-4 border-white/30 shadow-lg"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/20 text-white flex items-center justify-center text-3xl font-extrabold shadow-lg">
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
            <div>
              <h1 className="text-2xl sm:text-3xl font-black">
                Welcome back, {user.name}!
              </h1>
              <p className="text-sm text-white/80">{user.email}</p>
              <span className="inline-block mt-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider">
                {user.role} Dashboard
              </span>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/20 text-center w-full md:w-auto">
            <p className="text-xs font-semibold text-white/80 uppercase tracking-wider">Available Credits</p>
            <p className="text-3xl font-black text-white mt-1">💳 {user.credits ?? 0}</p>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm font-medium">
          {errorMsg}
        </div>
      )}

      {/* Dynamic Role-Based Stats Cards Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Overview Statistics
        </h2>

        {/* Supporter View */}
        {user.role === 'Supporter' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 flex items-center space-x-4 transform hover:-translate-y-1 transition duration-300">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center text-3xl shadow-inner">
                📊
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Total Contributions
                </p>
                <p className="text-2xl sm:text-3xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">
                  {stats?.totalContributions ?? 0}
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 flex items-center space-x-4 transform hover:-translate-y-1 transition duration-300">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center text-3xl shadow-inner">
                ⏳
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Pending Contributions
                </p>
                <p className="text-2xl sm:text-3xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">
                  {stats?.pendingContributions ?? 0}
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 flex items-center space-x-4 transform hover:-translate-y-1 transition duration-300">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-3xl shadow-inner">
                💰
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Total Amount Contributed
                </p>
                <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                  ${(stats?.totalAmountContributed ?? 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Creator View */}
        {user.role === 'Creator' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 flex items-center space-x-4 transform hover:-translate-y-1 transition duration-300">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-3xl shadow-inner">
                🚀
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Total Campaigns
                </p>
                <p className="text-2xl sm:text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">
                  {stats?.totalCampaigns ?? 0}
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 flex items-center space-x-4 transform hover:-translate-y-1 transition duration-300">
              <div className="w-14 h-14 rounded-2xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 flex items-center justify-center text-3xl shadow-inner">
                ⚡
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Active Campaigns
                </p>
                <p className="text-2xl sm:text-3xl font-extrabold text-teal-600 dark:text-teal-400 mt-1">
                  {stats?.activeCampaigns ?? 0}
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 flex items-center space-x-4 transform hover:-translate-y-1 transition duration-300">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-3xl shadow-inner">
                📈
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Total Raised Amount
                </p>
                <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                  ${(stats?.totalRaised ?? 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Admin View */}
        {user.role === 'Admin' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 flex items-center space-x-4 transform hover:-translate-y-1 transition duration-300">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center text-3xl shadow-inner">
                👥
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Total Supporters
                </p>
                <p className="text-2xl sm:text-3xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">
                  {stats?.totalSupporters ?? 0}
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 flex items-center space-x-4 transform hover:-translate-y-1 transition duration-300">
              <div className="w-14 h-14 rounded-2xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center text-3xl shadow-inner">
                🎨
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Total Creators
                </p>
                <p className="text-2xl sm:text-3xl font-extrabold text-purple-600 dark:text-purple-400 mt-1">
                  {stats?.totalCreators ?? 0}
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 flex items-center space-x-4 transform hover:-translate-y-1 transition duration-300">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-3xl shadow-inner">
                💎
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Total System Credits
                </p>
                <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                  {(stats?.totalCredits ?? 0).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 flex items-center space-x-4 transform hover:-translate-y-1 transition duration-300">
              <div className="w-14 h-14 rounded-2xl bg-pink-50 dark:bg-pink-950/50 text-pink-600 dark:text-pink-400 flex items-center justify-center text-3xl shadow-inner">
                💳
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Approved Payments
                </p>
                <p className="text-2xl sm:text-3xl font-extrabold text-pink-600 dark:text-pink-400 mt-1">
                  {stats?.totalPayments ?? 0}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Creator Contributions to Review Section */}
      {user.role === 'Creator' && (
        <div className="pt-4 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Contributions to Review
            </h2>
            {pendingContributions.length > 0 && (
              <span className="px-3 py-1 bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-bold text-xs rounded-full border border-amber-200 dark:border-amber-800">
                {pendingContributions.length} Pending
              </span>
            )}
          </div>

          {pendingContributions.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center shadow-md border border-gray-100 dark:border-gray-700 space-y-2">
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                No pending contributions to review right now.
              </p>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 text-xs font-bold uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
                      <th className="py-4 px-6">Supporter Name</th>
                      <th className="py-4 px-6">Campaign Title</th>
                      <th className="py-4 px-6">Amount</th>
                      <th className="py-4 px-6 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                    {pendingContributions.map((contribution) => (
                      <tr
                        key={contribution._id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors"
                      >
                        {/* Supporter Name / Email */}
                        <td className="py-4 px-6 font-semibold text-gray-900 dark:text-white">
                          <div>
                            <p className="font-bold">
                              {contribution.supporterName || 'Anonymous Supporter'}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {contribution.supporterEmail}
                            </p>
                          </div>
                        </td>

                        {/* Campaign Title */}
                        <td className="py-4 px-6 text-gray-700 dark:text-gray-300 max-w-xs truncate">
                          {contribution.campaignTitle || contribution.title || 'Untitled Campaign'}
                        </td>

                        {/* Amount */}
                        <td className="py-4 px-6 font-extrabold text-emerald-600 dark:text-emerald-400">
                          ${contribution.amount?.toLocaleString()} credits
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-6 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center space-x-2">
                            <button
                              onClick={() => handleApprove(contribution._id)}
                              disabled={actionLoadingId === contribution._id}
                              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-lg shadow transition disabled:opacity-50 cursor-pointer"
                            >
                              {actionLoadingId === contribution._id ? 'Processing...' : 'Approve'}
                            </button>
                            <button
                              onClick={() => handleReject(contribution._id)}
                              disabled={actionLoadingId === contribution._id}
                              className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white font-medium text-xs rounded-lg shadow transition disabled:opacity-50 cursor-pointer"
                            >
                              {actionLoadingId === contribution._id ? 'Processing...' : 'Reject'}
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
      )}
    </div>
  );
}
