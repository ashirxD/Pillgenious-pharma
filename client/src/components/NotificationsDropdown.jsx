import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNotifications, useMarkAllAsRead, notificationsKeys } from '../hooks/api/useNotifications';
import { useQueryClient } from '@tanstack/react-query';
import useAuthStore from '../store/useAuthStore';
import { initSocket } from '../utils/socket';

const VARIANT_STYLES = {
  default: {
    hover: 'hover:text-teal-600 hover:bg-gray-100',
    badge: 'bg-red-500',
  },
  admin: {
    hover: 'hover:text-purple-600 hover:bg-gray-100',
    badge: 'bg-purple-500',
  },
  pharmacy: {
    hover: 'hover:text-emerald-600 hover:bg-emerald-50',
    badge: 'bg-red-500',
  },
};

const formatTimestamp = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString();
};

export default function NotificationsDropdown({ variant = 'default', buttonClassName = '' }) {
  const styles = VARIANT_STYLES[variant] || VARIANT_STYLES.default;
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const queryClient = useQueryClient();
  const token = useAuthStore((state) => state.token);

  const { data: notificationsResponse, isLoading, isError, error } = useNotifications();
  const notifications = useMemo(() => {
    const result = Array.isArray(notificationsResponse) ? notificationsResponse : [];
    console.log('[NotificationsDropdown] Notifications data:', {
      response: notificationsResponse,
      processed: result,
      count: result.length
    });
    return result;
  }, [notificationsResponse]);
  const unreadCount = notifications.filter((notification) => !notification.isRead).length;

  const markAllAsRead = useMarkAllAsRead();

  // Socket integration for real-time notifications
  useEffect(() => {
    if (!token) {
      return;
    }

    const socket = initSocket(token);

    const handleNotification = (notification) => {
      // Invalidate queries to refresh notifications
      queryClient.invalidateQueries({ queryKey: notificationsKeys.all });
      queryClient.invalidateQueries({ queryKey: notificationsKeys.count() });
      queryClient.invalidateQueries({ queryKey: notificationsKeys.unread() });
    };

    socket.on('notification:new', handleNotification);

    return () => {
      socket.off('notification:new', handleNotification);
    };
  }, [token, queryClient]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`relative p-2 text-gray-600 rounded-full transition-all duration-200 ${styles.hover} ${buttonClassName}`}
        aria-label="Notifications"
        aria-expanded={isOpen}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {unreadCount > 0 && (
          <span className={`absolute top-1 right-1 flex items-center justify-center min-w-[0.75rem] h-[0.75rem] px-[6px] rounded-full text-[10px] font-semibold text-white ring-2 ring-white ${styles.badge}`}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-hidden bg-white rounded-xl shadow-lg border border-gray-100 z-50">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-gray-800">Notifications</h3>
              <p className="text-xs text-gray-500">Latest updates about your activity</p>
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => markAllAsRead.mutate()}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={markAllAsRead.isPending}
              >
                {markAllAsRead.isPending ? 'Updating...' : 'Mark all'}
              </button>
            )}
          </div>

          <div className="max-h-72 overflow-y-auto">
            {isLoading && (
              <div className="p-4 text-sm text-gray-500">Loading notifications...</div>
            )}

            {isError && (
              <div className="p-4 text-sm text-red-500">
                <p className="font-semibold mb-1">Failed to load notifications</p>
                <p className="text-xs text-red-400">
                  {error?.response?.data?.error || error?.message || 'Please try again later.'}
                </p>
              </div>
            )}

            {!isLoading && !isError && notifications.length === 0 && (
              <div className="p-6 text-sm text-center text-gray-500">
                <p>You are all caught up!</p>
                <button
                  type="button"
                  onClick={() => queryClient.invalidateQueries({ queryKey: notificationsKeys.all })}
                  className="mt-2 text-xs text-indigo-600 hover:text-indigo-700 underline"
                >
                  Refresh
                </button>
              </div>
            )}

            {!isLoading && !isError && notifications.length > 0 && (
              <ul className="divide-y divide-gray-100">
                {notifications.slice(0, 15).map((notification) => (
                  <li
                    key={notification._id || notification.id}
                    className={`px-4 py-3 text-sm transition-colors ${notification.isRead ? 'bg-white' : 'bg-gray-50'}`}
                  >
                    <p className="text-gray-800">{notification.message}</p>
                    {notification.payload?.orderId && (
                      <p className="text-xs text-gray-500 mt-1">
                        Order ID: {notification.payload.orderId}
                      </p>
                    )}
                    {notification.payload?.drugName && (
                      <p className="text-xs text-gray-500 mt-1">
                        Drug: {notification.payload.drugName}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      {formatTimestamp(notification.createdAt)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

