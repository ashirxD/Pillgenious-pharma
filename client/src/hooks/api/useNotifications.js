import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../utils/axios';
import { toast } from 'react-toastify';

// Query Keys
export const notificationsKeys = {
  all: ['notifications'],
  lists: () => [...notificationsKeys.all, 'list'],
  list: (filters) => [...notificationsKeys.lists(), { filters }],
  unread: () => [...notificationsKeys.all, 'unread'],
  count: () => [...notificationsKeys.all, 'count'],
};

// Fetch all notifications
export const useNotifications = (filters = {}) => {
  return useQuery({
    queryKey: notificationsKeys.list(filters),
    queryFn: async () => {
      const { data } = await axiosInstance.get('/notifications', { params: filters });
      return data;
    },
  });
};

// Fetch unread notifications
export const useUnreadNotifications = () => {
  return useQuery({
    queryKey: notificationsKeys.unread(),
    queryFn: async () => {
      const { data } = await axiosInstance.get('/notifications/unread');
      return data;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

// Get unread count
export const useUnreadCount = () => {
  return useQuery({
    queryKey: notificationsKeys.count(),
    queryFn: async () => {
      const { data } = await axiosInstance.get('/notifications/count');
      return data;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

// Mark notification as read
export const useMarkAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId) => {
      const { data } = await axiosInstance.put(`/notifications/${notificationId}/read`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationsKeys.all });
    },
  });
};

// Mark all as read
export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data } = await axiosInstance.put('/notifications/read-all');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationsKeys.all });
      toast.success('All notifications marked as read!');
    },
  });
};

// Delete notification
export const useDeleteNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId) => {
      const { data } = await axiosInstance.delete(`/notifications/${notificationId}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationsKeys.all });
      toast.success('Notification deleted!');
    },
  });
};

