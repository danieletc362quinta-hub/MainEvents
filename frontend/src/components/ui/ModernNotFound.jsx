import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Home as HomeIcon,
  ArrowBack as ArrowBackIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const ModernNotFound = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background Pattern */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          opacity: 0.3
        }}
      />

      <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ textAlign: 'center' }}>
          {/* 404 Number */}
          <Typography
            variant={isMobile ? 'h1' : 'h1'}
            sx={{
              fontSize: { xs: '8rem', sm: '12rem' },
              fontWeight: 900,
              background: 'linear-gradient(45deg, #fff, #e3f2fd)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 30px rgba(255,255,255,0.5)',
              mb: 2,
              lineHeight: 1
            }}
          >
            404
          </Typography>

          {/* Error Message */}
          <Typography
            variant={isMobile ? 'h4' : 'h3'}
            sx={{
              fontWeight: 700,
              color: 'white',
              mb: 2,
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
            }}
          >
            ¡Ups! Página no encontrada
          </Typography>

          <Typography
            variant="h6"
            sx={{
              color: 'rgba(255,255,255,0.9)',
              mb: 4,
              maxWidth: '600px',
              mx: 'auto',
              lineHeight: 1.6
            }}
          >
            La página que estás buscando no existe o ha sido movida. 
            No te preocupes, te ayudamos a encontrar lo que necesitas.
          </Typography>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<HomeIcon />}
              onClick={() => navigate('/')}
              sx={{
                background: 'linear-gradient(45deg, #ff6b6b 0%, #ee5a24 100%)',
                borderRadius: 3,
                px: 4,
                py: 1.5,
                fontWeight: 600,
                fontSize: '1.1rem',
                textTransform: 'none',
                boxShadow: '0 8px 24px rgba(255, 107, 107, 0.4)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #ff5252 0%, #e74c3c 100%)',
                  boxShadow: '0 12px 32px rgba(255, 107, 107, 0.6)',
                  transform: 'translateY(-2px)'
                }
              }}
            >
              Ir al Inicio
            </Button>

            <Button
              variant="outlined"
              size="large"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate(-1)}
              sx={{
                borderColor: 'rgba(255,255,255,0.5)',
                color: 'white',
                borderRadius: 3,
                px: 4,
                py: 1.5,
                fontWeight: 600,
                fontSize: '1.1rem',
                textTransform: 'none',
                backdropFilter: 'blur(10px)',
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  transform: 'translateY(-2px)'
                }
              }}
            >
              Volver Atrás
            </Button>

            <Button
              variant="outlined"
              size="large"
              startIcon={<SearchIcon />}
              onClick={() => navigate('/events')}
              sx={{
                borderColor: 'rgba(255,255,255,0.5)',
                color: 'white',
                borderRadius: 3,
                px: 4,
                py: 1.5,
                fontWeight: 600,
                fontSize: '1.1rem',
                textTransform: 'none',
                backdropFilter: 'blur(10px)',
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  transform: 'translateY(-2px)'
                }
              }}
            >
              Buscar Eventos
            </Button>
          </Box>

          {/* Help Text */}
          <Typography
            variant="body2"
            sx={{
              color: 'rgba(255,255,255,0.7)',
              mt: 4,
              maxWidth: '400px',
              mx: 'auto'
            }}
          >
            Si crees que esto es un error, por favor contacta con nuestro equipo de soporte.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default ModernNotFound;
