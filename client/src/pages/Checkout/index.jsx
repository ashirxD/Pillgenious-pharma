import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { useCreateOrder, useCreatePaymentIntent, useConfirmPayment } from '../../hooks/api/useOrders';
import useAuthStore from '../../store/useAuthStore';
import Checkout from './Checkout';
import { toast } from 'react-toastify';

// Initialize Stripe with client key from environment
// Note: In Vite, environment variables MUST be prefixed with VITE_ to be accessible in client code
// If you have STRIPE_CLIENT_KEY in your .env, rename it to VITE_STRIPE_CLIENT_KEY
const stripeClientKey = import.meta.env.VITE_STRIPE_CLIENT_KEY;

if (!stripeClientKey) {
  console.error('Error: VITE_STRIPE_CLIENT_KEY is not set in environment variables.');
  console.error('Please add VITE_STRIPE_CLIENT_KEY=pk_test_your_key_here to your client/.env file');
  console.error('Note: In Vite, environment variables must be prefixed with VITE_ to be accessible');
  // Debug: Show what env variables are available (for debugging only)
  if (import.meta.env.DEV) {
    console.log('Available env variables:', Object.keys(import.meta.env).filter(key => key.includes('STRIPE')));
  }
}

const stripePromise = stripeClientKey ? loadStripe(stripeClientKey) : null;

// Stripe Payment Form Component
function StripePaymentForm({ 
  clientSecret, 
  orderData, 
  onPaymentSuccess, 
  onPaymentError,
  isProcessing,
  setIsProcessing 
}) {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        onPaymentError(submitError.message);
        setIsProcessing(false);
        return;
      }

      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: window.location.origin + '/dashboard',
        },
        redirect: 'if_required',
      });

      if (error) {
        onPaymentError(error.message);
        setIsProcessing(false);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        onPaymentSuccess(paymentIntent.id);
      }
    } catch (err) {
      onPaymentError(err.message || 'Payment failed. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <button
        type="submit"
        disabled={!stripe || !elements || isProcessing}
        className="w-full px-6 py-3 bg-teal-700 text-white rounded-lg hover:bg-teal-800 transition-all font-semibold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed mt-4"
      >
        {isProcessing ? 'Processing Payment...' : 'Pay Now'}
      </button>
    </form>
  );
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const createOrderMutation = useCreateOrder();
  const createPaymentIntentMutation = useCreatePaymentIntent();
  const confirmPaymentMutation = useConfirmPayment();
  const user = useAuthStore((state) => state.user);
  
  const [stripeClientSecret, setStripeClientSecret] = useState(null);
  const [showStripeModal, setShowStripeModal] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Get selected items and totals from navigation state
  const { selectedItems, cartItems, totals } = location.state || {};

  const [formData, setFormData] = useState({
    fullName: user?.name || user?.fullName || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    paymentMethod: 'Cash on Delivery',
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
  });

  const [errors, setErrors] = useState({});

  // Redirect if no items selected
  useEffect(() => {
    if (!selectedItems || selectedItems.length === 0) {
      navigate('/cart');
    }
  }, [selectedItems, navigate]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }
    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }
    if (!formData.zipCode.trim()) {
      newErrors.zipCode = 'Zip code is required';
    }

    // Note: Card details validation removed - Stripe handles payment details in the modal

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Prepare order data
  const prepareOrderData = () => {
    return {
      items: cartItems.map((item) => ({
        drugId: item.drugId || item._id || item.id,
        drugName: item.drugName || item.name,
        quantity: item.quantity || 1,
        price: typeof item.price === 'string' 
          ? parseFloat(item.price.replace('$', '')) 
          : item.price,
      })),
      totalAmount: totals?.total || 0,
      subtotal: totals?.subtotal || 0,
      tax: totals?.tax || 0,
      deliveryFee: totals?.deliveryFee || 0,
      shippingAddress: {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
      },
    };
  };

  // Handle payment success
  const handlePaymentSuccess = async (paymentIntentId) => {
    const orderData = prepareOrderData();
    
    confirmPaymentMutation.mutate(
      {
        ...orderData,
        paymentIntentId,
      },
      {
        onSuccess: () => {
          setShowStripeModal(false);
          navigate('/dashboard', {
            state: {
              orderPlaced: true,
              message: 'Order placed successfully!',
            },
          });
        },
        onError: (error) => {
          toast.error(error.response?.data?.error || 'Failed to create order');
          setIsProcessingPayment(false);
        },
      }
    );
  };

  // Handle payment error
  const handlePaymentError = (errorMessage) => {
    toast.error(errorMessage || 'Payment failed. Please try again.');
    setIsProcessingPayment(false);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const orderData = prepareOrderData();

    // If Cash on Delivery, create order directly
    if (formData.paymentMethod === 'Cash on Delivery') {
      createOrderMutation.mutate(
        {
          ...orderData,
          paymentMethod: 'Cash on Delivery',
          paymentStatus: 'Pending',
        },
        {
          onSuccess: () => {
            navigate('/dashboard', {
              state: {
                orderPlaced: true,
                message: 'Order placed successfully!',
              },
            });
          },
        }
      );
      return;
    }

    // If Online Payment, create payment intent and show Stripe modal
    if (!stripePromise) {
      toast.error('Stripe is not configured. Please set VITE_STRIPE_CLIENT_KEY in your environment variables.');
      return;
    }

    setIsProcessingPayment(true);
    createPaymentIntentMutation.mutate(
      {
        amount: totals?.total || 0,
        currency: 'usd',
      },
      {
        onSuccess: (data) => {
          setStripeClientSecret(data.clientSecret);
          setShowStripeModal(true);
          setIsProcessingPayment(false);
        },
        onError: (error) => {
          toast.error(error.response?.data?.error || 'Failed to initialize payment');
          setIsProcessingPayment(false);
        },
      }
    );
  };

  // Format card number
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  // Handle card number change with formatting
  const handleCardNumberChange = (e) => {
    const formatted = formatCardNumber(e.target.value);
    setFormData((prev) => ({ ...prev, cardNumber: formatted }));
    if (errors.cardNumber) {
      setErrors((prev) => ({ ...prev, cardNumber: '' }));
    }
  };

  // Handle expiry date change with formatting
  const handleExpiryDateChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    setFormData((prev) => ({ ...prev, expiryDate: value }));
    if (errors.expiryDate) {
      setErrors((prev) => ({ ...prev, expiryDate: '' }));
    }
  };

  // Handle CVV change
  const handleCvvChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').substring(0, 4);
    setFormData((prev) => ({ ...prev, cvv: value }));
    if (errors.cvv) {
      setErrors((prev) => ({ ...prev, cvv: '' }));
    }
  };

  if (!selectedItems || selectedItems.length === 0) {
    return null; // Will redirect
  }

  return (
    <>
      <Checkout
        formData={formData}
        errors={errors}
        cartItems={cartItems}
        totals={totals}
        createOrderMutation={createOrderMutation}
        navigate={navigate}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        handleCardNumberChange={handleCardNumberChange}
        handleExpiryDateChange={handleExpiryDateChange}
        handleCvvChange={handleCvvChange}
        isProcessing={isProcessingPayment || createOrderMutation.isPending || createPaymentIntentMutation.isPending}
      />

      {/* Stripe Payment Modal */}
      {showStripeModal && stripeClientSecret && stripePromise && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Complete Payment</h2>
                <button
                  onClick={() => {
                    setShowStripeModal(false);
                    setStripeClientSecret(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Amount:</span>
                  <span className="text-2xl font-bold text-teal-700">
                    ${totals?.total.toFixed(2) || '0.00'}
                  </span>
                </div>
              </div>

              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret: stripeClientSecret,
                  appearance: {
                    theme: 'stripe',
                  },
                }}
              >
                <StripePaymentForm
                  clientSecret={stripeClientSecret}
                  orderData={prepareOrderData()}
                  onPaymentSuccess={handlePaymentSuccess}
                  onPaymentError={handlePaymentError}
                  isProcessing={isProcessingPayment || confirmPaymentMutation.isPending}
                  setIsProcessing={setIsProcessingPayment}
                />
              </Elements>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

