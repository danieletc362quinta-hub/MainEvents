import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  TextField,
  InputAdornment,
  Button,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
  useMediaQuery,
  Tabs,
  Tab,
  Pagination,
  Fab,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Add as AddIcon,
  ViewModule as GridIcon,
  ViewList as ListIcon,
  Sort as SortIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import ModernEventCard from '../components/ui/ModernEventCard';
import { useLanguage } from '../contexts/UnifiedLanguageContext';
import { useEvents } from '../hooks/useEvents';

const ModernEvents = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  // Usar el hook real para obtener eventos
  const { data: eventsData = { events: [] }, isLoading, error } = useEvents();
  const events = eventsData.events || [];
  
  // Eliminar duplicados basándose en el _id
  const uniqueEvents = events.filter((event, index, self) => 
    index === self.findIndex(e => e._id === event._id)
  );
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [viewMode, setViewMode] = useState('grid');
  const [activeTab, setActiveTab] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const categories = [
    'Tecnología',
    'Negocios',
    'Educación',
    'Entretenimiento',
    'Deportes',
    'Arte y Cultura',
    'Salud y Bienestar',
    'Networking'
  ];

  const locations = [
    'Buenos Aires',
    'Córdoba',
    'Rosario',
    'Mendoza',
    'La Plata',
    'Tucumán',
    'Mar del Plata',
    'Salta'
  ];

  const priceRanges = [
    { label: 'Gratis', value: 'free' },
    { label: 'Hasta $1,000', value: '0-1000' },
    { label: '$1,000 - $5,000', value: '1000-5000' },
    { label: '$5,000 - $10,000', value: '5000-10000' },
    { label: 'Más de $10,000', value: '10000+' }
  ];

  const sortOptions = [
    { label: 'Fecha', value: 'date' },
    { label: 'Precio', value: 'price' },
    { label: 'Popularidad', value: 'popularity' },
    { label: 'Calificación', value: 'rating' },
    { label: 'Nombre', value: 'name' }
  ];

  // Filtrar eventos localmente
  const filteredEvents = uniqueEvents.filter(event => {
    if (searchTerm && !event.name?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    if (selectedCategory && event.category !== selectedCategory) {
      return false;
    }
    if (selectedLocation && event.location !== selectedLocation) {
      return false;
    }
    if (priceRange) {
      const price = event.price || 0;
      switch (priceRange) {
        case 'free':
          if (price > 0) return false;
          break;
        case '0-1000':
          if (price > 1000) return false;
          break;
        case '1000-5000':
          if (price < 1000 || price > 5000) return false;
          break;
        case '5000-10000':
          if (price < 5000 || price > 10000) return false;
          break;
        case '10000+':
          if (price <= 10000) return false;
          break;
      }
    }
    return true;
  });

  // Ordenar eventos
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(a.date) - new Date(b.date);
      case 'price':
        return (a.price || 0) - (b.price || 0);
      case 'popularity':
        return (b.concurrentes || 0) - (a.concurrentes || 0);
      case 'rating':
        return (b.rating?.average || 0) - (a.rating?.average || 0);
      case 'name':
        return (a.name || '').localeCompare(b.name || '');
      default:
        return 0;
    }
  });

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
  };

  const handleLocationChange = (event) => {
    setSelectedLocation(event.target.value);
  };

  const handlePriceRangeChange = (event) => {
    setPriceRange(event.target.value);
  };

  const handleSortChange = (event) => {
    setSortBy(event.target.value);
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handlePageChange = (event, page) => {
    setCurrentPage(page);
  };

  const handleCreateEvent = () => {
    navigate('/create-event');
  };

  const handleEventClick = (eventId) => {
    navigate(`/events/${eventId}`);
  };

  if (isLoading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '50vh' 
      }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          Error al cargar los eventos: {error.message}
        </Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2
            }}
          >
            {t('events.title', 'Eventos')}
          </Typography>
          <Typography variant="h6" sx={{ color: 'white', opacity: 0.9 }}>
            {t('events.subtitle', 'Descubre y participa en los mejores eventos')}
          </Typography>
        </Box>

        {/* Filtros */}
        <Paper
          sx={{
            p: 3,
            mb: 4,
            borderRadius: 3,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 16px 48px rgba(0, 0, 0, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}
        >
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder={t('events.search', 'Buscar eventos...')}
                value={searchTerm}
                onChange={handleSearch}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: theme.palette.grey[500] }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: 'white'
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Categoría</InputLabel>
                <Select
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                  sx={{ borderRadius: 2, backgroundColor: 'white' }}
                >
                  <MenuItem value="">Todas</MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Ubicación</InputLabel>
                <Select
                  value={selectedLocation}
                  onChange={handleLocationChange}
                  sx={{ borderRadius: 2, backgroundColor: 'white' }}
                >
                  <MenuItem value="">Todas</MenuItem>
                  {locations.map((location) => (
                    <MenuItem key={location} value={location}>
                      {location}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Precio</InputLabel>
                <Select
                  value={priceRange}
                  onChange={handlePriceRangeChange}
                  sx={{ borderRadius: 2, backgroundColor: 'white' }}
                >
                  <MenuItem value="">Todos</MenuItem>
                  {priceRanges.map((range) => (
                    <MenuItem key={range.value} value={range.value}>
                      {range.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Ordenar</InputLabel>
                <Select
                  value={sortBy}
                  onChange={handleSortChange}
                  sx={{ borderRadius: 2, backgroundColor: 'white' }}
                >
                  {sortOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        {/* Eventos */}
        <Paper
          sx={{
            p: 3,
            borderRadius: 3,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 16px 48px rgba(0, 0, 0, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}
        >
          {sortedEvents.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h5" sx={{ mb: 2, color: theme.palette.grey[600] }}>
                {t('events.noEvents', 'No se encontraron eventos')}
              </Typography>
              <Typography variant="body1" sx={{ color: theme.palette.grey[500] }}>
                {t('events.noEventsDescription', 'Intenta ajustar los filtros o crear un nuevo evento')}
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {sortedEvents.map((event) => (
                <Grid item xs={12} sm={6} md={4} key={event._id}>
                  <ModernEventCard
                    event={{
                      id: event._id,
                      title: event.name,
                      description: event.description,
                      image: event.image,
                      organizer: event.user?.name || event.organizer || 'MainEvents',
                      date: event.date,
                      location: event.location,
                      price: event.price,
                      status: event.estado,
                      visibility: event.visibility,
                      rating: event.rating,
                      capacity: event.capacidad,
                      attendees: event.concurrentes,
                      category: event.category
                    }}
                    onClick={() => handleEventClick(event._id)}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </Paper>

        {/* FAB para crear evento */}
        <Fab
          color="primary"
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
            '&:hover': {
              background: 'linear-gradient(45deg, #5a6fd8 0%, #6a4190 100%)',
              transform: 'scale(1.1)'
            }
          }}
          onClick={handleCreateEvent}
        >
          <AddIcon />
        </Fab>
      </Container>
    </Box>
  );
};

export default ModernEvents;
