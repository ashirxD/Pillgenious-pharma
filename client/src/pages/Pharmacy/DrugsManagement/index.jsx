import React, { useState } from 'react';
import { useDrugs } from '../../../hooks/api/useDrugs';
import { useUpdateStock } from '../../../hooks/api/useDrugs';

export default function DrugsManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [updatingStockId, setUpdatingStockId] = useState(null);
  const [stockChangeValue, setStockChangeValue] = useState({});

  const { data, isLoading, error, refetch } = useDrugs({
    search: searchQuery || undefined,
    category: selectedCategory || undefined,
    type: selectedType || undefined,
  });

  const updateStockMutation = useUpdateStock();

  // Extract drugs from response (API returns { drugs, pagination })
  const drugs = data?.drugs || [];

  const handleStockChange = async (drugId, change) => {
    setUpdatingStockId(drugId);
    try {
      await updateStockMutation.mutateAsync({
        id: drugId,
        quantity: change
      });
      setStockChangeValue({ ...stockChangeValue, [drugId]: '' });
      refetch();
    } catch (error) {
      // Error is handled by the mutation
    } finally {
      setUpdatingStockId(null);
    }
  };

  const handleCustomStockChange = async (drugId) => {
    const value = stockChangeValue[drugId];
    if (!value || value === '0') {
      return;
    }
    const change = parseInt(value, 10);
    if (isNaN(change)) {
      return;
    }
    await handleStockChange(drugId, change);
  };

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

  const getStockStatusColor = (quantity) => {
    if (quantity === 0) return 'bg-red-100 text-red-800';
    if (quantity < 10) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getStockStatusText = (quantity) => {
    if (quantity === 0) return 'Out of Stock';
    if (quantity < 10) return 'Low Stock';
    return 'In Stock';
  };

  return (
    <div className="px-4 md:px-6 lg:px-8 py-6 md:py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Drugs Management</h1>
        <p className="text-sm text-gray-600 mt-1">
          View and manage drug inventory stock levels
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <div className="relative">
              <input
                type="text"
                id="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                placeholder="Search by drug name..."
              />
              <svg
                className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
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
          <div className="mt-4 flex items-center justify-between">
            <button
              onClick={clearFilters}
              className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear Filters
            </button>
            <span className="text-sm text-gray-600">
              {drugs.length} {drugs.length === 1 ? 'drug' : 'drugs'} found
            </span>
          </div>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          <p className="mt-4 text-gray-600">Loading drugs...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <svg className="mx-auto h-12 w-12 text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-medium text-red-800 mb-2">Error loading drugs</h3>
          <p className="text-sm text-red-600">{error.message || 'An error occurred while loading drugs'}</p>
          <button
            onClick={() => refetch()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && drugs.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 008 10.172V5L7 4z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No drugs found</h3>
          <p className="mt-2 text-sm text-gray-500">
            {hasActiveFilters
              ? 'Try adjusting your filters to see more results.'
              : 'No drugs available in the inventory.'}
          </p>
        </div>
      )}

      {/* Drugs Table */}
      {!isLoading && !error && drugs.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Drug Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock Status
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock Management
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {drugs.map((drug) => (
                  <tr key={drug._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{drug.drugName}</div>
                          {drug.description && (
                            <div className="text-sm text-gray-500 line-clamp-1">{drug.description}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {drug.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {drug.category ? (
                        <span className="text-sm text-gray-900">{drug.category}</span>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {drug.stockQuantity || 0} units
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStockStatusColor(drug.stockQuantity || 0)}`}>
                        {getStockStatusText(drug.stockQuantity || 0)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        {/* Quick Decrease Buttons */}
                        <button
                          onClick={() => handleStockChange(drug._id, -1)}
                          disabled={updatingStockId === drug._id || (drug.stockQuantity || 0) === 0}
                          className="px-3 py-1.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Decrease by 1"
                        >
                          -1
                        </button>
                        <button
                          onClick={() => handleStockChange(drug._id, -5)}
                          disabled={updatingStockId === drug._id || (drug.stockQuantity || 0) < 5}
                          className="px-3 py-1.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Decrease by 5"
                        >
                          -5
                        </button>

                        {/* Custom Input */}
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={stockChangeValue[drug._id] || ''}
                            onChange={(e) => setStockChangeValue({ ...stockChangeValue, [drug._id]: e.target.value })}
                            placeholder="±Qty"
                            className="w-20 px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                            disabled={updatingStockId === drug._id}
                          />
                          <button
                            onClick={() => handleCustomStockChange(drug._id)}
                            disabled={updatingStockId === drug._id || !stockChangeValue[drug._id] || stockChangeValue[drug._id] === '0'}
                            className="px-2 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Apply custom change"
                          >
                            Apply
                          </button>
                        </div>

                        {/* Quick Increase Buttons */}
                        <button
                          onClick={() => handleStockChange(drug._id, 5)}
                          disabled={updatingStockId === drug._id}
                          className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Increase by 5"
                        >
                          +5
                        </button>
                        <button
                          onClick={() => handleStockChange(drug._id, 1)}
                          disabled={updatingStockId === drug._id}
                          className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Increase by 1"
                        >
                          +1
                        </button>

                        {updatingStockId === drug._id && (
                          <div className="ml-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-600"></div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination Info */}
      {!isLoading && !error && data?.pagination && (
        <div className="mt-6 flex items-center justify-between text-sm text-gray-600">
          <p>
            Showing {((data.pagination.page - 1) * data.pagination.limit) + 1} to{' '}
            {Math.min(data.pagination.page * data.pagination.limit, data.pagination.total)} of{' '}
            {data.pagination.total} drugs
          </p>
        </div>
      )}
    </div>
  );
}

