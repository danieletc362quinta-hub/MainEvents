import React from 'react';
import { 
  Button, 
  IconButton,
  Box,
  useTheme, 
  useMediaQuery 
} from '@mui/material';

const ResponsiveButton = ({ 
  children, 
  icon,
  fullWidth = false,
  size = 'medium',
  variant = 'contained',
  color = 'primary',
  ...props 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Si es móvil y tiene icono, mostrar solo el icono
  if (isMobile && icon && !children) {
    return (
      <IconButton
        color={color}
        size={size}
        sx={{
          [theme.breakpoints.down('sm')]: {
            padding: theme.spacing(1),
          }
        }}
        {...props}
      >
        {icon}
      </IconButton>
    );
  }

  return (
    <Button
      variant={variant}
      color={color}
      size={isMobile ? 'small' : size}
      fullWidth={fullWidth}
      startIcon={!isMobile ? icon : undefined}
      sx={{
        [theme.breakpoints.down('sm')]: {
          minHeight: 36,
          fontSize: '0.875rem',
          padding: theme.spacing(1, 2),
        },
        [theme.breakpoints.down('md')]: {
          minHeight: 40,
        },
        ...props.sx
      }}
      {...props}
    >
      {isMobile && icon ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {icon}
          {children}
        </Box>
      ) : (
        children
      )}
    </Button>
  );
};

export default ResponsiveButton;
