import React from 'react';

export default function Checkout({
  formData,
  errors,
  cartItems,
  totals,
  createOrderMutation,
  navigate,
  handleChange,
  handleSubmit,
  handleCardNumberChange,
  handleExpiryDateChange,
  handleCvvChange,
  isProcessing = false,
}) {

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 md:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/cart')}
            className="text-teal-700 hover:text-teal-800 mb-4 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Cart
          </button>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Checkout</h1>
          <p className="text-gray-600">Complete your order</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Shipping Address */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Shipping Address</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all ${
                        errors.fullName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="John Doe"
                    />
                    {errors.fullName && (
                      <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="john@example.com"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all ${
                        errors.phone ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="+1 234 567 8900"
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address *
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all ${
                        errors.address ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="123 Main Street"
                    />
                    {errors.address && (
                      <p className="text-red-500 text-sm mt-1">{errors.address}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all ${
                        errors.city ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="New York"
                    />
                    {errors.city && (
                      <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State *
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all ${
                        errors.state ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="NY"
                    />
                    {errors.state && (
                      <p className="text-red-500 text-sm mt-1">{errors.state}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Zip Code *
                    </label>
                    <input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleChange}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all ${
                        errors.zipCode ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="10001"
                    />
                    {errors.zipCode && (
                      <p className="text-red-500 text-sm mt-1">{errors.zipCode}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Payment Method</h2>
                <div className="space-y-3">
                  <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-all">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="Cash on Delivery"
                      checked={formData.paymentMethod === 'Cash on Delivery'}
                      onChange={handleChange}
                      className="w-5 h-5 text-teal-700 focus:ring-teal-500"
                    />
                    <div className="ml-3 flex-1">
                      <span className="font-semibold text-gray-800">Cash on Delivery</span>
                      <p className="text-sm text-gray-600">Pay when you receive your order</p>
                    </div>
                  </label>

                  <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-all">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="Online Payment"
                      checked={formData.paymentMethod === 'Online Payment'}
                      onChange={handleChange}
                      className="w-5 h-5 text-teal-700 focus:ring-teal-500"
                    />
                    <div className="ml-3 flex-1">
                      <span className="font-semibold text-gray-800">Online Payment</span>
                      <p className="text-sm text-gray-600">Pay securely with your card</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm p-6 sticky top-4">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Order Summary</h2>
                
                {/* Items List */}
                <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                  {cartItems.map((item, index) => {
                    const price = typeof item.price === 'string' 
                      ? parseFloat(item.price.replace('$', '')) 
                      : item.price;
                    const quantity = item.quantity || 1;
                    return (
                      <div key={index} className="flex justify-between text-sm">
                        <div className="flex-1">
                          <p className="font-medium text-gray-800">
                            {item.drugName || item.name}
                          </p>
                          <p className="text-gray-600">Qty: {quantity}</p>
                        </div>
                        <p className="font-semibold text-gray-800">
                          ${(price * quantity).toFixed(2)}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t border-gray-200 pt-4 space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-semibold">${totals?.subtotal.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tax (5%)</span>
                    <span className="font-semibold">${totals?.tax.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery Fee</span>
                    <span className="font-semibold">
                      {totals?.deliveryFee === 0 ? (
                        <span className="text-green-600">Free</span>
                      ) : (
                        `$${totals?.deliveryFee.toFixed(2) || '0.00'}`
                      )}
                    </span>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-800">Total</span>
                    <span className="text-2xl font-bold text-teal-700">
                      ${totals?.total.toFixed(2) || '0.00'}
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full px-6 py-3 bg-teal-700 text-white rounded-lg hover:bg-teal-800 transition-all font-semibold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? 'Processing...' : formData.paymentMethod === 'Online Payment' ? 'Pay Now' : 'Place Order'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

