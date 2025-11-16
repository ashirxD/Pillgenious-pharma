import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../../utils/axios';

export const dashboardKeys = {
  all: ['dashboard'],
  stats: () => [...dashboardKeys.all, 'stats'],
  userStats: () => [...dashboardKeys.all, 'user-stats'],
  recentActivity: () => [...dashboardKeys.all, 'recent-activity'],
};

/**
 * Fetch user-specific dashboard statistics
 */
export const useUserStats = () => {
  return useQuery({
    queryKey: dashboardKeys.userStats(),
    queryFn: async () => {
      const { data } = await axiosInstance.get('/dashboard/user-stats');
      return data;
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: true,
  });
};

/**
 * Fetch admin/pharmacy dashboard statistics
 */
export const useDashboardStats = () => {
  return useQuery({
    queryKey: dashboardKeys.stats(),
    queryFn: async () => {
      const { data } = await axiosInstance.get('/dashboard/stats');
      return data;
    },
    staleTime: 60 * 1000, // 1 minute
  });
};

/**
 * Fetch recent activity for dashboard
 */
export const useRecentActivity = () => {
  return useQuery({
    queryKey: dashboardKeys.recentActivity(),
    queryFn: async () => {
      const { data } = await axiosInstance.get('/dashboard/recent-activity');
      return data;
    },
    staleTime: 60 * 1000, // 1 minute
  });
};

/**
 * Fetch promotional ads for banner
 */
export const useAds = () => {
  return useQuery({
    queryKey: [...dashboardKeys.all, 'ads'],
    queryFn: async () => {
      const { data } = await axiosInstance.get('/dashboard/ads');
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes (ads don't change often)
  });
};

