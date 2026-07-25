'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { API_BASE } from '@/lib/api';

export interface WithdrawalRequest {
  _id: string;
  creatorName?: string;
  creatorEmail?: string;
  withdrawCredit: number;
  withdrawAmount: number;
  paymentSystem: string;
  accountNumber: string;
  status: string;
  date?: string;
  createdAt?: string;
}

export default function WithdrawalRequestsPage() {
  const { user, loading: authLoading } = useAuth();
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchWithdrawals = async () => {
      const token = localStorage.getItem('access-token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // Attempt dedicated admin pending-withdrawals endpoint first
        let response = await fetch(`${API_BASE}/api/admin/pending-withdrawals`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token,
          },
        });

        // Fallback to payments route if needed
        if (!response.ok) {
          response = await fetch(`${API_BASE}/api/payments/my-payments`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + token,
            },
          });
        }

        const data = await response.json();

        if (response.ok && Array.isArray(data)) {
          // Filter to only show pending requests if needed
          const pendingOnly = data.filter((w: WithdrawalRequest) => (w.status || '').toLowerCase() === 'pending');
          setWithdrawals(pendingOnly.length > 0 ? pendingOnly : data);
        } else {
          console.error('Failed to fetch withdrawal requests:', data);
        }
      } catch (err) {
        console.error('Error fetching withdrawal requests:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === 'Admin') {
      fetchWithdrawals();
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
            Admins only. You do not have permission to review withdrawal requests.
          </p>
        </div>
      </div>
    );
  }

  const handleApprove = async (id: string) => {
    const confirmed = window.confirm('Mark this payment as successful?');
    if (!confirmed) return;

    const token = localStorage.getItem('access-token');
    if (!token) return;

    setActionLoadingId(id);

    try {
      const response = await fetch(`${API_BASE}/api/admin/approve-withdrawal/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token,
        },
      });

      const data = await response.json();

      if (response.ok) {
        // UI Update: Filter out approved withdrawal request from local state
        setWithdrawals((prev) => prev.filter((w) => w._id !== id));
      } else {
        alert(data.error || 'Failed to approve withdrawal request.');
      }
    } catch (err) {
      console.error('Error approving withdrawal request:', err);
      alert('Network error while approving withdrawal.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
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
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
            Withdrawal Requests
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Review and approve pending payout requests submitted by creators.
          </p>
        </div>

        <div className="px-4 py-2 bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 rounded-full text-xs font-bold border border-amber-200 dark:border-amber-800">
          Pending Payouts: {withdrawals.length}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-3 bg-white dark:bg-gray-800 rounded-2xl shadow-md p-8 border border-gray-100 dark:border-gray-700">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">Loading...</p>
        </div>
      ) : withdrawals.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 p-8 space-y-3">
          <span className="text-4xl">💰</span>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            No pending withdrawal requests.
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            All payout requests have been processed.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 text-xs font-bold uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
                  <th className="py-4 px-6">Date</th>
                  <th className="py-4 px-6">Creator Name</th>
                  <th className="py-4 px-6">Credits</th>
                  <th className="py-4 px-6">Amount ($)</th>
                  <th className="py-4 px-6">Payment System</th>
                  <th className="py-4 px-6">Account</th>
                  <th className="py-4 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                {withdrawals.map((w) => (
                  <tr
                    key={w._id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors"
                  >
                    <td className="py-4 px-6 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {formatDate(w.date || w.createdAt)}
                    </td>

                    <td className="py-4 px-6 font-semibold text-gray-900 dark:text-white">
                      {w.creatorName || w.creatorEmail || 'Creator'}
                    </td>

                    <td className="py-4 px-6 font-bold text-indigo-600 dark:text-indigo-400">
                      {w.withdrawCredit?.toLocaleString()} credits
                    </td>

                    <td className="py-4 px-6 font-extrabold text-emerald-600 dark:text-emerald-400">
                      ${w.withdrawAmount?.toLocaleString()} USD
                    </td>

                    <td className="py-4 px-6 text-gray-700 dark:text-gray-300">
                      <span className="px-2.5 py-1 bg-gray-100 dark:bg-gray-700 rounded-md text-xs font-medium">
                        {w.paymentSystem}
                      </span>
                    </td>

                    <td className="py-4 px-6 font-mono text-gray-600 dark:text-gray-300">
                      {w.accountNumber}
                    </td>

                    <td className="py-4 px-6 text-center whitespace-nowrap">
                      <button
                        onClick={() => handleApprove(w._id)}
                        disabled={actionLoadingId === w._id}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg shadow transition disabled:opacity-50 cursor-pointer"
                      >
                        {actionLoadingId === w._id ? 'Processing...' : 'Payment Success'}
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
