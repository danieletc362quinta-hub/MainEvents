import React from 'react';
import {
  Alert,
  AlertTitle,
  Box,
  Typography,
  Button,
  Collapse
} from '@mui/material';
import {
  Error as ErrorIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

const ErrorAlert = ({ 
  error, 
  onClose, 
  onRetry, 
  showDetails = false,
  title = "Error",
  variant = "error"
}) => {
  if (!error) return null;

  const [showFullError, setShowFullError] = React.useState(false);

  const handleToggleDetails = () => {
    setShowFullError(!showFullError);
  };

  const getErrorIcon = () => {
    switch (variant) {
      case 'warning':
        return <ErrorIcon color="warning" />;
      case 'info':
        return <ErrorIcon color="info" />;
      default:
        return <ErrorIcon color="error" />;
    }
  };

  return (
    <Alert 
      severity={variant}
      icon={getErrorIcon()}
      sx={{ 
        mb: 3, 
        borderRadius: 2,
        '& .MuiAlert-message': {
          width: '100%'
        }
      }}
      action={
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          {onRetry && (
            <Button
              size="small"
              startIcon={<RefreshIcon />}
              onClick={onRetry}
              sx={{ 
                color: 'inherit',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)'
                }
              }}
            >
              Reintentar
            </Button>
          )}
          {onClose && (
            <Button
              size="small"
              startIcon={<CloseIcon />}
              onClick={onClose}
              sx={{ 
                color: 'inherit',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)'
                }
              }}
            >
              Cerrar
            </Button>
          )}
        </Box>
      }
    >
      <AlertTitle sx={{ fontWeight: 600 }}>
        {title}
      </AlertTitle>
      
      <Typography variant="body2" sx={{ mb: 1 }}>
        {typeof error === 'string' ? error : error.message || 'Ha ocurrido un error'}
      </Typography>

      {showDetails && error.details && (
        <Box>
          <Button
            size="small"
            onClick={handleToggleDetails}
            sx={{ 
              textTransform: 'none',
              color: 'inherit',
              textDecoration: 'underline',
              p: 0,
              minWidth: 'auto'
            }}
          >
            {showFullError ? 'Ocultar detalles' : 'Ver detalles'}
          </Button>
          
          <Collapse in={showFullError}>
            <Box sx={{ mt: 1, p: 2, backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 1 }}>
              <Typography variant="caption" component="pre" sx={{ 
                fontFamily: 'monospace',
                fontSize: '0.75rem',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}>
                {JSON.stringify(error, null, 2)}
              </Typography>
            </Box>
          </Collapse>
        </Box>
      )}

      {error.status && (
        <Typography variant="caption" sx={{ 
          display: 'block', 
          mt: 1, 
          opacity: 0.8,
          fontStyle: 'italic'
        }}>
          Código de error: {error.status}
        </Typography>
      )}
    </Alert>
  );
};

export default ErrorAlert;
