import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  LinearProgress,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Visibility as VisibilityIcon,
  Favorite as FavoriteIcon,
  People as PeopleIcon,
  Star as StarIcon,
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
  MonetizationOn as MonetizationIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const EventStats = ({ event }) => {
  const getAttendancePercentage = () => {
    return Math.round((event.concurrentes / event.capacidad) * 100);
  };

  const getAvailabilityColor = () => {
    const percentage = getAttendancePercentage();
    if (percentage >= 90) return 'error';
    if (percentage >= 70) return 'warning';
    return 'success';
  };

  const getRevenueEstimate = () => {
    return (event.concurrentes || 0) * event.price;
  };

  const getDaysUntilEvent = () => {
    if (!event.date) return 0;
    try {
      const eventDate = new Date(event.date);
      if (isNaN(eventDate.getTime())) {
        return 0;
      }
      const today = new Date();
      const diffTime = eventDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    } catch (error) {
      return 0;
    }
  };

  const getEventStatus = () => {
    const daysUntil = getDaysUntilEvent();
    if (daysUntil < 0) return { status: 'Finalizado', color: 'error' };
    if (daysUntil === 0) return { status: 'Hoy', color: 'warning' };
    if (daysUntil <= 7) return { status: 'Esta semana', color: 'warning' };
    return { status: 'Próximamente', color: 'success' };
  };

  const formatCurrency = (amount) => {
    return `$${amount.toLocaleString('es-AR')}`;
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

  const eventStatus = getEventStatus();

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
          Estadísticas del Evento
        </Typography>

        <Grid container spacing={3}>
          {/* Estado del evento */}
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <CalendarIcon color="primary" />
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  Estado del Evento
                </Typography>
              </Box>
              <Chip
                label={eventStatus.status}
                color={eventStatus.color}
                variant="filled"
                size="small"
                sx={{ mb: 1 }}
              />
              <Typography variant="body2" color="text.secondary">
                {formatDate(event.date)}
              </Typography>
            </Box>
          </Grid>

          {/* Capacidad */}
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <PeopleIcon color="primary" />
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  Capacidad
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Ocupación
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {getAttendancePercentage()}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={getAttendancePercentage()}
                color={getAvailabilityColor()}
                sx={{ height: 8, borderRadius: 4, mb: 1 }}
              />
              <Typography variant="body2" color="text.secondary">
                {event.concurrentes || 0} de {event.capacidad} asistentes
              </Typography>
            </Box>
          </Grid>

          {/* Ingresos estimados */}
          {event.price > 0 && (
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <MonetizationIcon color="primary" />
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    Ingresos Estimados
                  </Typography>
                </Box>
                <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold' }}>
                  {formatCurrency(getRevenueEstimate())}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Basado en {event.concurrentes || 0} entradas vendidas
                </Typography>
              </Box>
            </Grid>
          )}

          {/* Calificación */}
          {event.rating && (
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <StarIcon color="warning" />
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    Calificación Promedio
                  </Typography>
                </Box>
                <Typography variant="h5" color="warning.main" sx={{ fontWeight: 'bold' }}>
                  {event.rating.average?.toFixed(1) || '0.0'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {event.rating.count || 0} reseñas
                </Typography>
              </Box>
            </Grid>
          )}

          {/* Visitas */}
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <VisibilityIcon color="primary" />
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  Visitas
                </Typography>
              </Box>
              <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold' }}>
                {event.visitas || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Visualizaciones del evento
              </Typography>
            </Box>
          </Grid>

          {/* Favoritos */}
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <FavoriteIcon color="error" />
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  Favoritos
                </Typography>
              </Box>
              <Typography variant="h5" color="error.main" sx={{ fontWeight: 'bold' }}>
                {event.favoritos?.length || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Usuarios que marcaron como favorito
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Información adicional */}
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
          Información Adicional
        </Typography>

        <List dense>
          <ListItem sx={{ px: 0 }}>
            <ListItemIcon>
              <LocationIcon color="action" />
            </ListItemIcon>
            <ListItemText
              primary="Ubicación"
              secondary={event.location}
            />
          </ListItem>
          
          <ListItem sx={{ px: 0 }}>
            <ListItemIcon>
              <CalendarIcon color="action" />
            </ListItemIcon>
            <ListItemText
              primary="Tipo de Evento"
              secondary={event.type}
            />
          </ListItem>

          {event.category && (
            <ListItem sx={{ px: 0 }}>
              <ListItemIcon>
                <TrendingUpIcon color="action" />
              </ListItemIcon>
              <ListItemText
                primary="Categoría"
                secondary={event.category}
              />
            </ListItem>
          )}

          {event.visibility && (
            <ListItem sx={{ px: 0 }}>
              <ListItemIcon>
                <VisibilityIcon color="action" />
              </ListItemIcon>
              <ListItemText
                primary="Visibilidad"
                secondary={event.visibility === 'publico' ? 'Público' : 'Privado'}
              />
            </ListItem>
          )}
        </List>
      </CardContent>
    </Card>
  );
};

export default EventStats; 
