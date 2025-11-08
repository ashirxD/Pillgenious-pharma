import React from 'react';

export default function Cart({
  cartItems,
  selectedItems,
  isLoading,
  isError,
  error,
  updateCartMutation,
  removeCartMutation,
  navigate,
  toggleItemSelection,
  selectAll,
  handleQuantityChange,
  handleRemoveItem,
  handleCheckout,
  subtotal,
  tax,
  deliveryFee,
  total,
}) {

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-700 mb-4"></div>
          <p className="text-gray-600 text-lg">Loading cart...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-6 rounded-lg max-w-md w-full">
          <div className="flex items-center">
            <span className="text-2xl mr-3">⚠️</span>
            <div>
              <p className="font-semibold">Error loading cart</p>
              <p className="text-sm mt-1">
                {error?.response?.data?.message || error?.message || 'Failed to load cart items'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 md:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Shopping Cart</h1>
          <p className="text-gray-600">
            {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>

        {cartItems.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Add some items to your cart to get started!</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 bg-teal-700 text-white rounded-lg hover:bg-teal-800 transition-all font-semibold shadow-md hover:shadow-lg"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {/* Select All */}
              <div className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedItems.size === cartItems.length && cartItems.length > 0}
                    onChange={selectAll}
                    className="w-5 h-5 text-teal-700 rounded focus:ring-teal-500 focus:ring-2"
                  />
                  <span className="ml-3 text-gray-700 font-medium">
                    Select All ({selectedItems.size} selected)
                  </span>
                </label>
              </div>

              {/* Cart Items List */}
              {cartItems.map((item) => {
                const itemId = item._id || item.id;
                const isSelected = selectedItems.has(itemId);
                const price = typeof item.price === 'string' 
                  ? parseFloat(item.price.replace('$', '')) 
                  : item.price;
                const quantity = item.quantity || 1;
                const itemTotal = price * quantity;

                return (
                  <div
                    key={itemId}
                    className={`bg-white rounded-xl shadow-sm p-6 border-2 transition-all ${
                      isSelected ? 'border-teal-500' : 'border-transparent'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleItemSelection(itemId)}
                        className="mt-1 w-5 h-5 text-teal-700 rounded focus:ring-teal-500 focus:ring-2"
                      />

                      {/* Item Info */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-1">
                              {item.drugName || item.name || 'Medicine'}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {item.type || 'Tablet'} • {item.category || 'General'}
                            </p>
                          </div>
                          <button
                            onClick={() => handleRemoveItem(itemId)}
                            disabled={removeCartMutation.isPending}
                            className="text-red-500 hover:text-red-700 transition-colors p-2"
                            title="Remove item"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-600">Quantity:</span>
                            <div className="flex items-center border border-gray-300 rounded-lg">
                              <button
                                onClick={() => handleQuantityChange(itemId, quantity - 1)}
                                disabled={quantity <= 1 || updateCartMutation.isPending}
                                className="px-3 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                −
                              </button>
                              <span className="px-4 py-1 text-gray-800 font-semibold min-w-[3rem] text-center">
                                {quantity}
                              </span>
                              <button
                                onClick={() => handleQuantityChange(itemId, quantity + 1)}
                                disabled={updateCartMutation.isPending}
                                className="px-3 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                +
                              </button>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-teal-700">
                              ${itemTotal.toFixed(2)}
                            </p>
                            <p className="text-sm text-gray-500">
                              ${price.toFixed(2)} each
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm p-6 sticky top-4">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Order Summary</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({selectedItems.size} items)</span>
                    <span className="font-semibold">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tax (5%)</span>
                    <span className="font-semibold">${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery Fee</span>
                    <span className="font-semibold">
                      {deliveryFee === 0 ? (
                        <span className="text-green-600">Free</span>
                      ) : (
                        `$${deliveryFee.toFixed(2)}`
                      )}
                    </span>
                  </div>
                  {subtotal < 50 && (
                    <p className="text-xs text-teal-600 mt-2">
                      Add ${(50 - subtotal).toFixed(2)} more for free delivery!
                    </p>
                  )}
                </div>

                <div className="border-t border-gray-200 pt-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-800">Total</span>
                    <span className="text-2xl font-bold text-teal-700">
                      ${total.toFixed(2)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={selectedItems.size === 0 || updateCartMutation.isPending}
                  className="w-full px-6 py-3 bg-teal-700 text-white rounded-lg hover:bg-teal-800 transition-all font-semibold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {selectedItems.size === 0
                    ? 'Select Items to Checkout'
                    : `Proceed to Checkout (${selectedItems.size} items)`
                  }
                </button>

                <button
                  onClick={() => navigate('/dashboard')}
                  className="w-full mt-3 px-6 py-3 bg-white border-2 border-teal-700 text-teal-700 rounded-lg hover:bg-teal-50 transition-all font-semibold"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

