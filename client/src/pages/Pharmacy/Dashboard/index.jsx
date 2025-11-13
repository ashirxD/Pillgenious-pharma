import React, { useState } from 'react';
import PharmacySidebar from '../layout/PharmacySidebar';
import PharmacyHeader from '../layout/PharmacyHeader';
import StatsCards from './StatsCards';
import RecentActivity from './RecentActivity';

export default function PharmacyDashboard() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

  const renderContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return (
          <div className="px-4 md:px-6 lg:px-8 py-6 md:py-8">
            <StatsCards />
            <RecentActivity />
          </div>
        );
      case 'inventory':
        return (
          <div className="px-4 md:px-6 lg:px-8 py-6 md:py-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Inventory Management</h2>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <p className="text-gray-600">Inventory management tools coming soon...</p>
            </div>
          </div>
        );
      case 'orders':
        return (
          <div className="px-4 md:px-6 lg:px-8 py-6 md:py-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Orders</h2>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <p className="text-gray-600">Order tracking and fulfilment features coming soon...</p>
            </div>
          </div>
        );
      case 'reports':
        return (
          <div className="px-4 md:px-6 lg:px-8 py-6 md:py-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Reports & Insights</h2>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <p className="text-gray-600">Analytics and reporting dashboards coming soon...</p>
            </div>
          </div>
        );
      case 'profile':
        return (
          <div className="px-4 md:px-6 lg:px-8 py-6 md:py-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Pharmacy Profile</h2>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <p className="text-gray-600">Profile settings and preferences coming soon...</p>
            </div>
          </div>
        );
      default:
        return (
          <div className="px-4 md:px-6 lg:px-8 py-6 md:py-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 capitalize">{currentTab}</h2>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <p className="text-gray-600">Content for {currentTab} coming soon...</p>
            </div>
          </div>
        );
    }
  };

  const handleNavigate = (destination) => {
    setCurrentTab(destination);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PharmacySidebar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        onExpandChange={setIsSidebarExpanded}
      />

      <div
        className={`transition-all duration-300 ${isSidebarExpanded ? 'ml-64' : 'ml-20'}`}
        style={{ minHeight: '100vh' }}
      >
        <PharmacyHeader onNavigate={handleNavigate} />
        {renderContent()}
      </div>
    </div>
  );
}

