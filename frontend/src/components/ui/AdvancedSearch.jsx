import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Typography,
  Divider,
  Autocomplete,
  Popper,
  useTheme,
  useMediaQuery,
  Collapse,
  Tooltip,
  Badge,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  Category as CategoryIcon,
  AttachMoney as MoneyIcon,
  People as PeopleIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Save as SaveIcon,
  History as HistoryIcon,
  TrendingUp as TrendingUpIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const AdvancedSearch = ({ onSearch, placeholder = "Buscar eventos...", fullWidth = true }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    location: '',
    dateRange: [null, null],
    priceRange: [0, 1000],
    attendees: '',
    rating: 0,
  });
  const [suggestions, setSuggestions] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [popularSearches, setPopularSearches] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const searchRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Cargar búsquedas recientes del localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Búsquedas populares simuladas
  useEffect(() => {
    setPopularSearches([
      'Conciertos',
      'Conferencias',
      'Deportes',
      'Arte',
      'Tecnología',
      'Música',
      'Educación',
    ]);
  }, []);

  // Sugerencias simuladas
  const generateSuggestions = (term) => {
    if (!term) return [];
    
    const allSuggestions = [
      'Concierto de Rock',
      'Conferencia de Tecnología',
      'Feria de Arte',
      'Partido de Fútbol',
      'Workshop de Programación',
      'Exposición de Fotografía',
      'Seminario de Marketing',
      'Festival de Música',
      'Torneo de Tenis',
      'Charla de Emprendimiento',
    ];

    return allSuggestions
      .filter(suggestion => 
        suggestion.toLowerCase().includes(term.toLowerCase())
      )
      .slice(0, 5);
  };

  // Manejar cambios en el término de búsqueda
  const handleSearchChange = (value) => {
    setSearchTerm(value);
    
    if (value.length > 2) {
      const newSuggestions = generateSuggestions(value);
      setSuggestions(newSuggestions);
    } else {
      setSuggestions([]);
    }
  };

  // Manejar selección de sugerencia
  const handleSuggestionSelect = (suggestion) => {
    setSearchTerm(suggestion);
    setSuggestions([]);
    performSearch(suggestion);
  };

  // Realizar búsqueda
  const performSearch = (term = searchTerm) => {
    if (!term.trim()) return;

    setIsLoading(true);
    
    // Agregar a búsquedas recientes
    const newRecentSearches = [
      term,
      ...recentSearches.filter(s => s !== term)
    ].slice(0, 10);
    
    setRecentSearches(newRecentSearches);
    localStorage.setItem('recentSearches', JSON.stringify(newRecentSearches));

    // Simular búsqueda
    setTimeout(() => {
      const searchResults = {
        term,
        filters,
        results: [], // Aquí irían los resultados reales
      };
      
      onSearch(searchResults);
      setIsLoading(false);
      setSuggestions([]);
    }, 500);
  };

  // Manejar envío de búsqueda
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    performSearch();
  };

  // Limpiar búsqueda
  const handleClearSearch = () => {
    setSearchTerm('');
    setFilters({
      category: '',
      location: '',
      dateRange: [null, null],
      priceRange: [0, 1000],
      attendees: '',
      rating: 0,
    });
    setSuggestions([]);
    onSearch({ term: '', filters: {}, results: [] });
  };

  // Aplicar filtros
  const handleApplyFilters = () => {
    setShowAdvanced(false);
    performSearch();
  };

  // Guardar filtros
  const handleSaveFilters = () => {
    const savedFilters = JSON.parse(localStorage.getItem('savedFilters') || '[]');
    const newFilter = {
      id: Date.now(),
      name: `Filtro ${savedFilters.length + 1}`,
      filters: { ...filters },
      timestamp: new Date().toISOString(),
    };
    
    savedFilters.push(newFilter);
    localStorage.setItem('savedFilters', JSON.stringify(savedFilters));
  };

  // Categorías disponibles
  const categories = [
    'Musical',
    'Deportivo',
    'Cultural',
    'Educativo',
    'Corporativo',
    'Público',
    'Tecnología',
    'Arte',
    'Gastronomía',
    'Salud',
  ];

  // Ubicaciones populares
  const popularLocations = [
    'Buenos Aires',
    'Córdoba',
    'Rosario',
    'Mendoza',
    'La Plata',
    'Mar del Plata',
    'Salta',
    'Tucumán',
  ];

  return (
    <Box sx={{ position: 'relative', width: fullWidth ? '100%' : 'auto' }}>
      {/* Barra de búsqueda principal */}
      <Paper
        component="form"
        onSubmit={handleSearchSubmit}
        sx={{
          display: 'flex',
          alignItems: 'center',
          borderRadius: 3,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          overflow: 'hidden',
          border: '1px solid rgba(0,0,0,0.05)',
        }}
      >
        <TextField
          ref={searchRef}
          fullWidth
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          variant="standard"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                {searchTerm && (
                  <IconButton
                    size="small"
                    onClick={handleClearSearch}
                    sx={{ mr: 1 }}
                  >
                    <ClearIcon />
                  </IconButton>
                )}
                <Tooltip title="Filtros avanzados">
                  <IconButton
                    size="small"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    color={showAdvanced ? 'primary' : 'default'}
                  >
                    <Badge
                      badgeContent={
                        Object.values(filters).filter(v => 
                          v !== '' && v !== 0 && (!Array.isArray(v) || v.some(item => item !== null && item !== 0))
                        ).length
                      }
                      color="primary"
                    >
                      <FilterIcon />
                    </Badge>
                  </IconButton>
                </Tooltip>
              </InputAdornment>
            ),
            style: { padding: '12px 16px' },
          }}
          sx={{
            '& .MuiInput-root': {
              fontSize: '1.1rem',
            },
          }}
        />
      </Paper>

      {/* Sugerencias */}
      <AnimatePresence>
        {suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <Paper
              ref={suggestionsRef}
              sx={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                zIndex: 1000,
                mt: 1,
                borderRadius: 2,
                boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                maxHeight: 300,
                overflow: 'auto',
              }}
            >
              <List>
                {suggestions.map((suggestion, index) => (
                  <ListItem
                    key={index}
                    button
                    onClick={() => handleSuggestionSelect(suggestion)}
                    sx={{
                      '&:hover': {
                        backgroundColor: 'rgba(25, 118, 210, 0.04)',
                      },
                    }}
                  >
                    <ListItemIcon>
                      <SearchIcon color="action" />
                    </ListItemIcon>
                    <ListItemText primary={suggestion} />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Búsquedas recientes y populares */}
      {!searchTerm && !suggestions.length && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          <Paper
            sx={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              zIndex: 1000,
              mt: 1,
              borderRadius: 2,
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              p: 2,
            }}
          >
            {/* Búsquedas recientes */}
            {recentSearches.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Búsquedas recientes
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {recentSearches.slice(0, 5).map((search, index) => (
                    <Chip
                      key={index}
                      label={search}
                      size="small"
                      onClick={() => handleSuggestionSelect(search)}
                      icon={<HistoryIcon />}
                      sx={{ cursor: 'pointer' }}
                    />
                  ))}
                </Box>
              </Box>
            )}

            {/* Búsquedas populares */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                Búsquedas populares
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {popularSearches.map((search, index) => (
                  <Chip
                    key={index}
                    label={search}
                    size="small"
                    onClick={() => handleSuggestionSelect(search)}
                    icon={<TrendingUpIcon />}
                    color="primary"
                    variant="outlined"
                    sx={{ cursor: 'pointer' }}
                  />
                ))}
              </Box>
            </Box>
          </Paper>
        </motion.div>
      )}

      {/* Filtros avanzados */}
      <Collapse in={showAdvanced}>
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Paper
            sx={{
              mt: 2,
              p: 3,
              borderRadius: 3,
              background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
              Filtros Avanzados
            </Typography>
            
            <Grid container spacing={3}>
              {/* Categoría */}
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Categoría</InputLabel>
                  <Select
                    value={filters.category}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                    label="Categoría"
                  >
                    <MenuItem value="">Todas las categorías</MenuItem>
                    {categories.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Ubicación */}
              <Grid item xs={12} sm={6} md={3}>
                <Autocomplete
                  options={popularLocations}
                  value={filters.location}
                  onChange={(e, newValue) => setFilters({ ...filters, location: newValue })}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Ubicación"
                      placeholder="Seleccionar ubicación"
                    />
                  )}
                  freeSolo
                />
              </Grid>

              {/* Rango de precios */}
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Rango de precios
                </Typography>
                <Slider
                  value={filters.priceRange}
                  onChange={(e, newValue) => setFilters({ ...filters, priceRange: newValue })}
                  valueLabelDisplay="auto"
                  min={0}
                  max={1000}
                  step={10}
                  marks={[
                    { value: 0, label: '$0' },
                    { value: 500, label: '$500' },
                    { value: 1000, label: '$1000' },
                  ]}
                />
              </Grid>

              {/* Calificación */}
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Calificación mínima
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Slider
                    value={filters.rating}
                    onChange={(e, newValue) => setFilters({ ...filters, rating: newValue })}
                    min={0}
                    max={5}
                    step={0.5}
                    marks={[
                      { value: 0, label: '0' },
                      { value: 2.5, label: '2.5' },
                      { value: 5, label: '5' },
                    ]}
                  />
                  <StarIcon color="primary" />
                </Box>
              </Grid>
            </Grid>

            {/* Botones de acción */}
            <Box sx={{ display: 'flex', gap: 2, mt: 3, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                startIcon={<SaveIcon />}
                onClick={handleSaveFilters}
              >
                Guardar Filtros
              </Button>
              <Button
                variant="outlined"
                onClick={handleClearSearch}
              >
                Limpiar
              </Button>
              <Button
                variant="contained"
                onClick={handleApplyFilters}
                disabled={isLoading}
              >
                {isLoading ? 'Buscando...' : 'Aplicar Filtros'}
              </Button>
            </Box>
          </Paper>
        </motion.div>
      </Collapse>
    </Box>
  );
};

export default AdvancedSearch; 
