'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export interface User {
  _id?: string;
  name: string;
  email: string;
  profilepictureurl: string;
  role: 'Supporter' | 'Creator';
  credits?: number;
  provider?: string;
  createdAt?: string;
}

export interface CreateUserResult {
  success: boolean;
  error?: string;
  user?: User;
}

export interface LoginUserResult {
  success: boolean;
  error?: string;
  user?: User;
}

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
  logOut: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Persistent Login Check on initial load
    try {
      const token = localStorage.getItem('access-token');
      if (token) {
        const savedUserStr = localStorage.getItem('logged-in-user');
        if (savedUserStr) {
          const parsedUser = JSON.parse(savedUserStr);
          setUser(parsedUser);
        }
      }
    } catch (err) {
      console.error('Failed to restore user session from localStorage:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createUser = async (
    email: string,
    password: string,
    name: string,
    photo: string,
    role: string
  ): Promise<CreateUserResult> => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
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
        localStorage.setItem('access-token', data.token);
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

  const loginUser = async (
    email: string,
    password: string
  ): Promise<LoginUserResult> => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
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

  const logOut = () => {
    localStorage.removeItem('access-token');
    localStorage.removeItem('logged-in-user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, createUser, loginUser, logOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
