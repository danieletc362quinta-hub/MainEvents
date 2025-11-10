import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Chip,
  IconButton,
  Paper,
  Grid,
  useTheme,
  useMediaQuery,
  Fab,
  Backdrop,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Share as ShareIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
  AttachMoney as MoneyIcon,
  People as PeopleIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import ModernCard from '../ui/ModernCard';
import EventDetailTabs from '../ui/EventDetailTabs';
import { useLanguage } from '../../contexts/UnifiedLanguageContext';
import { useEvent, useCommentEvent } from '../../hooks/useEvents';
import { useAuth } from '../../contexts/AuthContext';

const ModernEventDetail = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { t } = useLanguage();
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Usar el hook real para obtener el evento
  const { data: event, isLoading, error } = useEvent(id);
  const { user } = useAuth();
  const commentEvent = useCommentEvent();
  const [isFavorite, setIsFavorite] = useState(false);
  const [comments, setComments] = useState([]);
  const [attendees, setAttendees] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    if (event) {
      // Cargar comentarios y asistentes del evento real
      setComments(event.comments || []);
      setAttendees(event.attendees || []);
    }
  }, [event]);

  const handleFavorite = () => {
    setIsFavorite(!isFavorite);
    // Aquí harías la llamada a la API para marcar/desmarcar favorito
  };

  const handleAddComment = (commentText) => {
    if (!user) {
      navigate('/login');
      return;
    }

    commentEvent.mutate(
      { eventId: id, comment: commentText },
      {
        onSuccess: (data) => {
          console.log('✅ Comentario agregado:', data);
          // Actualizar la lista de comentarios localmente
          setComments(prev => [...prev, {
            user: { name: user.name, email: user.email },
            text: commentText,
            createdAt: new Date()
          }]);
        },
        onError: (error) => {
          console.error('❌ Error al agregar comentario:', error);
        }
      }
    );
  };

  const handleRateEvent = (rating) => {
    if (!user) {
      navigate('/login');
      return;
    }
    // Aquí implementarías la funcionalidad de calificación
    console.log('Calificación:', rating);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event?.name,
        text: event?.description,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      // Mostrar notificación de copiado
    }
  };

  const handleAttend = async () => {
    if (!user) {
      // Si no está autenticado, redirigir al login
      navigate('/login');
      return;
    }

    try {
      // Llamar a la API real de asistencia
      const response = await fetch(`http://localhost:4000/api/attendance/register/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          amount: event?.price || 0,
          source: 'web'
        })
      });

      const data = await response.json();

      if (data.success) {
        setSnackbar({
          open: true,
          message: '¡Te has registrado exitosamente en el evento!',
          severity: 'success'
        });
        
        // Actualizar el estado local
        setAttendees(prev => [...prev, {
          user: { _id: user.id, name: user.name },
          status: 'registered'
        }]);
      } else {
        setSnackbar({
          open: true,
          message: data.message || 'Error al registrar asistencia',
          severity: 'error'
        });
      }
      
    } catch (error) {
      console.error('Error al registrarse en el evento:', error);
      setSnackbar({
        open: true,
        message: 'Error al registrarse en el evento. Por favor, inténtalo de nuevo.',
        severity: 'error'
      });
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
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

  if (isLoading) {
    return (
      <Backdrop open={isLoading} sx={{ color: '#fff', zIndex: theme.zIndex.drawer + 1 }}>
        <CircularProgress color="inherit" />
      </Backdrop>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          Error al cargar el evento: {error.message}
        </Alert>
      </Container>
    );
  }

  if (!event) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" sx={{ textAlign: 'center', color: theme.palette.grey[500] }}>
          Evento no encontrado
        </Typography>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      {/* Header con imagen */}
      <Box
        sx={{
          position: 'relative',
          height: { xs: '50vh', sm: '55vh', md: '60vh' },
          overflow: 'hidden',
          // Fallback background cuando no hay imagen
          background: event.image 
            ? 'transparent' 
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(45deg, rgba(0,0,0,0.4), rgba(0,0,0,0.6))',
            zIndex: 1
          }
        }}
      >
        {/* Imagen responsive */}
        {event.image ? (
          <Box
            component="img"
            src={event.image}
            alt={event.title}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center',
              display: 'block',
              // Optimizaciones responsive
              minHeight: { xs: '300px', sm: '400px', md: '500px' },
              maxHeight: { xs: '50vh', md: '60vh' },
              // Mejoras de rendimiento
              loading: 'lazy',
              // Transición suave
              transition: 'transform 0.3s ease-in-out',
              '&:hover': {
                transform: 'scale(1.02)'
              }
            }}
          />
        ) : (
          // Fallback cuando no hay imagen
          <Box
            sx={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              fontSize: { xs: '3rem', sm: '4rem', md: '5rem' },
              color: 'white',
              opacity: 0.8
            }}
          >
            📅
          </Box>
        )}
        {/* Botón de regreso */}
        <IconButton
          onClick={() => navigate(-1)}
          sx={{
            position: 'absolute',
            top: 20,
            left: 20,
            zIndex: 2,
            backgroundColor: 'rgba(255,255,255,0.2)',
            color: 'white',
            backdropFilter: 'blur(10px)',
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.3)'
            }
          }}
        >
          <ArrowBackIcon />
        </IconButton>

        {/* Acciones del evento */}
        <Box
          sx={{
            position: 'absolute',
            top: 20,
            right: 20,
            zIndex: 2,
            display: 'flex',
            gap: 1
          }}
        >
          <IconButton
            onClick={handleShare}
            sx={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              color: 'white',
              backdropFilter: 'blur(10px)',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.3)'
              }
            }}
          >
            <ShareIcon />
          </IconButton>
          <IconButton
            onClick={handleFavorite}
            sx={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              color: isFavorite ? '#ff6b6b' : 'white',
              backdropFilter: 'blur(10px)',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.3)'
              }
            }}
          >
            {isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
          </IconButton>
        </Box>

        {/* Información del evento */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 2,
            p: 4,
            color: 'white'
          }}
        >
          <Container maxWidth="lg">
            {/* Estado y visibilidad */}
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Chip
                label="ACTIVO"
                color="success"
                sx={{
                  fontWeight: 600,
                  backgroundColor: 'rgba(76, 175, 80, 0.9)',
                  color: 'white'
                }}
              />
              <Chip
                label={event.visibility}
                color="primary"
                variant="outlined"
                sx={{
                  fontWeight: 600,
                  borderColor: 'rgba(255,255,255,0.5)',
                  color: 'white'
                }}
              />
            </Box>

            {/* Título del evento */}
            <Typography
              variant={isMobile ? 'h4' : 'h3'}
              sx={{
                fontWeight: 800,
                mb: 1,
                textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                background: 'linear-gradient(45deg, #fff, #e3f2fd)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              {event.name}
            </Typography>

            {/* Organizador */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <PersonIcon sx={{ fontSize: '1.25rem', opacity: 0.9 }} />
              <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 500 }}>
                Organizado por {event.user?.name || event.organizer || 'MainEvents'}
              </Typography>
            </Box>
          </Container>
        </Box>
      </Box>

      {/* Contenido principal */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={4}>
          {/* Información del evento */}
          <Grid item xs={12} md={4}>
            <Paper
              sx={{
                p: 3,
                borderRadius: 3,
                background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                position: 'sticky',
                top: 20
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: theme.palette.grey[800] }}>
                Información del Evento
              </Typography>

              {/* Fecha */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <CalendarIcon sx={{ color: theme.palette.primary.main }} />
                <Box>
                  <Typography variant="body2" sx={{ color: theme.palette.grey[600] }}>
                    Fecha y Hora
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {formatDate(event.date)}
                  </Typography>
                </Box>
              </Box>

              {/* Ubicación */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <LocationIcon sx={{ color: theme.palette.secondary.main }} />
                <Box>
                  <Typography variant="body2" sx={{ color: theme.palette.grey[600] }}>
                    Ubicación
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {event.location}
                  </Typography>
                </Box>
              </Box>

              {/* Precio */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <MoneyIcon sx={{ color: theme.palette.success.main }} />
                <Box>
                  <Typography variant="body2" sx={{ color: theme.palette.grey[600] }}>
                    Precio
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.success.main }}>
                    {formatPrice(event.price)}
                  </Typography>
                </Box>
              </Box>

              {/* Asistentes */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <PeopleIcon sx={{ color: theme.palette.info.main }} />
                <Box>
                  <Typography variant="body2" sx={{ color: theme.palette.grey[600] }}>
                    Asistentes
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {event.attendees} de {event.capacity} disponibles
                  </Typography>
                </Box>
              </Box>

              {/* Botón de asistir */}
              <Box
                sx={{
                  background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: 2,
                  p: 2,
                  textAlign: 'center',
                  color: 'white'
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  ¿Te interesa este evento?
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9, mb: 2 }}>
                  Únete a {event.attendees} personas que ya se registraron
                </Typography>
                <Box
                  onClick={handleAttend}
                  sx={{
                    background: 'rgba(255,255,255,0.2)',
                    borderRadius: 2,
                    p: 1.5,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: 'rgba(255,255,255,0.3)',
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  <Typography variant="button" sx={{ fontWeight: 600 }}>
                    Asistir al Evento
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Tabs de contenido */}
          <Grid item xs={12} md={8}>
            <EventDetailTabs
              event={event}
              comments={comments}
              attendees={attendees}
              onAddComment={handleAddComment}
              onRateEvent={handleRateEvent}
            />
          </Grid>
        </Grid>
      </Container>

      {/* Floating Action Button para móviles */}
      {isMobile && (
        <Fab
          color="primary"
          sx={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
            '&:hover': {
              background: 'linear-gradient(45deg, #5a6fd8 0%, #6a4190 100%)'
            }
          }}
          onClick={handleAttend}
        >
          <PeopleIcon />
        </Fab>
      )}

      {/* Snackbar para notificaciones */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ModernEventDetail;
