import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Fab,
  useTheme,
  useMediaQuery,
  Fade,
  Slide,
  Grow,
  Zoom,
  Paper,
  InputAdornment,
  Divider,
  Avatar,
  Rating,
  Tooltip,
  Alert,
  CircularProgress,
  Slider,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  ViewModule as ViewModuleIcon,
  ViewList as ViewListIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Share as ShareIcon,
  Add as AddIcon,
  Event as EventIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  TrendingUp as TrendingIcon,
  Star as StarIcon,
  // Nuevos iconos para filtros mejorados
  MusicNote as MusicNoteIcon,
  Sports as SportsIcon,
  Palette as PaletteIcon,
  Computer as ComputerIcon,
  Business as BusinessIcon,
  School as SchoolIcon,
  CalendarToday as CalendarTodayIcon,
  Today as TodayIcon,
  Schedule as TomorrowIcon,
  DateRange as DateRangeIcon,
  CalendarMonth as CalendarMonthIcon,
  EventAvailable as NextMonthIcon,
  MoneyOff as FreeIcon,
  TrendingDown as LowPriceIcon,
  TrendingFlat as MediumPriceIcon,
  TrendingUp as HighPriceIcon,
  SortByAlpha as SortByAlphaIcon,
  AttachMoney as AttachMoneyIcon,
  KeyboardArrowDown as ArrowDownIcon,
  KeyboardArrowUp as ArrowUpIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useEvents } from '../hooks/useEvents';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/UnifiedLanguageContext';

// Componente de filtros mejorado
const FilterSection = ({ filters, onFilterChange, onClearFilters }) => {
  const theme = useTheme();
  const { t } = useLanguage();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 1000]);

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.type) count++;
    if (filters.date) count++;
    if (filters.price) count++;
    if (filters.location) count++;
    if (filters.minRating) count++;
    if (filters.availability) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 4,
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        }}
      >
        {/* Header con contador de filtros */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <FilterIcon sx={{ color: theme.palette.primary.main }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {t('events.filters.title')}
            </Typography>
            {activeFiltersCount > 0 && (
              <Chip
                label={activeFiltersCount}
                color="primary"
                size="small"
                sx={{ fontWeight: 600 }}
              />
            )}
          </Box>
          <Button
            variant="outlined"
            onClick={() => setShowAdvanced(!showAdvanced)}
            endIcon={showAdvanced ? <ArrowUpIcon /> : <ArrowDownIcon />}
            sx={{ borderRadius: 3 }}
          >
            {showAdvanced ? t('events.filters.hideAdvanced') : t('events.filters.showAdvanced')}
          </Button>
        </Box>

        {/* Filtros básicos */}
        <Grid container spacing={3}>
          {/* Búsqueda */}
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder={t('events.filters.searchingFor')}
              value={filters.search}
              onChange={(e) => onFilterChange('search', e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: theme.palette.primary.main }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  '&.Mui-focused': {
                    boxShadow: `0 0 0 2px ${theme.palette.primary.main}20`,
                  },
                },
              }}
            />
          </Grid>

          {/* Categoría */}
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>{t('events.filters.category')}</InputLabel>
              <Select
                value={filters.type}
                onChange={(e) => onFilterChange('type', e.target.value)}
                label={t('events.filters.category')}
                sx={{ borderRadius: 3 }}
              >
                <MenuItem value="">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EventIcon sx={{ color: theme.palette.text.secondary }} />
                    {t('events.filters.allCategories')}
                  </Box>
                </MenuItem>
                <MenuItem value="music">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <MusicNoteIcon sx={{ color: theme.palette.primary.main }} />
                    {t('events.categories.music')}
                  </Box>
                </MenuItem>
                <MenuItem value="sports">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SportsIcon sx={{ color: theme.palette.success.main }} />
                    {t('events.categories.sports')}
                  </Box>
                </MenuItem>
                <MenuItem value="art">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PaletteIcon sx={{ color: theme.palette.warning.main }} />
                    {t('events.categories.art')}
                  </Box>
                </MenuItem>
                <MenuItem value="technology">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ComputerIcon sx={{ color: theme.palette.info.main }} />
                    {t('events.categories.technology')}
                  </Box>
                </MenuItem>
                <MenuItem value="business">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BusinessIcon sx={{ color: theme.palette.secondary.main }} />
                    {t('events.categories.business')}
                  </Box>
                </MenuItem>
                <MenuItem value="education">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SchoolIcon sx={{ color: theme.palette.error.main }} />
                    {t('events.categories.education')}
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Fecha */}
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>{t('events.filters.date')}</InputLabel>
              <Select
                value={filters.date}
                onChange={(e) => onFilterChange('date', e.target.value)}
                label={t('events.filters.date')}
                sx={{ borderRadius: 3 }}
              >
                <MenuItem value="">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarTodayIcon sx={{ color: theme.palette.text.secondary }} />
                    {t('events.filters.anyDate')}
                  </Box>
                </MenuItem>
                <MenuItem value="today">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TodayIcon sx={{ color: theme.palette.primary.main }} />
                    {t('events.filters.today')}
                  </Box>
                </MenuItem>
                <MenuItem value="tomorrow">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TomorrowIcon sx={{ color: theme.palette.secondary.main }} />
                    {t('events.filters.tomorrow')}
                  </Box>
                </MenuItem>
                <MenuItem value="week">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <DateRangeIcon sx={{ color: theme.palette.success.main }} />
                    {t('events.filters.thisWeek')}
                  </Box>
                </MenuItem>
                <MenuItem value="month">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarMonthIcon sx={{ color: theme.palette.info.main }} />
                    {t('events.filters.thisMonth')}
                  </Box>
                </MenuItem>
                <MenuItem value="nextMonth">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <NextMonthIcon sx={{ color: theme.palette.warning.main }} />
                    {t('events.filters.nextMonth')}
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Precio */}
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>{t('events.filters.price')}</InputLabel>
              <Select
                value={filters.price}
                onChange={(e) => onFilterChange('price', e.target.value)}
                label={t('events.filters.price')}
                sx={{ borderRadius: 3 }}
              >
                <MenuItem value="">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AttachMoneyIcon sx={{ color: theme.palette.text.secondary }} />
                    {t('events.filters.anyPrice')}
                  </Box>
                </MenuItem>
                <MenuItem value="free">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FreeIcon sx={{ color: theme.palette.success.main }} />
                    {t('events.filters.free')}
                  </Box>
                </MenuItem>
                <MenuItem value="low">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LowPriceIcon sx={{ color: theme.palette.info.main }} />
                    {t('events.filters.low')}
                  </Box>
                </MenuItem>
                <MenuItem value="medium">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <MediumPriceIcon sx={{ color: theme.palette.warning.main }} />
                    {t('events.filters.medium')}
                  </Box>
                </MenuItem>
                <MenuItem value="high">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <HighPriceIcon sx={{ color: theme.palette.error.main }} />
                    {t('events.filters.high')}
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Ordenar */}
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>{t('events.filters.sortBy')}</InputLabel>
              <Select
                value={filters.sort}
                onChange={(e) => onFilterChange('sort', e.target.value)}
                label={t('events.filters.sortBy')}
                sx={{ borderRadius: 3 }}
              >
                <MenuItem value="date">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarIcon sx={{ color: theme.palette.primary.main }} />
                    {t('events.filters.date')}
                  </Box>
                </MenuItem>
                <MenuItem value="price">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AttachMoneyIcon sx={{ color: theme.palette.success.main }} />
                    {t('events.filters.price')}
                  </Box>
                </MenuItem>
                <MenuItem value="name">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SortByAlphaIcon sx={{ color: theme.palette.info.main }} />
                    {t('events.filters.name')}
                  </Box>
                </MenuItem>
                <MenuItem value="popularity">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TrendingIcon sx={{ color: theme.palette.warning.main }} />
                    {t('events.filters.popularity')}
                  </Box>
                </MenuItem>
                <MenuItem value="rating">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <StarIcon sx={{ color: theme.palette.error.main }} />
                    {t('events.filters.rating')}
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* Filtros avanzados */}
        {showAdvanced && (
          <Fade in={showAdvanced}>
            <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                {t('events.filters.advancedFilters')}
              </Typography>
              <Grid container spacing={3}>
                {/* Ubicación */}
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label={t('events.filters.location')}
                    placeholder={t('events.filters.enterLocation')}
                    value={filters.location || ''}
                    onChange={(e) => onFilterChange('location', e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocationIcon />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ borderRadius: 3 }}
                  />
                </Grid>

                {/* Calificación mínima */}
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>{t('events.filters.minRating')}</InputLabel>
                    <Select
                      value={filters.minRating || ''}
                      onChange={(e) => onFilterChange('minRating', e.target.value)}
                      label={t('events.filters.minRating')}
                      sx={{ borderRadius: 3 }}
                    >
                      <MenuItem value="">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <StarIcon sx={{ color: theme.palette.text.secondary }} />
                          {t('events.filters.anyRating')}
                        </Box>
                      </MenuItem>
                      <MenuItem value="3">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Rating value={3} readOnly size="small" />
                          <Typography variant="body2">3+ {t('events.filters.stars')}</Typography>
                        </Box>
                      </MenuItem>
                      <MenuItem value="4">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Rating value={4} readOnly size="small" />
                          <Typography variant="body2">4+ {t('events.filters.stars')}</Typography>
                        </Box>
                      </MenuItem>
                      <MenuItem value="5">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Rating value={5} readOnly size="small" />
                          <Typography variant="body2">5 {t('events.filters.stars')}</Typography>
                        </Box>
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {/* Disponibilidad */}
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>{t('events.filters.availability')}</InputLabel>
                    <Select
                      value={filters.availability || ''}
                      onChange={(e) => onFilterChange('availability', e.target.value)}
                      label={t('events.filters.availability')}
                      sx={{ borderRadius: 3 }}
                    >
                      <MenuItem value="">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <EventIcon sx={{ color: theme.palette.text.secondary }} />
                          {t('events.filters.anyAvailability')}
                        </Box>
                      </MenuItem>
                      <MenuItem value="available">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip label={t('events.filters.available')} color="success" size="small" />
                        </Box>
                      </MenuItem>
                      <MenuItem value="limited">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip label={t('events.filters.limited')} color="warning" size="small" />
                        </Box>
                      </MenuItem>
                      <MenuItem value="soldOut">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip label={t('events.filters.soldOut')} color="error" size="small" />
                        </Box>
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {/* Rango de precios */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                    {t('events.filters.priceRange')}: ${priceRange[0]} - ${priceRange[1]}
                  </Typography>
                  <Slider
                    value={priceRange}
                    onChange={(e, newValue) => setPriceRange(newValue)}
                    valueLabelDisplay="auto"
                    min={0}
                    max={1000}
                    step={10}
                    sx={{
                      color: theme.palette.primary.main,
                      '& .MuiSlider-thumb': {
                        '&:hover, &.Mui-focusVisible': {
                          boxShadow: `0 0 0 8px ${theme.palette.primary.main}20`,
                        },
                      },
                    }}
                  />
                </Grid>
              </Grid>
            </Box>
          </Fade>
        )}

        {/* Botones de acción */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3 }}>
          <Button
            variant="outlined"
            onClick={onClearFilters}
            disabled={activeFiltersCount === 0}
            sx={{ borderRadius: 3 }}
          >
            {t('events.filters.clearAll')} {activeFiltersCount > 0 && `(${activeFiltersCount})`}
          </Button>
          
          <Button
            variant="contained"
            onClick={() => setShowAdvanced(!showAdvanced)}
            sx={{
              borderRadius: 3,
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5b5ee8 0%, #7c3aed 100%)',
              },
            }}
          >
            {t('events.filters.applyFilters')}
          </Button>
        </Box>
      </Paper>
    </motion.div>
  );
};

// Componente de tarjeta de evento mejorado
const EventCard = ({ event, index, onFavoriteToggle, onShare, favorites }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const isFavorite = favorites.has(event._id);

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 4,
          overflow: 'hidden',
          boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 15px 35px rgba(0,0,0,0.15)',
          },
        }}
      >
        {/* Imagen del evento */}
        <Box
          sx={{
            position: 'relative',
            height: 200,
            overflow: 'hidden',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          }}
        >
          {event.image ? (
            <Box
              component="img"
              src={event.image}
              alt={event.name}
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center',
              }}
            />
          ) : (
            <Box
              sx={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '4rem',
                color: 'white',
                opacity: 0.8,
              }}
            >
              📅
            </Box>
          )}
          
          {/* Botones de acción */}
          <Box
            sx={{
              position: 'absolute',
              top: 12,
              right: 12,
              display: 'flex',
              gap: 1,
            }}
          >
            <IconButton
              onClick={() => onFavoriteToggle(event._id)}
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 1)',
                },
              }}
            >
              {isFavorite ? (
                <FavoriteIcon sx={{ color: theme.palette.error.main }} />
              ) : (
                <FavoriteBorderIcon sx={{ color: theme.palette.text.secondary }} />
              )}
            </IconButton>
            <IconButton
              onClick={() => onShare(event)}
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 1)',
                },
              }}
            >
              <ShareIcon sx={{ color: theme.palette.text.secondary }} />
            </IconButton>
          </Box>

          {/* Badge de precio */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 12,
              left: 12,
            }}
          >
            <Chip
              label={event.price ? `$${event.price}` : t('events.free')}
              color={event.price ? 'primary' : 'success'}
              sx={{
                fontWeight: 600,
                backgroundColor: event.price ? theme.palette.primary.main : theme.palette.success.main,
                color: 'white',
              }}
            />
          </Box>
        </Box>

        {/* Contenido de la tarjeta */}
        <CardContent sx={{ flexGrow: 1, p: 3 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              mb: 1,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {event.name}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 2,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {event.description}
          </Typography>

          {/* Información del evento */}
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <LocationIcon sx={{ fontSize: 16, color: theme.palette.text.secondary, mr: 1 }} />
              <Typography variant="body2" color="text.secondary">
                {event.location}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <CalendarIcon sx={{ fontSize: 16, color: theme.palette.text.secondary, mr: 1 }} />
              <Typography variant="body2" color="text.secondary">
                {new Date(event.date).toLocaleDateString()}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <StarIcon sx={{ fontSize: 16, color: theme.palette.warning.main, mr: 1 }} />
              <Typography variant="body2" color="text.secondary">
                {typeof event.rating === 'object' ? event.rating?.average || 0 : event.rating || 0} ({event.visitas || 0} {t('events.views')})
              </Typography>
            </Box>
          </Box>

          {/* Botón de acción */}
          <Button
            fullWidth
            variant="contained"
            onClick={() => navigate(`/events/${event._id}`)}
            sx={{
              borderRadius: 3,
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5b5ee8 0%, #7c3aed 100%)',
                transform: 'translateY(-2px)',
              },
            }}
          >
            {t('events.viewDetails')}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const Events = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  
  const { data: eventsData = { events: [] }, isLoading, error } = useEvents();
  const events = eventsData.events || [];
  
  // Eliminar duplicados basándose en el _id
  const uniqueEvents = events.filter((event, index, self) => 
    index === self.findIndex(e => e._id === event._id)
  );
  
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    date: '',
    price: '',
    sort: 'date',
  });
  
  const [favorites, setFavorites] = useState(new Set());
  const [viewMode, setViewMode] = useState('grid');

  // Filtrar eventos
  const filteredEvents = uniqueEvents.filter(event => {
    if (filters.search && !event.name.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    if (filters.type && event.type !== filters.type) {
      return false;
    }
    if (filters.price) {
      const price = event.price || 0;
      switch (filters.price) {
        case 'free':
          if (price > 0) return false;
          break;
        case 'low':
          if (price >= 50) return false;
          break;
        case 'medium':
          if (price < 50 || price > 200) return false;
          break;
        case 'high':
          if (price <= 200) return false;
          break;
      }
    }
    return true;
  });

  // Ordenar eventos
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    switch (filters.sort) {
      case 'price':
        return (a.price || 0) - (b.price || 0);
      case 'name':
        return a.name.localeCompare(b.name);
      case 'popularity':
        return (b.visitas || 0) - (a.visitas || 0);
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      default:
        return new Date(a.date) - new Date(b.date);
    }
  });

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      type: '',
      date: '',
      price: '',
      sort: 'date',
    });
  };

  const handleFavoriteToggle = (eventId) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(eventId)) {
        newFavorites.delete(eventId);
      } else {
        newFavorites.add(eventId);
      }
      return newFavorites;
    });
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
    }
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
          <CircularProgress size={60} />
        </Box>
        <Typography variant="h6" textAlign="center" color="text.secondary">
          {t('events.loading')}
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {t('messages.error.generic')}: {error.message || t('messages.error.network')}
        </Alert>
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Button
            variant="contained"
            onClick={() => window.location.reload()}
            sx={{
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              borderRadius: 3,
              px: 4,
              py: 1.5,
              '&:hover': {
                background: 'linear-gradient(135deg, #5b5ee8 0%, #7c3aed 100%)',
                transform: 'translateY(-2px)',
              },
            }}
          >
            {t('common.retry')}
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 700,
              mb: 2,
              background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {t('events.title')}
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
            {t('events.subtitle')}
          </Typography>
        </Box>
      </motion.div>

      {/* Filtros */}
      <FilterSection
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
      />

      {/* Controles de vista */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {sortedEvents.length} {t('events.title').toLowerCase()}{sortedEvents.length !== 1 ? 's' : ''} {t('events.found')}
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title={t('events.gridView')}>
            <IconButton
              onClick={() => setViewMode('grid')}
              color={viewMode === 'grid' ? 'primary' : 'default'}
            >
              <ViewModuleIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('events.listView')}>
            <IconButton
              onClick={() => setViewMode('list')}
              color={viewMode === 'list' ? 'primary' : 'default'}
            >
              <ViewListIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Lista de eventos */}
      {sortedEvents.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Paper sx={{ p: 6, textAlign: 'center' }}>
            <EventIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
              {t('events.noEvents')}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {t('events.noEventsDescription')}
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/create-event')}
              sx={{ borderRadius: 3 }}
            >
              {t('events.createFirst')}
            </Button>
          </Paper>
        </motion.div>
      ) : (
        <Grid container spacing={3}>
          <AnimatePresence>
            {sortedEvents.map((event, index) => (
              <Grid item xs={12} sm={6} md={4} key={event._id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <EventCard
                    event={event}
                    index={index}
                    onFavoriteToggle={handleFavoriteToggle}
                    onShare={handleShare}
                    favorites={favorites}
                  />
                </motion.div>
              </Grid>
            ))}
          </AnimatePresence>
        </Grid>
      )}

      {/* Botón flotante para crear evento */}
      {user && (
        <Fab
          color="primary"
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
            boxShadow: '0 8px 25px rgba(99, 102, 241, 0.3)',
            '&:hover': {
              background: 'linear-gradient(135deg, #5b5ee8 0%, #db2777 100%)',
              transform: 'scale(1.1)',
            },
          }}
        >
          <AddIcon />
        </Fab>
      )}
    </Container>
  );
};

export default Events;