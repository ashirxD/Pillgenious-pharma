import React, { useState } from 'react';
import { useDrugs } from '../../hooks/api/useDrugs';
import DrugCards from './DrugCards';

export default function DrugShop() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedType, setSelectedType] = useState('');

  const { data, isLoading, error, refetch } = useDrugs({
    search: searchQuery || undefined,
    category: selectedCategory || undefined,
    type: selectedType || undefined,
  });

  // Extract drugs from response (API returns { drugs, pagination })
  const drugs = data?.drugs || [];
  
  // Filter out inactive drugs
  const activeDrugs = drugs.filter(drug => drug.isActive !== false);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedType('');
  };

  const hasActiveFilters = searchQuery || selectedCategory || selectedType;

  const categories = [
    'Pain Relief',
    'Antibiotics',
    'Digestive',
    'Allergy',
    'Diabetes',
    'Cardiovascular',
    'Respiratory',
    'Vitamins & Supplements',
    'Mental Health',
    'Other'
  ];

  const types = ['Tablet', 'Capsule', 'Syrup', 'Injection', 'Cream', 'Drops', 'Inhaler', 'Ointment', 'Other'];

  return (
    <div className="px-4 md:px-6 lg:px-8 py-6 md:py-8 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Drug Shop</h1>
        <p className="text-gray-600">
          Browse and purchase medicines from our pharmacy
        </p>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Search Medicines
            </label>
            <div className="relative">
              <input
                type="text"
                id="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                placeholder="Search by drug name..."
              />
              <svg
                className="absolute left-3 top-3 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              id="category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
              Type
            </label>
            <select
              id="type"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
            >
              <option value="">All Types</option>
              {types.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <div className="mt-4 flex items-center justify-between pt-4 border-t border-gray-200">
            <button
              onClick={clearFilters}
              className="text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center transition-colors"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear Filters
            </button>
            <span className="text-sm text-gray-600">
              {activeDrugs.length} {activeDrugs.length === 1 ? 'medicine' : 'medicines'} found
            </span>
          </div>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mb-4"></div>
          <p className="text-gray-600 text-lg">Loading medicines...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <svg className="mx-auto h-12 w-12 text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-medium text-red-800 mb-2">Error loading medicines</h3>
          <p className="text-sm text-red-600 mb-4">{error.message || 'An error occurred while loading medicines'}</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && activeDrugs.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 008 10.172V5L7 4z" />
          </svg>
          <h3 className="text-xl font-medium text-gray-900 mb-2">No medicines found</h3>
          <p className="text-gray-600 mb-6">
            {hasActiveFilters
              ? 'Try adjusting your filters to see more results.'
              : 'No medicines are available at the moment. Please check back later.'}
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-6 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
            >
              Clear Filters
            </button>
          )}
        </div>
      )}

      {/* Drugs Grid */}
      {!isLoading && !error && activeDrugs.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {activeDrugs.map((drug) => (
              <DrugCards key={drug._id} drug={drug} />
            ))}
          </div>

          {/* Pagination Info */}
          {data?.pagination && (
            <div className="mt-8 flex items-center justify-between text-sm text-gray-600 bg-white rounded-xl shadow-sm p-4">
              <p>
                Showing {((data.pagination.page - 1) * data.pagination.limit) + 1} to{' '}
                {Math.min(data.pagination.page * data.pagination.limit, data.pagination.total)} of{' '}
                {data.pagination.total} medicines
              </p>
              {data.pagination.pages > 1 && (
                <div className="flex gap-2">
                  <button
                    disabled={data.pagination.page === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2 text-gray-700">
                    Page {data.pagination.page} of {data.pagination.pages}
                  </span>
                  <button
                    disabled={data.pagination.page === data.pagination.pages}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

