'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import GoogleLoginButton from '@/components/GoogleLoginButton';

interface PasswordChecks {
  minLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
}

function RegisterForm() {
  const { createUser, loginWithGoogle } = useAuth();
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [photo, setPhoto] = useState('');
  const [role, setRole] = useState<'Supporter' | 'Creator'>('Supporter');
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const IMGBB_API_KEY = 'your-imgbb-api-key'; // Replace with actual imgBB API key

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Profile photo must be less than 5MB.');
      return;
    }

    setUploading(true);
    setErrorMessage('');

    const reader = new FileReader();
    reader.onloadend = () => { setPhotoPreview(reader.result as string); };
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
        setPhoto(data.data.url);
        setPhotoPreview(data.data.url);
      } else {
        setErrorMessage('Photo upload failed. Please try again or use a URL.');
        setPhotoPreview('');
      }
    } catch (err) {
      console.error('Error uploading photo:', err);
      setErrorMessage('Network error during upload. You can still paste a URL.');
      setPhotoPreview('');
    } finally {
      setUploading(false);
    }
  };

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const passwordChecks: PasswordChecks = {
    minLength: password.length >= 6,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
  };

  const allPasswordChecksPassed = Object.values(passwordChecks).every(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    if (!isValidEmail(email)) {
      setErrorMessage('Please enter a valid email address (e.g. you@example.com).');
      setIsSubmitting(false);
      return;
    }

    if (!allPasswordChecksPassed) {
      setErrorMessage('Password does not meet the strength requirements below.');
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await createUser(email, password, name, photo, role);

      if (result.success) {
        router.push('/dashboard');
      } else {
        setErrorMessage(result.error || 'Registration failed. Please check your information and try again.');
      }
    } catch (err: any) {
      setErrorMessage('An unexpected error occurred during registration.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSuccess = async (credential: string) => {
    setErrorMessage('');
    setGoogleLoading(true);

    try {
      const result = await loginWithGoogle(credential);
      if (result.success) {
        router.push('/dashboard');
      } else {
        setErrorMessage(result.error || 'Google sign-in failed.');
      }
    } catch (err: any) {
      setErrorMessage('An unexpected error occurred during Google sign-in.');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12">
      <div className="w-full max-w-md space-y-6 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Create an Account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Join our platform to get started
          </p>
        </div>

        {/* Google Sign-In Button */}
        <div className="space-y-3">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-gray-800 px-3 text-gray-500 dark:text-gray-400 font-medium">
                Or sign up with
              </span>
            </div>
          </div>
          {googleLoading ? (
            <div className="flex items-center justify-center py-3">
              <div className="w-6 h-6 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-3 text-sm text-gray-600 dark:text-gray-400 font-medium">Signing up with Google...</span>
            </div>
          ) : (
            <GoogleLoginButton onSuccess={handleGoogleSuccess} text="signup_with" />
          )}
        </div>

        <form className="mt-2 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className={`w-full px-4 py-2.5 rounded-lg border bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition ${
                email && !isValidEmail(email)
                  ? 'border-red-500 dark:border-red-500'
                  : 'border-gray-300 dark:border-gray-600'
              }`}
            />
            {email && !isValidEmail(email) && (
              <p className="mt-1 text-xs text-red-500 font-medium">Please enter a valid email address.</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 6 characters"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
            />
            {password.length > 0 && (
              <div className="mt-2 space-y-1">
                <p className={`text-xs font-medium flex items-center gap-1.5 ${passwordChecks.minLength ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                  <span>{passwordChecks.minLength ? '✓' : '✗'}</span> At least 6 characters
                </p>
                <p className={`text-xs font-medium flex items-center gap-1.5 ${passwordChecks.hasUppercase ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                  <span>{passwordChecks.hasUppercase ? '✓' : '✗'}</span> At least one uppercase letter
                </p>
                <p className={`text-xs font-medium flex items-center gap-1.5 ${passwordChecks.hasLowercase ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                  <span>{passwordChecks.hasLowercase ? '✓' : '✗'}</span> At least one lowercase letter
                </p>
                <p className={`text-xs font-medium flex items-center gap-1.5 ${passwordChecks.hasNumber ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                  <span>{passwordChecks.hasNumber ? '✓' : '✗'}</span> At least one number
                </p>
              </div>
            )}
          </div>

          {/* #16: Profile Photo Upload (imgBB) + URL fallback */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Profile Picture
            </label>

            {/* Photo Preview */}
            {photoPreview && (
              <div className="mb-2 relative inline-block">
                <img
                  src={photoPreview}
                  alt="Profile Preview"
                  className="w-16 h-16 rounded-full object-cover border-2 border-indigo-300 dark:border-indigo-600"
                  onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                />
                <button
                  type="button"
                  onClick={() => { setPhotoPreview(''); setPhoto(''); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full text-[10px] flex items-center justify-center shadow transition cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}

            <div className="flex items-center gap-3 mb-2">
              <label
                htmlFor="profilePhotoFile"
                className={`px-3 py-2 rounded-lg text-xs font-semibold shadow transition cursor-pointer inline-flex items-center gap-1.5 ${uploading ? 'bg-gray-400 text-gray-200 cursor-wait' : 'bg-indigo-100 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-800'}`}
              >
                {uploading ? (
                  <>
                    <div className="w-3 h-3 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    Upload Photo
                  </>
                )}
              </label>
              <input
                id="profilePhotoFile"
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                disabled={uploading}
                className="hidden"
              />
              <span className="text-xs text-gray-500 dark:text-gray-400">Max 5MB</span>
            </div>

            <input
              id="photo"
              name="photo"
              type="text"
              value={photo}
              onChange={(e) => { setPhoto(e.target.value); setPhotoPreview(e.target.value); }}
              placeholder="https://example.com/photo.jpg"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
            />
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Role
            </label>
            <select
              id="role"
              name="role"
              value={role}
              onChange={(e) => setRole(e.target.value as 'Supporter' | 'Creator')}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition cursor-pointer"
            >
              <option value="Supporter">Supporter</option>
              <option value="Creator">Creator</option>
            </select>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || !allPasswordChecksPassed || uploading}
              className="w-full py-3 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? 'Registering...' : 'Register'}
            </button>
          </div>
        </form>

        {errorMessage && (
          <div className="p-3.5 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm text-center font-medium">
            {errorMessage}
          </div>
        )}

        <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return <RegisterForm />;
}
