import React, { useState } from 'react';
import Sidebar from '../layout/sidebar';
import Header from '../layout/header';
import Consultant from '../Consultant';
import { useDrugs } from '../../hooks/api/useDrugs';
import { useAddToCart } from '../../hooks/api/useOrders';

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

  // Fetch medicines using React Query
  const { 
    data: medicinesData, 
    isLoading: loading, 
    isError, 
    error 
  } = useDrugs();

  // Add to cart mutation
  const addToCartMutation = useAddToCart();

  // Handle add to cart
  const handleAddToCart = (medicine) => {
    addToCartMutation.mutate({
      drugId: medicine.id,
      quantity: 1,
      price: medicine.price,
    });
  };

  // Sample medicine data (fallback)
  const sampleMedicines = [
    {
      id: 1,
      name: 'Paracetamol 500mg',
      category: 'Pain Relief',
      price: '$5.99',
      stock: 'In Stock',
      description: 'Effective pain relief and fever reducer',
      manufacturer: 'Generic Pharma'
    },
    {
      id: 2,
      name: 'Amoxicillin 250mg',
      category: 'Antibiotics',
      price: '$12.99',
      stock: 'In Stock',
      description: 'Broad-spectrum antibiotic',
      manufacturer: 'MediCare Labs'
    },
    {
      id: 3,
      name: 'Ibuprofen 400mg',
      category: 'Pain Relief',
      price: '$7.49',
      stock: 'Low Stock',
      description: 'Anti-inflammatory pain reliever',
      manufacturer: 'HealthPlus'
    },
    {
      id: 4,
      name: 'Omeprazole 20mg',
      category: 'Digestive',
      price: '$9.99',
      stock: 'In Stock',
      description: 'Reduces stomach acid production',
      manufacturer: 'DigestiCare'
    },
    {
      id: 5,
      name: 'Cetirizine 10mg',
      category: 'Allergy',
      price: '$6.99',
      stock: 'In Stock',
      description: 'Antihistamine for allergy relief',
      manufacturer: 'AllergyFree Inc'
    },
    {
      id: 6,
      name: 'Metformin 500mg',
      category: 'Diabetes',
      price: '$11.99',
      stock: 'In Stock',
      description: 'Blood sugar control medication',
      manufacturer: 'DiabetesControl'
    }
  ];

  // Use API data if available, otherwise use sample data
  const medicines = medicinesData && medicinesData.length > 0 ? medicinesData : sampleMedicines;

  const quickActions = [
    { icon: '💊', title: 'My Prescriptions', count: '3 Active', color: 'bg-blue-500' },
    { icon: '⏰', title: 'Reminders', count: '2 Today', color: 'bg-purple-500' },
    { icon: '🏥', title: 'Appointments', count: '1 Upcoming', color: 'bg-pink-500' },
    { icon: '📋', title: 'Health Records', count: 'View All', color: 'bg-teal-600' }
  ];

  const healthTips = [
    'Remember to take your medications at the same time each day',
    'Stay hydrated - drink at least 8 glasses of water daily',
    'Regular exercise improves medication effectiveness'
  ];

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
          <>
        <div className="px-4 md:px-6 lg:px-8 py-6 md:py-8">
        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          {quickActions.map((action, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border-l-4 border-teal-700 transform hover:-translate-y-1"
            >
              <div className="p-5 md:p-6">
                <div className={`${action.color} w-14 h-14 rounded-xl flex items-center justify-center text-2xl mb-3 shadow-lg`}>
                  {action.icon}
                </div>
                <h3 className="font-bold text-gray-800 text-base md:text-lg mb-1">{action.title}</h3>
                <p className="text-teal-600 font-semibold text-sm md:text-base">{action.count}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Health Tips Banner */}
        <div className="bg-gradient-to-r from-teal-50 to-blue-50 border-l-4 border-teal-700 rounded-xl p-5 md:p-6 mb-6 md:mb-8 shadow-sm">
          <div className="flex items-start">
            <div className="flex-shrink-0 bg-teal-100 rounded-full p-3">
              <span className="text-2xl md:text-3xl">💡</span>
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-lg md:text-xl font-bold text-teal-900 mb-3">Today's Health Tips</h3>
              <ul className="space-y-2 md:space-y-3">
                {healthTips.map((tip, index) => (
                  <li key={index} className="text-teal-800 flex items-start text-sm md:text-base">
                    <span className="text-teal-700 mr-2 mt-1 font-bold">✓</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6 md:mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Search for medicines, prescriptions, or health records..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-5 md:px-6 py-3 md:py-4 rounded-xl border-2 border-gray-200 focus:border-teal-600 focus:ring-2 focus:ring-teal-200 focus:outline-none text-gray-800 shadow-sm transition-all text-sm md:text-base"
            />
            <svg
              className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 md:w-6 md:h-6 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Medicines Section */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-800">Available Medicines</h2>
            <div className="flex gap-3">
              <button className="px-4 md:px-5 py-2 md:py-2.5 bg-white border-2 border-teal-700 text-teal-700 rounded-lg hover:bg-teal-50 transition-all font-semibold text-sm md:text-base shadow-sm hover:shadow-md">
                <span className="hidden sm:inline">Filter</span>
                <span className="sm:hidden">🔍</span>
              </button>
              <button className="px-4 md:px-5 py-2 md:py-2.5 bg-teal-700 text-white rounded-lg hover:bg-teal-800 transition-all font-semibold shadow-md hover:shadow-lg text-sm md:text-base">
                <span className="hidden sm:inline">+ Add Prescription</span>
                <span className="sm:hidden">+ Add</span>
              </button>
            </div>
          </div>

          {/* Error Message */}
          {isError && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-lg">
              <div className="flex items-center">
                <span className="text-2xl mr-3">⚠️</span>
                <div>
                  <p className="font-semibold">Error loading medicines</p>
                  <p className="text-sm">{error?.response?.data?.message || error?.message || 'Failed to load medicines. Showing sample data.'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-700 mb-4"></div>
                <p className="text-gray-600 text-lg">Loading medicines...</p>
              </div>
            </div>
          ) : (
            /* Medicine Cards Grid */
            <div className={`grid gap-4 md:gap-6 ${
              isSidebarExpanded 
                ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' 
                : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
            }`}>
            {medicines.map((medicine) => (
              <div
                key={medicine.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden transform hover:-translate-y-1 group"
              >
                <div className="bg-gradient-to-r from-teal-700 via-teal-600 to-teal-500 h-2"></div>
                <div className="p-5 md:p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-2 group-hover:text-teal-700 transition-colors truncate">
                        {medicine.name}
                      </h3>
                      <span className="inline-block px-3 py-1 bg-gradient-to-r from-teal-100 to-teal-50 text-teal-700 text-xs md:text-sm rounded-full font-semibold border border-teal-200">
                        {medicine.category}
                      </span>
                    </div>
                    <div className="ml-2 flex-shrink-0">
                      <span
                        className={`px-2.5 md:px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                          medicine.stock === 'In Stock'
                            ? 'bg-green-100 text-green-700 border border-green-200'
                            : 'bg-orange-100 text-orange-700 border border-orange-200'
                        }`}
                      >
                        {medicine.stock}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-4 text-sm md:text-base leading-relaxed">{medicine.description}</p>
                  
                  <div className="mb-4 pb-4 border-b border-gray-200">
                    <p className="text-xs md:text-sm text-gray-500 mb-1">Manufacturer</p>
                    <p className="text-gray-800 font-semibold text-sm md:text-base">{medicine.manufacturer}</p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl md:text-3xl font-bold text-teal-700">{medicine.price}</p>
                      <p className="text-xs text-gray-500">per pack</p>
                    </div>
                    <button 
                      onClick={() => handleAddToCart(medicine)}
                      disabled={addToCartMutation.isPending}
                      className="px-4 md:px-6 py-2 md:py-2.5 bg-teal-700 text-white rounded-lg hover:bg-teal-800 active:bg-teal-900 transition-all font-semibold shadow-md hover:shadow-lg text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {addToCartMutation.isPending ? 'Adding...' : 'Add to Cart'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
            </div>
          )}
        </div>

        {/* Additional Info Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mt-6 md:mt-8 mb-6">
          {/* Medication Reminders */}
          <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow p-5 md:p-6 border-t-4 border-purple-500">
            <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-4 flex items-center">
              <div className="bg-purple-100 rounded-full p-2 mr-3">
                <span className="text-xl md:text-2xl">⏰</span>
              </div>
              <span>Upcoming Reminders</span>
            </h3>
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 md:p-4 bg-gradient-to-r from-purple-50 to-purple-25 rounded-lg border border-purple-100 hover:border-purple-300 transition-colors">
                <div className="mb-2 sm:mb-0">
                  <p className="font-bold text-gray-800 text-sm md:text-base">Paracetamol 500mg</p>
                  <p className="text-xs md:text-sm text-gray-600">Take 1 tablet after breakfast</p>
                </div>
                <span className="text-purple-600 font-bold text-sm md:text-base whitespace-nowrap">9:00 AM</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 md:p-4 bg-gradient-to-r from-purple-50 to-purple-25 rounded-lg border border-purple-100 hover:border-purple-300 transition-colors">
                <div className="mb-2 sm:mb-0">
                  <p className="font-bold text-gray-800 text-sm md:text-base">Metformin 500mg</p>
                  <p className="text-xs md:text-sm text-gray-600">Take 1 tablet with dinner</p>
                </div>
                <span className="text-purple-600 font-bold text-sm md:text-base whitespace-nowrap">7:00 PM</span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-gradient-to-br from-teal-700 to-teal-600 rounded-xl shadow-lg hover:shadow-xl transition-shadow p-5 md:p-6 text-white">
            <h3 className="text-lg md:text-xl font-bold mb-5 flex items-center">
              <div className="bg-white/20 rounded-full p-2 mr-3">
                <span className="text-xl md:text-2xl">📊</span>
              </div>
              <span>Your Health Stats</span>
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                <span className="text-teal-50 text-sm md:text-base font-medium">Active Prescriptions</span>
                <span className="text-2xl md:text-3xl font-bold">3</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                <span className="text-teal-50 text-sm md:text-base font-medium">Medications Due Today</span>
                <span className="text-2xl md:text-3xl font-bold">2</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                <span className="text-teal-50 text-sm md:text-base font-medium">Refills Needed</span>
                <span className="text-2xl md:text-3xl font-bold text-orange-300">1</span>
              </div>
            </div>
          </div>
        </div>
      </div>
          </>
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
