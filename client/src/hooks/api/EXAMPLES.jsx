/* 
 * React Query Usage Examples
 * 
 * This file contains example components demonstrating best practices
 * for using React Query hooks in this application.
 */

import React, { useState } from 'react';
import {
  useDrugs,
  useDrug,
  useSearchDrugs,
  useCreateDrug,
  useAddToCart,
} from './index';

// ============================================================================
// Example 1: Simple Data Fetching with Loading and Error States
// ============================================================================
export function DrugListExample() {
  const { data: drugs, isLoading, isError, error } = useDrugs();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-700"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
        <p className="font-semibold">Error loading drugs</p>
        <p className="text-sm">{error?.message}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {drugs?.map((drug) => (
        <div key={drug.id} className="border p-4 rounded-lg">
          <h3 className="font-bold">{drug.name}</h3>
          <p className="text-gray-600">{drug.category}</p>
          <p className="text-teal-700 font-semibold">${drug.price}</p>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// Example 2: Data Fetching with Filters
// ============================================================================
export function FilteredDrugsExample() {
  const [category, setCategory] = useState('all');
  
  const { data: drugs } = useDrugs(
    category !== 'all' ? { category } : {}
  );

  return (
    <div>
      <select 
        value={category} 
        onChange={(e) => setCategory(e.target.value)}
        className="mb-4 px-4 py-2 border rounded-lg"
      >
        <option value="all">All Categories</option>
        <option value="antibiotics">Antibiotics</option>
        <option value="pain-relief">Pain Relief</option>
      </select>

      <div className="grid gap-4">
        {drugs?.map((drug) => (
          <div key={drug.id}>{drug.name}</div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Example 3: Conditional/Enabled Queries
// ============================================================================
export function DrugDetailsExample({ drugId }) {
  // Only fetch if drugId exists
  const { 
    data: drug, 
    isLoading 
  } = useDrug(drugId);
  // The hook automatically uses `enabled: !!drugId`

  if (!drugId) {
    return <p>Select a drug to view details</p>;
  }

  if (isLoading) return <div>Loading drug details...</div>;

  return (
    <div>
      <h2>{drug?.name}</h2>
      <p>{drug?.description}</p>
    </div>
  );
}

// ============================================================================
// Example 4: Search with Debounce
// ============================================================================
export function DrugSearchExample() {
  const [searchQuery, setSearchQuery] = useState('');
  
  // This hook only runs when searchQuery.length >= 2
  const { data: results, isFetching } = useSearchDrugs(searchQuery);

  return (
    <div>
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search drugs..."
          className="w-full px-4 py-2 border rounded-lg"
        />
        {isFetching && (
          <div className="absolute right-3 top-3">
            <div className="animate-spin h-5 w-5 border-2 border-teal-700 rounded-full border-t-transparent"></div>
          </div>
        )}
      </div>

      {searchQuery.length > 0 && searchQuery.length < 2 && (
        <p className="text-sm text-gray-500 mt-2">
          Type at least 2 characters to search
        </p>
      )}

      {results && results.length > 0 && (
        <div className="mt-4 space-y-2">
          {results.map((drug) => (
            <div key={drug.id} className="p-3 border rounded-lg hover:bg-gray-50">
              {drug.name}
            </div>
          ))}
        </div>
      )}

      {results && results.length === 0 && searchQuery.length >= 2 && (
        <p className="text-gray-500 mt-4">No results found</p>
      )}
    </div>
  );
}

// ============================================================================
// Example 5: Mutation with Loading State
// ============================================================================
export function CreateDrugFormExample() {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
  });

  const createMutation = useCreateDrug();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    createMutation.mutate(formData, {
      onSuccess: () => {
        // Reset form after success
        setFormData({ name: '', category: '', price: '' });
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        placeholder="Drug Name"
        className="w-full px-4 py-2 border rounded-lg"
        required
      />
      
      <input
        type="text"
        value={formData.category}
        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
        placeholder="Category"
        className="w-full px-4 py-2 border rounded-lg"
        required
      />
      
      <input
        type="number"
        value={formData.price}
        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
        placeholder="Price"
        className="w-full px-4 py-2 border rounded-lg"
        required
      />

      {createMutation.isError && (
        <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
          {createMutation.error?.message || 'Failed to create drug'}
        </div>
      )}

      <button
        type="submit"
        disabled={createMutation.isPending}
        className="w-full bg-teal-700 text-white py-2 rounded-lg hover:bg-teal-800 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {createMutation.isPending ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Creating...
          </span>
        ) : (
          'Create Drug'
        )}
      </button>
    </form>
  );
}

// ============================================================================
// Example 6: Add to Cart with Success Feedback
// ============================================================================
export function AddToCartButtonExample({ medicine }) {
  const addToCartMutation = useAddToCart();

  const handleAddToCart = () => {
    addToCartMutation.mutate({
      drugId: medicine.id,
      quantity: 1,
      price: medicine.price,
    });
  };

  return (
    <button
      onClick={handleAddToCart}
      disabled={addToCartMutation.isPending}
      className={`px-4 py-2 rounded-lg font-semibold transition-all ${
        addToCartMutation.isSuccess
          ? 'bg-green-600 text-white'
          : 'bg-teal-700 text-white hover:bg-teal-800'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {addToCartMutation.isPending && 'Adding...'}
      {addToCartMutation.isSuccess && '✓ Added!'}
      {!addToCartMutation.isPending && !addToCartMutation.isSuccess && 'Add to Cart'}
    </button>
  );
}

// ============================================================================
// Example 7: Dependent Queries
// ============================================================================
export function DependentQueriesExample() {
  const [selectedDrugId, setSelectedDrugId] = useState(null);

  // First query: Get all drugs
  const { data: drugs } = useDrugs();

  // Second query: Get details of selected drug
  // Only runs when selectedDrugId is truthy
  const { data: drugDetails } = useDrug(selectedDrugId);

  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <h3 className="font-bold mb-4">Drugs List</h3>
        {drugs?.map((drug) => (
          <button
            key={drug.id}
            onClick={() => setSelectedDrugId(drug.id)}
            className={`block w-full text-left p-3 mb-2 rounded-lg ${
              selectedDrugId === drug.id ? 'bg-teal-100' : 'bg-gray-100'
            }`}
          >
            {drug.name}
          </button>
        ))}
      </div>

      <div>
        <h3 className="font-bold mb-4">Drug Details</h3>
        {drugDetails ? (
          <div className="bg-white p-4 rounded-lg border">
            <h4 className="font-bold text-lg">{drugDetails.name}</h4>
            <p className="text-gray-600 mt-2">{drugDetails.description}</p>
            <p className="text-teal-700 font-semibold mt-4">
              ${drugDetails.price}
            </p>
          </div>
        ) : (
          <p className="text-gray-500">Select a drug to view details</p>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Example 8: Paginated Data
// ============================================================================
export function PaginatedDrugsExample() {
  const [page, setPage] = useState(1);
  
  const { data: drugs, isLoading, isPreviousData } = useDrugs(
    { page, limit: 10 },
    { keepPreviousData: true } // Keep old data while fetching new page
  );

  return (
    <div>
      <div className={`${isPreviousData ? 'opacity-50' : ''}`}>
        {drugs?.map((drug) => (
          <div key={drug.id} className="p-4 border-b">
            {drug.name}
          </div>
        ))}
      </div>

      <div className="flex gap-2 mt-4">
        <button
          onClick={() => setPage((old) => Math.max(old - 1, 1))}
          disabled={page === 1}
          className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50"
        >
          Previous
        </button>
        
        <span className="px-4 py-2">Page {page}</span>
        
        <button
          onClick={() => setPage((old) => old + 1)}
          disabled={!drugs || drugs.length < 10}
          className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// Example 9: Multiple Mutations in Sequence
// ============================================================================
export function SequentialMutationsExample({ medicine }) {
  const addToCartMutation = useAddToCart();
  const createOrderMutation = useCreateOrder();

  const handleBuyNow = async () => {
    // First add to cart
    addToCartMutation.mutate(
      {
        drugId: medicine.id,
        quantity: 1,
        price: medicine.price,
      },
      {
        onSuccess: (cartData) => {
          // Then create order
          createOrderMutation.mutate({
            cartId: cartData.id,
            totalAmount: medicine.price,
          });
        },
      }
    );
  };

  const isProcessing = addToCartMutation.isPending || createOrderMutation.isPending;

  return (
    <button
      onClick={handleBuyNow}
      disabled={isProcessing}
      className="px-6 py-3 bg-teal-700 text-white rounded-lg hover:bg-teal-800 disabled:opacity-50"
    >
      {addToCartMutation.isPending && 'Adding to cart...'}
      {createOrderMutation.isPending && 'Creating order...'}
      {!isProcessing && 'Buy Now'}
    </button>
  );
}

// ============================================================================
// Example 10: Refetch on Interval (Real-time Updates)
// ============================================================================
export function RealTimeNotificationsExample() {
  const { data: unreadCount } = useUnreadCount();
  // This automatically refetches every 30 seconds (configured in the hook)

  return (
    <div className="relative">
      <button className="p-2 rounded-full hover:bg-gray-100">
        <span className="text-2xl">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>
    </div>
  );
}

