"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { API_BASE } from '@/lib/api';

// ==========================================
// 1. TypeScript Interfaces & Data Models
// ==========================================

/** Represents the shape of a User object retrieved from the database */
export interface User {
  _id?: string;
  name: string;
  email: string;
  profilepictureurl: string;
  role: 'Supporter' | 'Creator' | 'Admin';
  credits?: number;
  provider?: string;
  createdAt?: string;
}

/** Return signature for the createUser (Registration) action */
export interface CreateUserResult {
  success: boolean;
  error?: string;
  user?: User;
}

/** Return signature for the loginUser (Authentication) action */
export interface LoginUserResult {
  success: boolean;
  error?: string;
  user?: User;
}

/** Shape of the shared state and methods exposed by AuthContext */
export interface AuthContextType {
  user: User | null;
  loading: boolean;
  createUser: (
    email: string,
    password: string,
    name: string,
    photo: string,
    role: string
  ) => Promise<CreateUserResult>;
  loginUser: (
    email: string,
    password: string
  ) => Promise<LoginUserResult>;
  loginWithGoogle: (
    credential: string
  ) => Promise<LoginUserResult>;
  logOut: () => void;
  setUser: (user: User | null) => void;
}

// ==========================================
// 2. React Context Creation
// ==========================================

/** Holds global authentication state (defaults to undefined until Provider initializes) */
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ==========================================
// 3. AuthProvider Component
// ==========================================

/**
 * AuthProvider wraps the application or pages to grant access to
 * global user state, persistent login checks, and auth helper methods.
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Global User State: holds logged-in user details (null if unauthenticated)
  const [user, setUser] = useState<User | null>(null);

  // Loading State: true while checking localStorage session on initial page load
  const [loading, setLoading] = useState<boolean>(true);

  // ------------------------------------------
  // PERSISTENT LOGIN ON INITIAL PAGE LOAD
  // ------------------------------------------
  useEffect(() => {
    try {
      // 1. Check if access token exists in browser storage
      const token = localStorage.getItem('access-token');
      if (token) {
        // 2. Check if saved user JSON string exists
        const savedUserStr = localStorage.getItem('logged-in-user');
        if (savedUserStr) {
          // 3. Parse JSON string back into User object and restore state
          const parsedUser = JSON.parse(savedUserStr);
          setUser(parsedUser);
        }
      }
    } catch (err) {
      console.error('Failed to restore user session from localStorage:', err);
    } finally {
      // 4. Mark initial session check as complete
      setLoading(false);
    }
  }, []);

  // ------------------------------------------
  // CREATE USER (REGISTRATION)
  // ------------------------------------------
  /**
   * Registers a new user via Express backend API endpoint (POST /api/auth/register).
   * Saves JWT token and user profile to localStorage upon success.
   */
  const createUser = async (
    email: string,
    password: string,
    name: string,
    photo: string,
    role: string
  ): Promise<CreateUserResult> => {
    try {
      const response = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
          profilepictureurl: photo,
          role,
        }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        // 1. Store JWT token in localStorage for authenticated API calls
        localStorage.setItem('access-token', data.token);

        // 2. Persist user object in localStorage and update state
        if (data.user) {
          localStorage.setItem('logged-in-user', JSON.stringify(data.user));
          setUser(data.user);
        }
        return { success: true, user: data.user };
      } else {
        const errorMsg = data.error || data.message || 'Registration failed';
        return { success: false, error: errorMsg };
      }
    } catch (err: any) {
      console.error('Registration API error:', err);
      return {
        success: false,
        error: err.message || 'Network error occurred. Please try again.',
      };
    }
  };

  // ------------------------------------------
  // LOGIN USER (AUTHENTICATION)
  // ------------------------------------------
  /**
   * Authenticates existing user via Express backend API endpoint (POST /api/auth/login).
   * Saves JWT token and user profile to localStorage upon success.
   */
  const loginUser = async (
    email: string,
    password: string
  ): Promise<LoginUserResult> => {
    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        // 1. Store JWT token in localStorage for authenticated requests
        localStorage.setItem('access-token', data.token);

        // 2. Persist user object in localStorage and update state
        if (data.user) {
          localStorage.setItem('logged-in-user', JSON.stringify(data.user));
          setUser(data.user);
        }
        return { success: true, user: data.user };
      } else {
        const errorMsg = data.error || data.message || 'Login failed';
        return { success: false, error: errorMsg };
      }
    } catch (err: any) {
      console.error('Login API error:', err);
      return {
        success: false,
        error: err.message || 'Network error occurred. Please try again.',
      };
    }
  };

  // ------------------------------------------
  // LOGIN WITH GOOGLE
  // ------------------------------------------
  /**
   * Authenticates or registers a user via Google Sign-In.
   * Sends the Google ID token (credential) to the server for verification.
   * Server finds or creates the user and returns our JWT.
   */
  const loginWithGoogle = async (
    credential: string
  ): Promise<LoginUserResult> => {
    try {
      const response = await fetch(`${API_BASE}/api/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ credential }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        localStorage.setItem('access-token', data.token);

        if (data.user) {
          localStorage.setItem('logged-in-user', JSON.stringify(data.user));
          setUser(data.user);
        }
        return { success: true, user: data.user };
      } else {
        const errorMsg = data.error || 'Google sign-in failed.';
        return { success: false, error: errorMsg };
      }
    } catch (err: any) {
      console.error('Google auth API error:', err);
      return {
        success: false,
        error: err.message || 'Network error during Google sign-in.',
      };
    }
  };

  // ------------------------------------------
  // LOGOUT USER
  // ------------------------------------------
  /**
   * Clears session tokens from localStorage and resets user state to null.
   */
  const logOut = () => {
    localStorage.removeItem('access-token');
    localStorage.removeItem('logged-in-user');
    setUser(null);
  };

  // Expose context value to child components
  return (
    <AuthContext.Provider value={{ user, loading, setUser, createUser, loginUser, loginWithGoogle, logOut }}>
      {children}
    </AuthContext.Provider>
  );
};

// ==========================================
// 4. Custom Hook for Consuming Auth Context
// ==========================================

/**
 * Custom React Hook to consume AuthContext safely within component trees.
 * Throws an error if used outside an <AuthProvider>.
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
