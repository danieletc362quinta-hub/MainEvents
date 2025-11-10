import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  useTheme,
  useMediaQuery,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  CardMedia,
  Divider,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  CloudUpload as UploadIcon,
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
  AttachMoney as MoneyIcon,
  People as PeopleIcon,
  Description as DescriptionIcon,
  Image as ImageIcon,
  Event as EventIcon
} from '@mui/icons-material';
import { useLanguage } from '../../contexts/UnifiedLanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { useCreateEvent } from '../../hooks/useEvents';
import { useNavigate } from 'react-router-dom';

const ModernCreateEvent = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { mutate: createEvent, isLoading, isError, error } = useCreateEvent();
  
  const [activeStep, setActiveStep] = useState(0);
  const [message, setMessage] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    date: '',
    time: '',
    location: '',
    address: '',
    price: '',
    capacity: '',
    visibility: 'public',
    tags: [],
    image: null,
    imageUrl: '',
    imageType: 'file' // 'file' o 'url'
  });

  const steps = [
    'Información Básica',
    'Detalles del Evento',
    'Configuración',
    'Revisar y Crear'
  ];

  const categories = [
    'Tecnología',
    'Negocios',
    'Educación',
    'Entretenimiento',
    'Deportes',
    'Arte y Cultura',
    'Salud y Bienestar',
    'Networking',
    'Conferencias',
    'Workshops'
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleTagAdd = (tag) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tag]
      });
    }
  };

  const handleTagRemove = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        image: file,
        imageType: 'file',
        imageUrl: ''
      });
    }
  };

  const handleImageUrlChange = (e) => {
    setFormData({
      ...formData,
      imageUrl: e.target.value,
      imageType: 'url',
      image: null
    });
  };

  const handleImageTypeChange = (type) => {
    setFormData({
      ...formData,
      imageType: type,
      image: type === 'file' ? null : formData.image,
      imageUrl: type === 'url' ? '' : formData.imageUrl
    });
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async () => {
    try {
      setMessage(null);
      
      // Validación básica
      if (!formData.title || !formData.description || !formData.date || !formData.time) {
        setMessage({ type: 'error', text: 'Por favor completa todos los campos obligatorios' });
        return;
      }

      let imageUrl = 'default-image';

      // Manejar imagen según el tipo seleccionado
      if (formData.imageType === 'file' && formData.image) {
        // Subir archivo local
        try {
          const formDataImage = new FormData();
          formDataImage.append('image', formData.image);

          const uploadResponse = await fetch('http://localhost:4000/api/events/upload-image', {
            method: 'POST',
            body: formDataImage,
            credentials: 'include' // Para enviar cookies de autenticación
          });

          if (uploadResponse.ok) {
            const uploadData = await uploadResponse.json();
            imageUrl = uploadData.imageUrl;
            console.log('✅ Imagen subida exitosamente:', imageUrl);
          } else {
            console.warn('⚠️ Error al subir imagen, usando imagen por defecto');
          }
        } catch (uploadError) {
          console.warn('⚠️ Error al subir imagen:', uploadError);
        }
      } else if (formData.imageType === 'url' && formData.imageUrl) {
        // Usar URL proporcionada
        imageUrl = formData.imageUrl;
        console.log('✅ Usando URL de imagen:', imageUrl);
      }
      
      // Preparar datos para enviar al backend
      const eventData = {
        name: formData.title,
        description: formData.description,
        category: formData.category,
        date: `${formData.date}T${formData.time}`,
        location: formData.location,
        address: formData.address,
        price: Number(formData.price) || 0,
        capacidad: Number(formData.capacity) || 0,
        visibility: formData.visibility === 'public' ? 'publico' : 'privado',
        tags: formData.tags,
        image: imageUrl,
        organizer: user?.id || user?._id || user?.email || 'organizador',
        user: user?.id || user?._id
      };
      
      console.log('🎉 Creando evento:', eventData);
      
      createEvent(eventData, {
        onSuccess: (response) => {
          console.log('✅ Evento creado exitosamente:', response);
          setMessage({ type: 'success', text: '¡Evento creado exitosamente!' });
          
          // Redirigir a la lista de eventos después de 2 segundos
          setTimeout(() => {
            navigate('/events');
          }, 2000);
        },
        onError: (error) => {
          console.error('❌ Error al crear evento:', error);
          setMessage({ 
            type: 'error', 
            text: error?.response?.data?.message || 'Error al crear el evento. Inténtalo de nuevo.' 
          });
        }
      });
      
    } catch (error) {
      console.error('❌ Error inesperado:', error);
      setMessage({ type: 'error', text: 'Error inesperado. Inténtalo de nuevo.' });
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Título del Evento"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                InputProps={{
                  startAdornment: <EventIcon sx={{ color: theme.palette.grey[500], mr: 1 }} />
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: 'white'
                  }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descripción"
                name="description"
                value={formData.description}
                onChange={handleChange}
                multiline
                rows={4}
                required
                InputProps={{
                  startAdornment: <DescriptionIcon sx={{ color: theme.palette.grey[500], mr: 1, mt: 2 }} />
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: 'white'
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Categoría</InputLabel>
                <Select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  label="Categoría"
                  sx={{ borderRadius: 2, backgroundColor: 'white' }}
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Etiquetas (separadas por comas)"
                placeholder="tecnología, networking, gratis"
                onChange={(e) => {
                  const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag);
                  setFormData({ ...formData, tags });
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: 'white'
                  }
                }}
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Fecha"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: <CalendarIcon sx={{ color: theme.palette.grey[500], mr: 1 }} />
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: 'white'
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Hora"
                name="time"
                type="time"
                value={formData.time}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: 'white'
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Ubicación"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                InputProps={{
                  startAdornment: <LocationIcon sx={{ color: theme.palette.grey[500], mr: 1 }} />
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: 'white'
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Dirección"
                name="address"
                value={formData.address}
                onChange={handleChange}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: 'white'
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Precio"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
                InputProps={{
                  startAdornment: <MoneyIcon sx={{ color: theme.palette.grey[500], mr: 1 }} />
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: 'white'
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Capacidad"
                name="capacity"
                type="number"
                value={formData.capacity}
                onChange={handleChange}
                InputProps={{
                  startAdornment: <PeopleIcon sx={{ color: theme.palette.grey[500], mr: 1 }} />
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: 'white'
                  }
                }}
              />
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Imagen del Evento
              </Typography>
              
              {/* Selector de tipo de imagen */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  Selecciona cómo quieres agregar la imagen:
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <Button
                    variant={formData.imageType === 'file' ? 'contained' : 'outlined'}
                    onClick={() => handleImageTypeChange('file')}
                    startIcon={<UploadIcon />}
                    sx={{ borderRadius: 2 }}
                  >
                    Subir desde PC
                  </Button>
                  <Button
                    variant={formData.imageType === 'url' ? 'contained' : 'outlined'}
                    onClick={() => handleImageTypeChange('url')}
                    startIcon={<ImageIcon />}
                    sx={{ borderRadius: 2 }}
                  >
                    Usar URL
                  </Button>
                </Box>
              </Box>

              {/* Opción 1: Subir archivo */}
              {formData.imageType === 'file' && (
                <Card
                  sx={{
                    border: '2px dashed',
                    borderColor: theme.palette.grey[300],
                    borderRadius: 2,
                    p: 2,
                    textAlign: 'center',
                    cursor: 'pointer',
                    '&:hover': {
                      borderColor: theme.palette.primary.main,
                      backgroundColor: theme.palette.primary.light + '10'
                    }
                  }}
                  onClick={() => document.getElementById('image-upload').click()}
                >
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                  />
                  {formData.image ? (
                    <Box>
                      <CardMedia
                        component="img"
                        height="200"
                        image={URL.createObjectURL(formData.image)}
                        alt="Event preview"
                        sx={{ borderRadius: 1, mb: 2 }}
                      />
                      <Button
                        startIcon={<DeleteIcon />}
                        onClick={(e) => {
                          e.stopPropagation();
                          setFormData({ ...formData, image: null });
                        }}
                      >
                        Eliminar Imagen
                      </Button>
                    </Box>
                  ) : (
                    <Box>
                      <UploadIcon sx={{ fontSize: 48, color: theme.palette.grey[400], mb: 2 }} />
                      <Typography variant="body1" sx={{ color: theme.palette.grey[600] }}>
                        Haz clic para subir una imagen
                      </Typography>
                      <Typography variant="body2" sx={{ color: theme.palette.grey[500] }}>
                        PNG, JPG hasta 10MB
                      </Typography>
                    </Box>
                  )}
                </Card>
              )}

              {/* Opción 2: URL de imagen */}
              {formData.imageType === 'url' && (
                <Box>
                  <TextField
                    fullWidth
                    label="URL de la imagen"
                    placeholder="https://ejemplo.com/imagen.jpg"
                    value={formData.imageUrl}
                    onChange={handleImageUrlChange}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        backgroundColor: 'white'
                      }
                    }}
                  />
                  {formData.imageUrl && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                        Vista previa:
                      </Typography>
                      <CardMedia
                        component="img"
                        height="200"
                        image={formData.imageUrl}
                        alt="Event preview"
                        sx={{ 
                          borderRadius: 1, 
                          border: '1px solid',
                          borderColor: theme.palette.grey[300]
                        }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </Box>
                  )}
                </Box>
              )}
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Visibilidad</InputLabel>
                <Select
                  name="visibility"
                  value={formData.visibility}
                  onChange={handleChange}
                  label="Visibilidad"
                  sx={{ borderRadius: 2, backgroundColor: 'white' }}
                >
                  <MenuItem value="public">Público</MenuItem>
                  <MenuItem value="private">Privado</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        );

      case 3:
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Revisa los detalles de tu evento
            </Typography>
            
            <Card sx={{ mb: 3 }}>
              <CardMedia
                component="img"
                height="200"
                image={
                  formData.imageType === 'file' && formData.image 
                    ? URL.createObjectURL(formData.image)
                    : formData.imageType === 'url' && formData.imageUrl
                    ? formData.imageUrl
                    : 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&h=600&fit=crop'
                }
                alt="Event preview"
              />
              <CardContent>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                  {formData.title}
                </Typography>
                <Typography variant="body1" sx={{ color: theme.palette.grey[600], mb: 2 }}>
                  {formData.description}
                </Typography>
                
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CalendarIcon sx={{ color: theme.palette.primary.main }} />
                      <Typography variant="body2">
                        {formData.date} {formData.time}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocationIcon sx={{ color: theme.palette.secondary.main }} />
                      <Typography variant="body2">
                        {formData.location}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <MoneyIcon sx={{ color: theme.palette.success.main }} />
                      <Typography variant="body2">
                        {formData.price ? `$${formData.price}` : 'Gratis'}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PeopleIcon sx={{ color: theme.palette.info.main }} />
                      <Typography variant="body2">
                        {formData.capacity} personas
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip label={formData.category} color="primary" />
                  <Chip label={formData.visibility} color="secondary" />
                  {formData.tags.map((tag, index) => (
                    <Chip key={index} label={tag} variant="outlined" />
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper
          sx={{
            p: 4,
            borderRadius: 3,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 16px 48px rgba(0, 0, 0, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}
        >
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1
              }}
            >
              Crear Nuevo Evento
            </Typography>
            <Typography variant="h6" sx={{ color: theme.palette.grey[600], fontWeight: 400 }}>
              Completa la información para crear tu evento
            </Typography>
          </Box>

          {/* Mensajes de estado */}
          {message && (
            <Alert 
              severity={message.type} 
              sx={{ mb: 3 }}
              onClose={() => setMessage(null)}
            >
              {message.text}
            </Alert>
          )}

          {/* Stepper */}
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {/* Step Content */}
          <Box sx={{ mb: 4 }}>
            {renderStepContent(activeStep)}
          </Box>

          {/* Navigation Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              sx={{ borderRadius: 2 }}
            >
              Anterior
            </Button>
            
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={isLoading}
                startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
                sx={{
                  background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: 2,
                  px: 4,
                  py: 1.5,
                  fontWeight: 600,
                  '&:hover': {
                    background: 'linear-gradient(45deg, #5a6fd8 0%, #6a4190 100%)',
                    transform: 'translateY(-2px)'
                  },
                  '&:disabled': {
                    background: theme.palette.grey[400],
                    transform: 'none'
                  }
                }}
              >
                {isLoading ? 'Creando...' : 'Crear Evento'}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                sx={{
                  background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: 2,
                  px: 4,
                  py: 1.5,
                  fontWeight: 600,
                  '&:hover': {
                    background: 'linear-gradient(45deg, #5a6fd8 0%, #6a4190 100%)',
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                Siguiente
              </Button>
            )}
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default ModernCreateEvent;
