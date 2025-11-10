import React, { useState } from 'react';
import {
  Box, Typography, Container, Grid, Card, CardContent, Button, TextField, 
  Avatar, Alert, CircularProgress, Divider, Chip, IconButton
} from '@mui/material';
import { Edit, Save, Cancel, Person, Email, Phone, LocationOn } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useUserStats } from '../hooks/useDashboard';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const { data: userStats, isLoading: loadingStats } = useUserStats();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    location: user?.location || '',
  });
  const [message, setMessage] = useState(null);

  const handleEdit = () => {
    setIsEditing(true);
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      location: user?.location || '',
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setMessage(null);
  };

  const handleSave = async () => {
    try {
      console.log('Profile: Guardando datos del perfil:', formData);
      await updateProfile(formData);
      setIsEditing(false);
      setMessage({ type: 'success', text: 'Perfil actualizado correctamente' });
      // Limpiar el mensaje después de 3 segundos
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Profile: Error al actualizar perfil:', error);
      setMessage({ type: 'error', text: error.message || 'Error al actualizar perfil' });
      // Limpiar el mensaje después de 5 segundos
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  if (!user) {
    return (
      <Container maxWidth="md">
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
          Mi Perfil
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
          Gestiona tu información personal y estadísticas
        </Typography>

        {message && (
          <Alert severity={message.type} sx={{ mb: 3 }}>
            {message.text}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Información Personal */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                    Información Personal
                  </Typography>
                  {!isEditing ? (
                    <Button
                      startIcon={<Edit />}
                      variant="outlined"
                      onClick={handleEdit}
                    >
                      Editar
                    </Button>
                  ) : (
                    <Box>
                      <IconButton color="primary" onClick={handleSave}>
                        <Save />
                      </IconButton>
                      <IconButton color="error" onClick={handleCancel}>
                        <Cancel />
                      </IconButton>
                    </Box>
                  )}
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar
                    sx={{ width: 80, height: 80, mr: 2, bgcolor: 'primary.main' }}
                  >
                    {user.name?.charAt(0)?.toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {user.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Miembro desde {user.createdAt ? (() => {
                  try {
                    const dateObj = new Date(user.createdAt);
                    if (isNaN(dateObj.getTime())) {
                      return 'Fecha no válida';
                    }
                    return dateObj.toLocaleDateString();
                  } catch (error) {
                    return 'Fecha no válida';
                  }
                })() : 'Fecha no disponible'}
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Person sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="body2" color="text.secondary">
                        Nombre
                      </Typography>
                    </Box>
                    {isEditing ? (
                      <TextField
                        fullWidth
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        size="small"
                      />
                    ) : (
                      <Typography variant="body1">{user.name}</Typography>
                    )}
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Email sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="body2" color="text.secondary">
                        Email
                      </Typography>
                    </Box>
                    {isEditing ? (
                      <TextField
                        fullWidth
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        size="small"
                        type="email"
                      />
                    ) : (
                      <Typography variant="body1">{user.email}</Typography>
                    )}
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Phone sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="body2" color="text.secondary">
                        Teléfono
                      </Typography>
                    </Box>
                    {isEditing ? (
                      <TextField
                        fullWidth
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        size="small"
                      />
                    ) : (
                      <Typography variant="body1">{user.phone || 'No especificado'}</Typography>
                    )}
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <LocationOn sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="body2" color="text.secondary">
                        Ubicación
                      </Typography>
                    </Box>
                    {isEditing ? (
                      <TextField
                        fullWidth
                        value={formData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        size="small"
                      />
                    ) : (
                      <Typography variant="body1">{user.location || 'No especificada'}</Typography>
                    )}
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Estadísticas */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>
                  Mis Estadísticas
                </Typography>

                {loadingStats ? (
                  <CircularProgress />
                ) : (
                  <Box>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="body2" color="text.secondary">
                        Eventos Asistidos
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                        {userStats?.eventsAttended || 0}
                      </Typography>
                    </Box>

                    <Box sx={{ mb: 3 }}>
                      <Typography variant="body2" color="text.secondary">
                        Eventos Favoritos
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                        {userStats?.favoriteEvents || 0}
                      </Typography>
                    </Box>

                    <Box sx={{ mb: 3 }}>
                      <Typography variant="body2" color="text.secondary">
                        Tickets Comprados
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                        {userStats?.ticketsPurchased || 0}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Cupones Usados
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                        {userStats?.couponsUsed || 0}
                      </Typography>
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Estado de la cuenta */}
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                  Estado de la Cuenta
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Chip 
                    label="Verificado" 
                    color="success" 
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  <Typography variant="body2">
                    Email verificado
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Chip 
                    label="Activo" 
                    color="primary" 
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  <Typography variant="body2">
                    Cuenta activa
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Profile; 
