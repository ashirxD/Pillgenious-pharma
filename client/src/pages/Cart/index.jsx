import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart, useUpdateCartItem, useRemoveFromCart } from '../../hooks/api/useOrders';
import Cart from './Cart';

export default function CartPage() {
  const navigate = useNavigate();
  const { data: cartData, isLoading, isError, error } = useCart();
  const updateCartMutation = useUpdateCartItem();
  const removeCartMutation = useRemoveFromCart();

  const [selectedItems, setSelectedItems] = useState(new Set());

  // Extract cart items from response
  // Note: 404 errors are handled in useCart hook and return { items: [] }
  const cartItems = cartData?.items || cartData || [];

  // Toggle item selection
  const toggleItemSelection = (itemId) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  // Select all items
  const selectAll = () => {
    if (selectedItems.size === cartItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(cartItems.map(item => item._id || item.id)));
    }
  };

  // Update quantity
  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    updateCartMutation.mutate({ itemId, quantity: newQuantity });
  };

  // Remove item
  const handleRemoveItem = (itemId) => {
    if (window.confirm('Are you sure you want to remove this item from your cart?')) {
      removeCartMutation.mutate(itemId);
    }
  };

  // Calculate totals for selected items
  const selectedItemsData = cartItems.filter(item => 
    selectedItems.has(item._id || item.id)
  );

  const subtotal = selectedItemsData.reduce((sum, item) => {
    const price = typeof item.price === 'string' 
      ? parseFloat(item.price.replace('$', '')) 
      : item.price;
    const quantity = item.quantity || 1;
    return sum + (price * quantity);
  }, 0);

  const tax = subtotal * 0.05; // 5% tax
  const deliveryFee = subtotal > 50 ? 0 : 5; // Free delivery over $50
  const total = subtotal + tax + deliveryFee;

  // Handle proceed to checkout
  const handleCheckout = () => {
    if (selectedItems.size === 0) {
      alert('Please select at least one item to proceed to checkout.');
      return;
    }
    // Navigate to checkout with selected items
    navigate('/checkout', { 
      state: { 
        selectedItems: Array.from(selectedItems),
        cartItems: selectedItemsData,
        totals: { subtotal, tax, deliveryFee, total }
      } 
    });
  };

  return (
    <Cart
      cartItems={cartItems}
      selectedItems={selectedItems}
      isLoading={isLoading}
      isError={isError}
      error={error}
      updateCartMutation={updateCartMutation}
      removeCartMutation={removeCartMutation}
      navigate={navigate}
      toggleItemSelection={toggleItemSelection}
      selectAll={selectAll}
      handleQuantityChange={handleQuantityChange}
      handleRemoveItem={handleRemoveItem}
      handleCheckout={handleCheckout}
      subtotal={subtotal}
      tax={tax}
      deliveryFee={deliveryFee}
      total={total}
    />
  );
}

