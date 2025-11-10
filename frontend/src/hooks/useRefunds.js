import { useQuery, useMutation } from '@tanstack/react-query';
import { refundService } from '../services/refundService';

export function useUserRefunds() {
  return useQuery({
    queryKey: ['refunds', 'user'],
    queryFn: refundService.getUserRefunds,
  });
}

export function useRequestRefund() {
  return useMutation({
    mutationFn: refundService.requestRefund,
  });
}

export function useRefundStats() {
  return useQuery({
    queryKey: ['refunds', 'stats'],
    queryFn: refundService.getRefundStats,
  });
}




