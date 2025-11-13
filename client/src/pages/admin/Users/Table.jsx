import React, { useMemo, useState } from 'react';
import { useUpdateUserStatus } from '../../../hooks/api/useUser';

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export default function UsersTable({ users = [], isLoading }) {
  const [updatingId, setUpdatingId] = useState(null);
  const updateStatusMutation = useUpdateUserStatus();

  const sortedUsers = useMemo(() => {
    if (!Array.isArray(users)) return [];
    return [...users].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [users]);

  const handleToggleStatus = async (user) => {
    const targetStatus = !user.isActive;
    setUpdatingId(user._id || user.id);

    try {
      await updateStatusMutation.mutateAsync({
        id: user._id || user.id,
        isActive: targetStatus,
      });
    } finally {
      setUpdatingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  if (!sortedUsers.length) {
    return (
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-8 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 11a3 3 0 10-6 0 3 3 0 006 0zM19 20v-1a7 7 0 00-14 0v1" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No users found</h3>
          <p className="mt-2 text-sm text-gray-500">Users will appear here once they register.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedUsers.map((user) => {
              const isUpdating = updatingId === (user._id || user.id);
              const isActive = user.isActive !== false;

              return (
                <tr key={user._id || user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                          <span className="text-purple-600 font-semibold text-sm">
                            {(user.name || user.email || '?').charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name || 'Unnamed User'}</div>
                        <div className="text-xs text-gray-500 md:hidden">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">
                      {user.role || 'user'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {isActive ? 'Active' : 'Blocked'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleToggleStatus(user)}
                      disabled={isUpdating}
                      className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                        isActive
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      } disabled:opacity-60 disabled:cursor-not-allowed`}
                    >
                      {isUpdating ? (
                        <>
                          <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Updating...
                        </>
                      ) : isActive ? (
                        <>
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
                          </svg>
                          Block
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          Activate
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="md:hidden divide-y divide-gray-200">
        {sortedUsers.map((user) => {
          const isUpdating = updatingId === (user._id || user.id);
          const isActive = user.isActive !== false;

          return (
            <div key={user._id || user.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                    <span className="text-purple-600 font-semibold">
                      {(user.name || user.email || '?').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-semibold text-gray-900">{user.name || 'Unnamed User'}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                    <div className="mt-1 flex items-center space-x-2">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">
                        {user.role || 'user'}
                      </span>
                      <span
                        className={`px-2 inline-flex text-xs font-semibold rounded-full ${
                          isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {isActive ? 'Active' : 'Blocked'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Joined {formatDate(user.createdAt)}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleToggleStatus(user)}
                  disabled={isUpdating}
                  className={`ml-3 inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                    isActive ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-green-100 text-green-700 hover:bg-green-200'
                  } disabled:opacity-60 disabled:cursor-not-allowed`}
                >
                  {isUpdating ? (
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : isActive ? (
                    'Block'
                  ) : (
                    'Activate'
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

