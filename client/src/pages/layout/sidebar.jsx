import React, { useState, useEffect } from 'react';

export default function Sidebar({ currentTab, onTabChange, onExpandChange }) {
  const [isExpanded, setIsExpanded] = useState(true);

  // Notify parent component when sidebar expands/collapses
  useEffect(() => {
    if (onExpandChange) {
      onExpandChange(isExpanded);
    }
  }, [isExpanded, onExpandChange]);

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
      id: 'medicines',
      name: 'Medicines',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 008 10.172V5L7 4z" />
        </svg>
      ),
      badge: '48'
    },
    {
      id: 'prescriptions',
      name: 'Prescriptions',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      badge: '3'
    },
    {
      id: 'appointments',
      name: 'Appointments',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      badge: '1'
    },
    {
      id: 'records',
      name: 'Health Records',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      id: 'reminders',
      name: 'Reminders',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      badge: '2'
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
      id: 'orders',
      name: 'Order History',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
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

  const settingsItems = [
    {
      id: 'profile',
      name: 'Profile',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
    {
      id: 'settings',
      name: 'Settings',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
    {
      id: 'logout',
      name: 'Logout',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      )
    }
  ];

  return (
    <div
      className={`${
        isExpanded ? 'w-64' : 'w-20'
      } bg-white shadow-xl h-screen fixed left-0 top-0 transition-all duration-300 flex flex-col border-r-2 border-gray-100 z-50`}
    >
      {/* Logo Section */}
      <div className="p-4 border-b-2 border-teal-800 bg-gradient-to-r from-teal-700 to-teal-600 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <g fill="none" fillRule="evenodd">
                  <circle cx="12" cy="12" r="10" fill="#ec4899" opacity="0.14" />
                  <path d="M7.05 9.05a4 4 0 015.657 0l2.243 2.243a4 4 0 010 5.657 4 4 0 01-5.657 0L7.05 14.707a4 4 0 010-5.657z" fill="#fff" />
                  <rect x="6.5" y="6.5" width="11" height="5" rx="2.5" transform="rotate(45 12 9)" fill="#fff" opacity="0.9" />
                </g>
              </svg>
            </div>
            {isExpanded && (
              <span className="text-xl font-bold text-white whitespace-nowrap">Pillgenious</span>
            )}
          </div>
          {isExpanded && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-white hover:bg-white/20 p-2 rounded-lg transition-all shadow-sm"
              title="Collapse sidebar"
            >
              <svg
                className="w-5 h-5 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
          )}
        </div>
        {!isExpanded && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-3 w-full text-white hover:bg-white/20 p-2 rounded-lg transition-all flex items-center justify-center"
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
      <div className="flex-1 overflow-y-auto py-4">
        <div className="px-3">
          {isExpanded && (
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">
              Main Menu
            </p>
          )}
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onTabChange && onTabChange(item.id)}
                className={`w-full flex items-center justify-between px-3 py-3 rounded-lg transition-all group ${
                  currentTab === item.id
                    ? 'bg-teal-700 text-white shadow-md'
                    : 'text-gray-700 hover:bg-teal-50 hover:text-teal-700'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`flex-shrink-0 ${currentTab === item.id ? 'text-white' : 'text-gray-500 group-hover:text-teal-700'}`}>
                    {item.icon}
                  </div>
                  {isExpanded && (
                    <span className="font-medium whitespace-nowrap">{item.name}</span>
                  )}
                </div>
                {isExpanded && item.badge && (
                  <span
                    className={`px-2 py-1 text-xs font-bold rounded-full ${
                      currentTab === item.id
                        ? 'bg-white text-teal-700'
                        : 'bg-teal-100 text-teal-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Settings Section */}
        <div className="px-3 mt-6">
          {isExpanded && (
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">
              Account
            </p>
          )}
          <nav className="space-y-1">
            {settingsItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onTabChange && onTabChange(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg transition-all group ${
                  currentTab === item.id
                    ? 'bg-teal-700 text-white shadow-md'
                    : 'text-gray-700 hover:bg-teal-50 hover:text-teal-700'
                }`}
              >
                <div className={`flex-shrink-0 ${currentTab === item.id ? 'text-white' : 'text-gray-500 group-hover:text-teal-700'}`}>
                  {item.icon}
                </div>
                {isExpanded && (
                  <span className="font-medium whitespace-nowrap">{item.name}</span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* User Profile Section */}
      <div className="p-4 border-t-2 border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-teal-700 to-teal-600 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold shadow-md">
            JD
          </div>
          {isExpanded && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-800 truncate">John Doe</p>
              <p className="text-xs text-gray-600 truncate">john.doe@email.com</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

