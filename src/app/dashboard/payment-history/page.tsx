'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { API_BASE } from '@/lib/api';

export interface PaymentItem {
  _id: string;
  creatorEmail: string;
  creatorName: string;
  withdrawCredit: number;
  withdrawAmount: number;
  paymentSystem: string;
  accountNumber: string;
  status: string;
  date?: string;
  createdAt?: string;
}

export default function PaymentHistoryPage() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchPayments = async () => {
      const token = localStorage.getItem('access-token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/api/payments/my-payments`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token,
          },
        });

        const data = await response.json();

        if (response.ok) {
          setPayments(Array.isArray(data) ? data : []);
        } else {
          console.error('Failed to fetch payment history:', data);
        }
      } catch (err) {
        console.error('Error fetching payment history:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
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
      {/* Page Header */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700">
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
          Payment History
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Track all your withdrawal requests, payment systems, and payout statuses.
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-3 bg-white dark:bg-gray-800 rounded-2xl shadow-md p-8 border border-gray-100 dark:border-gray-700">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">Loading withdrawal history...</p>
        </div>
      ) : payments.length === 0 ? (
        /* Empty State */
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 p-8 space-y-3">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-300 rounded-full flex items-center justify-center text-3xl mx-auto">
            💳
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            No withdrawal history yet.
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            Request a withdrawal of your raised credits to see records listed here.
          </p>
        </div>
      ) : (
        /* Responsive Table Container */
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 text-xs font-bold uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
                  <th className="py-4 px-6">Date</th>
                  <th className="py-4 px-6">Withdraw Credits</th>
                  <th className="py-4 px-6">Withdraw Amount ($)</th>
                  <th className="py-4 px-6">Payment System</th>
                  <th className="py-4 px-6">Account Number</th>
                  <th className="py-4 px-6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                {payments.map((item) => (
                  <tr
                    key={item._id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors"
                  >
                    {/* Date */}
                    <td className="py-4 px-6 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {formatDate(item.date || item.createdAt)}
                    </td>

                    {/* Withdraw Credits */}
                    <td className="py-4 px-6 font-bold text-indigo-600 dark:text-indigo-400">
                      {item.withdrawCredit?.toLocaleString()} credits
                    </td>

                    {/* Withdraw Amount ($) */}
                    <td className="py-4 px-6 font-extrabold text-emerald-600 dark:text-emerald-400">
                      ${item.withdrawAmount?.toLocaleString()} USD
                    </td>

                    {/* Payment System */}
                    <td className="py-4 px-6 text-gray-700 dark:text-gray-300">
                      <span className="px-2.5 py-1 bg-gray-100 dark:bg-gray-700 rounded-md text-xs font-medium">
                        {item.paymentSystem}
                      </span>
                    </td>

                    {/* Account Number */}
                    <td className="py-4 px-6 font-mono text-gray-600 dark:text-gray-300">
                      {item.accountNumber}
                    </td>

                    {/* Status */}
                    <td className="py-4 px-6">
                      {getStatusBadge(item.status)}
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
