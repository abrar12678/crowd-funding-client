'use client';

import React, { useState, useEffect } from 'react';
import { useAuth, User } from '@/context/AuthContext';

export default function ManageUsersPage() {
  const { user, loading: authLoading } = useAuth();
  const [usersList, setUsersList] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [updatingEmail, setUpdatingEmail] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem('access-token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('http://localhost:5000/api/admin/users', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token,
          },
        });

        const data = await response.json();

        if (response.ok) {
          setUsersList(Array.isArray(data) ? data : []);
        } else {
          console.error('Failed to fetch users:', data);
        }
      } catch (err) {
        console.error('Error fetching admin users:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === 'Admin') {
      fetchUsers();
    } else {
      setLoading(false);
    }
  }, [user]);

  // Security check: Admins only
  if (!authLoading && user?.role !== 'Admin') {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 text-center">
        <div className="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-2xl p-8 space-y-3">
          <span className="text-4xl">🚫</span>
          <h2 className="text-xl font-bold text-red-700 dark:text-red-300">Access Denied</h2>
          <p className="text-sm text-red-600 dark:text-red-400">
            Admins only. You do not have permission to access user management.
          </p>
        </div>
      </div>
    );
  }

  const handleRoleChange = async (targetEmail: string, newRole: string) => {
    const token = localStorage.getItem('access-token');
    if (!token) return;

    setUpdatingEmail(targetEmail);

    try {
      const response = await fetch(`http://localhost:5000/api/admin/update-role/${targetEmail}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token,
        },
        body: JSON.stringify({ newRole }),
      });

      const data = await response.json();

      if (response.ok) {
        // UI Update: update that specific user's role in local state
        setUsersList((prev) =>
          prev.map((u) => (u.email === targetEmail ? { ...u, role: newRole as any } : u))
        );
      } else {
        alert(data.error || 'Failed to update user role.');
      }
    } catch (err) {
      console.error('Error updating role:', err);
      alert('Network error while updating user role.');
    } finally {
      setUpdatingEmail(null);
    }
  };

  const handleRemoveUser = async (targetEmail: string) => {
    const confirmed = window.confirm(`Are you sure you want to remove user ${targetEmail}?`);
    if (!confirmed) return;

    const token = localStorage.getItem('access-token');
    if (!token) return;

    setUpdatingEmail(targetEmail);

    try {
      const response = await fetch(`http://localhost:5000/api/admin/delete-user/${targetEmail}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token,
        },
      });

      const data = await response.json();

      if (response.ok) {
        // UI Update: filter out deleted user from local state
        setUsersList((prev) => prev.filter((u) => u.email !== targetEmail));
      } else {
        alert(data.error || 'Failed to remove user.');
      }
    } catch (err) {
      console.error('Error deleting user:', err);
      alert('Network error while deleting user.');
    } finally {
      setUpdatingEmail(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
            Manage Users
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            View all registered platform accounts, update user roles, and manage permissions.
          </p>
        </div>

        <div className="px-4 py-2 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-bold border border-indigo-200 dark:border-indigo-800">
          Total Users: {usersList.length}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-3 bg-white dark:bg-gray-800 rounded-2xl shadow-md p-8 border border-gray-100 dark:border-gray-700">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">Loading...</p>
        </div>
      ) : usersList.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 p-8 space-y-3">
          <span className="text-4xl">👥</span>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">No users found.</h3>
        </div>
      ) : (
        /* Responsive Table Container */
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 text-xs font-bold uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
                  <th className="py-4 px-6">Photo</th>
                  <th className="py-4 px-6">Name</th>
                  <th className="py-4 px-6">Email</th>
                  <th className="py-4 px-6">Role</th>
                  <th className="py-4 px-6">Credits</th>
                  <th className="py-4 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                {usersList.map((u) => (
                  <tr
                    key={u._id || u.email}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors"
                  >
                    {/* Photo */}
                    <td className="py-4 px-6">
                      {u.profilepictureurl ? (
                        <img
                          src={u.profilepictureurl}
                          alt={u.name}
                          className="w-10 h-10 rounded-full object-cover border-2 border-indigo-500"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                          {u.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                      )}
                    </td>

                    {/* Name */}
                    <td className="py-4 px-6 font-semibold text-gray-900 dark:text-white">
                      {u.name}
                    </td>

                    {/* Email */}
                    <td className="py-4 px-6 text-gray-600 dark:text-gray-300">
                      {u.email}
                    </td>

                    {/* Current Role Badge */}
                    <td className="py-4 px-6">
                      <span
                        className={`px-3 py-1 text-xs font-bold rounded-full ${
                          u.role === 'Admin'
                            ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                            : u.role === 'Creator'
                            ? 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                            : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>

                    {/* Credits */}
                    <td className="py-4 px-6 font-extrabold text-emerald-600 dark:text-emerald-400">
                      💳 {u.credits ?? 0}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center space-x-3">
                        {/* Role Select Dropdown */}
                        <select
                          value={u.role}
                          disabled={updatingEmail === u.email}
                          onChange={(e) => handleRoleChange(u.email, e.target.value)}
                          className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer disabled:opacity-50"
                        >
                          <option value="Supporter">Supporter</option>
                          <option value="Creator">Creator</option>
                          <option value="Admin">Admin</option>
                        </select>

                        {/* Remove User Button */}
                        <button
                          onClick={() => handleRemoveUser(u.email)}
                          disabled={updatingEmail === u.email}
                          className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white font-medium text-xs rounded-lg shadow transition disabled:opacity-50 cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    </td>
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
