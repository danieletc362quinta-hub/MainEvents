import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  useTheme,
  useMediaQuery,
  Button,
  Chip,
  Avatar,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  IconButton,
  Fab
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  TrendingUp as TrendingIcon,
  Star as StarIcon,
  People as PeopleIcon,
  Event as EventIcon,
  Add as AddIcon,
  Share as ShareIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon
} from '@mui/icons-material';
import ModernCard from '../ui/ModernCard';
import { useLanguage } from '../../contexts/UnifiedLanguageContext';

const ModernHome = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { t } = useLanguage();
  
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [trendingEvents, setTrendingEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular carga de datos
    const loadData = async () => {
      setLoading(true);
      
      // Simular eventos destacados
      const mockFeaturedEvents = [
        {
          id: 1,
          title: 'Conferencia de Tecnología 2024',
          description: 'La mayor conferencia de tecnología del año con los mejores speakers internacionales.',
          image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop',
          organizer: 'TechCorp',
          date: '2024-03-15T18:00:00.000Z',
          location: 'Centro de Convenciones',
          price: 2500,
          status: 'active',
          visibility: 'public',
          rating: { average: 4.8, count: 156 },
          capacity: 500,
          attendees: 342
        },
        {
          id: 2,
          title: 'Workshop de Diseño UX/UI',
          description: 'Aprende las mejores prácticas de diseño de interfaces de usuario.',
          image: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=800&h=600&fit=crop',
          organizer: 'Design Studio',
          date: '2024-03-20T14:00:00.000Z',
          location: 'Espacio Creativo',
          price: 1200,
          status: 'active',
          visibility: 'public',
          rating: { average: 4.6, count: 89 },
          capacity: 50,
          attendees: 23
        },
        {
          id: 3,
          title: 'Networking Empresarial',
          description: 'Conecta con otros profesionales y expande tu red de contactos.',
          image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&h=600&fit=crop',
          organizer: 'Business Network',
          date: '2024-03-25T19:00:00.000Z',
          location: 'Hotel Plaza',
          price: 800,
          status: 'active',
          visibility: 'public',
          rating: { average: 4.4, count: 67 },
          capacity: 200,
          attendees: 156
        }
      ];

      // Simular eventos trending
      const mockTrendingEvents = [
        {
          id: 4,
          title: 'Festival de Música Electrónica',
          description: 'La mejor música electrónica en un ambiente único.',
          image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=600&fit=crop',
          organizer: 'Music Events',
          date: '2024-04-01T22:00:00.000Z',
          location: 'Estadio Principal',
          price: 3000,
          status: 'active',
          visibility: 'public',
          rating: { average: 4.9, count: 234 },
          capacity: 1000,
          attendees: 789
        },
        {
          id: 5,
          title: 'Seminario de Marketing Digital',
          description: 'Estrategias actuales de marketing digital para empresas.',
          image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop',
          organizer: 'Marketing Pro',
          date: '2024-04-05T10:00:00.000Z',
          location: 'Centro de Negocios',
          price: 1500,
          status: 'active',
          visibility: 'public',
          rating: { average: 4.7, count: 123 },
          capacity: 100,
          attendees: 67
        }
      ];

      setFeaturedEvents(mockFeaturedEvents);
      setTrendingEvents(mockTrendingEvents);
      setLoading(false);
    };

    loadData();
  }, []);

  const handleFavorite = (eventId) => {
    console.log('Toggle favorite for event:', eventId);
  };

  const handleShare = (eventId) => {
    console.log('Share event:', eventId);
  };

  const handleAttend = (eventId) => {
    console.log('Attend event:', eventId);
  };

  const StatCard = ({ icon, title, value, color, subtitle }) => (
    <Card
      sx={{
        background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
        borderRadius: 3,
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        border: '1px solid rgba(255,255,255,0.2)',
        backdropFilter: 'blur(10px)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 16px 48px rgba(0,0,0,0.15)'
        }
      }}
    >
      <CardContent sx={{ p: 3, textAlign: 'center' }}>
        <Avatar
          sx={{
            width: 60,
            height: 60,
            mx: 'auto',
            mb: 2,
            background: `linear-gradient(45deg, ${color} 0%, ${color}dd 100%)`,
            boxShadow: `0 8px 24px ${color}40`
          }}
        >
          {icon}
        </Avatar>
        <Typography variant="h4" sx={{ fontWeight: 700, color: color, mb: 1 }}>
          {value}
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.grey[800], mb: 0.5 }}>
          {title}
        </Typography>
        <Typography variant="body2" sx={{ color: theme.palette.grey[600] }}>
          {subtitle}
        </Typography>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      {/* Hero Section */}
      <Box
        sx={{
          position: 'relative',
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.9) 0%, rgba(118, 75, 162, 0.9) 100%)',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url(https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1920&h=1080&fit=crop)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.3,
            zIndex: 0
          }
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, py: 8 }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography
                variant={isMobile ? 'h3' : 'h2'}
                sx={{
                  fontWeight: 800,
                  color: 'white',
                  mb: 3,
                  textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                  background: 'linear-gradient(45deg, #fff, #e3f2fd)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                Descubre Eventos
                <br />
                <Box component="span" sx={{ color: '#ffd700' }}>
                  Increíbles
                </Box>
              </Typography>
              
              <Typography
                variant="h6"
                sx={{
                  color: 'rgba(255,255,255,0.9)',
                  mb: 4,
                  lineHeight: 1.6,
                  fontWeight: 400
                }}
              >
                Conecta con personas, aprende nuevas habilidades y vive experiencias únicas.
                Encuentra el evento perfecto para ti.
              </Typography>

              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<SearchIcon />}
                  sx={{
                    background: 'linear-gradient(45deg, #ff6b6b 0%, #ee5a24 100%)',
                    borderRadius: 3,
                    px: 4,
                    py: 1.5,
                    fontWeight: 600,
                    fontSize: '1.1rem',
                    textTransform: 'none',
                    boxShadow: '0 8px 24px rgba(255, 107, 107, 0.4)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #ff5252 0%, #e74c3c 100%)',
                      boxShadow: '0 12px 32px rgba(255, 107, 107, 0.6)',
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  Explorar Eventos
                </Button>
                
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<AddIcon />}
                  sx={{
                    borderColor: 'rgba(255,255,255,0.5)',
                    color: 'white',
                    borderRadius: 3,
                    px: 4,
                    py: 1.5,
                    fontWeight: 600,
                    fontSize: '1.1rem',
                    textTransform: 'none',
                    backdropFilter: 'blur(10px)',
                    '&:hover': {
                      borderColor: 'white',
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  Crear Evento
                </Button>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: -20,
                    left: -20,
                    right: -20,
                    bottom: -20,
                    background: 'linear-gradient(45deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
                    borderRadius: 4,
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    zIndex: 0
                  }
                }}
              >
                <Paper
                  sx={{
                    p: 4,
                    background: 'rgba(255,255,255,0.95)',
                    borderRadius: 3,
                    backdropFilter: 'blur(10px)',
                    position: 'relative',
                    zIndex: 1,
                    boxShadow: '0 16px 48px rgba(0,0,0,0.2)'
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, textAlign: 'center' }}>
                    Estadísticas de la Plataforma
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                          1,250+
                        </Typography>
                        <Typography variant="body2" sx={{ color: theme.palette.grey[600] }}>
                          Eventos
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.secondary.main }}>
                          15,000+
                        </Typography>
                        <Typography variant="body2" sx={{ color: theme.palette.grey[600] }}>
                          Usuarios
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.success.main }}>
                          98%
                        </Typography>
                        <Typography variant="body2" sx={{ color: theme.palette.grey[600] }}>
                          Satisfacción
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.warning.main }}>
                          24/7
                        </Typography>
                        <Typography variant="body2" sx={{ color: theme.palette.grey[600] }}>
                          Disponible
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Contenido principal */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        {/* Eventos Destacados */}
        <Box sx={{ mb: 8 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: 'white',
                textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
              }}
            >
              Eventos Destacados
            </Typography>
            <Button
              variant="outlined"
              endIcon={<FilterIcon />}
              sx={{
                borderColor: 'rgba(255,255,255,0.3)',
                color: 'white',
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255,255,255,0.1)'
                }
              }}
            >
              Filtrar
            </Button>
          </Box>

          <Grid container spacing={3}>
            {featuredEvents.map((event) => (
              <Grid item xs={12} sm={6} lg={4} key={event.id}>
                <ModernCard
                  title={event.title}
                  description={event.description}
                  image={event.image}
                  organizer={event.user?.name || event.organizer || 'MainEvents'}
                  date={event.date}
                  location={event.location}
                  price={event.price}
                  status={event.status}
                  visibility={event.visibility}
                  rating={event.rating}
                  capacity={event.capacity}
                  attendees={event.attendees}
                  isFavorite={false}
                  onFavorite={() => handleFavorite(event.id)}
                  onShare={() => handleShare(event.id)}
                  onAttend={() => handleAttend(event.id)}
                />
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Eventos Trending */}
        <Box sx={{ mb: 8 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 4 }}>
            <TrendingIcon sx={{ color: '#ff6b6b', fontSize: '2rem' }} />
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: 'white',
                textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
              }}
            >
              Trending Ahora
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {trendingEvents.map((event) => (
              <Grid item xs={12} sm={6} lg={4} key={event.id}>
                <ModernCard
                  title={event.title}
                  description={event.description}
                  image={event.image}
                  organizer={event.user?.name || event.organizer || 'MainEvents'}
                  date={event.date}
                  location={event.location}
                  price={event.price}
                  status={event.status}
                  visibility={event.visibility}
                  rating={event.rating}
                  capacity={event.capacity}
                  attendees={event.attendees}
                  isFavorite={false}
                  onFavorite={() => handleFavorite(event.id)}
                  onShare={() => handleShare(event.id)}
                  onAttend={() => handleAttend(event.id)}
                />
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Estadísticas */}
        <Box sx={{ mb: 8 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: 'white',
              textAlign: 'center',
              mb: 4,
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
            }}
          >
            Números que Hablan
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                icon={<EventIcon />}
                title="Eventos"
                value="1,250+"
                color={theme.palette.primary.main}
                subtitle="Este mes"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                icon={<PeopleIcon />}
                title="Usuarios"
                value="15,000+"
                color={theme.palette.secondary.main}
                subtitle="Registrados"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                icon={<StarIcon />}
                title="Calificación"
                value="4.8"
                color={theme.palette.warning.main}
                subtitle="Promedio"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                icon={<TrendingIcon />}
                title="Crecimiento"
                value="+25%"
                color={theme.palette.success.main}
                subtitle="Este año"
              />
            </Grid>
          </Grid>
        </Box>
      </Container>

      {/* Floating Action Button para crear evento */}
      <Fab
        color="primary"
        sx={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          background: 'linear-gradient(45deg, #ff6b6b 0%, #ee5a24 100%)',
          '&:hover': {
            background: 'linear-gradient(45deg, #ff5252 0%, #e74c3c 100%)',
            transform: 'scale(1.1)'
          },
          boxShadow: '0 8px 24px rgba(255, 107, 107, 0.4)'
        }}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
};

export default ModernHome;
