import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { couponService } from '../services/couponService';

export function useActiveCoupons() {
  return useQuery({
    queryKey: ['coupons', 'active'],
    queryFn: couponService.getActive,
  });
}

export function useUserCoupons() {
  return useQuery({
    queryKey: ['coupons', 'user'],
    queryFn: couponService.getUserCoupons,
  });
}

export function useCreateCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: couponService.create,
    onSuccess: () => queryClient.invalidateQueries(['coupons', 'active']),
  });
}

export function useValidateCoupon() {
  return useMutation({
    mutationFn: couponService.validate,
  });
}

export function useDeactivateCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: couponService.deactivate,
    onSuccess: () => queryClient.invalidateQueries(['coupons', 'active']),
  });
}

export function useCouponStats() {
  return useQuery({
    queryKey: ['coupons', 'stats'],
    queryFn: couponService.stats,
  });
} 