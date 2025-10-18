import React, { useState } from 'react';
import { useGetPharmacyUsers } from '../../../hooks/api/usePharmacyUsers';
import AddPharmacyUser from './AddPharmacyUser';
import PharmacyUserTable from './Table';

export default function PharmacyUser() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { data: users, isLoading, error } = useGetPharmacyUsers();

  return (
    <div className="px-4 md:px-6 lg:px-8 py-6 md:py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Pharmacy Users</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage pharmacy user accounts and permissions
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-sm font-medium"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Pharmacy User
        </button>
      </div>



      {/* Table */}
      <PharmacyUserTable users={users} isLoading={isLoading} />

      {/* Add User Modal */}
      <AddPharmacyUser 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
}

