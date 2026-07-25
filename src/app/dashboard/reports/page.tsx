'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

export interface ReportItem {
  _id: string;
  supporterName?: string;
  supporterEmail?: string;
  campaignTitle: string;
  campaignId: string;
  reason: string;
  date?: string;
  createdAt?: string;
}

export default function AdminReportsPage() {
  const { user, loading: authLoading } = useAuth();
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchReports = async () => {
      const token = localStorage.getItem('access-token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('http://localhost:5000/api/admin/reports', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token,
          },
        });

        const data = await response.json();

        if (response.ok) {
          setReports(Array.isArray(data) ? data : []);
        } else {
          console.error('Failed to fetch reports:', data);
        }
      } catch (err) {
        console.error('Error fetching admin reports:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === 'Admin') {
      fetchReports();
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
            Admins only. You do not have permission to view campaign reports.
          </p>
        </div>
      </div>
    );
  }

  const handleAction = (report: ReportItem) => {
    alert('Action taken on campaign (Dummy action for now)');
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
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
            Campaign Reports
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Review user-submitted reports for suspicious or fraudulent campaigns.
          </p>
        </div>

        <div className="px-4 py-2 bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 rounded-full text-xs font-bold border border-red-200 dark:border-red-800">
          Total Reports: {reports.length}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-3 bg-white dark:bg-gray-800 rounded-2xl shadow-md p-8 border border-gray-100 dark:border-gray-700">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">Loading...</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 p-8 space-y-3">
          <span className="text-4xl">🛡️</span>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">No reports submitted.</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            There are currently no reported campaigns.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 text-xs font-bold uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
                  <th className="py-4 px-6">Reporter Name</th>
                  <th className="py-4 px-6">Campaign Title</th>
                  <th className="py-4 px-6">Reason</th>
                  <th className="py-4 px-6">Date</th>
                  <th className="py-4 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                {reports.map((item) => (
                  <tr
                    key={item._id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors"
                  >
                    <td className="py-4 px-6 font-semibold text-gray-900 dark:text-white">
                      {item.supporterName || item.supporterEmail || 'Anonymous'}
                    </td>

                    <td className="py-4 px-6 font-medium text-gray-800 dark:text-gray-200 max-w-xs truncate">
                      {item.campaignTitle}
                    </td>

                    <td className="py-4 px-6 text-gray-600 dark:text-gray-300 max-w-md">
                      {item.reason}
                    </td>

                    <td className="py-4 px-6 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {formatDate(item.date || item.createdAt)}
                    </td>

                    <td className="py-4 px-6 text-center whitespace-nowrap">
                      <button
                        onClick={() => handleAction(item)}
                        className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white font-medium text-xs rounded-lg shadow transition cursor-pointer"
                      >
                        Suspend/Delete
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
