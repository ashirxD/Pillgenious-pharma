import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../../../utils/axios';

const activityConfig = [
  {
    key: 'latestPharmacyUser',
    title: 'New pharmacy user registered',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    iconPath:
      'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
    formatDescription: (activity) =>
      activity
        ? `${activity.name || 'Unnamed Pharmacy'} • ${activity.email || 'No email provided'}`
        : 'No pharmacy users found.'
  },
  {
    key: 'latestDrug',
    title: 'New medicine added',
    iconBg: 'bg-teal-100',
    iconColor: 'text-teal-600',
    iconPath: 'M12 4v16m8-8H4',
    formatDescription: (activity) =>
      activity
        ? `${activity.drugName || 'Unnamed Drug'} • ${activity.type || 'Unknown type'}`
        : 'No medicines added yet.'
  },
  {
    key: 'latestCompletedOrder',
    title: 'Order completed',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    iconPath: 'M5 13l4 4L19 7',
    formatDescription: (activity) =>
      activity
        ? `${activity.orderNumber || 'Order'} • ${activity.customer?.name || 'Unknown customer'}`
        : 'No orders delivered yet.'
  }
];

const ActivitySkeleton = () => (
  <div className="space-y-4">
    {Array.from({ length: 3 }).map((_, idx) => (
      <div key={idx} className="flex items-start gap-4 pb-4 border-b border-gray-100">
        <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
        </div>
      </div>
    ))}
  </div>
);

const formatRelativeTime = (timestamp) => {
  if (!timestamp) return 'Unknown time';

  const now = new Date();
  const time = new Date(timestamp);
  const diff = now.getTime() - time.getTime();

  if (Number.isNaN(diff)) return 'Unknown time';

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'Just now';
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;

  return time.toLocaleDateString();
};

export default function RecentActivity() {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['dashboard', 'recent-activity'],
    queryFn: async () => {
      const response = await axiosInstance.get('/dashboard/recent-activity');
      return response.data;
    },
    staleTime: 60 * 1000
  });

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">Recent Activity</h2>
        <button
          type="button"
          onClick={() => refetch()}
          className="text-sm font-medium text-purple-600 hover:text-purple-800"
        >
          Refresh
        </button>
      </div>

      {isLoading && !data ? (
        <ActivitySkeleton />
      ) : isError ? (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
          <p className="font-semibold">Unable to load recent activity</p>
          <p className="text-sm mt-1">
            {error?.response?.data?.error || error?.message || 'An unexpected error occurred.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {activityConfig.map((activity) => {
            const record = data?.[activity.key];
            const timestamp =
              activity.key === 'latestPharmacyUser'
                ? record?.createdAt
                : activity.key === 'latestDrug'
                ? record?.createdAt
                : record?.deliveredAt;

            return (
              <div
                key={activity.key}
                className="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-b-0"
              >
                <div
                  className={`w-10 h-10 ${activity.iconBg} rounded-full flex items-center justify-center flex-shrink-0`}
                >
                  <svg className={`w-5 h-5 ${activity.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={activity.iconPath} />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800">{activity.title}</p>
                  <p className="text-xs text-gray-600 mt-1">
                    {activity.formatDescription(record)}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatRelativeTime(timestamp)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

