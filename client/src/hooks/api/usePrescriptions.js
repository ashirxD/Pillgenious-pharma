import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../utils/axios';
import { toast } from 'react-toastify';

// Query Keys
export const prescriptionsKeys = {
  all: ['prescriptions'],
  lists: () => [...prescriptionsKeys.all, 'list'],
  list: (filters) => [...prescriptionsKeys.lists(), { filters }],
  details: () => [...prescriptionsKeys.all, 'detail'],
  detail: (id) => [...prescriptionsKeys.details(), id],
  user: (userId) => [...prescriptionsKeys.all, 'user', userId],
};

// Fetch all prescriptions for current user
export const usePrescriptions = (filters = {}) => {
  return useQuery({
    queryKey: prescriptionsKeys.list(filters),
    queryFn: async () => {
      const { data } = await axiosInstance.get('/prescriptions', { params: filters });
      return data;
    },
  });
};

// Fetch single prescription by ID
export const usePrescription = (id) => {
  return useQuery({
    queryKey: prescriptionsKeys.detail(id),
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/prescriptions/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

// Create new prescription
export const useCreatePrescription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (prescriptionData) => {
      const { data } = await axiosInstance.post('/prescriptions', prescriptionData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: prescriptionsKeys.all });
      toast.success('Prescription created successfully!');
    },
  });
};

// Update prescription
export const useUpdatePrescription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, prescriptionData }) => {
      const { data } = await axiosInstance.put(`/prescriptions/${id}`, prescriptionData);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: prescriptionsKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: prescriptionsKeys.lists() });
      toast.success('Prescription updated successfully!');
    },
  });
};

// Delete prescription
export const useDeletePrescription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const { data } = await axiosInstance.delete(`/prescriptions/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: prescriptionsKeys.all });
      toast.success('Prescription deleted successfully!');
    },
  });
};

// Upload prescription image/file
export const useUploadPrescription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData) => {
      const { data } = await axiosInstance.post('/prescriptions/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: prescriptionsKeys.all });
      toast.success('Prescription uploaded successfully!');
    },
  });
};

