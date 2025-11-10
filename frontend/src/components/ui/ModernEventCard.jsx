import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Typography,
  Box,
  Chip,
  IconButton,
  Avatar,
  Button,
  useTheme,
  useMediaQuery,
  Rating,
  LinearProgress
} from '@mui/material';
import {
  Share as ShareIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
  AttachMoney as MoneyIcon,
  People as PeopleIcon,
  Star as StarIcon
} from '@mui/icons-material';
import { useLanguage } from '../../contexts/UnifiedLanguageContext';

const ModernEventCard = ({
  event,
  isFavorite = false,
  onFavorite,
  onShare,
  onAttend,
  onViewDetails,
  ...props
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { t } = useLanguage();
  
  // Estado para forzar la recarga de imágenes
  const [imageKey, setImageKey] = useState(() => Math.random());
  const [imageError, setImageError] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState('');
  
  // Forzar recarga de imagen cada vez que cambie el evento
  useEffect(() => {
    const newKey = Math.random();
    setImageKey(newKey);
    setImageError(false);
    
    // Generar URL única para esta imagen
    if (event?.image && event.image !== 'default-image') {
      const baseUrl = event.image.startsWith('http') 
        ? event.image 
        : `http://localhost:4000/uploads/${event.image}`;
      
      const uniqueUrl = `${baseUrl}?t=${Date.now()}&v=${newKey}&r=${Math.random()}&id=${event.id}`;
      setCurrentImageUrl(uniqueUrl);
      console.log('🔄 Nueva URL generada:', uniqueUrl);
    } else {
      setCurrentImageUrl('https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop');
    }
  }, [event?.image, event?.id]);

  // Función para obtener la imagen del evento
  const getEventImage = () => {
    return currentImageUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(price);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'success';
      case 'inactive': return 'default';
      case 'cancelled': return 'error';
      case 'completed': return 'info';
      default: return 'default';
    }
  };

  const getVisibilityColor = (visibility) => {
    switch (visibility?.toLowerCase()) {
      case 'public': return 'primary';
      case 'private': return 'secondary';
      default: return 'default';
    }
  };

  const attendancePercentage = event?.capacity ? (event.attendees / event.capacity) * 100 : 0;

  return (
    <Card
      sx={{
        maxWidth: '100%',
        borderRadius: 3,
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: '0 16px 48px rgba(0,0,0,0.15)',
        },
        background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
        border: '1px solid rgba(255,255,255,0.2)',
        backdropFilter: 'blur(10px)',
        overflow: 'hidden',
        ...props.sx
      }}
      {...props}
    >
      {/* Header con estado y acciones */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 2,
          pb: 1
        }}
      >
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Chip
            label={event?.status?.toUpperCase() || 'ACTIVO'}
            color={getStatusColor(event?.status)}
            size="small"
            sx={{
              fontWeight: 600,
              fontSize: '0.75rem',
              height: 24,
              '& .MuiChip-icon': {
                fontSize: '0.875rem'
              }
            }}
            icon={event?.status === 'active' ? <CalendarIcon /> : undefined}
          />
          <Chip
            label={event?.visibility || 'público'}
            color={getVisibilityColor(event?.visibility)}
            variant="outlined"
            size="small"
            sx={{
              fontWeight: 500,
              fontSize: '0.75rem',
              height: 24
            }}
          />
        </Box>
        
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <IconButton
            size="small"
            onClick={() => onShare?.(event?.id)}
            sx={{
              color: theme.palette.grey[600],
              '&:hover': {
                color: theme.palette.primary.main,
                backgroundColor: theme.palette.primary.light + '20'
              }
            }}
          >
            <ShareIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => onFavorite?.(event?.id)}
            sx={{
              color: isFavorite ? theme.palette.error.main : theme.palette.grey[600],
              '&:hover': {
                color: theme.palette.error.main,
                backgroundColor: theme.palette.error.light + '20'
              }
            }}
          >
            {isFavorite ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
          </IconButton>
        </Box>
      </Box>

      {/* Imagen del evento */}
      <Box sx={{ 
        position: 'relative', 
        overflow: 'hidden', 
        height: { xs: '250px', sm: '280px', md: '300px' },
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <CardMedia
          component="img"
          image={getEventImage()}
          alt={event?.title}
          onError={(e) => {
            console.error('❌ Error cargando imagen:', currentImageUrl, e);
            setImageError(true);
            // Si falla la carga, usar imagen por defecto
            e.target.src = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop';
          }}
          onLoad={() => {
            console.log('✅ Imagen cargada correctamente:', currentImageUrl);
            setImageError(false);
          }}
          sx={{
            objectFit: 'contain',
            objectPosition: 'center',
            position: 'relative',
            cursor: 'pointer',
            maxWidth: '100%',
            maxHeight: '100%',
            width: 'auto',
            height: 'auto',
          }}
          onClick={() => onViewDetails?.(event?.id)}
        />
      </Box>

      {/* Overlay con información del evento */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(45deg, rgba(0,0,0,0.1), rgba(0,0,0,0.3))',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          p: 2,
          color: 'white',
          opacity: 0,
          transition: 'opacity 0.3s ease',
          '&:hover': {
            opacity: 1
          }
        }}
      >
        <Typography
          variant="h6"
          component="h2"
          sx={{
            fontWeight: 700,
            fontSize: isMobile ? '1.25rem' : '1.5rem',
            mb: 1,
            textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
            background: 'linear-gradient(45deg, #fff, #e3f2fd)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          {event?.title}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <PersonIcon sx={{ fontSize: '1rem', opacity: 0.9 }} />
          <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500 }}>
            {event?.organizer}
          </Typography>
        </Box>
      </Box>

      <CardContent sx={{ p: 3 }}>
        {/* Título del evento */}
        <Typography
          variant="h6"
          component="h2"
          sx={{
            fontWeight: 700,
            mb: 1,
            color: theme.palette.grey[800],
            cursor: 'pointer',
            '&:hover': {
              color: theme.palette.primary.main
            }
          }}
          onClick={() => onViewDetails?.(event?.id)}
        >
          {event?.title}
        </Typography>

        {/* Organizador */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <PersonIcon sx={{ color: theme.palette.grey[500], fontSize: '1rem' }} />
          <Typography variant="body2" sx={{ color: theme.palette.grey[600] }}>
            {event?.organizer}
          </Typography>
        </Box>

        {/* Información del evento */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <CalendarIcon sx={{ color: theme.palette.primary.main, fontSize: '1rem' }} />
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {formatDate(event?.date)}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <LocationIcon sx={{ color: theme.palette.secondary.main, fontSize: '1rem' }} />
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {event?.location}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <MoneyIcon sx={{ color: theme.palette.success.main, fontSize: '1rem' }} />
            <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.success.main }}>
              {formatPrice(event?.price)}
            </Typography>
          </Box>
        </Box>

        {/* Rating */}
        {event?.rating && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Rating
              value={event.rating.average}
              precision={0.1}
              size="small"
              readOnly
              sx={{
                '& .MuiRating-iconFilled': {
                  color: theme.palette.warning.main
                }
              }}
            />
            <Typography variant="body2" sx={{ color: theme.palette.grey[600] }}>
              ({event.rating.count})
            </Typography>
          </Box>
        )}

        {/* Progreso de asistencia */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="body2" sx={{ color: theme.palette.grey[600] }}>
              Asistencia
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.grey[700] }}>
              {event?.attendees || 0} / {event?.capacity || 0}
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={attendancePercentage}
            sx={{
              height: 6,
              borderRadius: 3,
              backgroundColor: theme.palette.grey[200],
              '& .MuiLinearProgress-bar': {
                borderRadius: 3,
                background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)'
              }
            }}
          />
        </Box>

        {/* Descripción */}
        <Typography
          variant="body2"
          sx={{
            color: theme.palette.grey[700],
            lineHeight: 1.6,
            mb: 3,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {event?.description}
        </Typography>
      </CardContent>

      <CardActions sx={{ p: 3, pt: 0 }}>
        <Button
          variant="contained"
          fullWidth
          onClick={() => onAttend?.(event?.id)}
          sx={{
            background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
            borderRadius: 2,
            py: 1.5,
            fontWeight: 600,
            fontSize: '1rem',
            textTransform: 'none',
            boxShadow: '0 4px 16px rgba(102, 126, 234, 0.4)',
            '&:hover': {
              background: 'linear-gradient(45deg, #5a6fd8 0%, #6a4190 100%)',
              boxShadow: '0 6px 20px rgba(102, 126, 234, 0.6)',
              transform: 'translateY(-2px)'
            }
          }}
        >
          Asistir al Evento
        </Button>
      </CardActions>
    </Card>
  );
};

export default ModernEventCard;
