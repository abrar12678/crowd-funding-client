'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function DashboardPage() {
  const { user, loading, logOut } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logOut();
    router.push('/');
  };

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            {user.profilepictureurl ? (
              <img
                src={user.profilepictureurl}
                alt={user.name}
                className="w-20 h-20 rounded-full object-cover border-4 border-white/30 shadow-lg"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-white/20 text-white flex items-center justify-center text-3xl font-extrabold shadow-lg">
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
            <p className="text-xs font-semibold text-white/80 uppercase tracking-wider">Available Balance</p>
            <p className="text-3xl font-black text-white mt-1">💳 {user.credits ?? 0} Credits</p>
          </div>
        </div>
      </div>

      {/* Role Summary Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Account Status</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            You are logged in as <span className="font-semibold text-indigo-600 dark:text-indigo-400">{user.role}</span>. Access your feature suite from the left sidebar navigation menu.
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl shadow transition focus:outline-none focus:ring-2 focus:ring-red-500 text-sm cursor-pointer whitespace-nowrap"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
