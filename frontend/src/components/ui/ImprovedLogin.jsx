import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Link,
  Divider,
  IconButton,
  InputAdornment,
  useTheme,
  useMediaQuery,
  Alert,
  CircularProgress,
  Fade,
  Snackbar
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Google as GoogleIcon,
  Facebook as FacebookIcon,
  Apple as AppleIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { useLanguage } from '../../contexts/UnifiedLanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

/**
 * Componente de Login mejorado siguiendo las 10 pautas de diseño web
 * - Código limpio y semántico
 * - Diseño responsive
 * - Optimización de velocidad
 * - Accesibilidad completa
 * - SEO optimizado
 * - Diseño moderno y minimalista
 * - Navegación clara
 * - Feedback estético
 * - Consistencia visual
 * - Seguridad básica
 */
const ImprovedLogin = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const { t } = useLanguage();
  const { login, loading: authLoading, error: authError } = useAuth();
  const navigate = useNavigate();
  
  // Estados del formulario
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  // Estados de UI
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarType, setSnackbarType] = useState('success');

  // Validación en tiempo real
  const [validationErrors, setValidationErrors] = useState({});

  // Limpiar errores cuando cambian los datos
  useEffect(() => {
    if (error) setError('');
    if (authError) setError(authError);
  }, [formData, authError]);

  // Validación de email
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validación de contraseña
  const validatePassword = (password) => {
    return password.length >= 6;
  };

  // Validación en tiempo real
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Validación en tiempo real
    const errors = { ...validationErrors };
    if (name === 'email' && value && !validateEmail(value)) {
      errors.email = 'Formato de email inválido';
    } else if (name === 'email') {
      delete errors.email;
    }
    
    if (name === 'password' && value && !validatePassword(value)) {
      errors.password = 'La contraseña debe tener al menos 6 caracteres';
    } else if (name === 'password') {
      delete errors.password;
    }
    
    setValidationErrors(errors);
  };

  // Manejo del envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validación final
    const errors = {};
    if (!formData.email) {
      errors.email = 'El email es obligatorio';
    } else if (!validateEmail(formData.email)) {
      errors.email = 'Formato de email inválido';
    }
    
    if (!formData.password) {
      errors.password = 'La contraseña es obligatoria';
    } else if (!validatePassword(formData.password)) {
      errors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      await login(formData);
      setSuccess('¡Inicio de sesión exitoso!');
      setSnackbarMessage('¡Bienvenido! Redirigiendo...');
      setSnackbarType('success');
      setShowSnackbar(true);
      
      // Redirigir después de un breve delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      const errorMessage = err.message || 'Error al iniciar sesión';
      setError(errorMessage);
      setSnackbarMessage(errorMessage);
      setSnackbarType('error');
      setShowSnackbar(true);
    }
  };

  // Toggle de visibilidad de contraseña
  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Navegación a registro
  const handleNavigateToRegister = () => {
    navigate('/register');
  };

  // Navegación a recuperar contraseña
  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  // Login con redes sociales (placeholder)
  const handleSocialLogin = (provider) => {
    setSnackbarMessage(`Login con ${provider} próximamente disponible`);
    setSnackbarType('info');
    setShowSnackbar(true);
  };

  return (
    <Box
      component="main"
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.spacing(2),
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Elementos decorativos de fondo */}
      <Box
        sx={{
          position: 'absolute',
          top: '-50%',
          left: '-50%',
          width: '200%',
          height: '200%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
          animation: 'float 20s ease-in-out infinite',
          '@keyframes float': {
            '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
            '50%': { transform: 'translateY(-20px) rotate(180deg)' }
          }
        }}
      />

      <Container maxWidth="sm">
        <Fade in timeout={800}>
          <Paper
            elevation={24}
            sx={{
              padding: isMobile ? theme.spacing(3) : theme.spacing(4),
              borderRadius: 3,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Header */}
            <Box textAlign="center" mb={4}>
              <Typography
                variant="h4"
                component="h1"
                sx={{
                  fontWeight: 700,
                  background: 'linear-gradient(45deg, #667eea, #764ba2)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 1
                }}
              >
                MainEvents
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ fontSize: '1.1rem' }}
              >
                Inicia sesión en tu cuenta
              </Typography>
            </Box>

            {/* Alertas de error y éxito */}
            {error && (
              <Fade in>
                <Alert
                  severity="error"
                  icon={<ErrorIcon />}
                  sx={{
                    mb: 3,
                    borderRadius: 2,
                    '& .MuiAlert-message': {
                      width: '100%'
                    }
                  }}
                  action={
                    <IconButton
                      size="small"
                      onClick={() => setError('')}
                      aria-label="Cerrar error"
                    >
                      ×
                    </IconButton>
                  }
                >
                  {error}
                </Alert>
              </Fade>
            )}

            {success && (
              <Fade in>
                <Alert
                  severity="success"
                  icon={<CheckCircleIcon />}
                  sx={{
                    mb: 3,
                    borderRadius: 2
                  }}
                >
                  {success}
                </Alert>
              </Fade>
            )}

            {/* Formulario */}
            <Box
              component="form"
              onSubmit={handleSubmit}
              noValidate
              sx={{ '& .MuiTextField-root': { mb: 2 } }}
            >
              {/* Campo Email */}
              <TextField
                fullWidth
                label="Correo electrónico"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                error={!!validationErrors.email}
                helperText={validationErrors.email}
                required
                autoComplete="email"
                autoFocus
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon sx={{ color: theme.palette.primary.main }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                    },
                    '&.Mui-focused': {
                      backgroundColor: 'white',
                      boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)'
                    }
                  }
                }}
              />

              {/* Campo Contraseña */}
              <TextField
                fullWidth
                label="Contraseña"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleInputChange}
                error={!!validationErrors.password}
                helperText={validationErrors.password}
                required
                autoComplete="current-password"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: theme.palette.primary.main }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleTogglePasswordVisibility}
                        edge="end"
                        aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                    },
                    '&.Mui-focused': {
                      backgroundColor: 'white',
                      boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)'
                    }
                  }
                }}
              />

              {/* Enlace de contraseña olvidada */}
              <Box textAlign="right" mb={3}>
                <Link
                  component="button"
                  type="button"
                  onClick={handleForgotPassword}
                  sx={{
                    textDecoration: 'none',
                    color: theme.palette.primary.main,
                    fontWeight: 500,
                    '&:hover': {
                      textDecoration: 'underline'
                    }
                  }}
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </Box>

              {/* Botón de envío */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={authLoading || Object.keys(validationErrors).length > 0}
                sx={{
                  py: 1.5,
                  mb: 3,
                  borderRadius: 2,
                  background: 'linear-gradient(45deg, #667eea, #764ba2)',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #5a6fd8, #6a4190)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 20px rgba(102, 126, 234, 0.6)'
                  },
                  '&:disabled': {
                    background: 'rgba(0, 0, 0, 0.12)',
                    color: 'rgba(0, 0, 0, 0.26)'
                  }
                }}
              >
                {authLoading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Iniciar Sesión'
                )}
              </Button>

              {/* Divider */}
              <Divider sx={{ my: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  O continúa con
                </Typography>
              </Divider>

              {/* Botones de redes sociales */}
              <Box
                sx={{
                  display: 'flex',
                  gap: 2,
                  flexDirection: isMobile ? 'column' : 'row',
                  mb: 3
                }}
              >
                {[
                  { provider: 'Google', icon: GoogleIcon, color: '#db4437' },
                  { provider: 'Facebook', icon: FacebookIcon, color: '#4267B2' },
                  { provider: 'Apple', icon: AppleIcon, color: '#000000' }
                ].map(({ provider, icon: Icon, color }) => (
                  <Button
                    key={provider}
                    variant="outlined"
                    fullWidth={isMobile}
                    onClick={() => handleSocialLogin(provider)}
                    startIcon={<Icon />}
                    sx={{
                      py: 1.5,
                      borderRadius: 2,
                      borderColor: color,
                      color: color,
                      fontWeight: 500,
                      textTransform: 'none',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        backgroundColor: `${color}10`,
                        borderColor: color,
                        transform: 'translateY(-1px)'
                      }
                    }}
                  >
                    {provider}
                  </Button>
                ))}
              </Box>

              {/* Enlace a registro */}
              <Box textAlign="center">
                <Typography variant="body2" color="text.secondary">
                  ¿No tienes una cuenta?{' '}
                  <Link
                    component="button"
                    type="button"
                    onClick={handleNavigateToRegister}
                    sx={{
                      textDecoration: 'none',
                      color: theme.palette.primary.main,
                      fontWeight: 600,
                      '&:hover': {
                        textDecoration: 'underline'
                      }
                    }}
                  >
                    Regístrate aquí
                  </Link>
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Fade>
      </Container>

      {/* Snackbar para notificaciones */}
      <Snackbar
        open={showSnackbar}
        autoHideDuration={4000}
        onClose={() => setShowSnackbar(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setShowSnackbar(false)}
          severity={snackbarType}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ImprovedLogin;

