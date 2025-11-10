import React, { useState } from 'react';
import {
  Box,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Typography,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery,
  Chip,
  Fade,
  Paper,
  ButtonGroup
} from '@mui/material';
import {
  Language as LanguageIcon,
  Check as CheckIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import { useTranslation } from '../../hooks/useTranslation';

const LanguageSelector = ({ variant = 'button', size = 'medium' }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { currentLanguage, changeLanguage, t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const availableLanguages = [
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'en', name: 'English', flag: '🇺🇸' }
  ];
  
  const currentLang = availableLanguages.find(lang => lang.code === currentLanguage) || availableLanguages[0];

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageChange = (langCode) => {
    changeLanguage(langCode);
    handleClose();
  };

  if (variant === 'simple') {
    return (
      <ButtonGroup size={size} variant="outlined" color="inherit">
        {availableLanguages.map((lang) => (
          <Button
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            variant={currentLanguage === lang.code ? 'contained' : 'outlined'}
            disabled={currentLanguage === lang.code}
            sx={{ minWidth: '60px' }}
          >
            {lang.code.toUpperCase()}
          </Button>
        ))}
      </ButtonGroup>
    );
  }

  if (variant === 'icon') {
    return (
      <>
        <Tooltip title={t('nav.language')}>
          <IconButton
            onClick={handleClick}
            size={size}
            sx={{
              color: 'inherit',
              '&:hover': {
                backgroundColor: theme.palette.action.hover,
              },
            }}
          >
            <LanguageIcon />
          </IconButton>
        </Tooltip>
        
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          TransitionComponent={Fade}
          PaperProps={{
            sx: {
              minWidth: 200,
              borderRadius: 2,
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              border: '1px solid rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              background: 'rgba(255,255,255,0.9)',
            }
          }}
        >
          {availableLanguages.map((lang) => (
            <MenuItem
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              selected={currentLanguage === lang.code}
              sx={{
                py: 1.5,
                px: 2,
                '&:hover': {
                  backgroundColor: theme.palette.primary.main + '10',
                },
                '&.Mui-selected': {
                  backgroundColor: theme.palette.action.selected,
                  '&:hover': {
                    backgroundColor: theme.palette.action.hover,
                  },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <Typography variant="h6">{lang.flag}</Typography>
              </ListItemIcon>
              <ListItemText primary={lang.name} />
              {currentLanguage === lang.code && (
                <CheckIcon sx={{ color: theme.palette.primary.main, ml: 1 }} />
              )}
            </MenuItem>
          ))}
        </Menu>
      </>
    );
  }

  if (variant === 'chip') {
    return (
      <Chip
        icon={<LanguageIcon />}
        label={currentLanguage?.name || 'Idioma'}
        onClick={handleClick}
        variant="outlined"
        sx={{
          cursor: 'pointer',
          '&:hover': {
            backgroundColor: theme.palette.primary.main + '10',
            borderColor: theme.palette.primary.main,
          },
        }}
      />
    );
  }

  // Variant 'button' (default)
  return (
    <>
      <Button
        onClick={handleClick}
        startIcon={<LanguageIcon />}
        endIcon={<ExpandMoreIcon />}
        variant="outlined"
        size={size}
        sx={{
          borderRadius: 2,
          textTransform: 'none',
          fontWeight: 500,
          minWidth: isMobile ? 'auto' : 140,
          px: isMobile ? 1 : 2,
          py: isMobile ? 0.5 : 1,
          borderColor: theme.palette.divider,
          color: theme.palette.text.primary,
          '&:hover': {
            borderColor: theme.palette.primary.main,
            backgroundColor: theme.palette.primary.main + '05',
          },
        }}
      >
        {isMobile ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography variant="h6">{currentLanguage?.flag}</Typography>
          </Box>
        ) : (
          currentLanguage?.name || 'Idioma'
        )}
      </Button>
      
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          style: {
            marginTop: theme.spacing(1),
            minWidth: 180,
          },
        }}
        TransitionComponent={Fade}
        keepMounted
      >
        <Box sx={{ px: 2, py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600 }}>
            {t('settings.language')}
          </Typography>
        </Box>
        
        {availableLanguages.map((lang) => (
          <MenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            selected={currentLanguage === lang.code}
            sx={{
              '&.Mui-selected': {
                backgroundColor: theme.palette.action.selected,
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <Typography variant="h6">{lang.flag}</Typography>
            </ListItemIcon>
            <ListItemText
              primary={lang.name}
              primaryTypographyProps={{
                fontWeight: lang.code === language ? 600 : 400,
              }}
            />
            {lang.code === language && (
              <CheckIcon sx={{ color: theme.palette.primary.main, ml: 1 }} />
            )}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default LanguageSelector;
