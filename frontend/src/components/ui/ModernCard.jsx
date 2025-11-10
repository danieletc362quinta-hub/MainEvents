import React from 'react';
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
  useMediaQuery
} from '@mui/material';
import {
  Share as ShareIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';

const ModernCard = ({
  title,
  description,
  image,
  organizer,
  date,
  location,
  price,
  status = 'active',
  visibility = 'public',
  isFavorite = false,
  onFavorite,
  onShare,
  onAttend,
  rating = { average: 0, count: 0 },
  capacity,
  attendees = 0,
  ...props
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'active': return 'success';
      case 'inactive': return 'default';
      case 'cancelled': return 'error';
      case 'completed': return 'info';
      default: return 'default';
    }
  };

  const getVisibilityColor = (visibility) => {
    switch (visibility.toLowerCase()) {
      case 'public': return 'primary';
      case 'private': return 'secondary';
      default: return 'default';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
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
        ...props.sx
      }}
      {...props}
    >
      {/* Header con estado y visibilidad */}
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
            label={status.toUpperCase()}
            color={getStatusColor(status)}
            size="small"
            sx={{
              fontWeight: 600,
              fontSize: '0.75rem',
              height: 24,
              '& .MuiChip-icon': {
                fontSize: '0.875rem'
              }
            }}
            icon={status === 'active' ? <CalendarIcon /> : undefined}
          />
          <Chip
            label={visibility}
            color={getVisibilityColor(visibility)}
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
            onClick={onShare}
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
            onClick={onFavorite}
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
      <CardMedia
        component="img"
        height={isMobile ? 200 : 280}
        image={image}
        alt={title}
        sx={{
          objectFit: 'cover',
          borderRadius: '0 0 0 0',
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '50%',
            background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
            pointerEvents: 'none'
          }
        }}
      />

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
          color: 'white'
        }}
      >
        <Typography
          variant="h5"
          component="h2"
          sx={{
            fontWeight: 700,
            fontSize: isMobile ? '1.5rem' : '1.75rem',
            mb: 1,
            textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
            background: 'linear-gradient(45deg, #fff, #e3f2fd)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          {title}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <PersonIcon sx={{ fontSize: '1rem', opacity: 0.9 }} />
          <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500 }}>
            Organizado por {organizer}
          </Typography>
        </Box>
      </Box>

      <CardContent sx={{ p: 3 }}>
        {/* Información del evento */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
            <CalendarIcon sx={{ color: theme.palette.primary.main, fontSize: '1.25rem' }} />
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {formatDate(date)}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
            <LocationIcon sx={{ color: theme.palette.secondary.main, fontSize: '1.25rem' }} />
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {location}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <MoneyIcon sx={{ color: theme.palette.success.main, fontSize: '1.25rem' }} />
            <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.success.main }}>
              {formatPrice(price)}
            </Typography>
          </Box>
        </Box>

        {/* Estadísticas */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 2,
            backgroundColor: theme.palette.grey[50],
            borderRadius: 2,
            mb: 3
          }}
        >
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
              {rating.average.toFixed(1)}
            </Typography>
            <Typography variant="caption" sx={{ color: theme.palette.grey[600] }}>
              Calificación
            </Typography>
          </Box>
          
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.secondary.main }}>
              {attendees}
            </Typography>
            <Typography variant="caption" sx={{ color: theme.palette.grey[600] }}>
              Asistentes
            </Typography>
          </Box>
          
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.success.main }}>
              {capacity}
            </Typography>
            <Typography variant="caption" sx={{ color: theme.palette.grey[600] }}>
              Capacidad
            </Typography>
          </Box>
        </Box>

        {/* Descripción */}
        <Typography
          variant="body2"
          sx={{
            color: theme.palette.grey[700],
            lineHeight: 1.6,
            mb: 3,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {description}
        </Typography>
      </CardContent>

      <CardActions sx={{ p: 3, pt: 0 }}>
        <Button
          variant="contained"
          fullWidth
          onClick={onAttend}
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

export default ModernCard;
