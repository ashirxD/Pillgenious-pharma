import React from 'react';
import { useAddToCart } from '../../hooks/api/useOrders';

interface Drug {
  _id: string;
  drugName: string;
  type: string;
  category?: string;
  price: number;
  stockQuantity?: number;
  description?: string;
  sideEffects?: string[];
  prescriptionRequired?: boolean;
  images?: string[];
  isActive?: boolean;
  status?: number; // 0 = not in cart, 1 = in cart, 2 = ordered, 3 = other
}

interface DrugCardProps {
  drug: Drug;
}

export default function DrugCards({ drug }: DrugCardProps) {
  const addToCartMutation = useAddToCart();

  const getStockStatusColor = (quantity: number | undefined) => {
    if (!quantity || quantity === 0) return 'bg-red-100 text-red-800';
    if (quantity < 10) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getStockStatusText = (quantity: number | undefined) => {
    if (!quantity || quantity === 0) return 'Out of Stock';
    if (quantity < 10) return 'Low Stock';
    return 'In Stock';
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'Tablet': 'bg-blue-100 text-blue-800',
      'Capsule': 'bg-purple-100 text-purple-800',
      'Syrup': 'bg-pink-100 text-pink-800',
      'Injection': 'bg-red-100 text-red-800',
      'Cream': 'bg-green-100 text-green-800',
      'Drops': 'bg-yellow-100 text-yellow-800',
      'Inhaler': 'bg-indigo-100 text-indigo-800',
      'Ointment': 'bg-orange-100 text-orange-800',
      'Other': 'bg-gray-100 text-gray-800',
    };
    return colors[type] || colors['Other'];
  };

  const handleAddToCart = () => {
    if (!drug.isActive || (drug.stockQuantity && drug.stockQuantity <= 0)) {
      return;
    }

    // Check if drug is already in cart (status 1)
    if (drug.status === 1) {
      return;
    }

    addToCartMutation.mutate({
      drugId: drug._id,
      quantity: 1,
    } as any);
  };

  const isOutOfStock = !drug.stockQuantity || drug.stockQuantity === 0;
  const isDisabled = isOutOfStock || !drug.isActive || addToCartMutation.isPending;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden transform hover:-translate-y-1 group">
      {/* Drug Image/Icon Section */}
      <div className="h-48 bg-gradient-to-br from-teal-100 to-blue-100 flex items-center justify-center relative overflow-hidden">
        {drug.images && drug.images.length > 0 ? (
          <img 
            src={drug.images[0]} 
            alt={drug.drugName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <svg className="w-16 h-16 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 008 10.172V5L7 4z" />
          </svg>
        )}
        {/* Stock Status Badge */}
        <div className="absolute top-3 right-3">
          <span className={`px-3 py-1 text-xs font-semibold rounded-full shadow-sm ${getStockStatusColor(drug.stockQuantity)}`}>
            {getStockStatusText(drug.stockQuantity)}
          </span>
        </div>
        {/* Prescription Required Badge */}
        {drug.prescriptionRequired && (
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800 shadow-sm">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Rx Required
            </span>
          </div>
        )}
      </div>

      {/* Drug Info Section */}
      <div className="p-5">
        {/* Header */}
        <div className="mb-3">
          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-teal-700 transition-colors">
            {drug.drugName}
          </h3>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(drug.type)}`}>
              {drug.type}
            </span>
            {drug.category && (
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                {drug.category}
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        {drug.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {drug.description}
          </p>
        )}

        {/* Side Effects Preview */}
        {drug.sideEffects && drug.sideEffects.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-medium text-gray-500 mb-1">Side Effects:</p>
            <div className="flex flex-wrap gap-1">
              {drug.sideEffects.slice(0, 2).map((effect, idx) => (
                <span key={idx} className="px-2 py-0.5 text-xs bg-red-50 text-red-700 rounded">
                  {effect}
                </span>
              ))}
              {drug.sideEffects.length > 2 && (
                <span className="px-2 py-0.5 text-xs text-gray-500">
                  +{drug.sideEffects.length - 2} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Price and Stock Info */}
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
          <div>
            <p className="text-xs text-gray-500">Price</p>
            <p className="text-2xl font-bold text-teal-700">${drug.price?.toFixed(2) || '0.00'}</p>
          </div>
          {drug.stockQuantity !== undefined && (
            <div className="text-right">
              <p className="text-xs text-gray-500">Available</p>
              <p className="text-sm font-semibold text-gray-700">
                {drug.stockQuantity} units
              </p>
            </div>
          )}
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={isDisabled}
          className={`w-full px-4 py-3 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
            isDisabled
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : addToCartMutation.isSuccess
              ? 'bg-green-600 text-white'
              : 'bg-teal-700 text-white hover:bg-teal-800 active:bg-teal-900 shadow-md hover:shadow-lg'
          }`}
        >
          {addToCartMutation.isPending ? (
            <>
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Adding...
            </>
          ) : addToCartMutation.isSuccess ? (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Added!
            </>
          ) : isOutOfStock ? (
            'Out of Stock'
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Add to Cart
            </>
          )}
        </button>
      </div>
    </div>
  );
}

