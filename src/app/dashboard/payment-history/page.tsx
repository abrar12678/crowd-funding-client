'use client';

import React from 'react';
import Link from 'next/link';

export default function PaymentHistoryPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700">
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
          Payment History
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          View all your previous credit purchases and invoice records.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center shadow-md border border-gray-100 dark:border-gray-700 space-y-4">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-300 rounded-full flex items-center justify-center text-3xl mx-auto">
          💳
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          No payment history yet.
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
          Purchase credits to see them listed here.
        </p>
        <div className="pt-2">
          <Link
            href="/dashboard/purchase-credit"
            className="inline-block px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow transition"
          >
            Buy Credits Now
          </Link>
        </div>
      </div>
    </div>
  );
}
