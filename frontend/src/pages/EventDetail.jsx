import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Button,
  Container,
  Paper,
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Rating,
  Badge,
  Tooltip,
  LinearProgress,
  Stack,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  AlertTitle,
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  Star as StarIcon,
  People as PeopleIcon,
  Person as PersonIcon,
  Share as ShareIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  AccessTime as TimeIcon,
  MonetizationOn as PriceIcon,
  Event as EventIcon,
  Category as CategoryIcon,
  Visibility as VisibilityIcon,
  ExpandMore as ExpandMoreIcon,
  WhatsApp as WhatsAppIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Map as MapIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useEvent, useEvents, useAttendEvent, useFavoriteEvent, useCommentEvent, useDeleteEvent } from '../hooks/useEvents';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import EventDetailSkeleton from '../components/ui/EventDetailSkeleton';
import RelatedEvents from '../components/events/RelatedEvents';
import EventStats from '../components/events/EventStats';
import { formatPrice } from '../utils/formatters';

// Componente para mostrar información del evento
const EventInfo = ({ event, user, attendEvent, favoriteEvent, commentEvent }) => {
  const navigate = useNavigate();
  const { data: relatedEvents, isLoading: relatedEventsLoading } = useEvents({ 
    type: event.type, 
    limit: 6 
  });
  const [selectedTab, setSelectedTab] = useState(0);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showCommentDialog, setShowCommentDialog] = useState(false);
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(0);
  const [showTicketDialog, setShowTicketDialog] = useState(false);
  const [ticketQuantity, setTicketQuantity] = useState(1);
  const [isAttending, setIsAttending] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const deleteEvent = useDeleteEvent();

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteEvent.mutateAsync(event._id);
      setDeleteDialogOpen(false);
      navigate('/events', { state: { message: 'Evento eliminado correctamente' } });
    } catch (error) {
      console.error('Error al eliminar el evento:', error);
      // El error se manejará automáticamente por el hook useDeleteEvent
    }
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const isEventOwner = user && event.organizer && (event.organizer._id === user._id || event.organizer === user._id);
  const isEventFull = (event.concurrentes || 0) >= (event.capacidad || 0);
  const isEventPast = event.date ? (() => {
    try {
      const eventDate = new Date(event.date);
      if (isNaN(eventDate.getTime())) {
        return false;
      }
      return eventDate < new Date();
    } catch (error) {
      return false;
    }
  })() : false;
  const isEventActive = event.estado === 'activo';

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
            title: event.name || 'Evento',
    text: event.description || 'Descripción del evento',
        url: window.location.href,
      });
    } else {
      setShowShareDialog(true);
    }
  };

  const handleFavorite = () => {
    if (!user) {
      navigate('/login');
      return;
    }

    favoriteEvent.mutate(event._id, {
      onSuccess: (data) => {
        console.log('✅ Favorito actualizado:', data);
      },
      onError: (error) => {
        console.error('❌ Error al actualizar favorito:', error);
      }
    });
  };

  const handleAttend = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setShowTicketDialog(true);
  };

  const handleBuyTickets = () => {
    console.log('🎫 handleBuyTickets llamado:', { eventId: event._id, quantity: ticketQuantity, user });
    
    if (!user) {
      navigate('/login');
      return;
    }

    console.log('🎫 Iniciando mutación de asistencia...');
    attendEvent.mutate(
      { eventId: event._id, quantity: ticketQuantity },
      {
        onSuccess: (data) => {
          console.log('✅ Entradas compradas:', data);
          setIsAttending(true);
          setShowTicketDialog(false);
          setTicketQuantity(1);
        },
        onError: (error) => {
          console.error('❌ Error al comprar entradas:', error);
        }
      }
    );
  };

  const handleComment = () => {
    setShowCommentDialog(true);
  };

  const submitComment = () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!comment.trim()) {
      return;
    }

    commentEvent.mutate(
      { eventId: event._id, comment: comment.trim() },
      {
        onSuccess: (data) => {
          console.log('✅ Comentario enviado:', data);
          setShowCommentDialog(false);
          setComment('');
          setRating(0);
        },
        onError: (error) => {
          console.error('❌ Error al enviar comentario:', error);
        }
      }
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'activo': return 'success';
      case 'cancelado': return 'error';
      case 'completado': return 'info';
      case 'pendiente': return 'warning';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'activo': return <CheckCircleIcon />;
      case 'cancelado': return <CancelIcon />;
      case 'completado': return <InfoIcon />;
      case 'pendiente': return <WarningIcon />;
      default: return <InfoIcon />;
    }
  };

  const formatDate = (date) => {
    if (!date) return 'Fecha no disponible';
    try {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) {
        return 'Fecha no válida';
      }
      return format(dateObj, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es });
    } catch (error) {
      return 'Fecha no válida';
    }
  };

  const formatTime = (date) => {
    if (!date) return '--:--';
    try {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) {
        return '--:--';
      }
      return format(dateObj, 'HH:mm');
    } catch (error) {
      return '--:--';
    }
  };



  const getAttendancePercentage = () => {
    if (!event.concurrentes || !event.capacidad) return 0;
    return Math.round((event.concurrentes / event.capacidad) * 100);
  };

  const getAvailabilityColor = () => {
    const percentage = getAttendancePercentage();
    if (percentage >= 90) return 'error';
    if (percentage >= 70) return 'warning';
    return 'success';
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header del evento */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Chip
                icon={getStatusIcon(event.estado)}
                label={event.estado?.toUpperCase() || 'PENDIENTE'}
                color={getStatusColor(event.estado)}
                variant="filled"
                size="medium"
              />
              <Chip
                label={event.type || 'Evento'}
                color="primary"
                variant="outlined"
                size="medium"
              />
              </Box>
          <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            {event.name || 'Evento sin título'}
          </Typography>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Organizado por {event.user?.name || 'Usuario'}
          </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
              <Tooltip title="Compartir evento">
                <IconButton onClick={handleShare} color="primary">
                  <ShareIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Agregar a favoritos">
                <IconButton onClick={handleFavorite} color="primary">
                  <FavoriteBorderIcon />
                </IconButton>
              </Tooltip>
              {isEventOwner && (
                <>
                  <Tooltip title="Editar evento">
                    <IconButton color="primary">
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Eliminar evento">
                    <IconButton 
                      color="error" 
                      onClick={handleDeleteClick}
                      disabled={deleteEvent.isLoading}
                    >
                      {deleteEvent.isLoading ? <CircularProgress size={24} /> : <DeleteIcon />}
                    </IconButton>
                  </Tooltip>
                </>
              )}
            </Box>
          </Grid>
        </Grid>
      </Box>

      <Grid container spacing={4}>
        {/* Contenido principal */}
        <Grid item xs={12} lg={8}>
          {/* Imagen del evento */}
          <Card sx={{ mb: 4, overflow: 'hidden' }}>
            <CardMedia
              component="img"
              height="400"
              image={imageError ? '/default-event.jpg' : (event.image || 'https://via.placeholder.com/800x400?text=Imagen+del+Evento')}
              alt={event.name || 'Imagen del evento'}
              sx={{ objectFit: 'cover' }}
              onError={handleImageError}
            />
          </Card>

          {/* Tabs de información */}
          <Card sx={{ mb: 4 }}>
            <Tabs value={selectedTab} onChange={(e, newValue) => setSelectedTab(newValue)}>
              <Tab label="Descripción" />
              <Tab label="Comentarios" />
              <Tab label="Asistentes" />
            </Tabs>
            <Divider />
            <CardContent>
              {selectedTab === 0 && (
                <Box>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Descripción
                  </Typography>
                  <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
                    {event.description || 'Este evento no tiene descripción disponible.'}
                  </Typography>
                  
                  {event.tags && Array.isArray(event.tags) && event.tags.length > 0 && (
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="h6" gutterBottom>
                        Etiquetas
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {event.tags.map((tag, index) => (
                          <Chip key={index} label={tag} variant="outlined" size="small" />
                        ))}
                      </Box>
                    </Box>
                  )}

                  {event.category && (
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="h6" gutterBottom>
                        Categoría
                      </Typography>
                      <Chip icon={<CategoryIcon />} label={event.category} color="primary" />
                    </Box>
                  )}
                </Box>
              )}

              {selectedTab === 1 && (
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                      Comentarios ({event.comments?.length || 0})
                    </Typography>
                    <Button
                      variant="outlined"
                      startIcon={<EditIcon />}
                      onClick={handleComment}
                    >
                      Agregar Comentario
                    </Button>
                  </Box>
                  
                  {event.comments && Array.isArray(event.comments) && event.comments.length > 0 ? (
                    <List>
                      {event.comments.map((comment, index) => (
                        <ListItem key={index} sx={{ px: 0, py: 2 }}>
                          <ListItemIcon>
                            <Avatar sx={{ bgcolor: 'primary.main' }}>
                              {comment.user?.name?.charAt(0) || 'U'}
                            </Avatar>
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                  {comment.user?.name || 'Usuario'}
                                </Typography>
                                <Rating value={comment.rating || 0} size="small" readOnly />
                                <Typography variant="caption" color="text.secondary">
                                  {comment.createdAt ? (() => {
                                    try {
                                      const dateObj = new Date(comment.createdAt);
                                      if (isNaN(dateObj.getTime())) {
                                        return 'Fecha no válida';
                                      }
                                      return format(dateObj, 'dd/MM/yyyy');
                                    } catch (error) {
                                      return 'Fecha no válida';
                                    }
                                  })() : 'Fecha no disponible'}
                                </Typography>
                              </Box>
                            }
                            secondary={
                              <Typography variant="body2" sx={{ mt: 1 }}>
                                {comment.text || 'Comentario sin texto'}
                              </Typography>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Alert severity="info">
                      <AlertTitle>Sin comentarios</AlertTitle>
                      Sé el primero en comentar sobre este evento.
                    </Alert>
                  )}
                </Box>
              )}

              {selectedTab === 2 && (
                <Box>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Asistentes ({event.concurrentes || 0})
                  </Typography>
                  
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Capacidad utilizada
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {getAttendancePercentage()}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={getAttendancePercentage()}
                      color={getAvailabilityColor()}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {event.concurrentes || 0} de {event.capacidad || 0} asistentes
                    </Typography>
                  </Box>

                  {event.attendees && Array.isArray(event.attendees) && event.attendees.length > 0 ? (
                    <List>
                      {event.attendees.map((attendee, index) => (
                        <ListItem key={index} sx={{ px: 0 }}>
                          <ListItemIcon>
                            <Avatar sx={{ bgcolor: 'primary.main' }}>
                              {attendee.user?.name?.charAt(0) || 'A'}
                            </Avatar>
                          </ListItemIcon>
                          <ListItemText
                            primary={attendee.user?.name || 'Asistente'}
                            secondary={`${attendee.quantity || 1} entrada${(attendee.quantity || 1) > 1 ? 's' : ''}`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Alert severity="info">
                      <AlertTitle>Sin asistentes</AlertTitle>
                      Sé el primero en registrarte para este evento.
                    </Alert>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Estadísticas del evento */}
          <EventStats event={event} />

          {/* Información adicional */}
          <Card sx={{ mt: 4 }}>
            <CardContent>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                Información Adicional
              </Typography>
              
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">Detalles del organizador</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                      {event.user?.name?.charAt(0) || 'O'}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {event.user?.name || 'Organizador'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {event.user?.email || 'email@ejemplo.com'}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button startIcon={<EmailIcon />} variant="outlined" size="small">
                      Contactar
                    </Button>
                    <Button startIcon={<WhatsAppIcon />} variant="outlined" size="small">
                      WhatsApp
                    </Button>
                  </Box>
                </AccordionDetails>
              </Accordion>

              {event.urlStreaming && event.urlStreaming.trim() && (
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h6">Transmisión en vivo</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" paragraph>
                      Este evento también se transmitirá en vivo.
                    </Typography>
                    <Button
                      variant="contained"
                      href={event.urlStreaming}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Ver transmisión
                    </Button>
                  </AccordionDetails>
                </Accordion>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} lg={4}>
          <Stack spacing={3}>
            {/* Tarjeta de compra */}
            <Paper sx={{ p: 3, position: 'sticky', top: 24 }}>
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Typography variant="h3" color="primary" sx={{ fontWeight: 'bold' }}>
                                      {formatPrice(event.price || 0)}
                </Typography>
                {(event.price || 0) === 0 && (
                  <Typography variant="body2" color="success.main" sx={{ fontWeight: 'bold' }}>
                    ¡Evento gratuito!
                  </Typography>
                )}
              </Box>

              <Button
                variant="contained"
                fullWidth
                size="large"
                disabled={isEventFull || isEventPast || !isEventActive || attendEvent.isPending}
                onClick={handleAttend}
                sx={{ py: 1.5, fontSize: '1.1rem', fontWeight: 'bold', mb: 2 }}
                startIcon={attendEvent.isPending ? <CircularProgress size={20} /> : null}
              >
                {attendEvent.isPending ? 'Procesando...' :
                 isEventFull ? 'Evento Completo' : 
                 isEventPast ? 'Evento Finalizado' : 
                 !isEventActive ? 'Evento No Disponible' : 
                 isAttending ? 'Entradas Compradas' :
                 'Comprar Entradas'}
              </Button>

              {isEventFull && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  <AlertTitle>Evento completo</AlertTitle>
                  No quedan entradas disponibles para este evento.
                </Alert>
              )}

              {isEventPast && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  <AlertTitle>Evento finalizado</AlertTitle>
                  Este evento ya ha terminado.
                </Alert>
              )}

              <Divider sx={{ my: 3 }} />

              {/* Información de fecha y hora */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <CalendarIcon color="primary" />
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Fecha y Hora
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ ml: 4, mb: 1 }}>
                  {event.date ? formatDate(event.date) : 'Fecha por definir'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                                      {event.date ? formatTime(event.date) : '--:--'} hrs
                </Typography>
                {event.duration && event.duration > 0 && (
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                    Duración: {event.duration || 0} minutos
                  </Typography>
                )}
              </Box>

              {/* Ubicación */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <LocationIcon color="primary" />
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Ubicación
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ ml: 4, mb: 1 }}>
                                      {event.location || 'Ubicación por definir'}
                </Typography>
                <Button
                  startIcon={<MapIcon />}
                  variant="outlined"
                  size="small"
                  sx={{ ml: 4 }}
                >
                  Ver en mapa
                </Button>
              </Box>

              {/* Capacidad */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <PeopleIcon color="primary" />
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Capacidad
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ ml: 4, mb: 1 }}>
                                      {event.concurrentes || 0} / {event.capacidad || 0} asistentes
                </Typography>
                <Box sx={{ ml: 4 }}>
                  <LinearProgress
                    variant="determinate"
                    value={getAttendancePercentage()}
                    color={getAvailabilityColor()}
                    sx={{ height: 6, borderRadius: 3 }}
                  />
                </Box>
              </Box>

              {/* Rating */}
              {event.rating && (event.rating.average || event.rating.count) && (
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <StarIcon color="warning" />
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      Calificación
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 4 }}>
                    <Rating value={event.rating?.average || 0} readOnly size="small" />
                    <Typography variant="body2" color="text.secondary">
                      ({event.rating?.count || 0} reseñas)
                    </Typography>
                  </Box>
                </Box>
              )}

              <Divider sx={{ my: 3 }} />

              {/* Estadísticas */}
              <Box>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Estadísticas
                </Typography>
                <List dense>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <VisibilityIcon color="action" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Visitas"
                      secondary={event.visitas || 0}
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <FavoriteIcon color="action" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Favoritos"
                      secondary={Array.isArray(event.favoritos) ? event.favoritos.length : 0}
                    />
                  </ListItem>
                </List>
              </Box>
            </Paper>
          </Stack>
        </Grid>
      </Grid>

      {/* Diálogos */}
      <Dialog open={showShareDialog} onClose={() => setShowShareDialog(false)}>
        <DialogTitle>Compartir evento</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            value={window.location.href}
            InputProps={{ readOnly: true }}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowShareDialog(false)}>Cerrar</Button>
          <Button
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              setShowShareDialog(false);
            }}
            variant="contained"
          >
            Copiar enlace
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={showCommentDialog} onClose={() => setShowCommentDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Agregar comentario</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography component="legend">Calificación</Typography>
            <Rating
              value={rating}
              onChange={(event, newValue) => setRating(newValue)}
              size="large"
            />
          </Box>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Tu comentario"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Comparte tu experiencia con este evento..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCommentDialog(false)}>Cancelar</Button>
          <Button
            onClick={submitComment}
            variant="contained"
            disabled={!comment.trim() || rating === 0}
          >
            Publicar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de compra de entradas */}
      <Dialog open={showTicketDialog} onClose={() => setShowTicketDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Comprar Entradas</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              {event.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {format(new Date(event.date), 'dd/MM/yyyy HH:mm', { locale: es })}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {event.location}
            </Typography>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
              {formatPrice(event.price || 0)}
            </Typography>
            {(event.price || 0) === 0 && (
              <Typography variant="body2" color="success.main" sx={{ fontWeight: 'bold' }}>
                ¡Evento gratuito!
              </Typography>
            )}
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Cantidad de entradas
            </Typography>
            <TextField
              type="number"
              value={ticketQuantity}
              onChange={(e) => setTicketQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              inputProps={{ min: 1, max: Math.min(50, (event.capacidad || 0) - (event.concurrentes || 0)) }}
              sx={{ width: 120 }}
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Entradas disponibles: {(event.capacidad || 0) - (event.concurrentes || 0)}
            </Typography>
          </Box>

          {(event.price || 0) > 0 && (
            <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="subtitle1" gutterBottom>
                Resumen de compra
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Entradas x{ticketQuantity}</Typography>
                <Typography>{formatPrice((event.price || 0) * ticketQuantity)}</Typography>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Total</Typography>
                <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                  {formatPrice((event.price || 0) * ticketQuantity)}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowTicketDialog(false)}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleBuyTickets}
            disabled={attendEvent.isPending}
            startIcon={attendEvent.isPending ? <CircularProgress size={20} /> : null}
          >
            {attendEvent.isPending ? 'Procesando...' : 
             (event.price || 0) === 0 ? 'Confirmar Asistencia' : 'Comprar Entradas'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Eventos relacionados */}
      <RelatedEvents 
        events={relatedEvents} 
        isLoading={relatedEventsLoading} 
        currentEventId={event._id || null} 
      />
      

      {/* Diálogo de confirmación para eliminar evento */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          ¿Estás seguro de que deseas eliminar este evento?
        </DialogTitle>
        <DialogContent>
          <Typography>Esta acción no se puede deshacer. Se eliminarán todos los datos asociados al evento.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="primary">
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirmDelete} 
            color="error" 
            variant="contained"
            disabled={deleteEvent.isLoading}
            startIcon={deleteEvent.isLoading ? <CircularProgress size={20} /> : null}
          >
            {deleteEvent.isLoading ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

// Componente principal
const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: event, isLoading, isError, error } = useEvent(id);
  const attendEvent = useAttendEvent();
  const favoriteEvent = useFavoriteEvent();
  const commentEvent = useCommentEvent();

  if (isLoading) {
    return <EventDetailSkeleton />;
  }

  if (isError || !event) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          <AlertTitle>Error al cargar el evento</AlertTitle>
          {error?.message || 'No se pudo cargar la información del evento.'}
        </Alert>
        <Button
          variant="contained"
          onClick={() => navigate('/events')}
          startIcon={<EventIcon />}
        >
          Volver a eventos
        </Button>
      </Container>
    );
  }

  return (
    <EventInfo 
      event={event} 
      user={user} 
      attendEvent={attendEvent}
      favoriteEvent={favoriteEvent}
      commentEvent={commentEvent}
    />
  );
};

export default EventDetail; 
