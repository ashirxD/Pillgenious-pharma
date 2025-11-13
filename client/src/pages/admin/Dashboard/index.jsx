import React, { useState } from 'react';
import AdminSidebar from '../layout/AdminSidebar';
import AdminHeader from '../layout/AdminHeader';
import PharmacyUser from '../PharmacyUser';
import Drugs from '../Drugs';
import Users from '../Users';
import StatsCards from './StatsCards';
import RecentActivity from './RecentActivity';

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
            <StatsCards />

            <RecentActivity />
          </div>
        );

      case 'pharmacy-users':
        return <PharmacyUser />;

      case 'medicines':
        return <Drugs />;

      case 'users':
        return <Users />;

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

