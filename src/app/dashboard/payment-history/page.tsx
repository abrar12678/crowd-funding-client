'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { API_BASE } from '@/lib/api';

interface WithdrawalItem { _id:string; creatorEmail:string; creatorName:string; withdrawCredit:number; withdrawAmount:number; paymentSystem:string; accountNumber:string; status:string; date?:string; createdAt?:string; }
interface PurchaseItem { _id:string; supporterEmail:string; supporterName:string; credits:number; amount:number; paymentMethod:string; status:string; date?:string; }

export default function PaymentHistoryPage() {
  const { user } = useAuth();
  const [withdrawals, setWithdrawals] = useState<WithdrawalItem[]>([]);
  const [purchases, setPurchases] = useState<PurchaseItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access-token');
    if (!token) { setLoading(false); return; }
    const fetch = async () => {
      try {
        if (user?.role === 'Supporter') {
          const r = await fetch(`${API_BASE}/api/payments/my-purchases`, {headers:{'Authorization':'Bearer '+token}});
          const d = await r.json(); if (r.ok && Array.isArray(d)) setPurchases(d);
        } else {
          const r = await fetch(`${API_BASE}/api/payments/my-payments`, {headers:{'Authorization':'Bearer '+token}});
          const d = await r.json(); if (r.ok && Array.isArray(d)) setWithdrawals(d);
        }
      } catch(e) { console.error(e); } finally { setLoading(false); }
    };
    fetch();
  }, [user]);

  const badge = (s:string) => {
    const m:Record<string,string> = {approved:'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 border-emerald-200',completed:'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 border-emerald-200',pending:'bg-amber-100 dark:bg-amber-950/60 text-amber-700 border-amber-200',rejected:'bg-red-100 dark:bg-red-950/60 text-red-700 border-red-200'};
    const c = m[(s||'').toLowerCase()] || 'bg-gray-100 dark:bg-gray-700 text-gray-700';
    return <span className={`px-3 py-1 font-semibold text-xs rounded-full border ${c}`}>{s}</span>;
  };
  const fd = (d?:string) => d ? new Date(d).toLocaleDateString('en-US',{year:'numeric',month:'short',day:'numeric'}) : 'N/A';
  const isS = user?.role === 'Supporter';

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700">
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">{isS ? 'Credit Purchase History' : 'Payment History'}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{isS ? 'Track all your credit purchases and top-ups.' : 'Track all your withdrawal requests and payout statuses.'}</p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 dark:text-gray-400 font-medium mt-3">Loading...</p>
        </div>
      ) : isS ? (
        purchases.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 space-y-3">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 text-gray-400 rounded-full flex items-center justify-center text-3xl mx-auto">$</div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">No purchase history yet.</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Purchase credits to see records here.</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead><tr className="bg-gray-50 dark:bg-gray-700/50 text-xs font-bold uppercase tracking-wider border-b border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300">
                  <th className="py-4 px-6">Date</th><th className="py-4 px-6">Credits</th><th className="py-4 px-6">Amount ($)</th><th className="py-4 px-6">Method</th><th className="py-4 px-6">Status</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                  {purchases.map((i) => (
                    <tr key={i._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/40">
                      <td className="py-4 px-6 text-gray-500 whitespace-nowrap">{fd(i.date)}</td>
                      <td className="py-4 px-6 font-bold text-indigo-600 dark:text-indigo-400">{i.credits?.toLocaleString()}</td>
                      <td className="py-4 px-6 font-extrabold text-emerald-600 dark:text-emerald-400">${i.amount}</td>
                      <td className="py-4 px-6"><span className="px-2.5 py-1 bg-gray-100 dark:bg-gray-700 rounded-md text-xs font-medium capitalize">{i.paymentMethod}</span></td>
                      <td className="py-4 px-6">{badge(i.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : withdrawals.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 space-y-3">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 text-gray-400 rounded-full flex items-center justify-center text-3xl mx-auto">$</div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">No withdrawal history yet.</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Request a withdrawal to see records here.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead><tr className="bg-gray-50 dark:bg-gray-700/50 text-xs font-bold uppercase tracking-wider border-b border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300">
                <th className="py-4 px-6">Date</th><th className="py-4 px-6">Credits</th><th className="py-4 px-6">Amount ($)</th><th className="py-4 px-6">System</th><th className="py-4 px-6">Account</th><th className="py-4 px-6">Status</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                {withdrawals.map((i) => (
                  <tr key={i._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/40">
                    <td className="py-4 px-6 text-gray-500 whitespace-nowrap">{fd(i.date||i.createdAt)}</td>
                    <td className="py-4 px-6 font-bold text-indigo-600 dark:text-indigo-400">{i.withdrawCredit?.toLocaleString()}</td>
                    <td className="py-4 px-6 font-extrabold text-emerald-600 dark:text-emerald-400">${i.withdrawAmount?.toLocaleString()}</td>
                    <td className="py-4 px-6"><span className="px-2.5 py-1 bg-gray-100 dark:bg-gray-700 rounded-md text-xs font-medium">{i.paymentSystem}</span></td>
                    <td className="py-4 px-6 font-mono text-gray-600 dark:text-gray-300">{i.accountNumber}</td>
                    <td className="py-4 px-6">{badge(i.status)}</td>
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
