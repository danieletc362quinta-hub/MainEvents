import React from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
  Paper,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Home as HomeIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Paper
        elevation={3}
        sx={{
          p: isMobile ? 4 : 6,
          textAlign: 'center',
          borderRadius: 3,
          background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
          color: 'white',
        }}
      >
        <ErrorIcon
          sx={{
            fontSize: isMobile ? 80 : 120,
            mb: 3,
            opacity: 0.9,
          }}
        />
        
        <Typography
          variant={isMobile ? "h3" : "h2"}
          component="h1"
          gutterBottom
          sx={{
            fontWeight: 'bold',
            mb: 2,
          }}
        >
          404
        </Typography>
        
        <Typography
          variant={isMobile ? "h5" : "h4"}
          component="h2"
          gutterBottom
          sx={{
            mb: 3,
            opacity: 0.9,
          }}
        >
          Página No Encontrada
        </Typography>
        
        <Typography
          variant="body1"
          sx={{
            mb: 4,
            opacity: 0.8,
            maxWidth: 500,
            mx: 'auto',
          }}
        >
          Lo sentimos, la página que buscas no existe o ha sido movida.
          Puedes volver al inicio o explorar nuestros eventos.
        </Typography>
        
        <Box
          sx={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            gap: 2,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Button
            variant="contained"
            size="large"
            startIcon={<HomeIcon />}
            onClick={() => navigate('/')}
            sx={{
              bgcolor: 'white',
              color: 'primary.main',
              '&:hover': {
                bgcolor: 'grey.100',
              },
              px: 4,
              py: 1.5,
            }}
          >
            Ir al Inicio
          </Button>
          
          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate('/events')}
            sx={{
              borderColor: 'white',
              color: 'white',
              '&:hover': {
                borderColor: 'white',
                bgcolor: 'rgba(255, 255, 255, 0.1)',
              },
              px: 4,
              py: 1.5,
            }}
          >
            Ver Eventos
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default NotFound; 
