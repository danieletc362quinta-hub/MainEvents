import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { eventService } from '../services/eventService';

// Hook para obtener eventos con paginación infinita
export function useInfiniteEvents(params = {}) {
  return useInfiniteQuery({
    queryKey: ['events', 'infinite', params],
    queryFn: ({ pageParam = 1 }) => eventService.getAll({ ...params, page: pageParam }),
    getNextPageParam: (lastPage, allPages) => {
      // Si no hay más páginas, retornar undefined
      if (!lastPage || lastPage.length < 10) return undefined;
      return allPages.length + 1;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });
}

// Hook para obtener eventos con filtros
export function useEvents(params = {}) {
  return useQuery({
    queryKey: ['events', params],
    queryFn: async () => {
      try {
        console.log('🔍 Fetching events with params:', params);
        const response = await eventService.getAll(params);
        console.log('✅ Events response:', response);
        
        // Asegurar que la respuesta tenga la estructura correcta
        if (response && response.success !== false) {
          return {
            events: response.events || [],
            totalPages: response.totalPages || 1,
            currentPage: response.currentPage || 1,
            total: response.total || 0,
            success: true
          };
        } else {
          console.warn('⚠️ Events response indicates failure:', response);
          return {
            events: [],
            totalPages: 1,
            currentPage: 1,
            total: 0,
            success: false,
            error: response?.error || 'Error desconocido'
          };
        }
      } catch (error) {
        console.error('❌ Error fetching events:', error);
        // Devolver un objeto válido en caso de error
        return {
          events: [],
          totalPages: 1,
          currentPage: 1,
          total: 0,
          success: false,
          error: error.message || 'Error de conexión'
        };
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: (failureCount, error) => {
      console.log(`🔄 Retry attempt ${failureCount} for events:`, error?.message);
      // No reintentar en errores 4xx (excepto 408, 429)
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return error?.response?.status === 408 || error?.response?.status === 429;
      }
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

// Hook para eventos destacados con prefetching
export function useFeaturedEvents(limit = 6) {
  return useQuery({
    queryKey: ['featured-events', limit],
    queryFn: async () => {
      try {
        const response = await eventService.getFeatured(limit);
        // El backend ya devuelve la estructura correcta
        return response;
      } catch (error) {
        console.error('Error fetching featured events:', error);
        // Devolver un objeto válido en caso de error
        return {
          events: [],
          count: 0,
          success: false,
          error: error.message
        };
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutos para eventos destacados
    gcTime: 15 * 60 * 1000, // 15 minutos
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    placeholderData: (previousData) => previousData, // Mantener datos anteriores mientras carga
  });
}

// Hook para un evento específico
export function useEvent(id) {
  return useQuery({
    queryKey: ['event', id],
    queryFn: () => eventService.getById(id),
    enabled: !!id, // Solo ejecutar si hay ID
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      if (error?.response?.status === 404) return false; // No reintentar si no existe
      return failureCount < 2;
    },
  });
}

// Hook para crear evento con optimización
export function useCreateEvent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: eventService.create,
    onMutate: async (newEvent) => {
      // Cancelar queries en curso
      await queryClient.cancelQueries({ queryKey: ['events'] });
      
      // Snapshot del estado anterior
      const previousEvents = queryClient.getQueryData(['events']);
      
      // Optimistic update
      queryClient.setQueryData(['events'], (old) => {
        if (!old) return [newEvent];
        return [newEvent, ...old];
      });
      
      return { previousEvents };
    },
    onError: (err, newEvent, context) => {
      // Revertir en caso de error
      if (context?.previousEvents) {
        queryClient.setQueryData(['events'], context.previousEvents);
      }
    },
    onSettled: () => {
      // Refetch para asegurar sincronización
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['featured-events'] });
    },
    retry: 1,
    retryDelay: 1000,
  });
}

// Hook para actualizar evento
export function useUpdateEvent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => eventService.update(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ['events'] });
      await queryClient.cancelQueries({ queryKey: ['event', id] });
      
      const previousEvents = queryClient.getQueryData(['events']);
      const previousEvent = queryClient.getQueryData(['event', id]);
      
      // Optimistic update
      queryClient.setQueryData(['event', id], (old) => ({
        ...old,
        ...data,
      }));
      
      queryClient.setQueryData(['events'], (old) => {
        if (!old) return old;
        return old.map(event => 
          event._id === id ? { ...event, ...data } : event
        );
      });
      
      return { previousEvents, previousEvent };
    },
    onError: (err, variables, context) => {
      if (context?.previousEvents) {
        queryClient.setQueryData(['events'], context.previousEvents);
      }
      if (context?.previousEvent) {
        queryClient.setQueryData(['event', variables.id], context.previousEvent);
      }
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['event', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['featured-events'] });
    },
    retry: 1,
  });
}

// Hook para eliminar evento
export function useDeleteEvent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: eventService.remove,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['events'] });
      
      const previousEvents = queryClient.getQueryData(['events']);
      
      // Optimistic update
      queryClient.setQueryData(['events'], (old) => {
        if (!old) return old;
        return old.filter(event => event._id !== id);
      });
      
      return { previousEvents };
    },
    onError: (err, id, context) => {
      if (context?.previousEvents) {
        queryClient.setQueryData(['events'], context.previousEvents);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['featured-events'] });
    },
    retry: 1,
  });
}

// Hook para búsqueda de eventos con debounce
export function useEventSearch(searchTerm, filters = {}) {
  return useQuery({
    queryKey: ['events', 'search', searchTerm, filters],
    queryFn: () => eventService.search(searchTerm, filters),
    enabled: !!searchTerm || Object.keys(filters).length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutos para búsquedas
    gcTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

// Hook para eventos por categoría
export function useEventsByCategory(category) {
  return useQuery({
    queryKey: ['events', 'category', category],
    queryFn: () => eventService.getByCategory(category),
    enabled: !!category,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

// Hook para eventos próximos
export function useUpcomingEvents(limit = 10) {
  return useQuery({
    queryKey: ['events', 'upcoming', limit],
    queryFn: () => eventService.getUpcoming(limit),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

// Hook para eventos del usuario
export function useUserEvents(userId) {
  return useQuery({
    queryKey: ['events', 'user', userId],
    queryFn: () => eventService.getUserEvents(),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

// Hook para prefetch de eventos
export function usePrefetchEvents() {
  const queryClient = useQueryClient();
  
  const prefetchEvent = (id) => {
    queryClient.prefetchQuery({
      queryKey: ['event', id],
      queryFn: () => eventService.getById(id),
      staleTime: 5 * 60 * 1000,
    });
  };
  
  const prefetchEvents = (params = {}) => {
    queryClient.prefetchQuery({
      queryKey: ['events', params],
      queryFn: () => eventService.getAll(params),
      staleTime: 5 * 60 * 1000,
    });
  };
  
  return { prefetchEvent, prefetchEvents };
}

// Hook para asistir a un evento
export function useAttendEvent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ eventId, quantity = 1 }) => {
      console.log('🎫 Hook: Enviando solicitud de asistencia:', { eventId, quantity });
      return eventService.attend(eventId, { quantity });
    },
    onSuccess: (data, variables) => {
      console.log('✅ Hook: Asistencia exitosa:', data);
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['event', variables.eventId] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['featured-events'] });
    },
    onError: (error, variables) => {
      console.error('❌ Hook: Error en asistencia:', error);
    },
    retry: 1,
  });
}

// Hook para marcar como favorito
export function useFavoriteEvent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (eventId) => eventService.favorite(eventId),
    onSuccess: (data, eventId) => {
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
    retry: 1,
  });
}

// Hook para comentar en un evento
export function useCommentEvent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ eventId, comment }) => eventService.comment(eventId, comment),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['event', variables.eventId] });
    },
    retry: 1,
  });
} 