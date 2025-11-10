import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Divider,
  Alert,
  CircularProgress,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Google as GoogleIcon,
  Facebook as FacebookIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/UnifiedLanguageContext';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Componente de Login Social
 * 
 * Props:
 * - onSuccess: Callback cuando el login es exitoso
 * - onError: Callback cuando hay un error
 * - variant: Variante del botón (contained, outlined, text)
 * - size: Tamaño del botón (small, medium, large)
 * - fullWidth: Si debe ocupar todo el ancho
 * - showDivider: Si mostrar divisor entre opciones
 */
const SocialLogin = ({
  onSuccess,
  onError,
  variant = 'contained',
  size = 'medium',
  fullWidth = false,
  showDivider = true,
  sx = {}
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { t } = useLanguage();
  const { login } = useAuth();
  
  const [loading, setLoading] = useState({ google: false, facebook: false });
  const [error, setError] = useState(null);

  // Configuración de Google OAuth
  const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
  const facebookAppId = process.env.REACT_APP_FACEBOOK_APP_ID;

  // Inicializar Google OAuth
  const initializeGoogle = () => {
    if (window.google) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  };

  // Inicializar Facebook SDK
  const initializeFacebook = () => {
    if (window.FB) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      window.fbAsyncInit = function() {
        window.FB.init({
          appId: facebookAppId,
          cookie: true,
          xfbml: true,
          version: 'v18.0'
        });
        resolve();
      };

      const script = document.createElement('script');
      script.src = 'https://connect.facebook.net/en_US/sdk.js';
      script.async = true;
      script.defer = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  };

  // Login con Google
  const handleGoogleLogin = async () => {
    try {
      setLoading(prev => ({ ...prev, google: true }));
      setError(null);

      await initializeGoogle();

      const response = await window.google.accounts.oauth2.initTokenClient({
        client_id: googleClientId,
        scope: 'email profile',
        callback: async (response) => {
          try {
            const result = await fetch('/api/social-auth/google', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              credentials: 'include',
              body: JSON.stringify({ idToken: response.access_token })
            });

            const data = await result.json();

            if (data.success) {
              // Actualizar contexto de autenticación
              login(data.user);
              onSuccess?.(data);
            } else {
              throw new Error(data.message);
            }
          } catch (error) {
            console.error('Google login error:', error);
            setError(error.message);
            onError?.(error);
          } finally {
            setLoading(prev => ({ ...prev, google: false }));
          }
        }
      });

      response.requestAccessToken();
    } catch (error) {
      console.error('Google initialization error:', error);
      setError('Error al inicializar Google OAuth');
      setLoading(prev => ({ ...prev, google: false }));
      onError?.(error);
    }
  };

  // Login con Facebook
  const handleFacebookLogin = async () => {
    try {
      setLoading(prev => ({ ...prev, facebook: true }));
      setError(null);

      await initializeFacebook();

      window.FB.login(async (response) => {
        try {
          if (response.authResponse) {
            const result = await fetch('/api/social-auth/facebook', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              credentials: 'include',
              body: JSON.stringify({ accessToken: response.authResponse.accessToken })
            });

            const data = await result.json();

            if (data.success) {
              // Actualizar contexto de autenticación
              login(data.user);
              onSuccess?.(data);
            } else {
              throw new Error(data.message);
            }
          } else {
            throw new Error('Facebook login cancelado');
          }
        } catch (error) {
          console.error('Facebook login error:', error);
          setError(error.message);
          onError?.(error);
        } finally {
          setLoading(prev => ({ ...prev, facebook: false }));
        }
      }, { scope: 'email,public_profile' });
    } catch (error) {
      console.error('Facebook initialization error:', error);
      setError('Error al inicializar Facebook SDK');
      setLoading(prev => ({ ...prev, facebook: false }));
      onError?.(error);
    }
  };

  const buttonStyles = {
    borderRadius: theme.spacing(2),
    textTransform: 'none',
    fontWeight: 600,
    letterSpacing: '0.5px',
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    ...sx
  };

  const googleButtonStyles = {
    ...buttonStyles,
    backgroundColor: '#4285f4',
    color: 'white',
    '&:hover': {
      backgroundColor: '#357ae8',
      boxShadow: theme.shadows[4]
    }
  };

  const facebookButtonStyles = {
    ...buttonStyles,
    backgroundColor: '#1877f2',
    color: 'white',
    '&:hover': {
      backgroundColor: '#166fe5',
      boxShadow: theme.shadows[4]
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Botón de Google */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{ width: fullWidth ? '100%' : 'auto' }}
        >
          <Button
            variant={variant}
            size={size}
            fullWidth={fullWidth}
            onClick={handleGoogleLogin}
            disabled={loading.google}
            startIcon={loading.google ? <CircularProgress size={20} color="inherit" /> : <GoogleIcon />}
            sx={googleButtonStyles}
          >
            {loading.google ? 'Conectando...' : 'Continuar con Google'}
          </Button>
        </motion.div>

        {/* Botón de Facebook */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{ width: fullWidth ? '100%' : 'auto' }}
        >
          <Button
            variant={variant}
            size={size}
            fullWidth={fullWidth}
            onClick={handleFacebookLogin}
            disabled={loading.facebook}
            startIcon={loading.facebook ? <CircularProgress size={20} color="inherit" /> : <FacebookIcon />}
            sx={facebookButtonStyles}
          >
            {loading.facebook ? 'Conectando...' : 'Continuar con Facebook'}
          </Button>
        </motion.div>
      </Box>

      {showDivider && (
        <Box sx={{ my: 3, display: 'flex', alignItems: 'center' }}>
          <Divider sx={{ flexGrow: 1 }} />
          <Typography
            variant="body2"
            sx={{
              mx: 2,
              color: theme.palette.text.secondary,
              fontWeight: 500
            }}
          >
            {t('auth.or')}
          </Typography>
          <Divider sx={{ flexGrow: 1 }} />
        </Box>
      )}
    </Box>
  );
};

export default SocialLogin;




