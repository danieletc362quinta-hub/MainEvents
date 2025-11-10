import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Grid,
  Avatar,
  IconButton,
  Divider,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  Tabs,
  Tab,
  Chip,
  Switch,
  FormControlLabel,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  Security as SecurityIcon,
  Notifications as NotificationIcon,
  Palette as PaletteIcon,
  Language as LanguageIcon,
  CloudUpload as UploadIcon,
  Star as StarIcon,
  Event as EventIcon,
  People as PeopleIcon
} from '@mui/icons-material';
import { useLanguage } from '../../contexts/UnifiedLanguageContext';
import { useAuth } from '../../contexts/AuthContext';

const ModernProfile = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { t } = useLanguage();
  const { user, updateProfile, uploadAvatar } = useAuth();
  
  const [activeTab, setActiveTab] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
    avatar: null,
    joinDate: '',
    role: '',
    verified: false
  });

  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    marketingEmails: false,
    darkMode: false,
    language: 'es'
  });

  const [stats, setStats] = useState({
    eventsCreated: 0,
    eventsAttended: 0,
    followers: 0,
    following: 0,
    rating: 0
  });

  // Cargar datos del usuario cuando el componente se monta o cuando el usuario cambia
  useEffect(() => {
    console.log('🔄 ModernProfile: useEffect ejecutado, user:', user);
    if (user) {
      console.log('🔄 ModernProfile: Actualizando profileData con user:', user);
      setProfileData({
        firstName: user.name || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        location: user.location || '',
        bio: user.bio || '',
        avatar: user.avatar || null,
        joinDate: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '',
        role: user.role || 'Usuario',
        verified: user.verified || false
      });
    }
  }, [user]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setMessage(null);
      
      // Preparar datos para enviar al backend
      const updateData = {
        name: profileData.firstName,
        lastName: profileData.lastName,
        phone: profileData.phone,
        location: profileData.location,
        bio: profileData.bio
      };
      
      await updateProfile(updateData);
      setIsEditing(false);
      setMessage({ type: 'success', text: 'Perfil actualizado correctamente' });
      
      // Limpiar mensaje después de 3 segundos
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      setMessage({ type: 'error', text: error.message || 'Error al actualizar perfil' });
      
      // Limpiar mensaje después de 5 segundos
      setTimeout(() => setMessage(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setMessage(null);
    
    // Restaurar datos originales del usuario
    if (user) {
      setProfileData({
        firstName: user.name || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        location: user.location || '',
        bio: user.bio || '',
        avatar: user.avatar || null,
        joinDate: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '',
        role: user.role || 'Usuario',
        verified: user.verified || false
      });
    }
  };

  const handleChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };

  const handleSettingsChange = (setting) => {
    setSettings({
      ...settings,
      [setting]: !settings[setting]
    });
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        setLoading(true);
        setMessage(null);
        
        // Validar tipo de archivo
        if (!file.type.startsWith('image/')) {
          setMessage({ type: 'error', text: 'Solo se permiten archivos de imagen' });
          return;
        }
        
        // Validar tamaño (5MB máximo)
        if (file.size > 5 * 1024 * 1024) {
          setMessage({ type: 'error', text: 'El archivo no puede ser mayor a 5MB' });
          return;
        }
        
        // Subir avatar
        const response = await uploadAvatar(file);
        
        // El contexto ya actualiza el usuario, no necesitamos actualizar profileData manualmente
        // El useEffect se encargará de actualizar profileData cuando user cambie
        
        setMessage({ type: 'success', text: 'Avatar actualizado correctamente' });
        
        // Limpiar mensaje después de 3 segundos
        setTimeout(() => setMessage(null), 3000);
        
      } catch (error) {
        console.error('Error al subir avatar:', error);
        setMessage({ type: 'error', text: error.message || 'Error al subir avatar' });
        
        // Limpiar mensaje después de 5 segundos
        setTimeout(() => setMessage(null), 5000);
      } finally {
        setLoading(false);
      }
    }
  };

  const TabPanel = ({ children, value, index, ...other }) => (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );

  // Mostrar loading si no hay usuario
  if (!user) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <CircularProgress size={60} sx={{ color: 'white' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Mensajes de estado */}
        {message && (
          <Alert 
            severity={message.type} 
            sx={{ mb: 2 }}
            onClose={() => setMessage(null)}
          >
            {message.text}
          </Alert>
        )}
        {/* Header */}
        <Paper
          sx={{
            p: 4,
            mb: 4,
            borderRadius: 3,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 16px 48px rgba(0, 0, 0, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}
        >
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} sm={4} md={3}>
              <Box sx={{ position: 'relative', display: 'inline-block' }}>
                <Avatar
                  src={user?.avatar || (profileData.avatar ? `http://localhost:4000/uploads/avatars/${profileData.avatar}` : undefined)}
                  sx={{
                    width: 120,
                    height: 120,
                    background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
                    fontSize: '3rem',
                    fontWeight: 600,
                    boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)'
                  }}
                >
                  {profileData.firstName.charAt(0)}{profileData.lastName.charAt(0)}
                </Avatar>
                <IconButton
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    backgroundColor: theme.palette.primary.main,
                    color: 'white',
                    '&:hover': {
                      backgroundColor: theme.palette.primary.dark
                    }
                  }}
                  onClick={() => document.getElementById('avatar-upload').click()}
                >
                  <UploadIcon />
                </IconButton>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  style={{ display: 'none' }}
                />
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={8} md={9}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                    {profileData.firstName} {profileData.lastName}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Chip
                      label={profileData.role}
                      color="primary"
                      size="small"
                    />
                    {profileData.verified && (
                      <Chip
                        label="Verificado"
                        color="success"
                        size="small"
                        icon={<StarIcon />}
                      />
                    )}
                  </Box>
                  <Typography variant="body1" sx={{ color: theme.palette.grey[600], mb: 2 }}>
                    {profileData.bio}
                  </Typography>
                </Box>
                
                <Box>
                  {isEditing ? (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        onClick={handleSave}
                        disabled={loading}
                        sx={{
                          backgroundColor: theme.palette.success.main,
                          color: 'white',
                          '&:hover': {
                            backgroundColor: theme.palette.success.dark
                          },
                          '&:disabled': {
                            backgroundColor: theme.palette.grey[400]
                          }
                        }}
                      >
                        {loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                      </IconButton>
                      <IconButton
                        onClick={handleCancel}
                        disabled={loading}
                        sx={{
                          backgroundColor: theme.palette.error.main,
                          color: 'white',
                          '&:hover': {
                            backgroundColor: theme.palette.error.dark
                          },
                          '&:disabled': {
                            backgroundColor: theme.palette.grey[400]
                          }
                        }}
                      >
                        <CancelIcon />
                      </IconButton>
                    </Box>
                  ) : (
                    <Button
                      variant="contained"
                      startIcon={<EditIcon />}
                      onClick={handleEdit}
                      sx={{
                        background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
                        '&:hover': {
                          background: 'linear-gradient(45deg, #5a6fd8 0%, #6a4190 100%)'
                        }
                      }}
                    >
                      Editar Perfil
                    </Button>
                  )}
                </Box>
              </Box>

              {/* Stats */}
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                      {stats.eventsCreated}
                    </Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.grey[600] }}>
                      Eventos Creados
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.secondary.main }}>
                      {stats.eventsAttended}
                    </Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.grey[600] }}>
                      Eventos Asistidos
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.success.main }}>
                      {stats.followers}
                    </Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.grey[600] }}>
                      Seguidores
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.warning.main }}>
                      {stats.rating}
                    </Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.grey[600] }}>
                      Calificación
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Paper>

        {/* Tabs */}
        <Paper
          sx={{
            borderRadius: 3,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 16px 48px rgba(0, 0, 0, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}
        >
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant={isMobile ? 'scrollable' : 'standard'}
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              '& .MuiTabs-indicator': {
                backgroundColor: theme.palette.primary.main,
                height: 3,
                borderRadius: '2px 2px 0 0'
              },
              '& .MuiTab-root': {
                fontWeight: 600,
                textTransform: 'none',
                '&.Mui-selected': {
                  color: theme.palette.primary.main
                }
              }
            }}
          >
            <Tab label="Información Personal" />
            <Tab label="Configuración" />
            <Tab label="Actividad" />
            <Tab label="Seguridad" />
          </Tabs>

          <TabPanel value={activeTab} index={0}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Nombre"
                  name="firstName"
                  value={profileData.firstName}
                  onChange={handleChange}
                  disabled={!isEditing}
                  InputProps={{
                    startAdornment: <PersonIcon sx={{ color: theme.palette.grey[500], mr: 1 }} />
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: isEditing ? 'white' : theme.palette.grey[50]
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Apellido"
                  name="lastName"
                  value={profileData.lastName}
                  onChange={handleChange}
                  disabled={!isEditing}
                  InputProps={{
                    startAdornment: <PersonIcon sx={{ color: theme.palette.grey[500], mr: 1 }} />
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: isEditing ? 'white' : theme.palette.grey[50]
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Correo electrónico"
                  name="email"
                  value={profileData.email}
                  onChange={handleChange}
                  disabled={!isEditing}
                  InputProps={{
                    startAdornment: <EmailIcon sx={{ color: theme.palette.grey[500], mr: 1 }} />
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: isEditing ? 'white' : theme.palette.grey[50]
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Teléfono"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleChange}
                  disabled={!isEditing}
                  InputProps={{
                    startAdornment: <PhoneIcon sx={{ color: theme.palette.grey[500], mr: 1 }} />
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: isEditing ? 'white' : theme.palette.grey[50]
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Ubicación"
                  name="location"
                  value={profileData.location}
                  onChange={handleChange}
                  disabled={!isEditing}
                  InputProps={{
                    startAdornment: <LocationIcon sx={{ color: theme.palette.grey[500], mr: 1 }} />
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: isEditing ? 'white' : theme.palette.grey[50]
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Biografía"
                  name="bio"
                  value={profileData.bio}
                  onChange={handleChange}
                  disabled={!isEditing}
                  multiline
                  rows={3}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: isEditing ? 'white' : theme.palette.grey[50]
                    }
                  }}
                />
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={activeTab} index={1}>
            <List>
              <ListItem>
                <ListItemIcon>
                  <NotificationIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Notificaciones por correo"
                  secondary="Recibe notificaciones sobre tus eventos y actividades"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.emailNotifications}
                      onChange={() => handleSettingsChange('emailNotifications')}
                    />
                  }
                  label=""
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemIcon>
                  <NotificationIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Notificaciones push"
                  secondary="Recibe notificaciones en tiempo real"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.pushNotifications}
                      onChange={() => handleSettingsChange('pushNotifications')}
                    />
                  }
                  label=""
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemIcon>
                  <EmailIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Emails de marketing"
                  secondary="Recibe ofertas y promociones especiales"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.marketingEmails}
                      onChange={() => handleSettingsChange('marketingEmails')}
                    />
                  }
                  label=""
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemIcon>
                  <PaletteIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Modo oscuro"
                  secondary="Cambiar el tema de la aplicación"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.darkMode}
                      onChange={() => handleSettingsChange('darkMode')}
                    />
                  }
                  label=""
                />
              </ListItem>
            </List>
          </TabPanel>

          <TabPanel value={activeTab} index={2}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Actividad Reciente
            </Typography>
            
            <List>
              <ListItem>
                <ListItemIcon>
                  <EventIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Creaste el evento 'Conferencia de Tecnología 2024'"
                  secondary="Hace 2 horas"
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemIcon>
                  <PeopleIcon color="secondary" />
                </ListItemIcon>
                <ListItemText
                  primary="Te uniste al evento 'Workshop de Diseño UX/UI'"
                  secondary="Hace 1 día"
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemIcon>
                  <StarIcon color="warning" />
                </ListItemIcon>
                <ListItemText
                  primary="Calificaste el evento 'Networking Empresarial' con 5 estrellas"
                  secondary="Hace 3 días"
                />
              </ListItem>
            </List>
          </TabPanel>

          <TabPanel value={activeTab} index={3}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Configuración de Seguridad
            </Typography>
            
            <List>
              <ListItem>
                <ListItemIcon>
                  <SecurityIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Cambiar contraseña"
                  secondary="Actualiza tu contraseña regularmente"
                />
                <Button variant="outlined" size="small">
                  Cambiar
                </Button>
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemIcon>
                  <SecurityIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Autenticación de dos factores"
                  secondary="Añade una capa extra de seguridad"
                />
                <Button variant="outlined" size="small">
                  Activar
                </Button>
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemIcon>
                  <SecurityIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Sesiones activas"
                  secondary="Gestiona tus sesiones activas"
                />
                <Button variant="outlined" size="small">
                  Ver sesiones
                </Button>
              </ListItem>
            </List>
          </TabPanel>
        </Paper>
      </Container>
    </Box>
  );
};

export default ModernProfile;
