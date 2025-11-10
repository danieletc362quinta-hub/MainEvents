import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Container,
  Paper,
  Chip,
  Stack,
  useTheme,
  useMediaQuery,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Skeleton,
  Alert,
  Snackbar,
  Fab,
  Zoom,
  Fade,
  Slide,
  Grow,
  CardActionArea,
  Rating,
  Avatar,
  Divider,
  LinearProgress,
  CircularProgress,
  Badge,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Event as EventIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  ArrowForward as ArrowForwardIcon,
  Star as StarIcon,
  People as PeopleIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Share as ShareIcon,
  TrendingUp as TrendingUpIcon,
  Visibility as VisibilityIcon,
  AttachMoney as MoneyIcon,
  Speed as SpeedIcon,
  EmojiEvents as TrophyIcon,
  Group as GroupIcon,
  Schedule as ScheduleIcon,
  KeyboardArrowUp as ArrowUpIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { formatPrice, formatDate } from '../utils/formatters';

// Componente de tarjeta de evento mejorado
const EventCard = ({ event, index }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={{ y: -10 }}
    >
      <Card
        sx={{
          height: '100%',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: 4,
          overflow: 'hidden',
          position: 'relative',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: 'pointer',
          '&:hover': {
            transform: 'translateY(-8px) scale(1.02)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            '& .event-image': {
              transform: 'scale(1.1)',
            },
            '& .event-overlay': {
              opacity: 1,
            },
          },
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => navigate(`/events/${event._id}`)}
      >
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
            image={event.image || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=200&fit=crop'}
            alt={event.name}
            className="event-image"
            sx={{
              transition: 'transform 0.3s ease',
              objectFit: 'contain',
              objectPosition: 'center',
              maxWidth: '100%',
              maxHeight: '100%',
              width: 'auto',
              height: 'auto',
            }}
          />
          
          {/* Overlay con gradiente */}
          <Box
            className="event-overlay"
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.8) 0%, rgba(236, 72, 153, 0.8) 100%)',
              opacity: 0,
              transition: 'opacity 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Button
              variant="contained"
              sx={{
                background: 'rgba(255,255,255,0.9)',
                color: theme.palette.primary.main,
                fontWeight: 600,
                '&:hover': {
                  background: 'rgba(255,255,255,1)',
                },
              }}
            >
              Ver Detalles
            </Button>
          </Box>

          {/* Badge de estado */}
          <Chip
            label={event.estado === 'activo' ? 'Activo' : 'Próximamente'}
            color={event.estado === 'activo' ? 'success' : 'warning'}
            size="small"
            sx={{
              position: 'absolute',
              top: 12,
              right: 12,
              fontWeight: 600,
              backdropFilter: 'blur(10px)',
            }}
          />

          {/* Precio */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 12,
              left: 12,
              background: 'rgba(0,0,0,0.8)',
              color: 'white',
              padding: '4px 12px',
              borderRadius: 2,
              fontWeight: 600,
              backdropFilter: 'blur(10px)',
            }}
          >
            {formatPrice(event.price || 0)}
          </Box>
        </Box>

        <CardContent sx={{ p: 3 }}>
          {/* Título del evento */}
          <Typography
            variant="h6"
            component="h3"
            sx={{
              fontWeight: 700,
              mb: 1,
              color: theme.palette.text.primary,
              lineHeight: 1.3,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {event.name}
          </Typography>

          {/* Información del evento */}
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <CalendarIcon sx={{ fontSize: 16, color: theme.palette.primary.main, mr: 1 }} />
              <Typography variant="body2" color="text.secondary">
                {formatDate(event.date)}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <LocationIcon sx={{ fontSize: 16, color: theme.palette.primary.main, mr: 1 }} />
              <Typography variant="body2" color="text.secondary">
                {event.location}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <PeopleIcon sx={{ fontSize: 16, color: theme.palette.primary.main, mr: 1 }} />
              <Typography variant="body2" color="text.secondary">
                {event.concurrentes || 0} asistentes
              </Typography>
            </Box>
          </Box>

          {/* Tipo de evento */}
          <Chip
            label={event.type}
            size="small"
            sx={{
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              color: 'white',
              fontWeight: 600,
              mb: 2,
            }}
          />

          {/* Acciones */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton size="small" sx={{ color: theme.palette.primary.main }}>
                <FavoriteIcon />
              </IconButton>
              <IconButton size="small" sx={{ color: theme.palette.primary.main }}>
                <ShareIcon />
              </IconButton>
            </Box>
            
            <Button
              variant="outlined"
              size="small"
              endIcon={<ArrowForwardIcon />}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              Ver más
            </Button>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Componente de estadísticas
const StatsCard = ({ icon, title, value, color }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.05 }}
    >
      <Card
        sx={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: 4,
          p: 3,
          textAlign: 'center',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0 15px 30px rgba(0,0,0,0.1)',
          },
        }}
      >
        <Avatar
          sx={{
            width: 60,
            height: 60,
            mx: 'auto',
            mb: 2,
            background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
            boxShadow: `0 8px 20px ${color}40`,
          }}
        >
          {icon}
        </Avatar>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: color }}>
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
          {title}
        </Typography>
      </Card>
    </motion.div>
  );
};

const Home = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  const { isAuthenticated, user } = useAuth();
  
  // Simular datos de eventos destacados
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  // Estados para funcionalidades avanzadas
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTab, setSelectedTab] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [favorites, setFavorites] = useState(new Set());

  // Cargar datos simulados
  useEffect(() => {
    const loadMockData = async () => {
      setIsLoading(true);
      try {
        // Simular eventos destacados
        const mockEvents = [
          {
            _id: '1',
            name: 'Conferencia de Tecnología 2024',
            description: 'La mayor conferencia de tecnología del año con los mejores speakers internacionales.',
            image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop',
            organizer: 'TechCorp',
            date: '2024-03-15T18:00:00.000Z',
            location: 'Centro de Convenciones',
            price: 2500,
            estado: 'activo',
            type: 'Tecnología',
            concurrentes: 342,
            capacity: 500
          },
          {
            _id: '2',
            name: 'Workshop de Diseño UX/UI',
            description: 'Aprende las mejores prácticas de diseño de interfaces de usuario.',
            image: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=800&h=600&fit=crop',
            organizer: 'Design Studio',
            date: '2024-03-20T14:00:00.000Z',
            location: 'Espacio Creativo',
            price: 1200,
            estado: 'activo',
            type: 'Educación',
            concurrentes: 23,
            capacity: 50
          },
          {
            _id: '3',
            name: 'Networking Empresarial',
            description: 'Conecta con otros profesionales y expande tu red de contactos.',
            image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&h=600&fit=crop',
            organizer: 'Business Network',
            date: '2024-03-25T19:00:00.000Z',
            location: 'Hotel Plaza',
            price: 800,
            estado: 'activo',
            type: 'Negocios',
            concurrentes: 156,
            capacity: 200
          }
        ];
        
        setFeaturedEvents(mockEvents);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading mock data:', error);
        setIsError(true);
        setIsLoading(false);
      }
    };

    loadMockData();
  }, []);

  // Logs de debug
  console.log('Home: Estado de autenticación:', isAuthenticated);
  console.log('Home: Estado de carga de eventos:', { isLoading, isError });
  console.log('Home: Datos de eventos destacados:', featuredEvents);

  // Usar los eventos directamente
  const events = featuredEvents;

  // Estadísticas simuladas
  const stats = {
    totalEvents: 1247,
    activeUsers: 8923,
    totalRevenue: 456789,
    eventsThisMonth: 89,
  };

  const eventTypes = [
    { name: 'Musical', icon: '🎵', count: 45, color: '#e91e63' },
    { name: 'Deportivo', icon: '⚽', count: 32, color: '#4caf50' },
    { name: 'Cultural', icon: '🎭', count: 28, color: '#ff9800' },
    { name: 'Educativo', icon: '📚', count: 56, color: '#2196f3' },
    { name: 'Corporativo', icon: '💼', count: 23, color: '#9c27b0' },
    { name: 'Público', icon: '🎪', count: 67, color: '#00bcd4' },
  ];

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/events');
    } else {
      navigate('/register');
    }
  };

  const handleEventClick = (eventId) => {
    navigate(`/events/${eventId}`);
  };

  const handleFavoriteToggle = (eventId) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(eventId)) {
      newFavorites.delete(eventId);
      setSnackbar({ open: true, message: 'Removido de favoritos', severity: 'info' });
    } else {
      newFavorites.add(eventId);
      setSnackbar({ open: true, message: 'Agregado a favoritos', severity: 'success' });
    }
    setFavorites(newFavorites);
  };

  const handleShare = (event) => {
    if (navigator.share) {
      navigator.share({
        title: event.name,
        text: event.description,
        url: window.location.origin + `/events/${event._id}`,
      });
    } else {
      navigator.clipboard.writeText(window.location.origin + `/events/${event._id}`);
      setSnackbar({ open: true, message: 'Enlace copiado al portapapeles', severity: 'success' });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Detectar scroll para mostrar botón de volver arriba
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Filtrar eventos basado en búsqueda y categoría
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || event.type === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'Fecha no disponible';
    try {
      const dateObj = new Date(dateString);
      if (isNaN(dateObj.getTime())) {
        return 'Fecha no válida';
      }
      return dateObj.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (error) {
      return 'Fecha no válida';
    }
  };



  return (
    <Box sx={{ minHeight: '100vh' }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: { xs: 8, md: 12 },
          px: { xs: 2, md: 4 },
          borderRadius: { xs: 0, md: 4 },
          mb: 6,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <Typography
                  variant={isMobile ? "h3" : "h2"}
                  component="h1"
                  sx={{
                    fontWeight: 'bold',
                    mb: 2,
                    textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                  }}
                >
                  Descubre Eventos
                  <br />
                  <Box component="span" sx={{ color: '#ffd700' }}>
                    Increíbles
                  </Box>
                </Typography>
                <Typography
                  variant={isMobile ? "body1" : "h6"}
                  sx={{
                    mb: 4,
                    opacity: 0.9,
                    lineHeight: 1.6,
                  }}
                >
                  Encuentra y participa en los mejores eventos de tu ciudad. 
                  Desde conciertos hasta conferencias, todo en un solo lugar.
                </Typography>
                <Stack
                  direction={isMobile ? "column" : "row"}
                  spacing={2}
                  sx={{ mb: 4 }}
                >
                  <Button
                    variant="contained"
                    size="large"
                    onClick={handleGetStarted}
                    sx={{
                      py: 1.5,
                      px: 4,
                      fontSize: '1.1rem',
                      fontWeight: 'bold',
                      borderRadius: 3,
                      background: 'linear-gradient(45deg, #ffd700, #ffed4e)',
                      color: '#333',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #ffed4e, #ffd700)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 25px rgba(255, 215, 0, 0.3)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {isAuthenticated ? 'Explorar Eventos' : 'Comenzar Ahora'}
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => navigate('/events')}
                    sx={{
                      py: 1.5,
                      px: 4,
                      fontSize: '1.1rem',
                      borderColor: 'rgba(255,255,255,0.5)',
                      color: 'white',
                      '&:hover': {
                        borderColor: 'white',
                        backgroundColor: 'rgba(255,255,255,0.1)',
                      },
                    }}
                  >
                    Ver Todos
                  </Button>
                </Stack>
              </motion.div>
            </Grid>
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: { xs: 200, md: 300 },
                  }}
                >
                  <EventIcon
                    sx={{
                      fontSize: { xs: 120, md: 200 },
                      opacity: 0.3,
                      animation: 'pulse 2s infinite',
                      '@keyframes pulse': {
                        '0%': { transform: 'scale(1)' },
                        '50%': { transform: 'scale(1.1)' },
                        '100%': { transform: 'scale(1)' },
                      },
                    }}
                  />
                </Box>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Stats Section */}
      <Container maxWidth="lg" sx={{ mb: 6 }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Grid container spacing={3}>
            {[
              { label: 'Eventos Totales', value: stats.totalEvents, icon: EventIcon, color: '#1976d2' },
              { label: 'Usuarios Activos', value: stats.activeUsers, icon: GroupIcon, color: '#4caf50' },
              { label: 'Ingresos Totales', value: formatPrice(stats.totalRevenue), icon: MoneyIcon, color: '#ff9800' },
              { label: 'Eventos Este Mes', value: stats.eventsThisMonth, icon: TrendingUpIcon, color: '#e91e63' },
            ].map((stat, index) => (
              <Grid item xs={6} md={3} key={index}>
                <Paper
                  elevation={2}
                  sx={{
                    p: 3,
                    textAlign: 'center',
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                    border: '1px solid rgba(0,0,0,0.05)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 1rem',
                      background: `linear-gradient(45deg, ${stat.color}, ${stat.color}dd)`,
                      color: 'white',
                    }}
                  >
                    <stat.icon sx={{ fontSize: 28 }} />
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, color: stat.color }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stat.label}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </motion.div>
      </Container>

      {/* Search and Filter Section */}
      <Container maxWidth="lg" sx={{ mb: 4 }}>
        <Paper
          elevation={3}
          sx={{
            p: 3,
            borderRadius: 3,
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
          }}
        >
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Buscar eventos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Categoría</InputLabel>
                <Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  label="Categoría"
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="">Todas las categorías</MenuItem>
                  {eventTypes.map((type) => (
                    <MenuItem key={type.name} value={type.name.toLowerCase()}>
                      {type.icon} {type.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<FilterIcon />}
                onClick={() => setSnackbar({ open: true, message: 'Filtros aplicados', severity: 'success' })}
                sx={{ borderRadius: 2, py: 1.5 }}
              >
                Filtrar
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Container>

      {/* Featured Events Section */}
      <Container maxWidth="lg" sx={{ mb: 6 }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between', 
          alignItems: isMobile ? 'flex-start' : 'center', 
          mb: 4,
          gap: isMobile ? 2 : 0
        }}>
          <Typography variant={isMobile ? "h4" : "h3"} component="h2" sx={{ fontWeight: 'bold' }}>
            Eventos Destacados
          </Typography>
          <Button
            endIcon={<ArrowForwardIcon />}
            onClick={() => navigate('/events')}
            sx={{ fontSize: '1.1rem' }}
          >
            Ver Todos
          </Button>
        </Box>
        
        {isLoading ? (
          <Grid container spacing={3}>
            {[1, 2, 3].map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item}>
                <Card sx={{ height: 400, borderRadius: 3 }}>
                  <Skeleton variant="rectangular" height={200} />
                  <CardContent>
                    <Skeleton variant="text" height={32} sx={{ mb: 1 }} />
                    <Skeleton variant="text" height={20} sx={{ mb: 1 }} />
                    <Skeleton variant="text" height={20} sx={{ mb: 2 }} />
                    <Skeleton variant="rectangular" height={40} />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : isError ? (
          <Alert severity="error" sx={{ borderRadius: 2 }}>
            Error al cargar los eventos. Por favor, intenta de nuevo.
          </Alert>
        ) : (
          <AnimatePresence>
            <Grid container spacing={3}>
              {filteredEvents.map((event, index) => (
                <Grid item xs={12} sm={6} md={4} key={event._id}>
                  <EventCard event={event} index={index} />
                </Grid>
              ))}
            </Grid>
          </AnimatePresence>
        )}
      </Container>

      {/* Event Types Section */}
      <Container maxWidth="lg" sx={{ mb: 6 }}>
        <Typography variant={isMobile ? "h4" : "h3"} component="h2" sx={{ 
          fontWeight: 'bold', 
          mb: 4,
          textAlign: 'center'
        }}>
          Categorías Populares
        </Typography>
        
        <Grid container spacing={3}>
          {eventTypes.map((type, index) => (
            <Grid item xs={6} sm={4} md={2} key={type.name}>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <Paper
                  elevation={2}
                  sx={{
                    p: 3,
                    textAlign: 'center',
                    borderRadius: 3,
                    cursor: 'pointer',
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                    border: '1px solid rgba(0,0,0,0.05)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                    },
                  }}
                  onClick={() => {
                    setSelectedCategory(type.name.toLowerCase());
                    setSnackbar({ open: true, message: `Filtrado por ${type.name}`, severity: 'info' });
                  }}
                >
                  <Typography variant="h2" sx={{ mb: 1 }}>
                    {type.icon}
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {type.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {type.count} eventos
                  </Typography>
                </Paper>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Floating Action Button */}
      <Zoom in={showScrollTop}>
        <Fab
          color="primary"
          size="large"
          onClick={scrollToTop}
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            zIndex: 1000,
            background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
          }}
        >
          <ArrowUpIcon />
        </Fab>
      </Zoom>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
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

export default Home; 
