import React from 'react';
import { Box, Typography, Button, Paper, Container } from '@mui/material';
import { Error as ErrorIcon } from '@mui/icons-material';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary: Error capturado:', error);
    console.error('ErrorBoundary: Error info:', errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <Container maxWidth="md" sx={{ py: 8 }}>
          <Paper
            elevation={3}
            sx={{
              p: 4,
              textAlign: 'center',
              borderRadius: 3,
              background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
              color: 'white',
            }}
          >
            <ErrorIcon sx={{ fontSize: 80, mb: 3, opacity: 0.9 }} />
            
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
              Algo salió mal
            </Typography>
            
            <Typography variant="body1" sx={{ mb: 4, opacity: 0.9 }}>
              Ha ocurrido un error inesperado. Por favor, intenta recargar la página.
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => window.location.reload()}
                sx={{
                  bgcolor: 'white',
                  color: 'error.main',
                  '&:hover': {
                    bgcolor: 'grey.100',
                  },
                  px: 4,
                  py: 1.5,
                }}
              >
                Recargar Página
              </Button>
              
              <Button
                variant="outlined"
                size="large"
                onClick={() => window.location.href = '/'}
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
                Ir al Inicio
              </Button>
            </Box>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <Box sx={{ mt: 4, p: 2, bgcolor: 'rgba(0,0,0,0.1)', borderRadius: 2, textAlign: 'left' }}>
                <Typography variant="h6" gutterBottom>
                  Información de Debug (Solo desarrollo):
                </Typography>
                <Typography variant="body2" component="pre" sx={{ 
                  whiteSpace: 'pre-wrap', 
                  fontSize: '0.8rem',
                  overflow: 'auto',
                  maxHeight: '200px'
                }}>
                  {this.state.error.toString()}
                </Typography>
              </Box>
            )}
          </Paper>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 
