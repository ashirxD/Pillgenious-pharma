import React from 'react';
import { useAdminUsers } from '../../../hooks/api/useUser';
import UsersTable from './Table';

export default function Users() {
  const { data: users, isLoading, error } = useAdminUsers();

  return (
    <div className="px-4 md:px-6 lg:px-8 py-6 md:py-8">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Users Management</h1>
        <p className="text-sm text-gray-600 mt-1">
          View all registered users and manage their access.
        </p>
      </div>

      {error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
          <p className="font-semibold">Unable to load users</p>
          <p className="text-sm mt-1">
            {error?.response?.data?.error || error?.message || 'An unexpected error occurred.'}
          </p>
        </div>
      ) : (
        <UsersTable users={users} isLoading={isLoading} />
      )}
    </div>
  );
}
