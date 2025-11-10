import React, { useState } from 'react';
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
  CircularProgress
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Google as GoogleIcon,
  Facebook as FacebookIcon,
  Apple as AppleIcon
} from '@mui/icons-material';
import { useLanguage } from '../../contexts/UnifiedLanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import ErrorAlert from './ErrorAlert';

const ModernLogin = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { t } = useLanguage();
  const { login, loading: authLoading, error: authError } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      console.log('Enviando datos de login:', formData);
      await login(formData);
      navigate('/dashboard');
    } catch (err) {
      console.error('Error en login:', err);
      const errorMessage = err.message || err.details || 'Error al iniciar sesión. Inténtalo de nuevo.';
      setError(errorMessage);
    }
  };

  const handleSocialLogin = (provider) => {
    console.log(`Login with ${provider}`);
    // Implementar login social
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        py: 4
      }}
    >
      <Container maxWidth="sm">
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
              MainEvents
            </Typography>
            <Typography variant="h6" sx={{ color: theme.palette.grey[600], fontWeight: 400 }}>
              Inicia sesión en tu cuenta
            </Typography>
          </Box>

          {/* Error Alert */}
          <ErrorAlert 
            error={error || authError}
            title="Error al iniciar sesión"
            showDetails={true}
            onClose={() => setError('')}
            onRetry={() => {
              setError('');
              // Reintentar login
            }}
          />

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit} sx={{ mb: 3 }}>
            <TextField
              fullWidth
              label="Correo electrónico"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon sx={{ color: theme.palette.grey[500] }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: 'white'
                }
              }}
            />

            <TextField
              fullWidth
              label="Contraseña"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: theme.palette.grey[500] }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: 'white'
                }
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={authLoading}
              sx={{
                py: 1.5,
                borderRadius: 2,
                fontWeight: 600,
                fontSize: '1.1rem',
                background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
                boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #5a6fd8 0%, #6a4190 100%)',
                  boxShadow: '0 12px 32px rgba(102, 126, 234, 0.6)',
                  transform: 'translateY(-2px)'
                },
                '&:disabled': {
                  background: theme.palette.grey[300],
                  color: theme.palette.grey[500]
                }
              }}
            >
              {authLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Iniciar Sesión'
              )}
            </Button>
          </Box>

          {/* Forgot Password */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Link
              href="#"
              sx={{
                color: theme.palette.primary.main,
                textDecoration: 'none',
                fontWeight: 500,
                '&:hover': {
                  textDecoration: 'underline'
                }
              }}
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </Box>

          {/* Divider */}
          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" sx={{ color: theme.palette.grey[500] }}>
              O continúa con
            </Typography>
          </Divider>

          {/* Social Login */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<GoogleIcon />}
              onClick={() => handleSocialLogin('google')}
              sx={{
                borderRadius: 2,
                py: 1.5,
                borderColor: theme.palette.grey[300],
                color: theme.palette.grey[700],
                '&:hover': {
                  borderColor: theme.palette.error.main,
                  color: theme.palette.error.main,
                  backgroundColor: theme.palette.error.light + '10'
                }
              }}
            >
              Google
            </Button>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FacebookIcon />}
              onClick={() => handleSocialLogin('facebook')}
              sx={{
                borderRadius: 2,
                py: 1.5,
                borderColor: theme.palette.grey[300],
                color: theme.palette.grey[700],
                '&:hover': {
                  borderColor: '#1877f2',
                  color: '#1877f2',
                  backgroundColor: '#1877f210'
                }
              }}
            >
              Facebook
            </Button>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<AppleIcon />}
              onClick={() => handleSocialLogin('apple')}
              sx={{
                borderRadius: 2,
                py: 1.5,
                borderColor: theme.palette.grey[300],
                color: theme.palette.grey[700],
                '&:hover': {
                  borderColor: '#000',
                  color: '#000',
                  backgroundColor: '#00010'
                }
              }}
            >
              Apple
            </Button>
          </Box>

          {/* Sign Up Link */}
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: theme.palette.grey[600] }}>
              ¿No tienes una cuenta?{' '}
              <Link
                href="/register"
                sx={{
                  color: theme.palette.primary.main,
                  textDecoration: 'none',
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
        </Paper>
      </Container>
    </Box>
  );
};

export default ModernLogin;
