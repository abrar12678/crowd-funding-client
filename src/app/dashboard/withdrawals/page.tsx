'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function WithdrawalsPage() {
  const { user } = useAuth();
  const [totalRaised, setTotalRaised] = useState<number | null>(null);
  const [loadingStats, setLoadingStats] = useState<boolean>(true);

  const [withdrawCredit, setWithdrawCredit] = useState<string>('');
  const [paymentSystem, setPaymentSystem] = useState<string>('Stripe');
  const [accountNumber, setAccountNumber] = useState<string>('');

  const [successMsg, setSuccessMsg] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Auto-calculated dollar amount (credits / 20)
  const withdrawAmount = withdrawCredit ? (Number(withdrawCredit) / 20).toFixed(2) : '0.00';

  useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem('access-token');
      if (!token) {
        setLoadingStats(false);
        return;
      }

      try {
        const response = await fetch('http://localhost:5000/api/dashboard/stats', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token,
          },
        });

        const data = await response.json();

        if (response.ok && data.stats) {
          setTotalRaised(data.stats.totalRaised ?? 0);
        }
      } catch (err) {
        console.error('Error fetching creator stats:', err);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    const creditsNum = Number(withdrawCredit);

    if (isNaN(creditsNum) || creditsNum < 200) {
      setErrorMsg('Minimum 200 credits required to withdraw.');
      return;
    }

    if (!accountNumber.trim()) {
      setErrorMsg('Please provide a valid account number.');
      return;
    }

    const token = localStorage.getItem('access-token');
    if (!token) {
      setErrorMsg('You are not authenticated. Please login first.');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('http://localhost:5000/api/payments/request-withdrawal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token,
        },
        body: JSON.stringify({
          withdrawCredit: creditsNum,
          withdrawAmount: Number(withdrawAmount),
          paymentSystem,
          accountNumber,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMsg('Withdrawal request submitted successfully!');
        alert('Withdrawal request submitted successfully!');
        setWithdrawCredit('');
        setAccountNumber('');
        setPaymentSystem('Stripe');
      } else {
        setErrorMsg(data.error || data.message || 'Withdrawal request failed.');
      }
    } catch (err: any) {
      console.error('Error submitting withdrawal request:', err);
      setErrorMsg('An unexpected error occurred while processing withdrawal.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-4">
      {/* Top Banner: Creator Stats */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-8 text-white shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black">Withdraw Funds</h1>
          <p className="text-sm text-white/80 mt-1">
            Convert your campaign raised credits into actual funds.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/20 text-center w-full sm:w-auto">
          <p className="text-xs font-semibold text-white/80 uppercase tracking-wider">Total Raised Credits</p>
          <p className="text-3xl font-black text-white mt-1">
            {loadingStats ? '...' : `📈 ${(totalRaised ?? 0).toLocaleString()} credits`}
          </p>
        </div>
      </div>

      {/* Withdrawal Form Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-6 sm:p-10 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Withdrawal Request Form
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Note: Rate is 20 credits = $1 USD. Minimum withdrawal is 200 credits ($10 USD).
          </p>
        </div>

        {successMsg && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-700 dark:text-emerald-300 text-sm font-medium text-center">
            {successMsg}
          </div>
        )}

        {errorMsg && (
          <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-sm font-medium text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Grid: Credits & Calculated Dollar Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label htmlFor="withdrawCredit" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Credits To Withdraw *
              </label>
              <input
                id="withdrawCredit"
                type="number"
                min="200"
                required
                value={withdrawCredit}
                onChange={(e) => setWithdrawCredit(e.target.value)}
                placeholder="e.g. 500"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              />
            </div>

            <div>
              <label htmlFor="withdrawAmount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Withdraw Amount in $ (Auto-calculated)
              </label>
              <input
                id="withdrawAmount"
                type="text"
                disabled
                value={`$${withdrawAmount} USD`}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-bold outline-none cursor-not-allowed"
              />
            </div>
          </div>

          {/* Grid: Payment System & Account Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label htmlFor="paymentSystem" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Select Payment System *
              </label>
              <select
                id="paymentSystem"
                value={paymentSystem}
                onChange={(e) => setPaymentSystem(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition cursor-pointer"
              >
                <option value="Stripe">Stripe</option>
                <option value="Bkash">Bkash</option>
                <option value="Rocket">Rocket</option>
                <option value="Nagad">Nagad</option>
              </select>
            </div>

            <div>
              <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Account Number / Wallet ID *
              </label>
              <input
                id="accountNumber"
                type="text"
                required
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="e.g. 017XXXXXXXX or acct_12345"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg transition disabled:opacity-50 cursor-pointer"
            >
              {submitting ? 'Submitting Request...' : 'Request Withdraw'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
