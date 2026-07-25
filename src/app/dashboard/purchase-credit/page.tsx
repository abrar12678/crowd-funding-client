'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { API_BASE } from '@/lib/api';

export default function PurchaseCreditPage() {
  const { user, setUser } = useAuth();
  const [purchasingIdx, setPurchasingIdx] = useState<number | null>(null);
  const [msg, setMsg] = useState<{type:'success'|'error'; text:string}|null>(null);

  const packages = [
    { credits: 100, price: 10, popular: false },
    { credits: 300, price: 25, popular: true },
    { credits: 800, price: 60, popular: false },
    { credits: 1500, price: 110, popular: false },
  ];

  const handlePurchase = async (credits:number, price:number, idx:number) => {
    setMsg(null); setPurchasingIdx(idx);
    const token = localStorage.getItem('access-token');
    if (!token) { setMsg({type:'error',text:'Please log in first.'}); setPurchasingIdx(null); return; }
    try {
      const res = await fetch(`${API_BASE}/api/payments/purchase-credits`, {
        method:'POST', headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},
        body: JSON.stringify({credits, amount:price}),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg({type:'success', text: data.message || credits+' credits added!'});
        if (data.user) { setUser(data.user); localStorage.setItem('logged-in-user', JSON.stringify(data.user)); }
      } else { setMsg({type:'error', text: data.error || 'Purchase failed.'}); }
    } catch { setMsg({type:'error', text:'Network error.'}); }
    finally { setPurchasingIdx(null); }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-4">
      <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">Purchase Credits</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Top up your balance to back campaigns.</p>
        </div>
        <div className="px-5 py-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-center">
          <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">Current Balance</p>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">Credits: {user?.credits ?? 0}</p>
        </div>
      </div>

      {msg && (
        <div className={`p-4 rounded-xl text-sm font-medium border ${msg.type==='success' ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 text-emerald-600' : 'bg-red-50 dark:bg-red-950/40 border-red-200 text-red-600'}`}>{msg.text}</div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {packages.map((pkg, idx) => (
          <div key={idx} className={`relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border flex flex-col justify-between transform hover:-translate-y-1.5 transition duration-300 ${pkg.popular ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-gray-100 dark:border-gray-700'}`}>
            {pkg.popular && <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow">Most Popular</span>}
            <div className="text-center space-y-4 pt-2">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-3xl font-bold mx-auto shadow-inner">*</div>
              <div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white">{pkg.credits.toLocaleString()} Credits</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Instant Top-Up</p>
              </div>
              <div className="py-2">
                <span className="text-4xl font-black text-indigo-600 dark:text-indigo-400">${pkg.price}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium"> USD</span>
              </div>
            </div>
            <div className="pt-6">
              <button onClick={() => handlePurchase(pkg.credits, pkg.price, idx)} disabled={purchasingIdx===idx} className={`w-full py-3 px-4 rounded-xl font-bold text-sm shadow transition cursor-pointer ${pkg.popular ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-gray-900 hover:bg-black dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white'} disabled:opacity-50`}>
                {purchasingIdx === idx ? 'Processing...' : 'Purchase'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
