import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Container,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Card,
  CardMedia,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useCreateEvent } from '../hooks/useEvents';
import { useAuth } from '../contexts/AuthContext';
import { eventService } from '../services/eventService';

const CreateEvent = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    date: '',
    time: '',
    location: '',
    type: '',
    capacity: '',
    price: '',
    image: '',
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const { mutate: createEvent, isLoading, isError, isSuccess, error } = useCreateEvent();

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      
      // Crear preview de la imagen
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = async () => {
    if (!selectedImage) return;
    
    setUploadingImage(true);
    try {
      const response = await eventService.uploadImage(selectedImage);
      console.log('✅ Imagen subida:', response);
      setFormData(prev => ({ ...prev, image: response.imageUrl }));
      setUploadingImage(false);
    } catch (error) {
      console.error('❌ Error al subir imagen:', error);
      setUploadingImage(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Debug: Verificar autenticación
    const token = localStorage.getItem('token');
    console.log('🔑 Token en localStorage:', token ? token.substring(0, 20) + '...' : 'NO HAY TOKEN');
    console.log('👤 Usuario actual:', user);
    console.log('🔐 Está autenticado:', user ? 'SÍ' : 'NO');
    
    // Validación básica
    const errors = {};
    if (!formData.date || !formData.time) {
      errors.date = 'Debes ingresar fecha y hora';
    }
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    setValidationErrors({});
    
    // Formato de fecha ISO completo (YYYY-MM-DDTHH:mm)
    const dateIso = `${formData.date}T${formData.time}`;
    
    const payload = {
      ...formData,
      date: dateIso,
      capacidad: Number(formData.capacity),
      price: Number(formData.price),
      // La imagen puede ser cualquier string, no necesariamente una URL
      image: formData.image || 'default-image',
      organizer: user?.id || user?._id || user?.email || 'organizador',
    };
    
    console.log('Enviando evento:', payload);
    
    createEvent(payload, {
      onSuccess: () => {
        console.log('Evento creado exitosamente');
        navigate('/events');
      },
      onError: (error) => {
        console.error('Error al crear evento:', error);
      }
    });
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          Crear Nuevo Evento
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
          Completa la información de tu evento
        </Typography>
        {isError && (
          (() => {
            console.error('Error al crear evento:', error);
            let msg = 'Error al crear evento';
            if (error?.response?.status === 401) msg = 'No autorizado. Por favor, inicia sesión.';
            if (error?.response?.status === 403) msg = 'No tienes permisos para crear eventos.';
            if (error?.response?.data?.error) msg += ': ' + error.response.data.error;
            if (error?.response?.data?.details) msg += ' - ' + JSON.stringify(error.response.data.details);
            return <Alert severity="error" sx={{ mb: 2 }}>{msg}</Alert>;
          })()
        )}

        <Paper sx={{ p: 4 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nombre del evento"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Descripción"
                  multiline
                  rows={4}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Fecha"
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Hora"
                  type="time"
                  required
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Ubicación"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Tipo de evento</InputLabel>
                  <Select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    label="Tipo de evento"
                  >
                    <MenuItem value="musical">Musical</MenuItem>
                    <MenuItem value="deportivo">Deportivo</MenuItem>
                    <MenuItem value="cultural">Cultural</MenuItem>
                    <MenuItem value="educativo">Educativo</MenuItem>
                    <MenuItem value="corporativo">Corporativo</MenuItem>
                    <MenuItem value="publico">Público</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Capacidad"
                  type="number"
                  required
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Precio"
                  type="number"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Imagen del Evento
                </Typography>
                
                {/* Preview de la imagen */}
                {imagePreview && (
                  <Card sx={{ mb: 2, maxWidth: 400 }}>
                    <CardMedia
                      component="img"
                      height="200"
                      image={imagePreview}
                      alt="Preview de imagen"
                      sx={{ objectFit: 'cover' }}
                    />
                  </Card>
                )}
                
                {/* Campo de archivo */}
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    style={{ display: 'none' }}
                    id="image-upload"
                  />
                  <label htmlFor="image-upload">
                    <Button variant="outlined" component="span">
                      Seleccionar Imagen
                    </Button>
                  </label>
                  
                  {selectedImage && (
                    <Button
                      variant="contained"
                      onClick={handleImageUpload}
                      disabled={uploadingImage}
                      startIcon={uploadingImage ? <CircularProgress size={20} /> : null}
                    >
                      {uploadingImage ? 'Subiendo...' : 'Subir Imagen'}
                    </Button>
                  )}
                </Box>
                
                {/* Campo de URL como alternativa */}
                <TextField
                  fullWidth
                  label="O ingresa una URL de imagen"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  helperText="Sube un archivo o ingresa una URL de imagen"
                  size="small"
                />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/events')}
                    disabled={isLoading}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isLoading}
                    sx={{ px: 4 }}
                  >
                    {isLoading ? <CircularProgress size={24} /> : 'Crear Evento'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default CreateEvent; 
