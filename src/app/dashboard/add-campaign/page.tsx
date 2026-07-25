'use client';

import React, { useState } from 'react';

export default function AddCampaignPage() {
  const [title, setTitle] = useState('');
  const [story, setStory] = useState('');
  const [category, setCategory] = useState('Technology');
  const [fundingGoal, setFundingGoal] = useState('');
  const [minimumContribution, setMinimumContribution] = useState('');
  const [deadline, setDeadline] = useState('');
  const [rewardInfo, setRewardInfo] = useState('');
  const [campaignImageUrl, setCampaignImageUrl] = useState('');

  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');
    setIsSubmitting(true);

    const token = localStorage.getItem('access-token');

    if (!token) {
      setErrorMessage('You are not authenticated. Please login first.');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token,
        },
        body: JSON.stringify({
          title,
          story,
          category,
          fundingGoal: Number(fundingGoal),
          minimumContribution: Number(minimumContribution),
          deadline,
          rewardInfo,
          campaignImageUrl,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage('Campaign created successfully! It is currently pending review by an admin.');
        setTitle('');
        setStory('');
        setCategory('Technology');
        setFundingGoal('');
        setMinimumContribution('');
        setDeadline('');
        setRewardInfo('');
        setCampaignImageUrl('');
      } else {
        setErrorMessage(data.error || data.message || 'Failed to create campaign.');
      }
    } catch (err: any) {
      console.error('Error submitting campaign:', err);
      setErrorMessage('An unexpected network error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-6 sm:p-10 space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
            Create a New Campaign
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Fill in the details to launch your campaign. It will be reviewed by an admin before going live.
          </p>
        </div>

        {successMessage && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-700 dark:text-emerald-300 text-sm font-medium text-center">
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-sm font-medium text-center">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Campaign Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Campaign Title *
            </label>
            <input
              id="title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. EcoSolar: Portable Next-Gen Solar Generator"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
            />
          </div>

          {/* Campaign Story */}
          <div>
            <label htmlFor="story" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Campaign Story *
            </label>
            <textarea
              id="story"
              rows={5}
              required
              value={story}
              onChange={(e) => setStory(e.target.value)}
              placeholder="Tell supporters why your project matters, your vision, and how funds will be utilized..."
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
            />
          </div>

          {/* Category & Deadline Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category *
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition cursor-pointer"
              >
                <option value="Technology">Technology</option>
                <option value="Art">Art</option>
                <option value="Community">Community</option>
                <option value="Health">Health</option>
                <option value="Education">Education</option>
              </select>
            </div>

            <div>
              <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Deadline *
              </label>
              <input
                id="deadline"
                type="date"
                required
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              />
            </div>
          </div>

          {/* Funding Goal & Minimum Contribution Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="fundingGoal" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Funding Goal (Credits) *
              </label>
              <input
                id="fundingGoal"
                type="number"
                min="1"
                required
                value={fundingGoal}
                onChange={(e) => setFundingGoal(e.target.value)}
                placeholder="e.g. 5000"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              />
            </div>

            <div>
              <label htmlFor="minimumContribution" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Minimum Contribution (Credits) *
              </label>
              <input
                id="minimumContribution"
                type="number"
                min="1"
                required
                value={minimumContribution}
                onChange={(e) => setMinimumContribution(e.target.value)}
                placeholder="e.g. 10"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              />
            </div>
          </div>

          {/* Reward Info */}
          <div>
            <label htmlFor="rewardInfo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Reward Info *
            </label>
            <input
              id="rewardInfo"
              type="text"
              required
              value={rewardInfo}
              onChange={(e) => setRewardInfo(e.target.value)}
              placeholder="e.g. Early access beta key + Exclusive Backer Badge"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
            />
          </div>

          {/* Campaign Image URL */}
          <div>
            <label htmlFor="campaignImageUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Campaign Image URL *
            </label>
            <input
              id="campaignImageUrl"
              type="text"
              required
              value={campaignImageUrl}
              onChange={(e) => setCampaignImageUrl(e.target.value)}
              placeholder="https://example.com/campaign-cover.jpg"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? 'Launching Campaign...' : 'Submit Campaign'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
