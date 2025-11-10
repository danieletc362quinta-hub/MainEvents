import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  useTheme,
  useMediaQuery,
  IconButton,
  Tooltip,
  Chip,
  Skeleton,
} from '@mui/material';
import {
  Event as EventIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  People as PeopleIcon,
  AttachMoney as MoneyIcon,
  Star as StarIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Share as ShareIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { formatPrice } from '../../utils/formatters';

const VirtualizedList = ({
  items = [],
  itemHeight = 80,
  containerHeight = 400,
  renderItem,
  loading = false,
  error = null,
  emptyMessage = "No hay elementos para mostrar",
  onItemClick,
  onFavoriteToggle,
  onShare,
  onEdit,
  onDelete,
  showActions = true,
  showFavorites = true,
  showRatings = true,
  showPricing = true,
  showAttendees = true,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [scrollTop, setScrollTop] = useState(0);
  const [containerRef, setContainerRef] = useState(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const [favorites, setFavorites] = useState(new Set());

  // Calcular elementos visibles
  const visibleItems = useMemo(() => {
    if (!items.length) return [];
    
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 2, // +2 para buffer
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
        padding: theme.spacing(1),
      },
    }));
  }, [items, itemHeight, containerHeight, scrollTop, theme]);

  // Manejar scroll
  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop);
    setIsScrolling(true);
    
    // Debounce para mejorar rendimiento
    clearTimeout(window.scrollTimeout);
    window.scrollTimeout = setTimeout(() => {
      setIsScrolling(false);
    }, 150);
  }, []);

  // Manejar click en elemento
  const handleItemClick = useCallback((item) => {
    if (onItemClick) {
      onItemClick(item);
    }
  }, [onItemClick]);

  // Manejar favoritos
  const handleFavoriteToggle = useCallback((itemId, e) => {
    e.stopPropagation();
    const newFavorites = new Set(favorites);
    if (newFavorites.has(itemId)) {
      newFavorites.delete(itemId);
    } else {
      newFavorites.add(itemId);
    }
    setFavorites(newFavorites);
    
    if (onFavoriteToggle) {
      onFavoriteToggle(itemId, newFavorites.has(itemId));
    }
  }, [favorites, onFavoriteToggle]);

  // Manejar compartir
  const handleShare = useCallback((item, e) => {
    e.stopPropagation();
    if (onShare) {
      onShare(item);
    }
  }, [onShare]);

  // Renderizar elemento por defecto (para eventos)
  const defaultRenderItem = useCallback((item) => {
    const formatDate = (dateString) => {
      if (!dateString) return 'Fecha no disponible';
    try {
      const dateObj = new Date(dateString);
      if (isNaN(dateObj.getTime())) {
        return 'Fecha no válida';
      }
      return dateObj.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (error) {
      return 'Fecha no válida';
    }
  };



    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        whileHover={{ y: -2 }}
      >
        <Paper
          elevation={isScrolling ? 0 : 2}
          sx={{
            height: '100%',
            borderRadius: 2,
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            '&:hover': {
              elevation: 4,
              transform: 'translateY(-2px)',
            },
            overflow: 'hidden',
          }}
          onClick={() => handleItemClick(item)}
        >
          <Box sx={{ display: 'flex', height: '100%' }}>
            {/* Imagen del evento */}
            <Box
              sx={{
                width: 120,
                height: '100%',
                backgroundImage: `url(${item.image || 'https://via.placeholder.com/120x80?text=Evento'})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                flexShrink: 0,
              }}
            />
            
            {/* Contenido */}
            <Box sx={{ flexGrow: 1, p: 2, display: 'flex', flexDirection: 'column' }}>
              {/* Header */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 'bold',
                    lineHeight: 1.2,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {item.name}
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 0.5, ml: 1 }}>
                  {showFavorites && (
                    <Tooltip title={favorites.has(item.id) ? 'Remover de favoritos' : 'Agregar a favoritos'}>
                      <IconButton
                        size="small"
                        onClick={(e) => handleFavoriteToggle(item.id, e)}
                      >
                        {favorites.has(item.id) ? (
                          <FavoriteIcon color="error" fontSize="small" />
                        ) : (
                          <FavoriteBorderIcon fontSize="small" />
                        )}
                      </IconButton>
                    </Tooltip>
                  )}
                  
                  {showActions && (
                    <>
                      <Tooltip title="Compartir">
                        <IconButton
                          size="small"
                          onClick={(e) => handleShare(item, e)}
                        >
                          <ShareIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Ver detalles">
                        <IconButton size="small">
                          <ViewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      
                      {onEdit && (
                        <Tooltip title="Editar">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              onEdit(item);
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      
                      {onDelete && (
                        <Tooltip title="Eliminar">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete(item);
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </>
                  )}
                </Box>
              </Box>
              
              {/* Descripción */}
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mb: 1,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  flexGrow: 1,
                }}
              >
                {item.description}
              </Typography>
              
              {/* Footer con información */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  {/* Fecha */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <CalendarIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(item.date)}
                    </Typography>
                  </Box>
                  
                  {/* Ubicación */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <LocationIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="caption" color="text.secondary">
                      {item.location}
                    </Typography>
                  </Box>
                  
                  {/* Asistentes */}
                  {showAttendees && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <PeopleIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="caption" color="text.secondary">
                        {item.attendees || 0}
                      </Typography>
                    </Box>
                  )}
                </Box>
                
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  {/* Calificación */}
                  {showRatings && item.rating && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <StarIcon sx={{ fontSize: 16, color: 'warning.main' }} />
                      <Typography variant="caption" color="text.secondary">
                        {item.rating}
                      </Typography>
                    </Box>
                  )}
                  
                  {/* Precio */}
                  {showPricing && (
                    <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 'bold' }}>
                      {formatPrice(item.price)}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>
          </Box>
        </Paper>
      </motion.div>
    );
  }, [
    isScrolling,
    handleItemClick,
    favorites,
    handleFavoriteToggle,
    handleShare,
    showFavorites,
    showActions,
    showRatings,
    showPricing,
    showAttendees,
    onEdit,
    onDelete,
  ]);

  // Renderizar skeleton mientras carga
  const renderSkeleton = () => (
    <Box sx={{ p: 1 }}>
      <Paper sx={{ p: 2, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Skeleton variant="rectangular" width={120} height={60} />
          <Box sx={{ flexGrow: 1 }}>
            <Skeleton variant="text" width="60%" height={24} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="100%" height={16} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="80%" height={16} />
          </Box>
        </Box>
      </Paper>
    </Box>
  );

  if (error) {
    return (
      <Alert severity="error" sx={{ borderRadius: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box
      ref={setContainerRef}
      sx={{
        height: containerHeight,
        overflow: 'auto',
        borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`,
        position: 'relative',
      }}
      onScroll={handleScroll}
    >
      {loading ? (
        // Mostrar skeletons mientras carga
        <Box>
          {Array.from({ length: Math.ceil(containerHeight / itemHeight) }).map((_, index) => (
            <Box key={index} style={{ height: itemHeight }}>
              {renderSkeleton()}
            </Box>
          ))}
        </Box>
      ) : items.length === 0 ? (
        // Mensaje cuando no hay elementos
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            p: 4,
          }}
        >
          <EventIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
            No hay elementos
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center">
            {emptyMessage}
          </Typography>
        </Box>
      ) : (
        // Lista virtualizada
        <Box sx={{ position: 'relative', height: items.length * itemHeight }}>
          <AnimatePresence>
            {visibleItems.map((item) => (
              <Box key={item.id || item.index} style={item.style}>
                {renderItem ? renderItem(item) : defaultRenderItem(item)}
              </Box>
            ))}
          </AnimatePresence>
        </Box>
      )}
    </Box>
  );
};

export default VirtualizedList; 
