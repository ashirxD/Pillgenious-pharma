import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../utils/axios';
import useAuthStore from '../../store/useAuthStore';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

// Login mutation
export const useLogin = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: async (credentials) => {
      const { data } = await axiosInstance.post('/auth/login', credentials);
      return data;
    },
    onSuccess: (data) => {
      // Save token and user to auth store
      setAuth({ token: data.token, user: data.user });
      toast.success('Login successful!');
      navigate('/dashboard');
    },
  });
};

// Register mutation
export const useRegister = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: async (userData) => {
      const { data } = await axiosInstance.post('/auth/register', userData);
      return data;
    },
    onSuccess: (data) => {
      // Save token and user to auth store
      setAuth({ token: data.token, user: data.user });
      toast.success('Registration successful!');
      navigate('/dashboard');
    },
  });
};

// Logout mutation
export const useLogout = () => {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // Optional: Call logout endpoint if you have one
      try {
        await axiosInstance.post('/auth/logout');
      } catch (error) {
        // Ignore errors on logout
      }
    },
    onSuccess: () => {
      logout();
      queryClient.clear(); // Clear all cached data
      toast.info('Logged out successfully');
      navigate('/auth/login');
    },
  });
};

// Update profile mutation
export const useUpdateProfile = () => {
  const setAuth = useAuthStore((state) => state.setAuth);
  const token = useAuthStore((state) => state.token);

  return useMutation({
    mutationFn: async (profileData) => {
      const { data } = await axiosInstance.put('/auth/profile', profileData);
      return data;
    },
    onSuccess: (data) => {
      // Update user in auth store
      setAuth({ token, user: data.user });
      toast.success('Profile updated successfully!');
    },
  });
};

// Change password mutation
export const useChangePassword = () => {
  return useMutation({
    mutationFn: async (passwordData) => {
      const { data } = await axiosInstance.put('/auth/change-password', passwordData);
      return data;
    },
    onSuccess: () => {
      toast.success('Password changed successfully!');
    },
  });
};

