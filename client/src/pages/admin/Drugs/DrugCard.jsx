import React from 'react';

export default function DrugCard({ drug, onEdit, onDelete, isDeleting }) {
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

  const getTypeColor = (type) => {
    const colors = {
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

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow overflow-hidden">
      {/* Drug Image/Icon Section */}
      <div className="h-48 bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
        {drug.images && drug.images.length > 0 ? (
          <img 
            src={drug.images[0]} 
            alt={drug.drugName}
            className="w-full h-full object-cover"
          />
        ) : (
          <svg className="w-16 h-16 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 008 10.172V5L7 4z" />
          </svg>
        )}
      </div>

      {/* Drug Info Section */}
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
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
          {drug.prescriptionRequired && (
            <div className="flex-shrink-0 ml-2">
              <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Rx
              </span>
            </div>
          )}
        </div>

        {/* Description */}
        {drug.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {drug.description}
          </p>
        )}

        {/* Side Effects */}
        {drug.sideEffects && drug.sideEffects.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-medium text-gray-500 mb-1">Side Effects:</p>
            <div className="flex flex-wrap gap-1">
              {drug.sideEffects.slice(0, 3).map((effect, idx) => (
                <span key={idx} className="px-2 py-0.5 text-xs bg-red-50 text-red-700 rounded">
                  {effect}
                </span>
              ))}
              {drug.sideEffects.length > 3 && (
                <span className="px-2 py-0.5 text-xs text-gray-500">
                  +{drug.sideEffects.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Price and Stock */}
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
          <div>
            <p className="text-xs text-gray-500">Price</p>
            <p className="text-xl font-bold text-gray-900">${drug.price?.toFixed(2) || '0.00'}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Stock</p>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStockStatusColor(drug.stockQuantity || 0)}`}>
                {getStockStatusText(drug.stockQuantity || 0)}
              </span>
              <span className="text-sm font-medium text-gray-700">
                {drug.stockQuantity || 0} units
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(drug)}
            className="flex-1 px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 font-medium text-sm transition-colors"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(drug._id)}
            disabled={isDeleting}
            className="flex-1 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

