import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../../../utils/axios';

const STAT_CONFIG = [
  {
    key: 'totalUsers',
    label: 'Total Users',
    border: 'border-purple-600',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
    iconPath:
      'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z'
  },
  {
    key: 'totalPharmacyUsers',
    label: 'Pharmacy Users',
    border: 'border-blue-600',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    iconPath:
      'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
  },
  {
    key: 'totalMedicines',
    label: 'Total Medicines',
    border: 'border-teal-600',
    iconBg: 'bg-teal-100',
    iconColor: 'text-teal-600',
    iconPath:
      'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 008 10.172V5L7 4z'
  },
  {
    key: 'totalOrders',
    label: 'Total Orders',
    border: 'border-orange-600',
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600',
    iconPath: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z'
  }
];

const StatsSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 animate-pulse">
    {Array.from({ length: 4 }).map((_, idx) => (
      <div
        key={idx}
        className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-gray-200 space-y-4"
      >
        <div className="flex items-center justify-between">
          <div className="space-y-3">
            <div className="h-4 w-24 bg-gray-200 rounded"></div>
            <div className="h-8 w-16 bg-gray-200 rounded"></div>
            <div className="h-3 w-20 bg-gray-200 rounded"></div>
          </div>
          <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    ))}
  </div>
);

export default function StatsCards() {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: async () => {
      const response = await axiosInstance.get('/dashboard/stats');
      return response.data;
    },
    staleTime: 60 * 1000
  });

  if (isLoading && !data) {
    return <StatsSkeleton />;
  }

  if (isError) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-8">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-semibold">Unable to load dashboard stats</p>
            <p className="text-sm mt-1">
              {error?.response?.data?.error || error?.message || 'An unexpected error occurred.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            className="text-sm font-semibold text-red-700 hover:text-red-900"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
      {STAT_CONFIG.map((stat) => (
        <div
          key={stat.key}
          className={`bg-white rounded-xl shadow-sm p-6 border-l-4 ${stat.border}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">{stat.label}</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">
                {data?.[stat.key] !== undefined ? data[stat.key].toLocaleString() : '—'}
              </p>
              <p className="text-xs text-gray-400 font-medium mt-1">
                Updated just now
              </p>
            </div>
            <div className={`w-12 h-12 ${stat.iconBg} rounded-lg flex items-center justify-center`}>
              <svg className={`w-6 h-6 ${stat.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.iconPath} />
              </svg>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
