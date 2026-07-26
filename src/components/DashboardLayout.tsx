'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { API_BASE } from '@/lib/api';

interface NavItem {
  label: string;
  href: string;
  icon?: string;
}

export interface NotificationItem {
  _id?: string;
  message?: string;
  text?: string;
  toEmail?: string;
  actionRoute?: string;
  time?: string;
  createdAt?: string;
  date?: string;
  read?: boolean;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Notification popup states
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showPopup, setShowPopup] = useState<boolean>(false);

  // Private route guard: redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Fetch notifications for logged-in user
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) return;
      const token = localStorage.getItem('access-token');
      if (!token) return;

      try {
        const response = await fetch(`${API_BASE}/api/notifications/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token,
          },
        });

        const data = await response.json();
        if (response.ok && Array.isArray(data)) {
          setNotifications(data);
        }
      } catch (err) {
        console.error('Error fetching notifications in DashboardLayout:', err);
      }
    };

    fetchNotifications();
  }, [user]);

  // Handle clicking outside to close popup
  useEffect(() => {
    const handleDocumentClick = () => {
      setShowPopup(false);
    };

    document.addEventListener('mousedown', handleDocumentClick);
    return () => {
      document.removeEventListener('mousedown', handleDocumentClick);
    };
  }, []);

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render dashboard content if user is not authenticated
  if (!user) {
    return null;
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Dynamic Navigation Links based on User Role
  let navItems: NavItem[] = [];

  if (user?.role === 'Supporter') {
    navItems = [
      { label: 'Home', href: '/dashboard', icon: '🏠' },
      { label: 'Explore Campaigns', href: '/dashboard/explore-campaigns', icon: '🔍' },
      { label: 'My Contributions', href: '/dashboard/my-contributions', icon: '🤝' },
      { label: 'Purchase Credit', href: '/dashboard/purchase-credit', icon: '💳' },
      { label: 'Payment History', href: '/dashboard/payment-history', icon: '📜' },
    ];
  } else if (user?.role === 'Creator') {
    navItems = [
      { label: 'Home', href: '/dashboard', icon: '🏠' },
      { label: 'Add New Campaign', href: '/dashboard/add-campaign', icon: '➕' },
      { label: 'My Campaigns', href: '/dashboard/my-campaigns', icon: '🚀' },
      { label: 'Withdrawals', href: '/dashboard/withdrawals', icon: '🏦' },
      { label: 'Payment History', href: '/dashboard/payment-history', icon: '📜' },
    ];
  } else if (user?.role === 'Admin') {
    navItems = [
      { label: 'Home', href: '/dashboard', icon: '🏠' },
      { label: 'Manage Users', href: '/dashboard/manage-users', icon: '👥' },
      { label: 'Manage Campaigns', href: '/dashboard/manage-campaigns', icon: '📋' },
      { label: 'Campaign Approvals', href: '/dashboard/campaign-approvals', icon: '✅' },
      { label: 'Withdrawal Requests', href: '/dashboard/withdrawal-requests', icon: '💸' },
      { label: 'Reports', href: '/dashboard/reports', icon: '📊' },
    ];
  } else {
    navItems = [
      { label: 'Home', href: '/dashboard', icon: '🏠' },
      { label: 'Explore Campaigns', href: '/dashboard/explore-campaigns', icon: '🔍' },
    ];
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Inner wrapper for sidebar + main content */}
      <div className="flex flex-1">
        {/* Mobile Backdrop Overlay */}
        {isSidebarOpen && (
          <div
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          />
        )}

        {/* Dark Sidebar Component */}
        <aside
          className={`fixed md:sticky top-0 left-0 z-50 h-screen w-64 bg-slate-900 text-white flex flex-col justify-between transition-transform duration-300 ease-in-out border-r border-slate-800 ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
        >
          <div className="p-5 flex-1 overflow-y-auto">
            {/* Top Brand Logo */}
            <div className="flex items-center justify-between pb-6 border-b border-slate-800 mb-6">
              <Link href="/" className="text-xl font-black bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                FundVerse
              </Link>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 font-medium border border-slate-700">
                {user?.role || 'Guest'}
              </span>
            </div>

            {/* Role-based Dynamic Navigation Links */}
            <nav className="space-y-1.5">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">
                Menu Navigation
              </div>
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsSidebarOpen(false)}
                    className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <span className="text-base">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-slate-800 text-xs text-slate-500 text-center">
            FundVerse Dashboard &copy; {new Date().getFullYear()}
          </div>
        </aside>

        {/* Main Right Content Section */}
        <div className="flex-1 flex flex-col min-w-0 min-h-screen">
          {/* Top Header / Top Bar */}
          <header className="sticky top-0 z-30 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm px-4 sm:px-6 py-3 flex items-center justify-between">
            {/* Left Side: Mobile Hamburger Toggle */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 md:hidden focus:outline-none"
                aria-label="Toggle Sidebar"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="text-lg font-bold text-gray-800 dark:text-white hidden sm:block">
                Dashboard
              </h1>
            </div>

            {/* Right Side: Credits, Notifications, User Profile */}
            <div className="flex items-center space-x-4 sm:space-x-6">
              {/* Prominent Credits Badge */}
              <div className="px-3.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-full flex items-center space-x-1.5">
                <span className="text-emerald-500 font-bold text-sm">💳</span>
                <span className="text-xs sm:text-sm font-extrabold text-emerald-700 dark:text-emerald-300">
                  Available Credits: <span className="text-emerald-600 dark:text-emerald-400">{user?.credits ?? 0}</span>
                </span>
              </div>

              {/* Notification Bell Icon with Floating Popup */}
              <div className="relative">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowPopup(!showPopup);
                  }}
                  className="relative p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer focus:outline-none"
                  aria-label="Notifications"
                >
                  <span className="text-xl">🔔</span>
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full min-w-[18px] h-[18px] flex items-center justify-center border-2 border-white dark:border-gray-800 shadow">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Floating Notification Popup */}
                {showPopup && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 shadow-xl rounded-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden text-left"
                  >
                    <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white">Notifications</h4>
                      <Link
                        href="/dashboard/notifications"
                        onClick={() => setShowPopup(false)}
                        className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        View All
                      </Link>
                    </div>

                    <div className="max-h-72 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                          No new notifications.
                        </div>
                      ) : (
                        notifications.slice(0, 5).map((item, idx) => (
                          <Link
                            key={item._id || idx}
                            href="/dashboard/notifications"
                            onClick={() => setShowPopup(false)}
                            className={`block p-3.5 transition ${
                              item.read
                                ? 'hover:bg-gray-50 dark:hover:bg-gray-700/40'
                                : 'bg-indigo-50/50 dark:bg-indigo-950/20 hover:bg-indigo-100 dark:hover:bg-indigo-950/40'
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              {!item.read && (
                                <div className="w-2 h-2 bg-indigo-600 rounded-full mt-1.5 flex-shrink-0"></div>
                              )}
                              <p className={`text-sm leading-snug ${item.read ? 'text-gray-500 dark:text-gray-400' : 'font-medium text-gray-800 dark:text-gray-200'}`}>
                                {item.message || item.text}
                              </p>
                            </div>
                            <span className="block mt-1 text-[11px] text-gray-400 dark:text-gray-500">
                              {new Date(item.time || item.createdAt || item.date || Date.now()).toLocaleDateString()}
                            </span>
                          </Link>
                        ))
                      )}
                    </div>

                    {notifications.length > 0 && (
                      <Link
                        href="/dashboard/notifications"
                        onClick={() => setShowPopup(false)}
                        className="block px-4 py-2.5 text-center text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-gray-50 dark:bg-gray-700/30 hover:bg-indigo-100 dark:hover:bg-indigo-950/30 border-t border-gray-100 dark:border-gray-700 transition"
                      >
                        See All Notifications
                      </Link>
                    )}
                  </div>
                )}
              </div>

              {/* User Profile Info */}
              {user && (
                <div className="flex items-center space-x-3 pl-2 border-l border-gray-200 dark:border-gray-700">
                  {user.profilepictureurl ? (
                    <img
                      src={user.profilepictureurl}
                      alt={user.name}
                      className="w-9 h-9 rounded-full object-cover border-2 border-indigo-500 shadow-sm"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                      {user.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                  <div className="hidden lg:block text-left leading-tight">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      {user.name}
                    </p>
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                      {user.role}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </header>

          {/* Dashboard Child View Area */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            {children}
          </main>

          {/* #30: Dashboard Footer */}
          <footer className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 sm:px-6 py-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500 dark:text-gray-400">
              <p>&copy; {new Date().getFullYear()} FundVerse. All rights reserved.</p>
              <div className="flex items-center gap-4">
                <Link href="/dashboard/notifications" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                  Notifications {unreadCount > 0 && `(${unreadCount} unread)`}
                </Link>
                <span className="text-gray-300 dark:text-gray-600">|</span>
                <span>Credit-based Crowdfunding Platform</span>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
