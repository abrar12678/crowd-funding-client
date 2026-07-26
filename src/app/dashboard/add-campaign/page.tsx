'use client';

import React, { useState, useRef } from 'react';
import { API_BASE } from '@/lib/api';

export default function AddCampaignPage() {
  const [title, setTitle] = useState('');
  const [story, setStory] = useState('');
  const [category, setCategory] = useState('Technology');
  const [fundingGoal, setFundingGoal] = useState('');
  const [minimumContribution, setMinimumContribution] = useState('');
  const [deadline, setDeadline] = useState('');
  const [rewardInfo, setRewardInfo] = useState('');
  const [campaignImageUrl, setCampaignImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);

  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const IMGBB_API_KEY = 'your-imgbb-api-key'; // Replace with actual imgBB API key

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file.');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Image must be less than 5MB.');
      return;
    }

    setUploading(true);
    setErrorMessage('');

    // Show local preview immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success && data.data?.url) {
        setCampaignImageUrl(data.data.url);
        setImagePreview(data.data.url);
      } else {
        setErrorMessage('Image upload failed. Please try again or use a URL instead.');
        setImagePreview('');
      }
    } catch (err) {
      console.error('Error uploading image:', err);
      setErrorMessage('Network error during image upload. You can still use a URL below.');
      setImagePreview('');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');
    setIsSubmitting(true);

    if (!campaignImageUrl.trim()) {
      setErrorMessage('Please upload a campaign image or provide an image URL.');
      setIsSubmitting(false);
      return;
    }

    const token = localStorage.getItem('access-token');

    if (!token) {
      setErrorMessage('You are not authenticated. Please login first.');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/campaigns`, {
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
        setImagePreview('');
        if (fileInputRef.current) fileInputRef.current.value = '';
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

          {/* #15: Campaign Image Upload (imgBB) + URL fallback */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Campaign Image *
            </label>

            {/* Image Preview */}
            {imagePreview && (
              <div className="mb-3 relative inline-block">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full max-w-xs h-40 object-cover rounded-xl border border-gray-200 dark:border-gray-600"
                  onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                />
                <button
                  type="button"
                  onClick={() => { setImagePreview(''); setCampaignImageUrl(''); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                  className="absolute top-2 right-2 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full text-xs flex items-center justify-center shadow-lg transition cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Upload Button */}
            <div className="flex items-center gap-3 mb-3">
              <label
                htmlFor="campaignImageFile"
                className={`px-4 py-2.5 rounded-lg text-sm font-semibold shadow transition cursor-pointer inline-flex items-center gap-2 ${uploading ? 'bg-gray-400 text-gray-200 cursor-wait' : 'bg-indigo-100 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-800'}`}
              >
                {uploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    Upload Image
                  </>
                )}
              </label>
              <input
                id="campaignImageFile"
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                className="hidden"
              />
              <span className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG, GIF (max 5MB)</span>
            </div>

            {/* URL Fallback — shown when image is uploaded, user can override */}
            <div>
              <label htmlFor="campaignImageUrl" className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                Or paste image URL (overrides upload if provided):
              </label>
              <input
                id="campaignImageUrl"
                type="text"
                value={campaignImageUrl}
                onChange={(e) => { setCampaignImageUrl(e.target.value); setImagePreview(e.target.value); }}
                placeholder="https://example.com/campaign-cover.jpg"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting || uploading}
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
