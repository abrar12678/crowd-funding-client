'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { API_BASE } from '@/lib/api';

interface NotificationItem {
  _id: string;
  message: string;
  toEmail?: string;
  actionRoute?: string;
  time: string;
  read: boolean;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);
  const [error, setError] = useState('');

  const fetchNotifications = useCallback(async () => {
    const token = localStorage.getItem('access-token');
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE}/api/notifications/`, {
        headers: { 'Authorization': 'Bearer ' + token },
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      await fetchNotifications();
      setLoading(false);
    };
    load();
  }, [fetchNotifications]);

  const markAsRead = async (id: string) => {
    const token = localStorage.getItem('access-token');
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE}/api/notifications/mark-read/${id}`, {
        method: 'PATCH',
        headers: { 'Authorization': 'Bearer ' + token },
      });
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n._id === id ? { ...n, read: true } : n))
        );
      }
    } catch (err) {
      console.error('Error marking notification:', err);
    }
  };

  const markAllAsRead = async () => {
    const token = localStorage.getItem('access-token');
    if (!token) return;
    setMarkingAll(true);

    try {
      const res = await fetch(`${API_BASE}/api/notifications/mark-all-read`, {
        method: 'PATCH',
        headers: { 'Authorization': 'Bearer ' + token },
      });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      }
    } catch (err) {
      setError('Failed to mark all as read.');
    } finally {
      setMarkingAll(false);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
              : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            disabled={markingAll}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-medium rounded-lg transition"
          >
            {markingAll ? 'Marking...' : 'Mark All as Read'}
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm rounded-lg">
          {error}
        </div>
      )}

      {/* Notification List */}
      <div className="space-y-2">
        {notifications.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <span className="text-4xl block mb-3">🔔</span>
            <p className="text-gray-500 dark:text-gray-400 font-medium">No notifications yet.</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              Notifications will appear here when campaigns are approved, contributions are processed, or withdrawals are completed.
            </p>
          </div>
        ) : (
          notifications.map((item) => (
            <div
              key={item._id}
              onClick={() => !item.read && markAsRead(item._id)}
              className={`flex items-start gap-4 p-4 rounded-xl border transition cursor-pointer ${
                item.read
                  ? 'bg-white dark:bg-gray-800/60 border-gray-200 dark:border-gray-700 opacity-70'
                  : 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-950/50'
              }`}
            >
              {/* Unread indicator dot */}
              <div className="flex-shrink-0 mt-1">
                {!item.read ? (
                  <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full shadow-sm shadow-indigo-400"></div>
                ) : (
                  <div className="w-2.5 h-2.5 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                )}
              </div>

              {/* Message + meta */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 leading-snug">
                  {item.message}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">
                  {new Date(item.time).toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>

              {/* Action link */}
              {item.actionRoute && (
                <Link
                  href={item.actionRoute}
                  className="flex-shrink-0 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition whitespace-nowrap mt-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  View &rarr;
                </Link>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
