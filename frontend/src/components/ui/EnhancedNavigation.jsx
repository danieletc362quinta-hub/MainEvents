import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Badge,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  useTheme,
  useMediaQuery,
  Tooltip
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  Event as EventIcon,
  Add as AddIcon,
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  Help as HelpIcon,
  Language as LanguageIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useLanguage } from '../../contexts/LanguageContext';
import { useHelpSystem } from '../../hooks/useHelpSystem';
import HelpSystem from './HelpSystem';
import LanguageSelector from './LanguageSelector';

const EnhancedNavigation = ({ 
  currentPath = '/',
  onNavigate,
  showHelp = true,
  showNotifications = true,
  notificationCount = 0
}) => {
  const { t } = useLanguage();
  const { openHelp, helpOpen, closeHelp, getTooltip } = useHelpSystem();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [languageMenuAnchor, setLanguageMenuAnchor] = useState(null);

  const navigationItems = [
    { key: 'home', label: t('navigation.home'), icon: <HomeIcon />, path: '/' },
    { key: 'events', label: t('navigation.events'), icon: <EventIcon />, path: '/events' },
    { key: 'createEvent', label: t('navigation.createEvent'), icon: <AddIcon />, path: '/create-event' },
    { key: 'dashboard', label: t('navigation.dashboard'), icon: <DashboardIcon />, path: '/dashboard' },
    { key: 'profile', label: t('navigation.profile'), icon: <PersonIcon />, path: '/profile' }
  ];

  const handleNavigation = (path) => {
    if (onNavigate) {
      onNavigate(path);
    }
    setMobileMenuOpen(false);
  };

  const handleHelpClick = () => {
    openHelp(0);
  };

  const handleLanguageClick = (event) => {
    setLanguageMenuAnchor(event.currentTarget);
  };

  const handleLanguageClose = () => {
    setLanguageMenuAnchor(null);
  };

  const renderDesktopNavigation = () => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {navigationItems.map((item) => (
        <Tooltip key={item.key} title={getTooltip(`nav.${item.key}`, item.label)}>
          <Button
            color="inherit"
            startIcon={item.icon}
            onClick={() => handleNavigation(item.path)}
            sx={{
              ...(currentPath === item.path && {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                }
              })
            }}
          >
            {item.label}
          </Button>
        </Tooltip>
      ))}
    </Box>
  );

  const renderMobileNavigation = () => (
    <Drawer
      anchor="left"
      open={mobileMenuOpen}
      onClose={() => setMobileMenuOpen(false)}
      sx={{
        '& .MuiDrawer-paper': {
          width: 280,
        },
      }}
    >
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6">{t('navigation.title')}</Typography>
        <IconButton onClick={() => setMobileMenuOpen(false)}>
          <CloseIcon />
        </IconButton>
      </Box>
      
      <Divider />
      
      <List>
        {navigationItems.map((item) => (
          <ListItem
            key={item.key}
            button
            onClick={() => handleNavigation(item.path)}
            selected={currentPath === item.path}
            sx={{
              '&.Mui-selected': {
                backgroundColor: 'primary.light',
                '&:hover': {
                  backgroundColor: 'primary.main',
                }
              }
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItem>
        ))}
      </List>
      
      <Divider />
      
      <List>
        <ListItem button onClick={handleHelpClick}>
          <ListItemIcon>
            <HelpIcon />
          </ListItemIcon>
          <ListItemText primary={t('help.title')} />
        </ListItem>
        
        <ListItem button onClick={handleLanguageClick}>
          <ListItemIcon>
            <LanguageIcon />
          </ListItemIcon>
          <ListItemText primary={t('navigation.language')} />
        </ListItem>
      </List>
    </Drawer>
  );

  const renderActionButtons = () => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {showNotifications && (
        <Tooltip title={t('navigation.notifications')}>
          <IconButton color="inherit">
            <Badge badgeContent={notificationCount} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
        </Tooltip>
      )}
      
      {showHelp && (
        <Tooltip title={getTooltip('nav.help', t('help.title'))}>
          <IconButton color="inherit" onClick={handleHelpClick}>
            <HelpIcon />
          </IconButton>
        </Tooltip>
      )}
      
      <Tooltip title={getTooltip('nav.language', t('navigation.language'))}>
        <IconButton color="inherit" onClick={handleLanguageClick}>
          <LanguageIcon />
        </IconButton>
      </Tooltip>
      
      {isMobile && (
        <Tooltip title={getTooltip('nav.menu', t('navigation.menu'))}>
          <IconButton color="inherit" onClick={() => setMobileMenuOpen(true)}>
            <MenuIcon />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );

  return (
    <>
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {t('navigation.title')}
          </Typography>
          
          {!isMobile && renderDesktopNavigation()}
          {renderActionButtons()}
        </Toolbar>
      </AppBar>
      
      {isMobile && renderMobileNavigation()}
      
      <Menu
        anchorEl={languageMenuAnchor}
        open={Boolean(languageMenuAnchor)}
        onClose={handleLanguageClose}
      >
        <LanguageSelector onClose={handleLanguageClose} />
      </Menu>
      
      <HelpSystem
        open={helpOpen}
        onClose={closeHelp}
        initialTab={0}
      />
    </>
  );
};

export default EnhancedNavigation;