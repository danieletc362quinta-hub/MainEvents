import React from 'react';
import { Box, Button, Typography, Paper, Divider } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

const DebugPanel = () => {
  const { isAuthenticated, user, token, loading, clearSession } = useAuth();

  const handleClearSession = () => {
    clearSession();
    window.location.reload();
  };

  const handleClearLocalStorage = () => {
    localStorage.clear();
    window.location.reload();
  };

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <Paper sx={{ p: 2, m: 2, backgroundColor: '#f5f5f5' }}>
      <Typography variant="h6" gutterBottom>
        🐛 Debug Panel (Solo Desarrollo)
      </Typography>
      <Divider sx={{ mb: 2 }} />
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2">
          <strong>Estado de Autenticación:</strong> {isAuthenticated ? '✅ Autenticado' : '❌ No autenticado'}
        </Typography>
        <Typography variant="body2">
          <strong>Loading:</strong> {loading ? '⏳ Cargando...' : '✅ Listo'}
        </Typography>
        <Typography variant="body2">
          <strong>Token:</strong> {token ? '✅ Presente' : '❌ Ausente'}
        </Typography>
        <Typography variant="body2">
          <strong>Usuario:</strong> {user ? user.name || user.email : '❌ No hay usuario'}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button 
          variant="outlined" 
          size="small" 
          onClick={handleClearSession}
          color="warning"
        >
          Limpiar Sesión
        </Button>
        <Button 
          variant="outlined" 
          size="small" 
          onClick={handleClearLocalStorage}
          color="error"
        >
          Limpiar localStorage
        </Button>
        <Button 
          variant="outlined" 
          size="small" 
          onClick={() => window.location.reload()}
        >
          Recargar Página
        </Button>
      </Box>
    </Paper>
  );
};

export default DebugPanel; 
