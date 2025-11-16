import React, { useState, useEffect } from 'react';
import { useLogout } from '../../hooks/api/useAuth';

export default function Sidebar({ currentTab, onTabChange, onExpandChange }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const logoutMutation = useLogout();

  // Notify parent component when sidebar expands/collapses
  useEffect(() => {
    if (onExpandChange) {
      onExpandChange(isExpanded);
    }
  }, [isExpanded, onExpandChange]);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const menuItems = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },

    {
      id: 'drugshop',
      name: 'Drug Shop',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      )
    },
    {
      id: 'cart',
      name: 'Shopping Cart',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    {
      id: 'consultation',
      name: 'Consultation',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
        </svg>
      )
    }
  ];


  return (
    <div
      className={`${
        isExpanded ? 'w-64' : 'w-20'
      } bg-white h-screen fixed left-0 top-0 transition-all duration-300 flex flex-col border-r border-gray-200 z-50`}
    >
      {/* Logo Section */}
      <div className="px-6 py-5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 bg-teal-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <g fill="none" fillRule="evenodd">
                <path d="M7.05 9.05a4 4 0 015.657 0l2.243 2.243a4 4 0 010 5.657 4 4 0 01-5.657 0L7.05 14.707a4 4 0 010-5.657z" fill="#fff" />
                <rect x="6.5" y="6.5" width="11" height="5" rx="2.5" transform="rotate(45 12 9)" fill="#fff" opacity="0.9" />
              </g>
            </svg>
          </div>
          {isExpanded && (
            <span className="text-lg font-bold text-gray-800 whitespace-nowrap">Pillgenious</span>
          )}
        </div>
        {isExpanded && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-all"
            title="Collapse sidebar"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
        )}
        {!isExpanded && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-3 w-full text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-all flex items-center justify-center"
            title="Expand sidebar"
          >
            <svg
              className="w-5 h-5 rotate-180"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
        )}
      </div>

      {/* Main Menu */}
      <div className="flex-1 overflow-y-auto py-2">
        <div className="px-3">
          <nav className="space-y-0.5">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onTabChange && onTabChange(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all group ${
                  currentTab === item.id
                    ? 'bg-teal-50 text-teal-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`flex-shrink-0 ${currentTab === item.id ? 'text-teal-600' : 'text-gray-400 group-hover:text-gray-600'}`}>
                    {item.icon}
                  </div>
                  {isExpanded && (
                    <span className="text-sm font-medium whitespace-nowrap">{item.name}</span>
                  )}
                </div>
                {isExpanded && item.badge && (
                  <span
                    className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                      currentTab === item.id
                        ? 'bg-teal-600 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Logout Button */}
      <div className="p-3">
        <button
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
          className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all group text-gray-600 hover:bg-red-50 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="flex-shrink-0 text-gray-400 group-hover:text-red-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </div>
          {isExpanded && (
            <span className="text-sm font-medium whitespace-nowrap">
              {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}

