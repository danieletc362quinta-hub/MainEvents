import React, { useState } from 'react';
import {
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Snackbar,
  Alert,
  useTheme,
  useMediaQuery,
  Tooltip
} from '@mui/material';
import {
  Share as ShareIcon,
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  WhatsApp as WhatsAppIcon,
  LinkedIn as LinkedInIcon,
  Telegram as TelegramIcon,
  Email as EmailIcon,
  Link as LinkIcon,
  ContentCopy as CopyIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/UnifiedLanguageContext';

/**
 * Componente para compartir eventos en redes sociales
 * 
 * Props:
 * - event: Objeto del evento a compartir
 * - variant: Variante del botón (button, icon, menu)
 * - size: Tamaño del componente
 * - showText: Si mostrar texto en los botones
 * - platforms: Array de plataformas a mostrar
 */
const SocialShare = ({
  event,
  variant = 'button',
  size = 'medium',
  showText = true,
  platforms = ['facebook', 'twitter', 'whatsapp', 'linkedin', 'telegram', 'email', 'copy'],
  sx = {}
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { t } = useLanguage();
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Generar URL del evento
  const eventUrl = `${window.location.origin}/events/${event._id}`;
  
  // Generar texto para compartir
  const shareText = `${event.name} - ${event.description?.substring(0, 100)}...`;
  
  // Generar hashtags
  const hashtags = event.category ? `#${event.category.replace(/\s+/g, '')}` : '#Evento';

  // Configuración de plataformas
  const platformConfig = {
    facebook: {
      name: 'Facebook',
      icon: <FacebookIcon />,
      color: '#1877f2',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(eventUrl)}&quote=${encodeURIComponent(shareText)}`
    },
    twitter: {
      name: 'Twitter',
      icon: <TwitterIcon />,
      color: '#1da1f2',
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(eventUrl)}&hashtags=${hashtags}`
    },
    whatsapp: {
      name: 'WhatsApp',
      icon: <WhatsAppIcon />,
      color: '#25d366',
      url: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${eventUrl}`)}`
    },
    linkedin: {
      name: 'LinkedIn',
      icon: <LinkedInIcon />,
      color: '#0077b5',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(eventUrl)}&title=${encodeURIComponent(event.name)}&summary=${encodeURIComponent(event.description?.substring(0, 200) || '')}`
    },
    telegram: {
      name: 'Telegram',
      icon: <TelegramIcon />,
      color: '#0088cc',
      url: `https://t.me/share/url?url=${encodeURIComponent(eventUrl)}&text=${encodeURIComponent(shareText)}`
    },
    email: {
      name: 'Email',
      icon: <EmailIcon />,
      color: '#ea4335',
      url: `mailto:?subject=${encodeURIComponent(event.name)}&body=${encodeURIComponent(`${shareText}\n\n${eventUrl}`)}`
    },
    copy: {
      name: 'Copiar enlace',
      icon: <CopyIcon />,
      color: '#6c757d',
      action: 'copy'
    }
  };

  // Manejar apertura del menú
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Manejar cierre del menú
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Compartir en plataforma
  const handleShare = async (platform) => {
    const config = platformConfig[platform];
    
    if (!config) return;

    try {
      if (config.action === 'copy') {
        // Copiar al portapapeles
        await navigator.clipboard.writeText(eventUrl);
        setSnackbar({
          open: true,
          message: 'Enlace copiado al portapapeles',
          severity: 'success'
        });
      } else {
        // Abrir ventana de compartir
        const shareWindow = window.open(
          config.url,
          'share',
          'width=600,height=400,scrollbars=yes,resizable=yes'
        );
        
        if (shareWindow) {
          setSnackbar({
            open: true,
            message: `Compartiendo en ${config.name}...`,
            severity: 'info'
          });
        }
      }
    } catch (error) {
      console.error('Error sharing:', error);
      setSnackbar({
        open: true,
        message: 'Error al compartir',
        severity: 'error'
      });
    }
    
    handleMenuClose();
  };

  // Cerrar snackbar
  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Renderizar botón principal
  const renderButton = () => {
    const buttonProps = {
      size,
      onClick: handleMenuOpen,
      sx: {
        borderRadius: theme.spacing(2),
        textTransform: 'none',
        fontWeight: 600,
        ...sx
      }
    };

    if (variant === 'icon') {
      return (
        <Tooltip title="Compartir evento">
          <IconButton {...buttonProps}>
            <ShareIcon />
          </IconButton>
        </Tooltip>
      );
    }

    return (
      <Button
        variant="outlined"
        startIcon={<ShareIcon />}
        {...buttonProps}
      >
        {showText && 'Compartir'}
      </Button>
    );
  };

  // Renderizar menú de opciones
  const renderMenu = () => (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={handleMenuClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
      sx={{
        '& .MuiPaper-root': {
          borderRadius: 2,
          minWidth: 200,
          boxShadow: theme.shadows[8]
        }
      }}
    >
      {platforms.map((platform) => {
        const config = platformConfig[platform];
        if (!config) return null;

        return (
          <MenuItem
            key={platform}
            onClick={() => handleShare(platform)}
            sx={{
              py: 1.5,
              px: 2,
              '&:hover': {
                backgroundColor: theme.palette.action.hover,
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: config.color }}>
              {config.icon}
            </ListItemIcon>
            <ListItemText 
              primary={config.name}
              sx={{ 
                '& .MuiListItemText-primary': { 
                  fontWeight: 500 
                } 
              }}
            />
          </MenuItem>
        );
      })}
    </Menu>
  );

  // Renderizar botones individuales (para desktop)
  const renderIndividualButtons = () => (
    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
      {platforms.map((platform) => {
        const config = platformConfig[platform];
        if (!config) return null;

        return (
          <motion.div
            key={platform}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Tooltip title={`Compartir en ${config.name}`}>
              <IconButton
                size={size}
                onClick={() => handleShare(platform)}
                sx={{
                  color: config.color,
                  '&:hover': {
                    backgroundColor: `${config.color}20`,
                  },
                  ...sx
                }}
              >
                {config.icon}
              </IconButton>
            </Tooltip>
          </motion.div>
        );
      })}
    </Box>
  );

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {isMobile || variant === 'menu' ? (
          <>
            {renderButton()}
            {renderMenu()}
          </>
        ) : (
          renderIndividualButtons()
        )}
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default SocialShare;




