import React, { useState } from 'react';
import { useDrugs, useDeleteDrug } from '../../../hooks/api/useDrugs';
import DrugCard from './DrugCard';
import AddDrug from './addDrug';

export default function Drugs() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingDrug, setEditingDrug] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedType, setSelectedType] = useState('');

  const { data, isLoading, error, refetch } = useDrugs({
    search: searchQuery || undefined,
    category: selectedCategory || undefined,
    type: selectedType || undefined,
  });

  const deleteMutation = useDeleteDrug();
  const [deletingId, setDeletingId] = useState(null);

  // Extract drugs from response (API returns { drugs, pagination })
  const drugs = data?.drugs || [];

  const handleAddClick = () => {
    setEditingDrug(null);
    setIsAddModalOpen(true);
  };

  const handleEditClick = (drug) => {
    setEditingDrug(drug);
    setIsAddModalOpen(true);
  };

  const handleDeleteClick = async (drugId) => {
    if (window.confirm('Are you sure you want to delete this drug? This action cannot be undone.')) {
      setDeletingId(drugId);
      try {
        await deleteMutation.mutateAsync(drugId);
        refetch();
      } catch (error) {
        // Error is handled by the mutation
      } finally {
        setDeletingId(null);
      }
    }
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setEditingDrug(null);
    refetch();
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

  return (
    <div className="px-4 md:px-6 lg:px-8 py-6 md:py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Drugs Management</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage medicines and drugs inventory
          </p>
        </div>
        <button
          onClick={handleAddClick}
          className="inline-flex items-center px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-sm font-medium"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Drug
        </button>
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
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
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
              className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center"
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
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
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
              : 'Get started by adding a new drug to the inventory.'}
          </p>
          {!hasActiveFilters && (
            <button
              onClick={handleAddClick}
              className="mt-4 inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Your First Drug
            </button>
          )}
        </div>
      )}

      {/* Drugs Grid */}
      {!isLoading && !error && drugs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {drugs.map((drug) => (
            <DrugCard
              key={drug._id}
              drug={drug}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
              isDeleting={deletingId === drug._id}
            />
          ))}
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
          {data.pagination.pages > 1 && (
            <div className="flex gap-2">
              <button
                disabled={data.pagination.page === 1}
                className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                disabled={data.pagination.page === data.pagination.pages}
                className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Modal */}
      <AddDrug
        isOpen={isAddModalOpen}
        onClose={handleCloseModal}
        editingDrug={editingDrug}
      />
    </div>
  );
}

