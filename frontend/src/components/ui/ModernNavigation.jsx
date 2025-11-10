import React, { useState, useRef, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  Avatar,
  Box,
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Button
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  Event as EventIcon,
  Add as AddIcon,
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  Payment as PaymentIcon,
  LocalOffer as CouponIcon,
  Notifications as NotificationIcon,
  Close as CloseIcon,
  Login as LoginIcon,
  Logout as LogoutIcon,
  HelpOutline as HelpIcon
} from '@mui/icons-material';
import { useLanguage } from '../../contexts/UnifiedLanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import LanguageSelector from './LanguageSelector';

const ModernNavigation = ({ onNavigate, currentPage }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'Nuevo evento creado', read: false, date: 'Hace 5 minutos' },
    { id: 2, message: 'Pago recibido', read: false, date: 'Hace 1 hora' },
    { id: 3, message: 'Evento actualizado', read: true, date: 'Ayer' },
  ]);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const notificationsRef = useRef(null);

  // Close notifications when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotificationsClick = () => {
    setNotificationsOpen(!notificationsOpen);
    // Mark all as read when opening
    if (!notificationsOpen) {
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    }
  };

  const { t } = useLanguage();
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const navigationItems = [
    { key: 'home', icon: <HomeIcon />, label: t('navigation.home') },
    { key: 'events', icon: <EventIcon />, label: t('navigation.events') },
    { key: 'create', icon: <AddIcon />, label: t('navigation.createEvent') },
    { key: 'dashboard', icon: <DashboardIcon />, label: t('navigation.dashboard') },
    { key: 'profile', icon: <PersonIcon />, label: t('navigation.profile') },
    { key: 'payments', icon: <PaymentIcon />, label: t('navigation.payments') },
    { key: 'coupons', icon: <CouponIcon />, label: t('navigation.coupons') },
    { key: 'help', icon: <HelpIcon />, label: 'Ayuda' }
  ];

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleNavigation = (key) => {
    // Navegar usando React Router
    const routes = {
      'home': '/',
      'events': '/events',
      'create': '/create-event',
      'dashboard': '/dashboard',
      'help': '/help',
      'profile': '/profile',
      'payments': '/payments',
      'coupons': '/coupons',
      'login': '/login'
    };
    
    if (routes[key]) {
      navigate(routes[key]);
    }
    
    if (isMobile) {
      setDrawerOpen(false);
    }
  };

  const NavigationContent = () => (
    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
      {/* Logo */}
      <Typography
        variant="h5"
        component="div"
        sx={{
          fontWeight: 800,
          background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          mr: 4,
          cursor: 'pointer',
          '&:hover': {
            transform: 'scale(1.05)',
            transition: 'transform 0.2s ease-in-out'
          }
        }}
        onClick={() => handleNavigation('home')}
      >
        MainEvents
      </Typography>

      {/* Navigation Items - Desktop */}
      {!isMobile && (
        <Box sx={{ display: 'flex', gap: 1, flexGrow: 1 }}>
          {navigationItems.map((item) => (
            <IconButton
              key={item.key}
              onClick={() => handleNavigation(item.key)}
              sx={{
                color: currentPage === item.key ? theme.palette.primary.main : theme.palette.grey[600],
                backgroundColor: currentPage === item.key ? theme.palette.primary.light + '20' : 'transparent',
                borderRadius: 2,
                px: 2,
                py: 1,
                '&:hover': {
                  backgroundColor: theme.palette.primary.light + '30',
                  color: theme.palette.primary.main,
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {item.icon}
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {item.label}
                </Typography>
              </Box>
            </IconButton>
          ))}
        </Box>
      )}

      {/* Right Side Actions */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 'auto' }}>
        {/* Language Selector */}
        <LanguageSelector variant="chip" size="small" />
        
        {/* Notifications */}
        <Box sx={{ position: 'relative' }} ref={notificationsRef}>
          <IconButton
            onClick={handleNotificationsClick}
            sx={{
              color: notificationsOpen ? theme.palette.primary.main : theme.palette.grey[600],
              backgroundColor: notificationsOpen ? theme.palette.primary.light + '20' : 'transparent',
              '&:hover': {
                color: theme.palette.primary.main,
                backgroundColor: theme.palette.primary.light + '20'
              }
            }}
          >
            <Badge badgeContent={unreadCount} color="error">
              <NotificationIcon />
            </Badge>
          </IconButton>
          
          {/* Notifications Popup */}
          {notificationsOpen && (
            <Box
              sx={{
                position: 'absolute',
                right: 0,
                top: '100%',
                width: 320,
                maxHeight: 400,
                bgcolor: 'background.paper',
                boxShadow: 3,
                borderRadius: 2,
                mt: 1,
                overflow: 'hidden',
                zIndex: 1200,
                border: `1px solid ${theme.palette.divider}`
              }}
            >
              <Box 
                sx={{ 
                  p: 2, 
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <Typography variant="subtitle1" fontWeight="bold">
                  Notificaciones
                </Typography>
                <Typography 
                  variant="caption" 
                  color="primary"
                  sx={{ cursor: 'pointer' }}
                  onClick={() => setNotifications([])}
                >
                  Limpiar todo
                </Typography>
              </Box>
              <Box sx={{ overflowY: 'auto', maxHeight: 350 }}>
                {notifications.length === 0 ? (
                  <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      No hay notificaciones
                    </Typography>
                  </Box>
                ) : (
                  notifications.map((notification) => (
                    <Box 
                      key={notification.id}
                      sx={{
                        p: 2,
                        borderBottom: `1px solid ${theme.palette.divider}`,
                        bgcolor: notification.read ? 'background.paper' : 'action.hover',
                        '&:hover': {
                          bgcolor: 'action.hover'
                        },
                        cursor: 'pointer',
                        transition: 'background-color 0.2s'
                      }}
                    >
                      <Typography variant="body2">
                        {notification.message}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {notification.date}
                      </Typography>
                    </Box>
                  ))
                )}
              </Box>
            </Box>
          )}
        </Box>

        {/* Auth Button */}
        {isAuthenticated ? (
          <>
            {/* User Avatar */}
            <Avatar
              sx={{
                background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
                fontWeight: 600,
                cursor: 'pointer',
                '&:hover': {
                  transform: 'scale(1.1)',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
                },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
              onClick={() => handleNavigation('profile')}
            >
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </Avatar>
            
            {/* Logout Button */}
            <Button
              variant="outlined"
              startIcon={<LogoutIcon />}
              onClick={logout}
              sx={{
                borderColor: 'rgba(255,255,255,0.3)',
                color: 'white',
                borderRadius: 2,
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255,255,255,0.1)'
                }
              }}
            >
              Salir
            </Button>
          </>
        ) : (
          <Button
            variant="contained"
            startIcon={<LoginIcon />}
            onClick={() => handleNavigation('login')}
            sx={{
              background: 'linear-gradient(45deg, #ff6b6b 0%, #ee5a24 100%)',
              borderRadius: 2,
              '&:hover': {
                background: 'linear-gradient(45deg, #ff5252 0%, #e74c3c 100%)'
              }
            }}
          >
            Iniciar Sesión
          </Button>
        )}

        {/* Mobile Menu Button */}
        {isMobile && (
          <IconButton
            color="inherit"
            aria-label="menu"
            onClick={handleDrawerToggle}
            sx={{ ml: 1 }}
          >
            <MenuIcon />
          </IconButton>
        )}
      </Box>
    </Box>
  );

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
          zIndex: theme.zIndex.drawer + 1
        }}
      >
        <Toolbar sx={{ px: { xs: 2, sm: 3 } }}>
          <NavigationContent />
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        sx={{
          '& .MuiDrawer-paper': {
            width: 280,
            background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
            borderLeft: '1px solid rgba(0, 0, 0, 0.1)'
          }
        }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
            Menú
          </Typography>
          <IconButton onClick={handleDrawerToggle}>
            <CloseIcon />
          </IconButton>
        </Box>
        
        <Divider />
        
        <List sx={{ px: 1 }}>
          {navigationItems.map((item) => (
            <ListItem
              key={item.key}
              button
              onClick={() => handleNavigation(item.key)}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                backgroundColor: currentPage === item.key ? theme.palette.primary.light + '20' : 'transparent',
                '&:hover': {
                  backgroundColor: theme.palette.primary.light + '30'
                }
              }}
            >
              <ListItemIcon
                sx={{
                  color: currentPage === item.key ? theme.palette.primary.main : theme.palette.grey[600],
                  minWidth: 40
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                sx={{
                  '& .MuiListItemText-primary': {
                    fontWeight: currentPage === item.key ? 600 : 400,
                    color: currentPage === item.key ? theme.palette.primary.main : theme.palette.grey[700]
                  }
                }}
              />
            </ListItem>
          ))}
        </List>
      </Drawer>
    </>
  );
};

export default ModernNavigation;
