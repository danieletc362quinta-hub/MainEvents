import { useState, useEffect, useCallback, useMemo, useRef } from 'react';

// Hook para optimización de rendimiento
export const usePerformance = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [performanceMetrics, setPerformanceMetrics] = useState({});
  const observerRef = useRef(null);
  const timeoutRef = useRef(null);

  // Detectar visibilidad del elemento
  const useIntersectionObserver = (ref, options = {}) => {
    useEffect(() => {
      const element = ref.current;
      if (!element) return;

      observerRef.current = new IntersectionObserver(([entry]) => {
        setIsVisible(entry.isIntersecting);
      }, {
        threshold: 0.1,
        ...options,
      });

      observerRef.current.observe(element);

      return () => {
        if (observerRef.current) {
          observerRef.current.disconnect();
        }
      };
    }, [ref, options]);

    return isVisible;
  };

  // Detectar estado de conexión
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Medir rendimiento
  const measurePerformance = useCallback((name, fn) => {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    
    setPerformanceMetrics(prev => ({
      ...prev,
      [name]: {
        duration: end - start,
        timestamp: Date.now(),
      },
    }));

    return result;
  }, []);

  // Debounce function
  const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);

      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }, [value, delay]);

    return debouncedValue;
  };

  // Throttle function
  const useThrottle = (value, delay) => {
    const [throttledValue, setThrottledValue] = useState(value);
    const lastRun = useRef(Date.now());

    useEffect(() => {
      const handler = setTimeout(() => {
        if (Date.now() - lastRun.current >= delay) {
          setThrottledValue(value);
          lastRun.current = Date.now();
        }
      }, delay - (Date.now() - lastRun.current));

      return () => {
        clearTimeout(handler);
      };
    }, [value, delay]);

    return throttledValue;
  };

  // Memoización con dependencias
  const useMemoizedValue = (value, dependencies) => {
    return useMemo(() => value, dependencies);
  };

  // Lazy loading de imágenes
  const useLazyImage = (src, placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkxvYWRpbmcuLi48L3RleHQ+PC9zdmc+') => {
    const [imageSrc, setImageSrc] = useState(placeholder);
    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState(false);

    useEffect(() => {
      const img = new Image();
      img.src = src;
      
      img.onload = () => {
        setImageSrc(src);
        setIsLoaded(true);
        setError(false);
      };
      
      img.onerror = () => {
        setError(true);
        setIsLoaded(false);
      };
    }, [src]);

    return { imageSrc, isLoaded, error };
  };

  // Virtual scrolling helper
  const useVirtualScroll = (items, itemHeight, containerHeight) => {
    const [scrollTop, setScrollTop] = useState(0);
    
    const visibleItems = useMemo(() => {
      const startIndex = Math.floor(scrollTop / itemHeight);
      const endIndex = Math.min(
        startIndex + Math.ceil(containerHeight / itemHeight) + 1,
        items.length
      );
      
      return items.slice(startIndex, endIndex).map((item, index) => ({
        ...item,
        index: startIndex + index,
        style: {
          position: 'absolute',
          top: (startIndex + index) * itemHeight,
          height: itemHeight,
          width: '100%',
        },
      }));
    }, [items, itemHeight, containerHeight, scrollTop]);

    const handleScroll = useCallback((e) => {
      setScrollTop(e.target.scrollTop);
    }, []);

    return {
      visibleItems,
      handleScroll,
      totalHeight: items.length * itemHeight,
    };
  };

  // Cache management
  const useCache = (key, data, ttl = 5 * 60 * 1000) => { // 5 minutes default
    const cache = useMemo(() => {
      const cached = localStorage.getItem(`cache_${key}`);
      if (cached) {
        const { value, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < ttl) {
          return value;
        }
      }
      return null;
    }, [key, ttl]);

    const setCache = useCallback((value) => {
      localStorage.setItem(`cache_${key}`, JSON.stringify({
        value,
        timestamp: Date.now(),
      }));
    }, [key]);

    return { cache, setCache };
  };

  // Preload resources
  const usePreload = (resources) => {
    useEffect(() => {
      resources.forEach(resource => {
        if (resource.type === 'image') {
          const img = new Image();
          img.src = resource.url;
        } else if (resource.type === 'script') {
          const script = document.createElement('script');
          script.src = resource.url;
          script.async = true;
          document.head.appendChild(script);
        }
      });
    }, [resources]);
  };

  // Performance monitoring
  const usePerformanceMonitor = () => {
    useEffect(() => {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'navigation') {
            setPerformanceMetrics(prev => ({
              ...prev,
              pageLoad: {
                duration: entry.loadEventEnd - entry.loadEventStart,
                domContentLoaded: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
                firstPaint: entry.firstPaint,
                firstContentfulPaint: entry.firstContentfulPaint,
              },
            }));
          }
        });
      });

      observer.observe({ entryTypes: ['navigation', 'paint'] });

      return () => observer.disconnect();
    }, []);
  };

  return {
    isVisible,
    isOnline,
    performanceMetrics,
    useIntersectionObserver,
    measurePerformance,
    useDebounce,
    useThrottle,
    useMemoizedValue,
    useLazyImage,
    useVirtualScroll,
    useCache,
    usePreload,
    usePerformanceMonitor,
  };
};

// Hook para optimización de listas
export const useOptimizedList = (items, options = {}) => {
  const {
    pageSize = 20,
    searchTerm = '',
    sortBy = null,
    filterBy = null,
  } = options;

  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Filtrar y ordenar items
  const processedItems = useMemo(() => {
    let result = [...items];

    // Aplicar filtro de búsqueda
    if (searchTerm) {
      result = result.filter(item =>
        Object.values(item).some(value =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Aplicar filtro personalizado
    if (filterBy) {
      result = result.filter(filterBy);
    }

    // Aplicar ordenamiento
    if (sortBy) {
      result.sort((a, b) => {
        const aValue = a[sortBy.field];
        const bValue = b[sortBy.field];
        
        if (sortBy.direction === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
    }

    return result;
  }, [items, searchTerm, sortBy, filterBy]);

  // Paginación
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return processedItems.slice(startIndex, endIndex);
  }, [processedItems, currentPage, pageSize]);

  const totalPages = Math.ceil(processedItems.length / pageSize);

  const goToPage = useCallback((page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  }, [totalPages]);

  const nextPage = useCallback(() => {
    goToPage(currentPage + 1);
  }, [currentPage, goToPage]);

  const prevPage = useCallback(() => {
    goToPage(currentPage - 1);
  }, [currentPage, goToPage]);

  return {
    items: paginatedItems,
    totalItems: processedItems.length,
    currentPage,
    totalPages,
    isLoading,
    setIsLoading,
    goToPage,
    nextPage,
    prevPage,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
  };
};

// Hook para gestión de estado global optimizado
export const useOptimizedState = (initialState) => {
  const [state, setState] = useState(initialState);
  const stateRef = useRef(state);

  const updateState = useCallback((updates) => {
    setState(prevState => {
      const newState = typeof updates === 'function' ? updates(prevState) : { ...prevState, ...updates };
      stateRef.current = newState;
      return newState;
    });
  }, []);

  const getState = useCallback(() => stateRef.current, []);

  return [state, updateState, getState];
}; 