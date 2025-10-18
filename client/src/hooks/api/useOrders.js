import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../utils/axios';
import { toast } from 'react-toastify';

// Query Keys
export const ordersKeys = {
  all: ['orders'],
  lists: () => [...ordersKeys.all, 'list'],
  list: (filters) => [...ordersKeys.lists(), { filters }],
  details: () => [...ordersKeys.all, 'detail'],
  detail: (id) => [...ordersKeys.details(), id],
  user: (userId) => [...ordersKeys.all, 'user', userId],
};

// Fetch all orders for current user
export const useOrders = (filters = {}) => {
  return useQuery({
    queryKey: ordersKeys.list(filters),
    queryFn: async () => {
      const { data } = await axiosInstance.get('/orders', { params: filters });
      return data;
    },
  });
};

// Fetch single order by ID
export const useOrder = (id) => {
  return useQuery({
    queryKey: ordersKeys.detail(id),
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/orders/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

// Create new order
export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderData) => {
      const { data } = await axiosInstance.post('/orders', orderData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ordersKeys.all });
      toast.success('Order placed successfully!');
    },
  });
};

// Update order status
export const useUpdateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, orderData }) => {
      const { data } = await axiosInstance.put(`/orders/${id}`, orderData);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ordersKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: ordersKeys.lists() });
      toast.success('Order updated successfully!');
    },
  });
};

// Cancel order
export const useCancelOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const { data } = await axiosInstance.put(`/orders/${id}/cancel`);
      return data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ordersKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: ordersKeys.lists() });
      toast.success('Order cancelled successfully!');
    },
  });
};

// Add item to cart
export const useAddToCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (cartItem) => {
      const { data } = await axiosInstance.post('/cart/add', cartItem);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Added to cart!');
    },
  });
};

// Get cart items
export const useCart = () => {
  return useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const { data } = await axiosInstance.get('/cart');
      return data;
    },
  });
};

