import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../utils/axios';
import useAuthStore from '../../store/useAuthStore';
import { toast } from 'react-toastify';

// Query Keys
export const userKeys = {
  all: ['user'],
  profile: () => [...userKeys.all, 'profile'],
};

/**
 * Fetch current user's profile
 */
export const useUserProfile = () => {
  return useQuery({
    queryKey: userKeys.profile(),
    queryFn: async () => {
      const { data } = await axiosInstance.get('/user/profile');
      return data.user;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Update user profile
 */
export const useUpdateProfile = () => {
  const setAuth = useAuthStore((state) => state.setAuth);
  const token = useAuthStore((state) => state.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profileData) => {
      const { data } = await axiosInstance.put('/user/profile', profileData);
      return data;
    },
    onSuccess: (data) => {
      // Update user in auth store
      setAuth({ token, user: data.user });
      // Invalidate and refetch profile
      queryClient.invalidateQueries({ queryKey: userKeys.profile() });
      toast.success('Profile updated successfully!');
    },
    onError: (error) => {
      const message = error?.response?.data?.error || 'Failed to update profile';
      toast.error(message);
    },
  });
};

