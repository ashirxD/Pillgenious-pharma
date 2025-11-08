import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCreateOrder } from '../../hooks/api/useOrders';
import useAuthStore from '../../store/useAuthStore';
import Checkout from './Checkout';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const createOrderMutation = useCreateOrder();
  const user = useAuthStore((state) => state.user);

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

    // Validate payment method specific fields
    if (formData.paymentMethod === 'Online Payment') {
      if (!formData.cardNumber.trim()) {
        newErrors.cardNumber = 'Card number is required';
      } else if (!/^\d{16}$/.test(formData.cardNumber.replace(/\s/g, ''))) {
        newErrors.cardNumber = 'Card number must be 16 digits';
      }
      if (!formData.cardName.trim()) {
        newErrors.cardName = 'Cardholder name is required';
      }
      if (!formData.expiryDate.trim()) {
        newErrors.expiryDate = 'Expiry date is required';
      } else if (!/^\d{2}\/\d{2}$/.test(formData.expiryDate)) {
        newErrors.expiryDate = 'Format: MM/YY';
      }
      if (!formData.cvv.trim()) {
        newErrors.cvv = 'CVV is required';
      } else if (!/^\d{3,4}$/.test(formData.cvv)) {
        newErrors.cvv = 'CVV must be 3-4 digits';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Prepare order data
    const orderData = {
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
      paymentMethod: formData.paymentMethod,
      paymentStatus: formData.paymentMethod === 'Online Payment' ? 'Paid' : 'Pending',
      transactionId: formData.paymentMethod === 'Online Payment' 
        ? `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
        : undefined,
    };

    createOrderMutation.mutate(orderData, {
      onSuccess: () => {
        // Navigate to order confirmation or dashboard
        navigate('/dashboard', { 
          state: { 
            orderPlaced: true,
            message: 'Order placed successfully!' 
          } 
        });
      },
    });
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
    />
  );
}

