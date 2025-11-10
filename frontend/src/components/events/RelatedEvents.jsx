import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Button,
  Grid,
  Avatar,
  Rating,
  Skeleton,
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  Star as StarIcon,
  People as PeopleIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const RelatedEvents = ({ events, isLoading, currentEventId }) => {
  const navigate = useNavigate();

  const formatDate = (date) => {
    if (!date) return 'Fecha no disponible';
    try {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) {
        return 'Fecha no válida';
      }
      return format(dateObj, "d 'de' MMM", { locale: es });
    } catch (error) {
      return 'Fecha no válida';
    }
  };

  const handleEventClick = (eventId) => {
    navigate(`/events/${eventId}`);
  };

  if (isLoading) {
    return (
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
          Eventos Relacionados
        </Typography>
        <Grid container spacing={3}>
          {[1, 2, 3].map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item}>
              <Card>
                <Skeleton variant="rectangular" height={200} />
                <CardContent>
                  <Skeleton variant="text" width="80%" height={24} sx={{ mb: 1 }} />
                  <Skeleton variant="text" width="60%" height={20} sx={{ mb: 1 }} />
                  <Skeleton variant="text" width="40%" height={16} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (!events || events.length === 0) {
    return null;
  }

  // Filtrar el evento actual
  const filteredEvents = Array.isArray(events) ? events.filter(event => event._id !== currentEventId).slice(0, 3) : [];

  if (filteredEvents.length === 0) {
    return null;
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
        Eventos Relacionados
      </Typography>
      <Grid container spacing={3}>
        {filteredEvents.map((event) => (
          <Grid item xs={12} sm={6} md={4} key={event._id}>
            <Card 
              sx={{ 
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                }
              }}
              onClick={() => handleEventClick(event._id)}
            >
              <CardMedia
                component="img"
                height="200"
                image={event.image || 'https://via.placeholder.com/400x200?text=Evento'}
                alt={event.name}
                sx={{ objectFit: 'cover' }}
              />
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Chip
                    label={event.type}
                    color="primary"
                    variant="outlined"
                    size="small"
                  />
                  <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                    {formatPrice(event.price)}
                  </Typography>
                </Box>

                <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
                  {event.name}
                </Typography>

                <Typography variant="body2" color="text.secondary" paragraph sx={{ mb: 2 }}>
                  {event.description?.substring(0, 100)}...
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <CalendarIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(event.date)}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <LocationIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    {event.location}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <PeopleIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    {event.concurrentes || 0} / {event.capacidad} asistentes
                  </Typography>
                </Box>

                {event.rating && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Rating value={event.rating.average || 0} readOnly size="small" />
                    <Typography variant="body2" color="text.secondary">
                      ({event.rating.count || 0})
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default RelatedEvents; 
