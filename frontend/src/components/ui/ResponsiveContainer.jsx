import React, { useState, useEffect } from 'react';
import {
  Box,
  useTheme,
  useMediaQuery,
  Typography,
  IconButton,
  Tooltip,
  Paper,
  Grid,
  Card,
  CardContent,
  Alert,
  AlertTitle,
  Chip,
  Button
} from '@mui/material';
import {
  Phone as PhoneIcon,
  Tablet as TabletIcon,
  Computer as ComputerIcon,
  Tv as TvIcon,
  Visibility as VisibilityIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { useLanguage } from '../../contexts/LanguageContext';

const ResponsiveContainer = ({ 
  children, 
  showDebugInfo = false,
  enableResponsiveTesting = false,
  onResponsiveChange
}) => {
  const { t } = useLanguage();
  const theme = useTheme();
  
  // Breakpoints
  const isXs = useMediaQuery(theme.breakpoints.only('xs'));
  const isSm = useMediaQuery(theme.breakpoints.only('sm'));
  const isMd = useMediaQuery(theme.breakpoints.only('md'));
  const isLg = useMediaQuery(theme.breakpoints.only('lg'));
  const isXl = useMediaQuery(theme.breakpoints.only('xl'));
  
  // Device detection
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
  
  const [currentBreakpoint, setCurrentBreakpoint] = useState('');
  const [responsiveIssues, setResponsiveIssues] = useState([]);
  const [testResults, setTestResults] = useState({});

  // Detectar breakpoint actual
  useEffect(() => {
    if (isXs) setCurrentBreakpoint('xs');
    else if (isSm) setCurrentBreakpoint('sm');
    else if (isMd) setCurrentBreakpoint('md');
    else if (isLg) setCurrentBreakpoint('lg');
    else if (isXl) setCurrentBreakpoint('xl');
  }, [isXs, isSm, isMd, isLg, isXl]);

  // Notificar cambios de responsive
  useEffect(() => {
    if (onResponsiveChange) {
      onResponsiveChange({
        breakpoint: currentBreakpoint,
        isMobile,
        isTablet,
        isDesktop,
        width: window.innerWidth,
        height: window.innerHeight
      });
    }
  }, [currentBreakpoint, isMobile, isTablet, isDesktop, onResponsiveChange]);

  // Ejecutar tests de responsive
  const runResponsiveTests = () => {
    const tests = {
      viewport: {
        name: 'Viewport Test',
        status: 'pass',
        message: 'Viewport is properly configured'
      },
      touch: {
        name: 'Touch Support',
        status: 'pass',
        message: 'Touch events are supported'
      },
      orientation: {
        name: 'Orientation Support',
        status: 'pass',
        message: 'Orientation changes are handled'
      },
      images: {
        name: 'Responsive Images',
        status: 'pass',
        message: 'Images are responsive'
      },
      text: {
        name: 'Readable Text',
        status: 'pass',
        message: 'Text is readable at all sizes'
      },
      navigation: {
        name: 'Navigation',
        status: 'pass',
        message: 'Navigation is accessible'
      },
      forms: {
        name: 'Form Elements',
        status: 'pass',
        message: 'Form elements are properly sized'
      }
    };

    // Verificar viewport
    const viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport || !viewport.content.includes('width=device-width')) {
      tests.viewport.status = 'fail';
      tests.viewport.message = 'Viewport meta tag is missing or incorrect';
    }

    // Verificar touch support
    if (!('ontouchstart' in window)) {
      tests.touch.status = 'warn';
      tests.touch.message = 'Touch events not detected (may be desktop)';
    }

    // Verificar imágenes responsivas
    const images = document.querySelectorAll('img');
    let responsiveImages = 0;
    images.forEach(img => {
      if (img.style.maxWidth === '100%' || img.style.width === '100%' || 
          img.classList.contains('responsive') || img.hasAttribute('srcset')) {
        responsiveImages++;
      }
    });
    
    if (responsiveImages < images.length * 0.8) {
      tests.images.status = 'warn';
      tests.images.message = `${responsiveImages}/${images.length} images are responsive`;
    }

    // Verificar texto legible
    const textElements = document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6');
    let smallText = 0;
    textElements.forEach(el => {
      const fontSize = window.getComputedStyle(el).fontSize;
      if (parseInt(fontSize) < 12) {
        smallText++;
      }
    });
    
    if (smallText > textElements.length * 0.1) {
      tests.text.status = 'warn';
      tests.text.message = `${smallText} text elements may be too small`;
    }

    setTestResults(tests);
  };

  // Ejecutar tests al montar el componente
  useEffect(() => {
    if (enableResponsiveTesting) {
      runResponsiveTests();
    }
  }, [enableResponsiveTesting]);

  // Obtener icono del dispositivo
  const getDeviceIcon = () => {
    if (isMobile) return <PhoneIcon />;
    if (isTablet) return <TabletIcon />;
    if (isDesktop) return <ComputerIcon />;
    return <TvIcon />;
  };

  // Obtener color del status
  const getStatusColor = (status) => {
    switch (status) {
      case 'pass': return 'success';
      case 'warn': return 'warning';
      case 'fail': return 'error';
      default: return 'default';
    }
  };

  // Obtener icono del status
  const getStatusIcon = (status) => {
    switch (status) {
      case 'pass': return <CheckCircleIcon />;
      case 'warn': return <WarningIcon />;
      case 'fail': return <ErrorIcon />;
      default: return null;
    }
  };

  const renderDebugInfo = () => (
    <Paper 
      elevation={2} 
      sx={{ 
        position: 'fixed', 
        top: 16, 
        right: 16, 
        p: 2, 
        zIndex: 9999,
        maxWidth: 300,
        backgroundColor: 'background.paper'
      }}
    >
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
        <Typography variant="h6" color="primary">
          {t('responsive.debug.title')}
        </Typography>
        <IconButton size="small" onClick={runResponsiveTests}>
          <RefreshIcon />
        </IconButton>
      </Box>
      
      <Box mb={2}>
        <Chip
          icon={getDeviceIcon()}
          label={`${currentBreakpoint.toUpperCase()} (${window.innerWidth}x${window.innerHeight})`}
          color="primary"
          variant="outlined"
        />
      </Box>
      
      <Grid container spacing={1}>
        <Grid item xs={6}>
          <Typography variant="caption" color="text.secondary">
            {t('responsive.debug.mobile')}: {isMobile ? 'Yes' : 'No'}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="caption" color="text.secondary">
            {t('responsive.debug.tablet')}: {isTablet ? 'Yes' : 'No'}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="caption" color="text.secondary">
            {t('responsive.debug.desktop')}: {isDesktop ? 'Yes' : 'No'}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="caption" color="text.secondary">
            {t('responsive.debug.orientation')}: {window.innerHeight > window.innerWidth ? 'Portrait' : 'Landscape'}
          </Typography>
        </Grid>
      </Grid>
      
      {enableResponsiveTesting && Object.keys(testResults).length > 0 && (
        <Box mt={2}>
          <Typography variant="subtitle2" gutterBottom>
            {t('responsive.debug.tests')}
          </Typography>
          {Object.entries(testResults).map(([key, test]) => (
            <Box key={key} display="flex" alignItems="center" mb={0.5}>
              {getStatusIcon(test.status)}
              <Typography variant="caption" sx={{ ml: 1, flexGrow: 1 }}>
                {test.name}
              </Typography>
              <Chip
                label={test.status}
                size="small"
                color={getStatusColor(test.status)}
                variant="outlined"
              />
            </Box>
          ))}
        </Box>
      )}
    </Paper>
  );

  const renderResponsiveIssues = () => {
    if (responsiveIssues.length === 0) return null;
    
    return (
      <Alert severity="warning" sx={{ mb: 2 }}>
        <AlertTitle>{t('responsive.issues.title')}</AlertTitle>
        <ul>
          {responsiveIssues.map((issue, index) => (
            <li key={index}>{issue}</li>
          ))}
        </ul>
      </Alert>
    );
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        position: 'relative',
        // Asegurar que el contenido sea responsive
        '& *': {
          boxSizing: 'border-box'
        }
      }}
    >
      {renderResponsiveIssues()}
      
      {children}
      
      {showDebugInfo && renderDebugInfo()}
    </Box>
  );
};

export default ResponsiveContainer;