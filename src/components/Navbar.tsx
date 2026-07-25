'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const { user, logOut } = useAuth();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logOut();
    router.push('/');
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 shadow-sm border-b border-gray-100 dark:border-gray-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left: Website Logo/Name */}
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
            <Link
              href="#"
              className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-lg shadow-sm transition transform hover:-translate-y-0.5"
            >
              Join as Developer
            </Link>
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

          <Link
            href="#"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block text-center w-full py-2.5 px-4 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg shadow-sm transition"
          >
            Join as Developer
          </Link>
        </div>
      )}
    </header>
  );
}
