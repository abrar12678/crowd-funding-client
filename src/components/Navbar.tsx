'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export interface NotificationItem {
  _id?: string;
  message?: string;
  text?: string;
  toEmail?: string;
  actionRoute?: string;
  time?: string;
  createdAt?: string;
  date?: string;
}

export default function Navbar() {
  const { user, logOut } = useAuth();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Notifications State
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showPopup, setShowPopup] = useState<boolean>(false);

  // Fetch notifications if user is logged in
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) return;
      const token = localStorage.getItem('access-token');
      if (!token) return;

      try {
        const response = await fetch('http://localhost:5000/api/notifications/', {
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
        console.error('Error fetching notifications:', err);
      }
    };

    fetchNotifications();
  }, [user]);

  // Click outside listener to close notification popup
  useEffect(() => {
    const handleDocumentClick = () => {
      setShowPopup(false);
    };

    document.addEventListener('mousedown', handleDocumentClick);
    return () => {
      document.removeEventListener('mousedown', handleDocumentClick);
    };
  }, []);

  const handleLogout = () => {
    logOut();
    router.push('/');
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 shadow-sm border-b border-gray-100 dark:border-gray-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left: Website Logo/Name strictly redirecting to "/" */}
          <div className="flex-shrink-0 flex items-center">
            <Link
              href="/"
              className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
            >
              FundVerse
            </Link>
          </div>

          {/* Right: Desktop Navigation Links */}
          <div className="hidden md:flex md:items-center md:space-x-6">
            <Link
              href="#"
              className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
            >
              Explore Campaigns
            </Link>

            {user ? (
              /* View B: User IS Logged In */
              <>
                <Link
                  href="/dashboard"
                  className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                >
                  Dashboard
                </Link>

                <div className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-full text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                  Credits: {user.credits ?? 0}
                </div>

                {/* Notification Bell with Floating Popup */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowPopup(!showPopup);
                    }}
                    className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer focus:outline-none"
                    aria-label="Notifications"
                  >
                    <span className="text-xl">🔔</span>
                    {notifications.length > 0 && (
                      <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full min-w-[18px] h-[18px] flex items-center justify-center border-2 border-white dark:border-gray-900 shadow">
                        {notifications.length}
                      </span>
                    )}
                  </button>

                  {/* Conditionally Render Floating Notification Popup */}
                  {showPopup && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 shadow-xl rounded-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden text-left"
                    >
                      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white">Notifications</h4>
                        <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                          {notifications.length} new
                        </span>
                      </div>

                      <div className="max-h-72 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700">
                        {notifications.length === 0 ? (
                          <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                            No new notifications.
                          </div>
                        ) : (
                          notifications.map((item, idx) => (
                            <div key={item._id || idx} className="p-3.5 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition">
                              <p className="text-sm font-medium text-gray-800 dark:text-gray-200 leading-snug">
                                {item.message || item.text}
                              </p>
                              <span className="block mt-1 text-[11px] text-gray-400 dark:text-gray-500">
                                {new Date(item.time || item.createdAt || item.date || Date.now()).toLocaleDateString()}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2.5">
                  {user.profilepictureurl ? (
                    <img
                      src={user.profilepictureurl}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover border border-indigo-500"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                      {user.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {user.name}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition cursor-pointer"
                >
                  Logout
                </button>
              </>
            ) : (
              /* View A: User is NOT Logged In */
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                >
                  Login
                </Link>

                <Link
                  href="/register"
                  className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                >
                  Register
                </Link>
              </>
            )}

            {/* Special Button: Join as Developer */}
            <a
              href="https://github.com/abrar12678/crowd-funding-client"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-lg shadow-sm transition transform hover:-translate-y-0.5 inline-block"
            >
              Join as Developer
            </a>
          </div>

          {/* Mobile Hamburger Menu Toggle */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              type="button"
              className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none transition"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 pt-2 pb-4 space-y-3">
          <Link
            href="#"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block text-base font-medium text-gray-700 dark:text-gray-200 hover:text-indigo-600 transition"
          >
            Explore Campaigns
          </Link>

          {user ? (
            <>
              <div className="flex items-center space-x-3 py-2 border-y border-gray-100 dark:border-gray-800 my-2">
                {user.profilepictureurl ? (
                  <img
                    src={user.profilepictureurl}
                    alt={user.name}
                    className="w-9 h-9 rounded-full object-cover border border-indigo-500"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{user.name}</p>
                  <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    Credits: {user.credits ?? 0}
                  </p>
                </div>
              </div>

              <Link
                href="/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-base font-medium text-gray-700 dark:text-gray-200 hover:text-indigo-600 transition"
              >
                Dashboard
              </Link>

              <button
                onClick={handleLogout}
                className="block w-full text-left text-base font-medium text-red-600 hover:text-red-700 transition cursor-pointer"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-base font-medium text-gray-700 dark:text-gray-200 hover:text-indigo-600 transition"
              >
                Login
              </Link>

              <Link
                href="/register"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-base font-medium text-gray-700 dark:text-gray-200 hover:text-indigo-600 transition"
              >
                Register
              </Link>
            </>
          )}

          <a
            href="https://github.com/abrar12678/crowd-funding-client"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block text-center w-full py-2.5 px-4 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg shadow-sm transition"
          >
            Join as Developer
          </a>
        </div>
      )}
    </header>
  );
}
