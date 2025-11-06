import React, { useState } from 'react';
import AdminSidebar from '../layout/AdminSidebar';
import AdminHeader from '../layout/AdminHeader';
import PharmacyUser from '../PharmacyUser';
import Drugs from '../Drugs';

export default function AdminDashboard() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

  // Handle profile navigation from header
  const handleProfileNavigation = (page) => {
    if (page === 'profile') {
      setCurrentTab('profile');
    }
  };

  // Render different content based on current tab
  const renderContent = () => {
    switch(currentTab) {
      case 'dashboard':
        return (
          <div className="px-4 md:px-6 lg:px-8 py-6 md:py-8">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-600">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Total Users</p>
                    <p className="text-3xl font-bold text-gray-800 mt-2">89</p>
                    <p className="text-xs text-green-600 font-semibold mt-1">↑ 12% from last month</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-600">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Pharmacy Users</p>
                    <p className="text-3xl font-bold text-gray-800 mt-2">24</p>
                    <p className="text-xs text-green-600 font-semibold mt-1">↑ 5% from last month</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-teal-600">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Total Medicines</p>
                    <p className="text-3xl font-bold text-gray-800 mt-2">156</p>
                    <p className="text-xs text-green-600 font-semibold mt-1">↑ 8% from last month</p>
                  </div>
                  <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 008 10.172V5L7 4z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-orange-600">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Active Orders</p>
                    <p className="text-3xl font-bold text-gray-800 mt-2">42</p>
                    <p className="text-xs text-orange-600 font-semibold mt-1">↓ 3% from last month</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Recent Activity</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-4 pb-4 border-b border-gray-100">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800">New pharmacy user registered</p>
                    <p className="text-xs text-gray-600 mt-1">HealthPlus Pharmacy - 2 hours ago</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 pb-4 border-b border-gray-100">
                  <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800">New medicine added</p>
                    <p className="text-xs text-gray-600 mt-1">Aspirin 500mg - 5 hours ago</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 pb-4 border-b border-gray-100">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800">Order completed</p>
                    <p className="text-xs text-gray-600 mt-1">Order #12453 - 1 day ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'pharmacy-users':
        return <PharmacyUser />;

      case 'medicines':
        return <Drugs />;

      case 'users':
        return (
          <div className="px-4 md:px-6 lg:px-8 py-6 md:py-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Users Management</h2>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <p className="text-gray-600">Users management coming soon...</p>
            </div>
          </div>
        );

      case 'profile':
        return (
          <div className="px-4 md:px-6 lg:px-8 py-6 md:py-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Admin Profile</h2>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <p className="text-gray-600">Admin profile settings coming soon...</p>
            </div>
          </div>
        );

      default:
        return (
          <div className="px-4 md:px-6 lg:px-8 py-6 md:py-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">{currentTab}</h2>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <p className="text-gray-600">Content for {currentTab} coming soon...</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Sidebar */}
      <AdminSidebar 
        currentTab={currentTab} 
        onTabChange={setCurrentTab}
        onExpandChange={setIsSidebarExpanded}
      />
      
      {/* Main Content Area */}
      <div 
        className={`transition-all duration-300 ${isSidebarExpanded ? 'ml-64' : 'ml-20'}`}
        style={{ minHeight: '100vh' }}
      >
        {/* Admin Header */}
        <AdminHeader onNavigate={handleProfileNavigation} />
        
        {renderContent()}
      </div>
    </div>
  );
}

