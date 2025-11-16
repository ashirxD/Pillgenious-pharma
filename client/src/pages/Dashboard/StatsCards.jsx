import React from 'react';
import { useUserStats } from '../../hooks/api/useDashboard';

const STAT_CONFIG = [
  {
    key: 'totalOrders',
    label: 'Total Orders',
    border: 'border-blue-600',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    iconPath: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z'
  },
  {
    key: 'pendingPaymentOrders',
    label: 'Pending Payment',
    border: 'border-orange-600',
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600',
    iconPath: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z'
  },
  {
    key: 'itemsInCart',
    label: 'Items in Cart',
    border: 'border-teal-600',
    iconBg: 'bg-teal-100',
    iconColor: 'text-teal-600',
    iconPath: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z'
  },
  {
    key: 'availableDrugs',
    label: 'Available Medicines',
    border: 'border-green-600',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    iconPath: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 008 10.172V5L7 4z'
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
  const { data: stats, isLoading, isError, error, refetch } = useUserStats();

  if (isLoading && !stats) {
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
                {stats?.[stat.key] !== undefined ? stats[stat.key].toLocaleString() : '—'}
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

