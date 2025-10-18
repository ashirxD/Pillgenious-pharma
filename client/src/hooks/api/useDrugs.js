import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../utils/axios';
import { toast } from 'react-toastify';

// Query Keys
export const drugsKeys = {
  all: ['drugs'],
  lists: () => [...drugsKeys.all, 'list'],
  list: (filters) => [...drugsKeys.lists(), { filters }],
  details: () => [...drugsKeys.all, 'detail'],
  detail: (id) => [...drugsKeys.details(), id],
};

// Fetch all drugs/medicines
export const useDrugs = (filters = {}) => {
  return useQuery({
    queryKey: drugsKeys.list(filters),
    queryFn: async () => {
      const { data } = await axiosInstance.get('/drugs', { params: filters });
      return data;
    },
  });
};

// Fetch single drug by ID
export const useDrug = (id) => {
  return useQuery({
    queryKey: drugsKeys.detail(id),
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/drugs/${id}`);
      return data;
    },
    enabled: !!id, // Only run if ID exists
  });
};

// Create new drug (admin)
export const useCreateDrug = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (drugData) => {
      const { data } = await axiosInstance.post('/drugs', drugData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: drugsKeys.all });
      toast.success('Drug created successfully!');
    },
  });
};

// Update drug (admin)
export const useUpdateDrug = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, drugData }) => {
      const { data } = await axiosInstance.put(`/drugs/${id}`, drugData);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: drugsKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: drugsKeys.lists() });
      toast.success('Drug updated successfully!');
    },
  });
};

// Delete drug (admin)
export const useDeleteDrug = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const { data } = await axiosInstance.delete(`/drugs/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: drugsKeys.all });
      toast.success('Drug deleted successfully!');
    },
  });
};

// Search drugs
export const useSearchDrugs = (searchQuery) => {
  return useQuery({
    queryKey: [...drugsKeys.all, 'search', searchQuery],
    queryFn: async () => {
      const { data } = await axiosInstance.get('/drugs/search', {
        params: { q: searchQuery },
      });
      return data;
    },
    enabled: searchQuery.length >= 2, // Only search if query is at least 2 chars
  });
};

