import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentService } from '../services/paymentService';

export function useCreatePreference() {
  return useMutation({
    mutationFn: paymentService.createPreference,
  });
}

export function useUserPayments() {
  return useQuery({
    queryKey: ['payments', 'user'],
    queryFn: paymentService.getUserPayments,
  });
}

export function useRefundPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: paymentService.refund,
    onSuccess: () => queryClient.invalidateQueries(['payments', 'user']),
  });
}

export function useValidateTicket() {
  return useMutation({
    mutationFn: paymentService.validateTicket,
  });
} 