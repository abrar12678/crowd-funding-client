'use client';

import React, { useState, useEffect } from 'react';
import { API_BASE } from '@/lib/api';

export interface Contribution {
  _id: string;
  campaignTitle?: string;
  title?: string;
  amount: number;
  status: string;
  date?: string;
  createdAt?: string;
}

export default function MyContributionsPage() {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchContributions = async () => {
      setLoading(true);
      const token = localStorage.getItem('access-token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${API_BASE}/api/payments/my-contributions?page=${currentPage}&limit=10`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + token,
            },
          }
        );

        const data = await response.json();

        if (response.ok) {
          setContributions(data.contributions || []);
          setTotalPages(data.totalPages || 1);
        } else {
          console.error('Failed to fetch contributions:', data);
        }
      } catch (err) {
        console.error('Error fetching supporter contributions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchContributions();
  }, [currentPage]);

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
        <span className="px-3 py-1 bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-semibold text-xs rounded-full border border-amber-200 dark:border-amber-800" title="Waiting for Creator approval">
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
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700">
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
          My Contributions
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Track all your backed campaign contributions, credits spent, and approval statuses.
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-3 bg-white dark:bg-gray-800 rounded-2xl shadow-md p-8 border border-gray-100 dark:border-gray-700">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">Loading contributions...</p>
        </div>
      ) : contributions.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 p-8 space-y-3">
          <span className="text-4xl">🤝</span>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">No Contributions Found</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            You haven't backed any campaigns yet. Explore active campaigns to contribute!
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 text-xs font-bold uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
                  <th className="py-4 px-6">Campaign Title</th>
                  <th className="py-4 px-6">Amount</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                {contributions.map((item) => (
                  <tr
                    key={item._id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors"
                  >
                    <td className="py-4 px-6 font-semibold text-gray-900 dark:text-white max-w-xs truncate">
                      {item.campaignTitle || item.title || 'Untitled Campaign'}
                    </td>
                    <td className="py-4 px-6 font-extrabold text-emerald-600 dark:text-emerald-400">
                      ${item.amount?.toLocaleString()} credits
                    </td>
                    <td className="py-4 px-6">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="py-4 px-6 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {formatDate(item.date || item.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              Page {currentPage} of {totalPages}
            </span>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3.5 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    currentPage === pageNum
                      ? 'bg-indigo-600 text-white shadow'
                      : 'bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3.5 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
