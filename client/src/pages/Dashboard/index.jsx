import React, { useState } from 'react';
import Sidebar from '../layout/sidebar';
import Header from '../layout/header';
import Consultant from '../Consultant';
import DrugShop from '../DrugShop';
import Cart from '../Cart';
import StatsCards from './StatsCards';
import AdsBanner from './adsbanner';

export default function Dashboard() {
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
      case 'consultation':
        return <Consultant />;
      case 'drugshop':
        return <DrugShop />;
      case 'cart':
        return <Cart />;
      case 'profile':
        return (
          <div className="px-4 md:px-6 lg:px-8 py-6 md:py-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Profile Settings</h2>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <p className="text-gray-600">Profile page content coming soon...</p>
            </div>
          </div>
        );
      case 'dashboard':
      default:
        return (
          <div className="px-4 md:px-6 lg:px-8 py-6 md:py-8">
            {/* Stats Cards */}
            <StatsCards />
            
            {/* Promotional Ads Banner */}
            <AdsBanner />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar 
        currentTab={currentTab} 
        onTabChange={setCurrentTab}
        onExpandChange={setIsSidebarExpanded}
      />
      
      {/* Main Content Area */}
      <div 
        className={`transition-all duration-300 ${isSidebarExpanded ? 'ml-64' : 'ml-20'}`}
        style={{ minHeight: '100vh' }}
      >
        {/* Header */}
        <Header onNavigate={handleProfileNavigation} />
        
        {renderContent()}
      </div>
    </div>
  );
}
