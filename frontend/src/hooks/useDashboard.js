import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../services/dashboardService';

export function usePublicStats() {
  return useQuery({
    queryKey: ['stats', 'public'],
    queryFn: dashboardService.getPublicStats,
  });
}

export function useAdminStats() {
  return useQuery({
    queryKey: ['stats', 'admin'],
    queryFn: dashboardService.getAdminStats,
  });
}

export function useUserStats() {
  return useQuery({
    queryKey: ['stats', 'user'],
    queryFn: dashboardService.getUserStats,
  });
} 