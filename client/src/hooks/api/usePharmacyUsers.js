import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../utils/axios';
import { toast } from 'react-toastify';

// Get all pharmacy users
export const useGetPharmacyUsers = () => {
  return useQuery({
    queryKey: ['pharmacyUsers'],
    queryFn: async () => {
      const { data } = await axiosInstance.get('/protected/pharmacy-users');
      return data;
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to fetch pharmacy users');
    }
  });
};

// Create pharmacy user (using auth/register endpoint)
export const useCreatePharmacyUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData) => {
      const { data } = await axiosInstance.post('/auth/register', {
        ...userData,
        role: 'pharmacyUser'
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pharmacyUsers'] });
      toast.success('Pharmacy user created successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to create pharmacy user');
    }
  });
};

// Delete pharmacy user
export const useDeletePharmacyUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const { data } = await axiosInstance.delete(`/protected/pharmacy-users/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pharmacyUsers'] });
      toast.success('Pharmacy user deleted successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to delete pharmacy user');
    }
  });
};

