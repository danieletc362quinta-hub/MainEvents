import { useQuery, useMutation } from '@tanstack/react-query';
import { ticketService } from '../services/ticketService';

export function useUserTickets() {
  return useQuery({
    queryKey: ['tickets', 'user'],
    queryFn: ticketService.getUserTickets,
  });
}

export function useTransferTicket() {
  return useMutation({
    mutationFn: ticketService.transferTicket,
  });
}

export function useDownloadTicket() {
  return useMutation({
    mutationFn: ticketService.downloadTicket,
  });
}

export function useValidateTicket() {
  return useMutation({
    mutationFn: ticketService.validateTicket,
  });
} 