'use client';

import React, { useState, useEffect } from 'react';
import { API_BASE } from '@/lib/api';

interface Campaign {
  _id: string;
  title: string;
  creatorName: string;
  raisedAmount: number;
  fundingGoal: number;
  campaignImageUrl: string;
  category: string;
}

export default function TopCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTop = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/api/campaigns/top`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (Array.isArray(data)) setCampaigns(data);
      } catch { setError('Unable to load top campaigns.'); }
      finally { setLoading(false); }
    };
    fetchTop();
  }, []);

  if (loading) return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">Top Funded Campaigns</h2>
        <p className="mt-3 text-lg text-gray-600 dark:text-gray-400">Explore the highest-performing projects.</p>
      </div>
      <div className="flex justify-center py-12"><div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div></div>
    </section>
  );

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">Top Funded Campaigns</h2>
        <p className="mt-3 text-lg text-gray-600 dark:text-gray-400">Explore the highest-performing projects.</p>
      </div>
      {error ? <p className="text-center text-gray-500 py-12">{error}</p> :
      campaigns.length === 0 ? <p className="text-center text-gray-500 py-12">No campaigns yet.</p> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {campaigns.map((c) => {
            const pct = Math.min(Math.round((c.raisedAmount / c.fundingGoal) * 100), 100);
            return (
              <div key={c._id} className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg border border-gray-100 dark:border-gray-700 hover:-translate-y-1 hover:shadow-2xl transition flex flex-col group cursor-pointer">
                <div className="relative h-48 w-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                  <img src={c.campaignImageUrl} alt={c.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={(e)=>{(e.target as HTMLImageElement).src='https://picsum.photos/seed/'+c._id+'/600/400'}} />
                  <span className="absolute top-3 left-3 bg-gray-900/80 backdrop-blur-md text-white text-xs font-semibold px-3 py-1 rounded-full border border-white/20">{c.category}</span>
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-2 group-hover:text-indigo-600 transition">{c.title}</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">by <span className="font-medium text-gray-700 dark:text-gray-300">{c.creatorName}</span></p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm font-semibold">
                      <span className="text-emerald-600 dark:text-emerald-400">{c.raisedAmount.toLocaleString()} credits</span>
                      <span className="text-gray-500 dark:text-gray-400">{pct}%</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-700 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full" style={{width:`${pct}%`}}></div>
                    </div>
                  </div>
                </div>
              </div>);
          })}
        </div>
      )}
    </section>
  );
}
